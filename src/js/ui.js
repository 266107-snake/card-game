import { CARD_LABELS, cardText } from "./cards.js";
import { CARD_SKINS, ROUND_OPTIONS } from "./gameState.js";

export function render(app, state, handlers) {
  app.className = state.game.selectedSkin === CARD_SKINS.neon ? "app neon-mode" : "app";
  app.innerHTML = `
    <main class="shell">
      <header class="topbar">
        <div>
          <p class="eyebrow">Card Draw Combo</p>
          <h1>숫자 카드 콤보</h1>
        </div>
        <div class="auth">${renderAuth(state)}</div>
      </header>
      ${renderScreen(state)}
    </main>
  `;

  bindEvents(app, handlers);
}

function renderAuth(state) {
  const user = state.user;
  if (!state.firebaseReady) {
    return `<span class="status offline">Firebase 미설정 · 로컬 저장</span>`;
  }
  if (!user) {
    return `
      <button data-action="login-google">Google 로그인</button>
      <button data-action="login-anon" class="ghost">익명 시작</button>
    `;
  }
  return `
    <span class="status">${user.displayName || "익명 플레이어"}</span>
    <button data-action="logout" class="ghost">로그아웃</button>
  `;
}

function renderScreen(state) {
  if (state.game.screen === "game") return renderGame(state);
  if (state.game.screen === "result") return renderResult(state);
  if (state.game.screen === "records") return renderRecords(state);
  return renderHome(state);
}

function renderHome(state) {
  const stats = state.stats;
  const neonLocked = !stats.neonUnlocked;
  return `
    <section class="panel home-grid">
      <div class="hero-copy">
        <h2>3장의 카드로 기록을 세우세요</h2>
        <p>조커로 조합을 만들고, 별로 점수를 키우고, 함정을 버티며 최고점과 최저점 모두에 도전합니다.</p>
        <div class="metric-row">
          <span>총 도전 ${stats.playCount}회</span>
          <span>최고 ${formatScore(stats.bestScore)}</span>
          <span>최저 ${formatScore(stats.worstScore)}</span>
        </div>
      </div>
      <div class="setup">
        <h3>라운드 선택</h3>
        <div class="segmented">
          ${ROUND_OPTIONS.map(
            (round) => `<button data-action="select-round" data-round="${round}" class="${state.game.selectedRounds === round ? "active" : ""}">${round}</button>`,
          ).join("")}
        </div>
        <h3>카드 디자인</h3>
        <div class="skin-list">
          <button data-action="select-skin" data-skin="classic" class="${state.game.selectedSkin === "classic" ? "active" : ""}">기본 카드</button>
          <button data-action="select-skin" data-skin="neon" class="${state.game.selectedSkin === "neon" ? "active" : ""}" ${neonLocked ? "disabled" : ""}>
            네온 카드 ${neonLocked ? `(5회 도전 후 해제 · 현재 ${stats.playCount}회)` : ""}
          </button>
        </div>
        <div class="actions">
          <button data-action="start-game" class="primary">게임 시작</button>
          <button data-action="show-records" class="ghost">기록 보기</button>
        </div>
      </div>
    </section>
  `;
}

function renderGame(state) {
  const game = state.game;
  return `
    <section class="panel game-panel">
      <div class="scoreboard">
        <span>라운드 ${game.currentRound + (game.isRoundPending ? 1 : 0)} / ${game.selectedRounds}</span>
        <strong>총점 ${game.totalScore}점</strong>
      </div>
      <div class="cards">
        ${[0, 1, 2].map((index) => renderCard(game.drawnCards[index], game.selectedSkin)).join("")}
      </div>
      ${game.pendingJokerCount > game.pendingJokerValues.length ? renderJokerPicker(game.pendingJokerValues.length + 1) : ""}
      <p class="message">${game.message || "카드 뽑기를 눌러 이번 라운드를 시작하세요."}</p>
      <div class="actions">
        <button data-action="draw-cards" class="primary" ${game.isRoundPending ? "disabled" : ""}>카드 뽑기</button>
        <button data-action="give-up" class="danger" ${game.currentRound === 0 && !game.isRoundPending ? "disabled" : ""}>중간 포기</button>
      </div>
    </section>
  `;
}

function renderJokerPicker(order) {
  return `
    <div class="joker-picker">
      <h3>조커 ${order}번째 숫자 선택</h3>
      <div class="number-grid">
        ${Array.from({ length: 9 }, (_, index) => `<button data-action="choose-joker" data-value="${index + 1}">${index + 1}</button>`).join("")}
      </div>
    </div>
  `;
}

function renderResult(state) {
  const game = state.game;
  return `
    <section class="panel result-panel">
      <p class="eyebrow">도전 종료</p>
      <h2>${game.totalScore}점</h2>
      <div class="result-grid">
        <span>선택 라운드</span><strong>${game.selectedRounds}</strong>
        <span>종료 라운드</span><strong>${game.currentRound}</strong>
        <span>종료 방식</span><strong>${game.endType}</strong>
        <span>카드 디자인</span><strong>${game.selectedSkin === "neon" ? "네온" : "기본"}</strong>
      </div>
      <p class="message">${game.countdown > 0 ? `${game.countdown}초 후 다시 도전 가능` : "다시 도전할 수 있습니다."}</p>
      <div class="actions">
        <button data-action="restart" class="primary" ${game.countdown > 0 ? "disabled" : ""}>다시 도전</button>
        <button data-action="show-records" class="ghost">기록 보기</button>
      </div>
    </section>
  `;
}

function renderRecords(state) {
  const stats = state.stats;
  return `
    <section class="panel records-panel">
      <div class="records-head">
        <div>
          <p class="eyebrow">Records</p>
          <h2>기록과 랭킹</h2>
        </div>
        <button data-action="go-home" class="ghost">시작 화면</button>
      </div>
      <div class="metric-row">
        <span>최고 ${formatScore(stats.bestScore)}</span>
        <span>최저 ${formatScore(stats.worstScore)}</span>
        <span>총 도전 ${stats.playCount}회</span>
      </div>
      <h3>최근 기록 20개</h3>
      <div class="table-wrap">
        <table>
          <thead><tr><th>#</th><th>라운드</th><th>종료</th><th>점수</th><th>방식</th><th>디자인</th></tr></thead>
          <tbody>
            ${(stats.records || []).map((record, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${record.selectedRounds}</td>
                <td>${record.endedRound}</td>
                <td>${record.finalScore}</td>
                <td>${record.endType}</td>
                <td>${record.skin === "neon" ? "네온" : "기본"}</td>
              </tr>
            `).join("") || `<tr><td colspan="6">아직 기록이 없습니다.</td></tr>`}
          </tbody>
        </table>
      </div>
      <h3>전체 랭킹</h3>
      <div class="ranking-list">
        ${(state.ranking || []).map((rank, index) => `
          <div><span>${index + 1}. ${rank.displayName}</span><strong>${rank.bestScore}점</strong></div>
        `).join("") || `<p class="message">Firebase 연결 후 랭킹을 볼 수 있습니다.</p>`}
      </div>
    </section>
  `;
}

function renderCard(card, skin) {
  const label = cardText(card);
  const special = card && card.type !== "number" ? CARD_LABELS[card.type] : "";
  return `
    <div class="card ${skin} ${card?.type || "empty"}">
      <span>${label || "?"}</span>
      <small>${special}</small>
    </div>
  `;
}

function bindEvents(app, handlers) {
  app.querySelectorAll("[data-action]").forEach((element) => {
    element.addEventListener("click", () => handlers[element.dataset.action]?.(element.dataset));
  });
}

function formatScore(score) {
  return score === null || score === undefined ? "-" : `${score}점`;
}
