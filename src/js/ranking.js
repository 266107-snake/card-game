export function getLocalRanking(records = []) {
  return [...records]
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, 10)
    .map((record, index) => ({
      rank: index + 1,
      score: record.finalScore,
      rounds: record.endedRound,
      playedAt: record.playedAt,
    }));
}
