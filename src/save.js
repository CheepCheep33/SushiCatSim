// Saved progress, kept in the browser's localStorage. For now it only holds the
// Recipe Book; level progress can join it later under the same key.

export const SAVE_KEY = 'neko-nigiri-save';

export function emptySave() {
  return { version: 1, recipeBook: [] };
}

function browserStorage() {
  try { return globalThis.localStorage ?? null; } catch { return null; }
}

// A broken or missing save just starts fresh, so the game never fails to load.
export function loadSave(storage = browserStorage()) {
  try {
    const data = JSON.parse(storage?.getItem(SAVE_KEY) ?? 'null');
    if (!data || !Array.isArray(data.recipeBook)) return emptySave();
    return { ...emptySave(), ...data };
  } catch {
    return emptySave();
  }
}

export function writeSave(save, storage = browserStorage()) {
  try { storage?.setItem(SAVE_KEY, JSON.stringify(save)); } catch { /* private mode or full: play on */ }
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
