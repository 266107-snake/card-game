import "../styles/main.css";
import { getJokerCount, drawCards } from "./cards.js";
import { calculateRoundScore } from "./score.js";
import { createInitialGame, createRecord } from "./gameState.js";
import { isFirebaseConfigured } from "./firebase.js";
import { listenToAuth, loginAnonymously, loginWithGoogle, logout } from "./auth.js";
import { ensureUserDocument, loadLocalStats, loadUserStats, saveRecord } from "./storage.js";
import { getRankingSafe } from "./ranking.js";
import { render } from "./ui.js";

const app = document.querySelector("#app");

const state = {
  firebaseReady: isFirebaseConfigured,
  user: null,
  stats: loadLocalStats(),
  ranking: [],
  game: createInitialGame(),
};

const handlers = {
  "login-google": async () => {
    await loginWithGoogle();
  },
  "login-anon": async () => {
    await loginAnonymously();
  },
  logout: async () => {
    await logout();
  },
  "select-round": ({ round }) => {
    state.game.selectedRounds = Number(round);
    paint();
  },
  "select-skin": ({ skin }) => {
    if (skin === "neon" && !state.stats.neonUnlocked) return;
    state.game.selectedSkin = skin;
    paint();
  },
  "start-game": () => {
    const selectedRounds = state.game.selectedRounds;
    const selectedSkin = state.game.selectedSkin;
    state.game = { ...createInitialGame(), selectedRounds, selectedSkin, screen: "game" };
    paint();
  },
  "draw-cards": () => {
    if (state.game.currentRound >= state.game.selectedRounds) return;
    state.game.drawnCards = drawCards();
    state.game.pendingJokerValues = [];
    state.game.pendingJokerCount = getJokerCount(state.game.drawnCards);
    state.game.isRoundPending = true;

    if (state.game.pendingJokerCount === 0) {
      finishRound();
    } else {
      state.game.message = `조커 ${state.game.pendingJokerCount}장의 숫자를 선택하세요.`;
      paint();
    }
  },
  "choose-joker": ({ value }) => {
    state.game.pendingJokerValues.push(Number(value));
    if (state.game.pendingJokerValues.length === state.game.pendingJokerCount) {
      finishRound();
      return;
    }
    paint();
  },
  "give-up": async () => {
    await endGame("중간 포기");
  },
  restart: () => {
    if (state.game.countdown > 0) return;
    const selectedRounds = state.game.selectedRounds;
    const selectedSkin = state.game.selectedSkin;
    state.game = { ...createInitialGame(), selectedRounds, selectedSkin };
    paint();
  },
  "show-records": async () => {
    state.game.screen = "records";
    state.ranking = await getRankingSafe();
    paint();
  },
  "go-home": () => {
    state.game.screen = "home";
    paint();
  },
};

listenToAuth(async (user) => {
  state.user = user;
  if (user) await ensureUserDocument(user);
  state.stats = await loadUserStats(user);
  state.ranking = await getRankingSafe();
  paint();
});

function finishRound() {
  const result = calculateRoundScore(state.game.drawnCards, state.game.pendingJokerValues);
  state.game.totalScore += result.roundScore;
  state.game.currentRound += 1;
  state.game.isRoundPending = false;
  state.game.lastRoundResult = result;
  state.game.message = `${result.comboLabel} · ${result.starLabel} · 함정 ${result.trapPenalty}점 · 이번 라운드 ${result.roundScore}점`;

  if (state.game.currentRound >= state.game.selectedRounds) {
    endGame("라운드 완료");
    return;
  }
  paint();
}

async function endGame(endType) {
  if (state.game.isRoundPending) {
    finishRound();
    return;
  }

  state.game.endType = endType;
  const record = createRecord(state.game, endType);
  state.stats = await saveRecord(record, state.user);
  state.game.screen = "result";
  state.game.countdown = 5;
  paint();
  startCountdown();
}

function startCountdown() {
  const timer = setInterval(() => {
    state.game.countdown -= 1;
    if (state.game.countdown <= 0) {
      clearInterval(timer);
      state.game.countdown = 0;
    }
    paint();
  }, 1000);
}

function paint() {
  render(app, state, handlers);
}

paint();
