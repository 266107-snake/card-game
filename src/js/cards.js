export const CARD_TYPES = {
  star: "star",
  trap: "trap",
  joker: "joker",
};

export const CARD_LABELS = {
  star: "별",
  trap: "함정",
  joker: "조커",
};

export const NUMBER_CARDS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const DECK_VALUES = [
  ...NUMBER_CARDS,
  ...NUMBER_CARDS,
  ...NUMBER_CARDS,
  CARD_TYPES.star,
  CARD_TYPES.star,
  CARD_TYPES.trap,
  CARD_TYPES.trap,
  CARD_TYPES.joker,
  CARD_TYPES.joker,
];

export function drawCards(count = 3) {
  return Array.from({ length: count }, () => {
    const value = DECK_VALUES[Math.floor(Math.random() * DECK_VALUES.length)];
    return typeof value === "number"
      ? { type: "number", value }
      : { type: value, value };
  });
}

export function cardText(card) {
  if (!card) return "";
  return card.type === "number" ? String(card.value) : CARD_LABELS[card.type];
}

export function countType(cards, type) {
  return cards.filter((card) => card.type === type).length;
}

export function getJokerCount(cards) {
  return countType(cards, CARD_TYPES.joker);
}
