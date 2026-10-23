import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchRecipe, servePlate, boardHint, starsFor, RECIPES, PERFECT_TIP, INGREDIENTS } from '../src/logic.js';
import { LEVELS } from '../src/levels.js';

test('matchRecipe finds exact stacks only', () => {
  assert.equal(matchRecipe(['rice', 'salmon']), 'salmon_nigiri');
  assert.equal(matchRecipe(['rice', 'tuna']), 'tuna_nigiri');
  assert.equal(matchRecipe(['salmon', 'rice']), null);
  assert.equal(matchRecipe(['rice', 'salmon', 'tuna']), null);
  assert.equal(matchRecipe([]), null);
});

test('servePlate pays price plus tip for a perfect plate', () => {
  const r = servePlate('salmon_nigiri', ['rice', 'salmon']);
  assert.deepEqual([r.correct, r.coins], [true, RECIPES.salmon_nigiri.price + PERFECT_TIP]);
});

test('servePlate drops the tip after a mistake and pays nothing for a wrong plate', () => {
  assert.equal(servePlate('tuna_nigiri', ['rice', 'tuna'], { mistakes: 1 }).coins, RECIPES.tuna_nigiri.price);
  const wrong = servePlate('tuna_nigiri', ['rice', 'salmon']);
  assert.equal(wrong.correct, false);
  assert.equal(wrong.coins, 0);
  assert.equal(wrong.made, 'salmon_nigiri');
});

test('boardHint teaches rice first and spots wrong toppings', () => {
  assert.equal(boardHint('salmon_nigiri', []), null);
  assert.equal(boardHint('salmon_nigiri', ['salmon']), 'rice_first');
  assert.equal(boardHint('salmon_nigiri', ['rice']), null);
  assert.equal(boardHint('salmon_nigiri', ['rice', 'tuna']), 'wrong_topping');
  assert.equal(boardHint('salmon_nigiri', ['rice', 'salmon']), 'ready');
});

test('starsFor gives at least one star and caps at three', () => {
  const targets = [30, 60, 79];
  assert.equal(starsFor(0, targets), 1);
  assert.equal(starsFor(60, targets), 2);
  assert.equal(starsFor(200, targets), 3);
});

test('level data only uses known recipes and ingredients, and 3 stars is reachable', () => {
  for (const level of LEVELS) {
    for (const ing of level.ingredients) assert.ok(INGREDIENTS[ing], ing);
    for (const c of level.customers) {
      assert.ok(level.menu.includes(c.order), c.order);
      for (const ing of RECIPES[c.order].stack) assert.ok(level.ingredients.includes(ing), ing);
    }
    const perfect = level.customers.reduce((sum, c) => sum + RECIPES[c.order].price + PERFECT_TIP, 0);
    assert.ok(perfect >= level.starTargets[2], `level ${level.id}: perfect run ${perfect}`);
  }
});
