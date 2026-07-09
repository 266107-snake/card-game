export const ROUND_OPTIONS = [5, 10, 15, 20, 25, 30];
export const CARD_SKINS = {
  classic: "classic",
  neon: "neon",
};

export function createInitialGame() {
  return {
    screen: "home",
    selectedRounds: 10,
    selectedSkin: CARD_SKINS.classic,
    currentRound: 0,
    totalScore: 0,
    drawnCards: [],
    pendingJokerValues: [],
    pendingJokerCount: 0,
    message: "",
    isRoundPending: false,
    lastRoundResult: null,
    countdown: 0,
  };
}

export function createRecord(game, endType) {
  return {
    id: crypto.randomUUID(),
    selectedRounds: game.selectedRounds,
    endedRound: game.currentRound,
    finalScore: game.totalScore,
    endType,
    skin: game.selectedSkin,
    playedAt: new Date().toISOString(),
  };
}
