import { CARD_TYPES, countType } from "./cards.js";

export function evaluateNumberCombo(numbers) {
  if (numbers.length === 0) {
    return { label: "숫자 없음", baseScore: 0 };
  }

  const sorted = [...numbers].sort((a, b) => a - b);
  const counts = new Map();
  sorted.forEach((number) => counts.set(number, (counts.get(number) || 0) + 1));
  const maxCount = Math.max(...counts.values());
  const isStraight =
    sorted.length === 3 &&
    new Set(sorted).size === 3 &&
    sorted[1] === sorted[0] + 1 &&
    sorted[2] === sorted[1] + 1;

  if (maxCount === 3) return { label: "같은 숫자 3장", baseScore: 80 };
  if (isStraight) return { label: "연속 숫자 3장", baseScore: 50 };
  if (maxCount === 2) return { label: "같은 숫자 2장", baseScore: 30 };
  return { label: "아무 조합 없음", baseScore: 10 };
}

export function calculateRoundScore(cards, jokerValues = []) {
  const numbers = cards
    .filter((card) => card.type === "number")
    .map((card) => card.value)
    .concat(jokerValues.map(Number));

  const combo = evaluateNumberCombo(numbers);
  const starCount = countType(cards, CARD_TYPES.star);
  const trapCount = countType(cards, CARD_TYPES.trap);

  let scoreAfterStars = combo.baseScore;
  let starLabel = "별 없음";

  if (starCount === 1) {
    scoreAfterStars = combo.baseScore * 2;
    starLabel = "별 1장 x2";
  } else if (starCount === 2) {
    scoreAfterStars = combo.baseScore * 3;
    starLabel = "별 2장 x3";
  } else if (starCount >= 3) {
    scoreAfterStars = 100;
    starLabel = "별 3장 보너스 100점";
  }

  const trapPenalty = trapCount === 1 ? -30 : trapCount === 2 ? -60 : trapCount >= 3 ? -100 : 0;
  const roundScore = scoreAfterStars + trapPenalty;

  return {
    numbers,
    comboLabel: combo.label,
    baseScore: combo.baseScore,
    starCount,
    starLabel,
    trapCount,
    trapPenalty,
    roundScore,
  };
}
