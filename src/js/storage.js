const STORAGE_KEY = "number-card-combo:v2";

const defaultStats = {
  records: [],
  bestScore: null,
  worstScore: null,
  playCount: 0,
  neonUnlocked: false,
  selectedSkin: "classic",
};

export function loadLocalStats() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...defaultStats, ...parsed };
  } catch {
    return { ...defaultStats };
  }
}

export function saveLocalStats(stats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export function addLocalRecord(record) {
  const stats = loadLocalStats();
  const records = [record, ...stats.records].slice(0, 20);
  const scores = records.map((item) => item.finalScore);
  const playCount = stats.playCount + (record.endedRound > 0 ? 1 : 0);
  const nextStats = {
    ...stats,
    records,
    bestScore: Math.max(...scores),
    worstScore: Math.min(...scores),
    playCount,
    neonUnlocked: playCount >= 5,
    selectedSkin: record.skin,
  };

  saveLocalStats(nextStats);
  return nextStats;
}

export function resetLocalStats() {
  saveLocalStats({ ...defaultStats });
  return loadLocalStats();
}
