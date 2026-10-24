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

// Chef's choice: about 3 in 10 customers ask Nori to invent something.
export const CHEFS_CHOICE_CHANCE = 0.3;
export const COINS_PER_STAR = 4;
// What can go on a nigiri or inside a roll. Rice and nori are the base, never the topping.
export const TOPPINGS = ['salmon', 'tuna', 'cucumber'];

// What each customer likes and won't eat, for chef's choice orders.
export const TASTES = {
  mouse: { likes: 'salmon', dislikes: ['tuna'] },
  owl: { likes: 'tuna', dislikes: [] },
  kitsune: { likes: 'salmon', dislikes: [] },
  dog: { likes: 'tuna', dislikes: ['salmon'] },
  tanuki: { likes: 'tuna', dislikes: [] },
  turtle: { likes: 'salmon', dislikes: [] },
  lantern: { likes: 'cucumber', dislikes: ['salmon', 'tuna'] },
  bunny: { likes: 'cucumber', dislikes: [] },
  kappa: { likes: 'cucumber', dislikes: ['salmon'] },
  panda: { likes: 'cucumber', dislikes: ['tuna'] },
};

// Which customers in a level ask for chef's choice. The first customer always
// orders off the menu, so the level's lesson comes first.
export function pickChefsChoice(count, rng = Math.random, chance = CHEFS_CHOICE_CHANCE) {
  return Array.from({ length: count }, (_, i) => i > 0 && rng() < chance);
}

// Why an invented plate isn't proper sushi yet, or null if it is.
// Nigiri is rice then toppings. Maki is nori, rice, fillings, then rolled.
export function inventProblem(board, rolled = false) {
  if (board.length === 0) return 'empty';
  const maki = board[0] === 'nori';
  const base = maki ? MAKI_BASE : ['rice'];
  if (!maki && board[0] !== 'rice') return 'rice_first';
  if (maki && board.length > 1 && board[1] !== 'rice') return 'rice_after_nori';
  const fillings = board.slice(base.length);
  if (fillings.some((ing) => !TOPPINGS.includes(ing))) return 'not_a_topping';
  if (fillings.length === 0) return 'need_topping';
  if (maki && !rolled) return 'roll_it';
  return null;
}

// Mistakes that mean the plate has to go in the trash.
export const INVENT_MISTAKES = ['rice_first', 'rice_after_nori', 'not_a_topping'];

export function recipeId(board, rolled = false) {
  return `${rolled ? 'roll' : 'nigiri'}:${board.join('+')}`;
}

// A name for an invented plate, after the customer who inspired it,
// like "Kappa's Cucumber-Tuna Roll" or "Shy Mouse's Double Salmon Nigiri".
export function inventedName(board, rolled, customerName) {
  const fillings = board.slice(rolled ? MAKI_BASE.length : 1);
  const names = [...new Set(fillings)].map((ing) => INGREDIENTS[ing].name);
  const counts = { 2: 'Double ', 3: 'Triple ' };
  const what = names.length === 1 ? (counts[fillings.length] ?? '') + names[0] : names.join('-');
  return `${customerName}'s ${what} ${rolled ? 'Roll' : 'Nigiri'}`;
}

// Stars for a menu order: 5 for a clean plate, one off per mistake, never below 3
// while you're still learning.
export function rateOrder(mistakes = 0) {
  return Math.max(3, 5 - mistakes);
}

// Stars for a chef's choice plate. One for real sushi, plus one each for:
// something new, their favourite, nothing they hate, and no mistakes.
export function rateChefsChoice(board, rolled, tastes, mistakes = 0) {
  const reasons = {
    isNew: matchRecipe(board, rolled) === null,
    favorite: board.includes(tastes.likes),
    noDislikes: !tastes.dislikes.some((ing) => board.includes(ing)),
    clean: mistakes === 0,
  };
  const stars = 1 + Object.values(reasons).filter(Boolean).length;
  return { stars, reasons };
}

// Serving a chef's choice plate. Not-yet-sushi plates come back with the problem.
export function serveChefsChoice(board, { rolled = false, mistakes = 0, tastes, customerName }) {
  const problem = inventProblem(board, rolled);
  if (problem) return { ok: false, problem };
  const { stars, reasons } = rateChefsChoice(board, rolled, tastes, mistakes);
  const recipe = reasons.isNew
    ? { id: recipeId(board, rolled), name: inventedName(board, rolled, customerName), stack: [...board], rolled }
    : null;
  return { ok: true, stars, reasons, coins: stars * COINS_PER_STAR, recipe, made: matchRecipe(board, rolled) };
}
