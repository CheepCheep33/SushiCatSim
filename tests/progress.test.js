import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS, MAP_SLOTS } from '../src/levels.js';
import {
  emptySave, loadSave, writeSave, upgradeSave, recordShift, isUnlocked, hasProgress, continueLevel,
  totalStars, resetProgress, SAVE_KEY, SAVE_VERSION,
} from '../src/save.js';

const fakeStorage = () => {
  const data = {};
  return { getItem: (k) => data[k] ?? null, setItem: (k, v) => { data[k] = v; }, data };
};

const THREE = [{ id: 1 }, { id: 2 }, { id: 3 }];

test('only the first level is open on a fresh save', () => {
  const save = emptySave();
  assert.deepEqual(THREE.map((_, i) => isUnlocked(save, THREE, i)), [true, false, false]);
  assert.equal(continueLevel(save, THREE), 0);
  assert.equal(hasProgress(save), false);
});

test('finishing a level unlocks the next, and Continue moves along', () => {
  const save = emptySave();
  const first = recordShift(save, THREE, 0, { coins: 40, stars: 1 });
  assert.deepEqual(first, { firstClear: true, moreStars: false, bestCoins: false, unlocked: true });
  assert.deepEqual(THREE.map((_, i) => isUnlocked(save, THREE, i)), [true, true, false]);
  assert.equal(continueLevel(save, THREE), 1);
  recordShift(save, THREE, 1, { coins: 50, stars: 2 });
  recordShift(save, THREE, 2, { coins: 79, stars: 3 });
  // Everything finished: Continue goes to the last level, and the last one unlocks nothing.
  assert.equal(continueLevel(save, THREE), 2);
  assert.equal(recordShift(save, THREE, 2, { coins: 10, stars: 1 }).unlocked, false);
});

test('replays keep the best stars and coins, and every shift fills the wallet', () => {
  const save = emptySave();
  recordShift(save, THREE, 0, { coins: 60, stars: 2 });
  const worse = recordShift(save, THREE, 0, { coins: 30, stars: 1 });
  assert.deepEqual(worse, { firstClear: false, moreStars: false, bestCoins: false, unlocked: false });
  const better = recordShift(save, THREE, 0, { coins: 79, stars: 3 });
  assert.deepEqual([better.moreStars, better.bestCoins], [true, true]);
  assert.deepEqual(save.levels[1], { stars: 3, bestCoins: 79, plays: 3 });
  assert.equal(save.wallet, 60 + 30 + 79);
  assert.equal(totalStars(save), 3);
});

test('replaying an early level does not lock later ones', () => {
  const save = emptySave();
  recordShift(save, THREE, 0, { coins: 30, stars: 1 });
  recordShift(save, THREE, 1, { coins: 30, stars: 1 });
  recordShift(save, THREE, 0, { coins: 10, stars: 1 });
  assert.equal(isUnlocked(save, THREE, 2), true);
});

test('a version 1 save keeps its Recipe Book and gains empty progress', () => {
  const storage = fakeStorage();
  const recipe = { id: 'nigiri:rice+tuna+tuna', name: 'The Tuna Tower', bestStars: 5 };
  storage.setItem(SAVE_KEY, JSON.stringify({ version: 1, recipeBook: [recipe] }));
  const save = loadSave(storage);
  assert.equal(save.version, SAVE_VERSION);
  assert.deepEqual(save.recipeBook, [recipe]);
  assert.deepEqual([save.levels, save.wallet, save.upgrades], [{}, 0, {}]);
});

test('progress survives a reload, and broken parts of a save are dropped', () => {
  const storage = fakeStorage();
  const save = loadSave(storage);
  recordShift(save, THREE, 0, { coins: 45, stars: 2 });
  save.upgrades.riceCooker = 1;
  writeSave(save, storage);
  assert.deepEqual(loadSave(storage), save);
  const broken = upgradeSave({ version: 2, recipeBook: [], levels: 'nope', wallet: -5, upgrades: [] });
  assert.deepEqual(broken, emptySave());
  assert.deepEqual(upgradeSave({ levels: {} }), emptySave());
});

test('reset clears levels, coins and upgrades but keeps the Recipe Book by default', () => {
  const save = emptySave();
  save.recipeBook.push({ id: 'roll:nori+rice+tuna+cucumber', name: 'Ghost Roll' });
  recordShift(save, THREE, 0, { coins: 79, stars: 3 });
  save.upgrades.riceCooker = 1;
  const fresh = resetProgress(save);
  assert.deepEqual([fresh.levels, fresh.wallet, fresh.upgrades], [{}, 0, {}]);
  assert.equal(fresh.recipeBook.length, 1);
  assert.deepEqual(resetProgress(save, { keepRecipes: false }), emptySave());
});

test('real levels have unique ids and names for the map', () => {
  const ids = LEVELS.map((l) => l.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const level of LEVELS) assert.ok(level.name, `level ${level.id} needs a map name`);
  assert.ok(MAP_SLOTS >= 1);
});
