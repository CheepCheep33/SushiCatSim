// Game rules with no Phaser in them, so they can be tested in Node.

export const INGREDIENTS = {
  rice: { name: 'Rice', color: 0xfaf6ec },
  nori: { name: 'Nori', color: 0x1f3a2a },
  salmon: { name: 'Salmon', color: 0xf28c5a },
  tuna: { name: 'Tuna', color: 0xc8324a },
  cucumber: { name: 'Cucumber', color: 0x5fa83a },
  eel: { name: 'Eel', color: 0x9a5a2a },
  avocado: { name: 'Avocado', color: 0x9cc45a },
  sesame: { name: 'Sesame', color: 0xf3e6c0 },
  sauce: { name: 'Sauce', color: 0x4a2414 },
};

// The bottom of every maki stack, before the filling. Real chefs lay the nori down first.
export const MAKI_BASE = ['nori', 'rice'];

// Each recipe is the exact stack of ingredients on the board, bottom first.
// Rolled recipes also have to go through the bamboo mat before serving.
// Fancy rolls get toppings after rolling: any order, except sauce always goes on last.
export const RECIPES = {
  salmon_nigiri: { name: 'Salmon Nigiri', stack: ['rice', 'salmon'], price: 10 },
  tuna_nigiri: { name: 'Tuna Nigiri', stack: ['rice', 'tuna'], price: 12 },
  tuna_maki: { name: 'Tuna Maki', stack: [...MAKI_BASE, 'tuna'], rolled: true, price: 14 },
  cucumber_maki: { name: 'Cucumber Maki', stack: [...MAKI_BASE, 'cucumber'], rolled: true, price: 8 },
  caterpillar_roll: { name: 'Caterpillar Roll', stack: [...MAKI_BASE, 'cucumber'], rolled: true, toppings: ['avocado'], price: 16 },
  dragon_roll: { name: 'Dragon Roll', stack: [...MAKI_BASE, 'eel'], rolled: true, toppings: ['avocado', 'sauce'], price: 20 },
  rainbow_roll: { name: 'Rainbow Roll', stack: [...MAKI_BASE, 'cucumber'], rolled: true, toppings: ['salmon', 'avocado', 'sesame'], price: 22 },
};

export const PERFECT_TIP = 5;
export const MAX_BOARD = 4;
export const MAX_TOPPINGS = 3;

const sameStack = (a, b) => a.length === b.length && a.every((ing, i) => ing === b[i]);
const sorted = (list) => [...list].sort();

// Toppings match in any order, as long as the sauce (if any) went on last.
export function toppingsMatch(want = [], got = []) {
  if (want.length !== got.length) return false;
  if (got.includes('sauce') && got[got.length - 1] !== 'sauce') return false;
  return sameStack(sorted(want), sorted(got));
}

// Returns the recipe key the board matches, or null.
export function matchRecipe(board, rolled = false, toppings = []) {
  for (const [key, recipe] of Object.entries(RECIPES)) {
    if (!!recipe.rolled !== rolled) continue;
    if (sameStack(recipe.stack, board) && toppingsMatch(recipe.toppings, toppings)) return key;
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
// needsRoll is true when the stack is right but nobody rolled it, and needsToppings
// when it's rolled right but some toppings are still missing.
export function servePlate(orderKey, board, { mistakes = 0, rolled = false, toppings = [] } = {}) {
  const made = matchRecipe(board, rolled, toppings);
  if (made !== orderKey) {
    const recipe = RECIPES[orderKey];
    const stackRight = !!recipe.rolled && sameStack(recipe.stack, board);
    const needsRoll = !rolled && stackRight;
    const needsToppings = rolled && stackRight && toppingsSoFar(recipe.toppings, toppings) === 'more';
    return { correct: false, coins: 0, made, needsRoll, needsToppings };
  }
  const tip = mistakes === 0 ? PERFECT_TIP : 0;
  return { correct: true, coins: RECIPES[orderKey].price + tip, tip, made };
}

// How the toppings on a rolled plate are going: 'wrong_topping', 'too_much', 'sauce_last',
// 'more' (fine so far, keep going) or 'done'.
export function toppingsSoFar(want = [], got = []) {
  const left = [...want];
  for (const [i, ing] of got.entries()) {
    if (i > 0 && got[i - 1] === 'sauce') return 'sauce_last';
    const at = left.indexOf(ing);
    if (at === -1) return want.includes(ing) ? 'too_much' : 'wrong_topping';
    left.splice(at, 1);
  }
  // Sauce is always last, so anything still missing after it went on is too late.
  if (left.length) return got.includes('sauce') ? 'sauce_last' : 'more';
  return 'done';
}

// A hint for the learning levels about where the board is heading.
export function boardHint(orderKey, board, rolled = false, toppings = []) {
  const recipe = RECIPES[orderKey];
  const target = recipe.stack;
  if (board.length === 0) return null;
  if (board[0] !== target[0]) return `${target[0]}_first`;
  if (board.length > target.length) {
    // Toppings dropped on before rolling end up inside the roll.
    const extra = board.slice(target.length);
    const early = recipe.toppings && sameStack(target, board.slice(0, target.length)) && extra.every((ing) => recipe.toppings.includes(ing));
    return early ? 'roll_first' : 'too_much';
  }
  for (let i = 0; i < board.length; i++) {
    if (board[i] === target[i]) continue;
    if (recipe.toppings?.includes(board[i]) && !target.includes(board[i])) return 'roll_first';
    return target.includes(board[i]) ? 'wrong_order' : 'wrong_topping';
  }
  if (board.length < target.length) return null;
  if (recipe.rolled && !rolled) return 'roll_it';
  if (!recipe.toppings) return toppings.length ? 'wrong_topping' : 'ready';
  const how = toppingsSoFar(recipe.toppings, toppings);
  if (how === 'more') return toppings.length ? 'more_toppings' : 'add_toppings';
  return how === 'done' ? 'ready' : how;
}

// 1 to 3 stars from coins earned against the level's targets.
export function starsFor(coins, targets) {
  let stars = 0;
  for (const t of targets) if (coins >= t) stars++;
  return Math.max(1, stars);
}

// Chef's choice: about 7 in 100 customers ask Nori to invent something, at most once a level,
// so about 1 in 4 five-customer levels has one.
export const CHEFS_CHOICE_CHANCE = 0.07;
export const CHEFS_CHOICE_PER_LEVEL = 1;
export const COINS_PER_STAR = 4;
// What can go on a nigiri or inside a roll. Rice and nori are the base, never the topping.
export const TOPPINGS = ['salmon', 'tuna', 'cucumber', 'eel', 'avocado'];
// Little extras that only go on top: on a nigiri after the fish, or on a rolled roll.
// They don't count as the tasty part, and sauce always goes on last.
export const GARNISHES = ['sesame', 'sauce'];

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
  dragon: { likes: 'eel', dislikes: ['cucumber'] },
};

// Which customers in a level ask for chef's choice. The first customer always
// orders off the menu, so the level's lesson comes first.
export function pickChefsChoice(count, rng = Math.random, chance = CHEFS_CHOICE_CHANCE, max = CHEFS_CHOICE_PER_LEVEL) {
  let picked = 0;
  return Array.from({ length: count }, (_, i) => {
    const pick = i > 0 && picked < max && rng() < chance;
    if (pick) picked++;
    return pick;
  });
}

// Why an invented plate isn't proper sushi yet, or null if it is.
// Nigiri is rice then toppings. Maki is nori, rice, fillings, then rolled, then
// any toppings. Garnishes go on top only, and sauce goes on last.
export function inventProblem(board, rolled = false, toppings = []) {
  if (board.length === 0) return 'empty';
  const maki = board[0] === 'nori';
  const base = maki ? MAKI_BASE : ['rice'];
  if (!maki && board[0] !== 'rice') return 'rice_first';
  if (maki && board.length > 1 && board[1] !== 'rice') return 'rice_after_nori';
  const fillings = board.slice(base.length);
  const onTop = maki ? toppings : fillings;
  if (fillings.some((ing) => !TOPPINGS.includes(ing) && !(GARNISHES.includes(ing) && !maki))) {
    return maki && fillings.some((ing) => GARNISHES.includes(ing)) ? 'garnish_inside' : 'not_a_topping';
  }
  if (onTop.some((ing) => !TOPPINGS.includes(ing) && !GARNISHES.includes(ing))) return 'not_a_topping';
  if (onTop.slice(0, -1).includes('sauce')) return 'sauce_last';
  if (!fillings.some((ing) => TOPPINGS.includes(ing))) return 'need_topping';
  if (maki && !rolled) return 'roll_it';
  return null;
}

// Mistakes that mean the plate has to go in the trash.
export const INVENT_MISTAKES = ['rice_first', 'rice_after_nori', 'not_a_topping', 'garnish_inside', 'sauce_last'];

export function recipeId(board, rolled = false, toppings = []) {
  const top = toppings.length ? `/${toppingKey(toppings)}` : '';
  return `${rolled ? 'roll' : 'nigiri'}:${board.join('+')}${top}`;
}

// Toppings in any order are the same recipe, so the id sorts them (sauce still last).
function toppingKey(toppings) {
  const sauce = toppings.filter((ing) => ing === 'sauce');
  return [...sorted(toppings.filter((ing) => ing !== 'sauce')), ...sauce].join('+');
}

// Names a list like "Avocado", "Avocado and Sauce" or "Salmon, Avocado and Sesame".
function andList(names) {
  return names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

// A name for an invented plate, after the customer who inspired it,
// like "Kappa's Cucumber-Tuna Roll", "Shy Mouse's Double Salmon Nigiri" or
// "Little Dragon's Eel Roll with Avocado and Sauce".
export function inventedName(board, rolled, customerName, toppings = []) {
  const fillings = board.slice(rolled ? MAKI_BASE.length : 1).filter((ing) => !GARNISHES.includes(ing));
  const names = [...new Set(fillings)].map((ing) => INGREDIENTS[ing].name);
  const counts = { 2: 'Double ', 3: 'Triple ' };
  const what = names.length === 1 ? (counts[fillings.length] ?? '') + names[0] : names.join('-');
  const extras = rolled ? toppings : board.slice(1).filter((ing) => GARNISHES.includes(ing));
  const top = extras.length ? ` with ${andList([...new Set(extras)].map((ing) => INGREDIENTS[ing].name))}` : '';
  return `${customerName}'s ${what} ${rolled ? 'Roll' : 'Nigiri'}${top}`;
}

// Stars for a menu order: 5 for a clean plate, one off per mistake, never below 3
// while you're still learning.
export function rateOrder(mistakes = 0) {
  return Math.max(3, 5 - mistakes);
}

// Stars for a chef's choice plate. One for real sushi, plus one each for:
// something new, their favourite, nothing they hate, and no mistakes.
export function rateChefsChoice(board, rolled, tastes, mistakes = 0, toppings = []) {
  const all = [...board, ...toppings];
  const reasons = {
    isNew: matchRecipe(board, rolled, toppings) === null,
    favorite: all.includes(tastes.likes),
    noDislikes: !tastes.dislikes.some((ing) => all.includes(ing)),
    clean: mistakes === 0,
  };
  const stars = 1 + Object.values(reasons).filter(Boolean).length;
  return { stars, reasons };
}

// Serving a chef's choice plate. Not-yet-sushi plates come back with the problem.
export function serveChefsChoice(board, { rolled = false, toppings = [], mistakes = 0, tastes, customerName }) {
  const problem = inventProblem(board, rolled, toppings);
  if (problem) return { ok: false, problem };
  const { stars, reasons } = rateChefsChoice(board, rolled, tastes, mistakes, toppings);
  const recipe = reasons.isNew
    ? {
      id: recipeId(board, rolled, toppings),
      name: inventedName(board, rolled, customerName, toppings),
      stack: [...board],
      rolled,
      ...(toppings.length ? { toppings: [...toppings] } : {}),
    }
    : null;
  return { ok: true, stars, reasons, coins: stars * COINS_PER_STAR, recipe, made: matchRecipe(board, rolled, toppings) };
}
