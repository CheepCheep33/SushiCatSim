import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchRecipe, servePlate, boardHint, rollProblem, starsFor, RECIPES, PERFECT_TIP, INGREDIENTS, MAKI_BASE } from '../src/logic.js';
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
  assert.equal(boardHint('salmon_nigiri', ['rice', 'salmon', 'tuna']), 'too_much');
});

test('maki stacks are nori, then rice, then the filling', () => {
  assert.deepEqual(MAKI_BASE, ['nori', 'rice']);
  assert.deepEqual(RECIPES.tuna_maki.stack, ['nori', 'rice', 'tuna']);
  assert.deepEqual(RECIPES.cucumber_maki.stack, ['nori', 'rice', 'cucumber']);
});

test('a maki only counts once it is rolled', () => {
  const stack = [...MAKI_BASE, 'cucumber'];
  assert.equal(matchRecipe(stack), null);
  assert.equal(matchRecipe(stack, true), 'cucumber_maki');
  assert.equal(matchRecipe(['rice', 'tuna'], true), null);
  const unrolled = servePlate('cucumber_maki', stack);
  assert.deepEqual([unrolled.correct, unrolled.needsRoll], [false, true]);
  const rolled = servePlate('cucumber_maki', stack, { rolled: true });
  assert.deepEqual([rolled.correct, rolled.coins], [true, RECIPES.cucumber_maki.price + PERFECT_TIP]);
  assert.equal(servePlate('tuna_maki', stack, { rolled: true }).needsRoll, false);
});

test('rollProblem needs nori and a finished stack', () => {
  assert.equal(rollProblem(['rice', 'tuna']), 'need_nori');
  assert.equal(rollProblem(MAKI_BASE), 'too_small');
  assert.equal(rollProblem([...MAKI_BASE, 'tuna']), null);
  assert.equal(rollProblem([...MAKI_BASE, 'tuna'], true), 'already_rolled');
});

test('boardHint teaches the maki order and when to roll', () => {
  assert.equal(boardHint('tuna_maki', ['rice']), `${MAKI_BASE[0]}_first`);
  assert.equal(boardHint('tuna_maki', [MAKI_BASE[0]]), null);
  assert.equal(boardHint('tuna_maki', [MAKI_BASE[0], 'tuna']), 'wrong_order');
  assert.equal(boardHint('tuna_maki', [...MAKI_BASE, 'salmon']), 'wrong_topping');
  assert.equal(boardHint('tuna_maki', [...MAKI_BASE, 'tuna']), 'roll_it');
  assert.equal(boardHint('tuna_maki', [...MAKI_BASE, 'tuna'], true), 'ready');
  assert.equal(boardHint('tuna_nigiri', ['nori']), 'rice_first');
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
      for (const ing of RECIPES[c.order].toppings ?? []) {
        assert.ok([...level.ingredients, ...(level.tray ?? [])].includes(ing), `level ${level.id} needs ${ing}`);
      }
      if (RECIPES[c.order].rolled) assert.ok(level.rollingMat, `level ${level.id} needs a rolling mat`);
    }
    const perfect = level.customers.reduce((sum, c) => sum + RECIPES[c.order].price + PERFECT_TIP, 0);
    assert.ok(perfect >= level.starTargets[2], `level ${level.id}: perfect run ${perfect}`);
  }
});
