// Saved progress, kept in the browser's localStorage: stars and best coins per level,
// the coin wallet, upgrades owned, and the Recipe Book. Bump SAVE_VERSION when the shape
// changes, and teach loadSave how to bring older saves up to date.

export const SAVE_KEY = 'neko-nigiri-save';
export const SAVE_VERSION = 2;

export function emptySave() {
  // levels is keyed by level id: { stars, bestCoins, plays }. upgrades is for the shop (T4).
  return { version: SAVE_VERSION, recipeBook: [], levels: {}, wallet: 0, upgrades: {} };
}

function browserStorage() {
  try { return globalThis.localStorage ?? null; } catch { return null; }
}

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

// Brings any older save up to the current version, dropping anything that looks broken.
// Version 1 only had the Recipe Book, so it just gains empty progress.
export function upgradeSave(data) {
  if (!isObject(data) || !Array.isArray(data.recipeBook)) return emptySave();
  const save = { ...emptySave(), ...data, version: SAVE_VERSION };
  if (!isObject(save.levels)) save.levels = {};
  if (!isObject(save.upgrades)) save.upgrades = {};
  if (!Number.isFinite(save.wallet) || save.wallet < 0) save.wallet = 0;
  return save;
}

// A broken or missing save just starts fresh, so the game never fails to load.
export function loadSave(storage = browserStorage()) {
  try {
    return upgradeSave(JSON.parse(storage?.getItem(SAVE_KEY) ?? 'null'));
  } catch {
    return emptySave();
  }
}

export function writeSave(save, storage = browserStorage()) {
  try { storage?.setItem(SAVE_KEY, JSON.stringify(save)); } catch { /* private mode or full: play on */ }
}

// Records a finished shift: the coins go in the wallet, and the level keeps its best
// stars and best coins. Returns what changed, for the results screen.
export function recordShift(save, levels, index, { coins, stars }) {
  const id = levels[index].id;
  const before = save.levels[id];
  const wasUnlocked = isUnlocked(save, levels, index + 1);
  save.wallet += coins;
  save.levels[id] = {
    stars: Math.max(stars, before?.stars ?? 0),
    bestCoins: Math.max(coins, before?.bestCoins ?? 0),
    plays: (before?.plays ?? 0) + 1,
  };
  return {
    firstClear: !before,
    moreStars: !!before && stars > before.stars,
    bestCoins: !!before && coins > before.bestCoins,
    unlocked: !wasUnlocked && index + 1 < levels.length,
  };
}

// The first level is always open. Each one after opens once the level before it is finished.
export function isUnlocked(save, levels, index) {
  if (index === 0) return true;
  const prev = levels[index - 1];
  return !!prev && !!save.levels[prev.id];
}

export function hasProgress(save) {
  return Object.keys(save.levels).length > 0;
}

// Where Continue goes: the first open level not finished yet, or the last one if all are.
export function continueLevel(save, levels) {
  let last = 0;
  for (let i = 0; i < levels.length; i++) {
    if (!isUnlocked(save, levels, i)) break;
    if (!save.levels[levels[i].id]) return i;
    last = i;
  }
  return last;
}

export function totalStars(save) {
  return Object.values(save.levels).reduce((sum, l) => sum + l.stars, 0);
}

// Starts over: levels, coins and upgrades go. The Recipe Book stays unless asked.
export function resetProgress(save, { keepRecipes = true } = {}) {
  return { ...emptySave(), recipeBook: keepRecipes ? save.recipeBook : [] };
}

// Adds an invented recipe, or remembers a better rating for one already there.
// Returns 'new', 'better' or 'same'.
export function addToRecipeBook(save, recipe, { stars, customer, at = Date.now() }) {
  const existing = save.recipeBook.find((r) => r.id === recipe.id);
  if (!existing) {
    save.recipeBook.push({ ...recipe, bestStars: stars, inventedFor: customer, timesServed: 1, invented: at });
    return 'new';
  }
  existing.timesServed++;
  if (stars <= existing.bestStars) return 'same';
  existing.bestStars = stars;
  return 'better';
}

export const MAX_NAME = 32;

// Gives an invented recipe the player's own name. A blank name keeps the old one.
// Returns the name it ended up with, or null if there's no such recipe.
export function renameRecipe(save, id, name) {
  const recipe = save.recipeBook.find((r) => r.id === id);
  if (!recipe) return null;
  const clean = String(name ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_NAME);
  if (clean) recipe.name = clean;
  return recipe.name;
}
