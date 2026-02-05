/* =========================
   Character Sheet Store
   Local Persistence Layer
========================= */

const STORAGE_KEY = "maeri.characterSheet.v1";

/**
 * Default character sheet structure
 */
const DEFAULT_SHEET = {
  version: 1,

  character: {
    name: ""
  },

  attributes: {
    F: 0,
    V: 0,
    D: 0,
    S: 0,
    I: 0,
    A: 0
  },

  info: "",
  items: "",

  updatedAt: null
};

/**
 * Internal in-memory state
 */
let sheetState = null;

/* =========================
   Helpers
========================= */

/**
 * Deep clone utility (safe for simple objects)
 */
function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Update timestamp
 */
function touch(sheet) {
  sheet.updatedAt = new Date().toISOString();
}

/* =========================
   Core API
========================= */

/**
 * Load character sheet from localStorage
 * If not found or invalid, create a new one
 */
export function loadCharacterSheet() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      sheetState = clone(DEFAULT_SHEET);
      return sheetState;
    }

    const parsed = JSON.parse(raw);

    // Basic version check
    if (!parsed.version || parsed.version !== DEFAULT_SHEET.version) {
      sheetState = clone(DEFAULT_SHEET);
      return sheetState;
    }

    sheetState = parsed;
    return sheetState;

  } catch (error) {
    console.error("Failed to load character sheet:", error);
    sheetState = clone(DEFAULT_SHEET);
    return sheetState;
  }
}

/**
 * Get current in-memory sheet
 */
export function getCharacterSheet() {
  if (!sheetState) {
    return loadCharacterSheet();
  }
  return sheetState;
}

/**
 * Persist current sheet state to localStorage
 */
export function saveCharacterSheet() {
  if (!sheetState) return;

  touch(sheetState);

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(sheetState)
    );
  } catch (error) {
    console.error("Failed to save character sheet:", error);
  }
}

/**
 * Reset character sheet (used by future "Clear Sheet" action)
 */
export function resetCharacterSheet() {
  sheetState = clone(DEFAULT_SHEET);
  saveCharacterSheet();
  return sheetState;
}

/* =========================
   Field-level setters
========================= */

export function setCharacterName(name) {
  sheetState.character.name = name;
  saveCharacterSheet();
}

export function setAttribute(key, value) {
  if (key in sheetState.attributes) {
    sheetState.attributes[key] = Number(value) || 0;
    saveCharacterSheet();
  }
}

export function setInfo(text) {
  sheetState.info = text;
  saveCharacterSheet();
}

export function setItems(text) {
  sheetState.items = text;
  saveCharacterSheet();
}
