import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  pickChefsChoice, inventProblem, inventedName, rateOrder, rateChefsChoice, serveChefsChoice,
  recipeId, TASTES, TOPPINGS, RECIPES, PERFECT_TIP, COINS_PER_STAR, CHEFS_CHOICE_PER_LEVEL, MAX_BOARD, MAKI_BASE,
} from '../src/logic.js';
import { LEVELS } from '../src/levels.js';
import { emptySave, loadSave, writeSave, addToRecipeBook, renameRecipe, SAVE_KEY, MAX_NAME } from '../src/save.js';

const fakeStorage = () => {
  const data = {};
  return { getItem: (k) => data[k] ?? null, setItem: (k, v) => { data[k] = v; }, data };
};

test('pickChefsChoice never picks the first customer, follows the chance and caps a level', () => {
  assert.deepEqual(pickChefsChoice(4, () => 0), [false, true, false, false]);
  assert.deepEqual(pickChefsChoice(4, () => 0, 1, 4), [false, true, true, true]);
  assert.deepEqual(pickChefsChoice(3, () => 0.99), [false, false, false]);
  assert.deepEqual(pickChefsChoice(2, () => 0.06), [false, true]);
  assert.deepEqual(pickChefsChoice(2, () => 0.07), [false, false]);
  let seed = 1;
  const rng = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const picks = pickChefsChoice(10001, rng, undefined, Infinity).slice(1).filter(Boolean).length;
  assert.ok(picks > 550 && picks < 850, `about 7 in 100, got ${picks}`);
});

test('inventProblem accepts real nigiri and rolled maki only', () => {
  assert.equal(inventProblem([]), 'empty');
  assert.equal(inventProblem(['salmon']), 'rice_first');
  assert.equal(inventProblem(['rice']), 'need_topping');
  assert.equal(inventProblem(['rice', 'salmon']), null);
  assert.equal(inventProblem(['rice', 'salmon', 'tuna', 'cucumber']), null);
  assert.equal(inventProblem(['rice', 'rice']), 'not_a_topping');
  assert.equal(inventProblem(['rice', 'salmon', 'nori']), 'not_a_topping');
  assert.equal(inventProblem(['nori']), 'need_topping');
  assert.equal(inventProblem(['nori', 'tuna']), 'rice_after_nori');
  assert.equal(inventProblem(['nori', 'rice']), 'need_topping');
  assert.equal(inventProblem(['nori', 'rice', 'tuna', 'cucumber']), 'roll_it');
  assert.equal(inventProblem(['nori', 'rice', 'tuna', 'cucumber'], true), null);
});

test('invented plates are named after the customer who asked', () => {
  assert.equal(inventedName(['rice', 'salmon', 'salmon'], false, 'Shy Mouse'), "Shy Mouse's Double Salmon Nigiri");
  assert.equal(inventedName(['nori', 'rice', 'cucumber', 'tuna'], true, 'Kappa'), "Kappa's Cucumber-Tuna Roll");
  assert.equal(inventedName(['rice', 'tuna', 'tuna', 'tuna'], false, 'Sleepy Owl'), "Sleepy Owl's Triple Tuna Nigiri");
  assert.equal(recipeId(['nori', 'rice', 'tuna'], true), 'roll:nori+rice+tuna');
});

test('menu orders are rated 5 when clean, never below 3', () => {
  assert.deepEqual([0, 1, 2, 3, 9].map(rateOrder), [5, 4, 3, 3, 3]);
});

test('chef\'s choice stars: real sushi, new, favourite, nothing they hate, no mistakes', () => {
  const kappa = TASTES.kappa; // likes cucumber, no salmon
  assert.equal(rateChefsChoice(['nori', 'rice', 'cucumber', 'tuna'], true, kappa).stars, 5);
  assert.equal(rateChefsChoice(['nori', 'rice', 'cucumber', 'tuna'], true, kappa, 1).stars, 4);
  // Just the menu's cucumber maki: not new.
  const plain = rateChefsChoice(['nori', 'rice', 'cucumber'], true, kappa);
  assert.deepEqual([plain.stars, plain.reasons.isNew], [4, false]);
  // Salmon they hate, no cucumber, and a mistake: just the one star for being sushi.
  assert.equal(rateChefsChoice(['rice', 'salmon'], false, kappa, 2).stars, 1);
});

test('serveChefsChoice pays per star and only new plates make the Recipe Book', () => {
  const opts = { tastes: TASTES.mouse, customerName: 'Shy Mouse' };
  const notSushi = serveChefsChoice(['salmon'], opts);
  assert.deepEqual(notSushi, { ok: false, problem: 'rice_first' });
  assert.equal(serveChefsChoice(['nori', 'rice', 'salmon'], opts).problem, 'roll_it');
  const best = serveChefsChoice(['rice', 'salmon', 'salmon'], opts);
  assert.deepEqual([best.stars, best.coins], [5, 5 * COINS_PER_STAR]);
  assert.equal(best.recipe.name, "Shy Mouse's Double Salmon Nigiri");
  const menu = serveChefsChoice(['rice', 'salmon'], opts);
  assert.deepEqual([menu.recipe, menu.made], [null, 'salmon_nigiri']);
});

// Every level ingredient stack the board can hold, as [board, rolled].
function allPlates(ingredients) {
  const plates = [];
  const grow = (board) => {
    if (board.length) { plates.push([board, false]); plates.push([board, true]); }
    if (board.length < MAX_BOARD) for (const ing of ingredients) grow([...board, ing]);
  };
  grow([]);
  return plates.filter(([b, rolled]) => (!rolled || b.includes('nori')) && !inventProblem(b, rolled));
}

test('every customer has tastes, and 5 stars is possible in every level they visit', () => {
  for (const level of LEVELS) {
    const ingredients = [...level.ingredients, ...(level.tray ?? [])];
    const plates = allPlates(ingredients);
    for (const c of level.customers) {
      const tastes = TASTES[c.kind];
      assert.ok(tastes, `${c.kind} needs tastes`);
      for (const ing of [tastes.likes, ...tastes.dislikes]) assert.ok(TOPPINGS.includes(ing), ing);
      assert.ok(ingredients.includes(tastes.likes), `${c.kind} likes something in level ${level.id}`);
      assert.ok(plates.some(([b, r]) => rateChefsChoice(b, r, tastes).stars === 5), `${c.kind} in level ${level.id}`);
    }
    // A 5 star invention can pay less than a fancy menu plate. Even if chef's choice lands on
    // the priciest customer, a perfect shift still earns 3 stars.
    const plates3 = level.customers.map((c) => RECIPES[c.order].price + PERFECT_TIP);
    const perfect = plates3.reduce((a, b) => a + b, 0);
    const shortfall = Math.max(0, ...plates3.map((p) => p - 5 * COINS_PER_STAR));
    assert.ok(perfect - shortfall * CHEFS_CHOICE_PER_LEVEL >= level.starTargets[2], `level ${level.id}`);
  }
});

test('the Recipe Book saves, keeps the best rating, and survives a broken save', () => {
  const storage = fakeStorage();
  assert.deepEqual(loadSave(storage), emptySave());
  const save = loadSave(storage);
  const recipe = { id: recipeId([...MAKI_BASE, 'tuna', 'cucumber'], true), name: "Kappa's Tuna-Cucumber Roll", stack: [...MAKI_BASE, 'tuna', 'cucumber'], rolled: true };
  assert.equal(addToRecipeBook(save, recipe, { stars: 3, customer: 'Kappa', at: 1 }), 'new');
  assert.equal(addToRecipeBook(save, recipe, { stars: 2, customer: 'Panda' }), 'same');
  assert.equal(addToRecipeBook(save, recipe, { stars: 5, customer: 'Panda' }), 'better');
  writeSave(save, storage);
  const loaded = loadSave(storage);
  assert.equal(loaded.recipeBook.length, 1);
  assert.deepEqual([loaded.recipeBook[0].bestStars, loaded.recipeBook[0].timesServed, loaded.recipeBook[0].inventedFor], [5, 3, 'Kappa']);
  storage.setItem(SAVE_KEY, '{not json');
  assert.deepEqual(loadSave(storage), emptySave());
  assert.deepEqual(loadSave(null), emptySave());
});

test('recipes can be renamed in the book, and a blank name keeps the old one', () => {
  const save = emptySave();
  const recipe = { id: recipeId(['rice', 'tuna', 'tuna'], false), name: "Sleepy Owl's Double Tuna Nigiri", stack: ['rice', 'tuna', 'tuna'], rolled: false };
  addToRecipeBook(save, recipe, { stars: 4, customer: 'Sleepy Owl' });
  assert.equal(renameRecipe(save, recipe.id, '  The   Tuna  Tower '), 'The Tuna Tower');
  assert.equal(renameRecipe(save, recipe.id, '   '), 'The Tuna Tower');
  assert.equal(renameRecipe(save, recipe.id, 'x'.repeat(50)).length, MAX_NAME);
  assert.equal(renameRecipe(save, 'nigiri:nope', 'Hi'), null);
  // A later serve of the same plate keeps the player's name.
  addToRecipeBook(save, recipe, { stars: 5, customer: 'Dog' });
  assert.equal(save.recipeBook[0].name, 'x'.repeat(MAX_NAME));
});
