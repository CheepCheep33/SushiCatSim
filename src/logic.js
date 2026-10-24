// Game rules with no Phaser in them, so they can be tested in Node.

export const INGREDIENTS = {
  rice: { name: 'Rice', color: 0xfaf6ec },
  nori: { name: 'Nori', color: 0x1f3a2a },
  salmon: { name: 'Salmon', color: 0xf28c5a },
  tuna: { name: 'Tuna', color: 0xc8324a },
  cucumber: { name: 'Cucumber', color: 0x5fa83a },
};

// The bottom of every maki stack, before the filling. Real chefs lay the nori down first.
export const MAKI_BASE = ['nori', 'rice'];

// Each recipe is the exact stack of ingredients on the board, bottom first.
// Rolled recipes also have to go through the bamboo mat before serving.
export const RECIPES = {
  salmon_nigiri: { name: 'Salmon Nigiri', stack: ['rice', 'salmon'], price: 10 },
  tuna_nigiri: { name: 'Tuna Nigiri', stack: ['rice', 'tuna'], price: 12 },
  tuna_maki: { name: 'Tuna Maki', stack: [...MAKI_BASE, 'tuna'], rolled: true, price: 14 },
  cucumber_maki: { name: 'Cucumber Maki', stack: [...MAKI_BASE, 'cucumber'], rolled: true, price: 8 },
};

export const PERFECT_TIP = 5;
export const MAX_BOARD = 4;

// Returns the recipe key the board matches, or null.
export function matchRecipe(board, rolled = false) {
  for (const [key, recipe] of Object.entries(RECIPES)) {
    if (!!recipe.rolled !== rolled) continue;
    if (recipe.stack.length === board.length && recipe.stack.every((ing, i) => ing === board[i])) {
      return key;
    }
  }
  return null;
}

// Why the board can't go on the bamboo mat yet, or null if it can be rolled.
export function rollProblem(board, rolled = false) {
  if (rolled) return 'already_rolled';
  if (!board.includes('nori')) return 'need_nori';
  if (board.length < MAKI_BASE.length + 1) return 'too_small';
  return null;
}

// What a customer pays for a plate. Wrong plates still get a little pity money.
// needsRoll is true when the stack is right but nobody rolled it.
export function servePlate(orderKey, board, { mistakes = 0, rolled = false } = {}) {
  const made = matchRecipe(board, rolled);
  if (made !== orderKey) {
    const needsRoll = !rolled && matchRecipe(board, true) === orderKey;
    return { correct: false, coins: 0, made, needsRoll };
  }
  const tip = mistakes === 0 ? PERFECT_TIP : 0;
  return { correct: true, coins: RECIPES[orderKey].price + tip, tip, made };
}

// A hint for the learning levels about where the board is heading.
export function boardHint(orderKey, board, rolled = false) {
  const recipe = RECIPES[orderKey];
  const target = recipe.stack;
  if (board.length === 0) return null;
  if (board[0] !== target[0]) return `${target[0]}_first`;
  if (board.length > target.length) return 'too_much';
  for (let i = 0; i < board.length; i++) {
    if (board[i] === target[i]) continue;
    return target.includes(board[i]) ? 'wrong_order' : 'wrong_topping';
  }
  if (board.length < target.length) return null;
  return recipe.rolled && !rolled ? 'roll_it' : 'ready';
}

// 1 to 3 stars from coins earned against the level's targets.
export function starsFor(coins, targets) {
  let stars = 0;
  for (const t of targets) if (coins >= t) stars++;
  return Math.max(1, stars);
}
