import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  matchRecipe, servePlate, boardHint, toppingsMatch, toppingsSoFar, inventProblem, inventedName, recipeId,
  serveChefsChoice, rateChefsChoice, RECIPES, PERFECT_TIP, MAKI_BASE, TASTES, INGREDIENTS,
} from '../src/logic.js';
import { LEVELS } from '../src/levels.js';

const eelRoll = [...MAKI_BASE, 'eel'];
const cucumberRoll = [...MAKI_BASE, 'cucumber'];

test('a dragon roll is an eel roll with avocado, then sauce, on top', () => {
  assert.equal(matchRecipe(eelRoll, true, ['avocado', 'sauce']), 'dragon_roll');
  assert.equal(matchRecipe(eelRoll, true, ['sauce', 'avocado']), null);
  assert.equal(matchRecipe(eelRoll, true, ['avocado']), null);
  assert.equal(matchRecipe(eelRoll, false, ['avocado', 'sauce']), null);
});

test('toppings can go on in any order, but sauce is always last', () => {
  assert.ok(toppingsMatch(['salmon', 'avocado', 'sesame'], ['sesame', 'salmon', 'avocado']));
  assert.ok(!toppingsMatch(['avocado', 'sauce'], ['sauce', 'avocado']));
  assert.ok(toppingsMatch(undefined, []));
  assert.equal(toppingsSoFar(['avocado', 'sauce'], []), 'more');
  assert.equal(toppingsSoFar(['avocado', 'sauce'], ['avocado']), 'more');
  assert.equal(toppingsSoFar(['avocado', 'sauce'], ['sauce']), 'sauce_last');
  assert.equal(toppingsSoFar(['avocado', 'sauce'], ['avocado', 'sauce']), 'done');
  assert.equal(toppingsSoFar(['avocado'], ['salmon']), 'wrong_topping');
  assert.equal(toppingsSoFar(['avocado'], ['avocado', 'avocado']), 'too_much');
});

test('plain and topped rolls with the same filling are different plates', () => {
  assert.equal(matchRecipe(cucumberRoll, true), 'cucumber_maki');
  assert.equal(matchRecipe(cucumberRoll, true, ['avocado']), 'caterpillar_roll');
  assert.equal(matchRecipe(cucumberRoll, true, ['avocado', 'salmon', 'sesame']), 'rainbow_roll');
});

test('boardHint walks through roll first, then toppings', () => {
  assert.equal(boardHint('dragon_roll', eelRoll), 'roll_it');
  assert.equal(boardHint('dragon_roll', eelRoll, true), 'add_toppings');
  assert.equal(boardHint('dragon_roll', eelRoll, true, ['avocado']), 'more_toppings');
  assert.equal(boardHint('dragon_roll', eelRoll, true, ['avocado', 'sauce']), 'ready');
  assert.equal(boardHint('dragon_roll', eelRoll, true, ['sauce']), 'sauce_last');
  assert.equal(boardHint('dragon_roll', eelRoll, true, ['sesame']), 'wrong_topping');
  // Toppings dropped on before rolling end up inside.
  assert.equal(boardHint('dragon_roll', [...eelRoll, 'avocado']), 'roll_first');
  assert.equal(boardHint('rainbow_roll', [...MAKI_BASE, 'salmon']), 'roll_first');
  assert.equal(boardHint('dragon_roll', [...MAKI_BASE, 'cucumber']), 'wrong_topping');
  // A plain roll in a toppings level takes none.
  assert.equal(boardHint('cucumber_maki', cucumberRoll, true), 'ready');
  assert.equal(boardHint('cucumber_maki', cucumberRoll, true, ['avocado']), 'wrong_topping');
});

test('a rolled plate missing toppings goes back to the board instead of the trash', () => {
  const half = servePlate('dragon_roll', eelRoll, { rolled: true, toppings: ['avocado'] });
  assert.deepEqual([half.correct, half.needsToppings, half.needsRoll], [false, true, false]);
  assert.equal(servePlate('dragon_roll', eelRoll).needsRoll, true);
  assert.equal(servePlate('dragon_roll', eelRoll, { rolled: true, toppings: ['sauce'] }).needsToppings, false);
  const done = servePlate('dragon_roll', eelRoll, { rolled: true, toppings: ['avocado', 'sauce'] });
  assert.deepEqual([done.correct, done.coins], [true, RECIPES.dragon_roll.price + PERFECT_TIP]);
  // Serving a caterpillar roll to someone who wanted it plain is just wrong.
  const plain = servePlate('cucumber_maki', cucumberRoll, { rolled: true, toppings: ['avocado'] });
  assert.deepEqual([plain.correct, plain.needsToppings, plain.made], [false, false, 'caterpillar_roll']);
});

test('inventions can have toppings once rolled; garnishes only go on top', () => {
  assert.equal(inventProblem(eelRoll, true, ['avocado', 'sauce']), null);
  assert.equal(inventProblem(eelRoll, true, ['sauce', 'avocado']), 'sauce_last');
  assert.equal(inventProblem(eelRoll, true, ['rice']), 'not_a_topping');
  assert.equal(inventProblem([...MAKI_BASE, 'sesame']), 'garnish_inside');
  assert.equal(inventProblem(['rice', 'eel', 'sauce']), null);
  assert.equal(inventProblem(['rice', 'sauce']), 'need_topping');
  assert.equal(inventProblem(['rice', 'sauce', 'eel']), 'sauce_last');
});

test('invented fancy rolls get a name and an id that ignores topping order', () => {
  assert.equal(inventedName(eelRoll, true, 'Little Dragon', ['avocado', 'sauce']), "Little Dragon's Eel Roll with Avocado and Sauce");
  assert.equal(inventedName(['rice', 'eel', 'sauce'], false, 'Old Turtle'), "Old Turtle's Eel Nigiri with Sauce");
  assert.equal(inventedName(cucumberRoll, true, 'Kappa', ['salmon', 'avocado', 'sesame']), "Kappa's Cucumber Roll with Salmon, Avocado and Sesame");
  assert.equal(recipeId(eelRoll, true, ['salmon', 'avocado']), recipeId(eelRoll, true, ['avocado', 'salmon']));
  assert.equal(recipeId(eelRoll, true), 'roll:nori+rice+eel');
  const served = serveChefsChoice(eelRoll, { rolled: true, toppings: ['salmon', 'sauce'], tastes: TASTES.dragon, customerName: 'Little Dragon' });
  assert.equal(served.stars, 5);
  assert.deepEqual(served.recipe.toppings, ['salmon', 'sauce']);
  // The dragon roll itself isn't new, and cucumber on top still counts as cucumber.
  assert.equal(rateChefsChoice(eelRoll, true, TASTES.dragon, 0, ['avocado', 'sauce']).reasons.isNew, false);
  assert.equal(rateChefsChoice(eelRoll, true, TASTES.dragon, 0, ['cucumber']).reasons.noDislikes, false);
});

test('Level 3 teaches toppings with a tray of known ingredients', () => {
  const level = LEVELS.find((l) => l.id === 3);
  assert.ok(level.rollingMat);
  for (const ing of level.tray) assert.ok(INGREDIENTS[ing], ing);
  assert.ok(RECIPES[level.customers[0].order].toppings, 'the first customer teaches toppings');
  assert.ok(level.customers.some((c) => c.order === 'dragon_roll'));
});
