// Game rules with no Phaser in them, so they can be tested in Node.

export const INGREDIENTS = {
  rice: { name: 'Rice', color: 0xfaf6ec },
  salmon: { name: 'Salmon', color: 0xf28c5a },
  tuna: { name: 'Tuna', color: 0xc8324a },
};

// Each recipe is the exact stack of ingredients on the board, bottom first.
export const RECIPES = {
  salmon_nigiri: { name: 'Salmon Nigiri', stack: ['rice', 'salmon'], price: 10 },
  tuna_nigiri: { name: 'Tuna Nigiri', stack: ['rice', 'tuna'], price: 12 },
};

export const PERFECT_TIP = 5;
export const MAX_BOARD = 4;

// Returns the recipe key the board matches, or null.
export function matchRecipe(board) {
  for (const [key, recipe] of Object.entries(RECIPES)) {
    if (recipe.stack.length === board.length && recipe.stack.every((ing, i) => ing === board[i])) {
      return key;
    }
  }
  return null;
}

// What a customer pays for a plate. Wrong plates still get a little pity money.
export function servePlate(orderKey, board, { mistakes = 0 } = {}) {
  const made = matchRecipe(board);
  if (made !== orderKey) {
    return { correct: false, coins: 0, made };
  }
  const tip = mistakes === 0 ? PERFECT_TIP : 0;
  return { correct: true, coins: RECIPES[orderKey].price + tip, tip, made };
}

// A hint for the learning levels when the board can't become the order.
export function boardHint(orderKey, board) {
  const target = RECIPES[orderKey].stack;
  if (board.length === 0) return null;
  if (board[0] !== 'rice') return 'rice_first';
  for (let i = 0; i < board.length; i++) {
    if (board[i] !== target[i]) return 'wrong_topping';
  }
  if (board.length === target.length) return 'ready';
  return null;
}

// 1 to 3 stars from coins earned against the level's targets.
export function starsFor(coins, targets) {
  let stars = 0;
  for (const t of targets) if (coins >= t) stars++;
  return Math.max(1, stars);
}
