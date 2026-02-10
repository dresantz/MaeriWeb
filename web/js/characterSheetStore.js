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

// 🔹 Controle para evitar loops de sincronização
let isSyncing = false;

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

/**
 * Validar e mesclar dados recebidos
 */
function validateAndMerge(current, incoming) {
  if (!incoming || incoming.version !== DEFAULT_SHEET.version) {
    return current;
  }
  
  return {
    ...current,
    character: {
      ...current.character,
      ...(incoming.character || {})
    },
    attributes: {
      ...current.attributes,
      ...(incoming.attributes || {})
    },
    info: incoming.info !== undefined ? incoming.info : current.info,
    items: incoming.items !== undefined ? incoming.items : current.items,
    updatedAt: incoming.updatedAt || current.updatedAt
  };
}

/* =========================
   Sincronização entre abas
========================= */

/**
 * Inicializar sincronização via eventos storage
 */
export function initSheetSync() {
  // 🔹 Ouvir alterações no localStorage de outras abas
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY && event.newValue && !isSyncing) {
      try {
        isSyncing = true;
        const incoming = JSON.parse(event.newValue);
        
        // Mesclar dados recebidos
        if (sheetState) {
          sheetState = validateAndMerge(sheetState, incoming);
        } else {
          sheetState = incoming;
        }
        
        // 🔹 Disparar evento para atualizar a UI
        window.dispatchEvent(new CustomEvent('characterSheet:updated', {
          detail: sheetState
        }));
        
        console.log('📡 Ficha sincronizada de outra aba');
      } catch (error) {
        console.error('Erro na sincronização:', error);
      } finally {
        isSyncing = false;
      }
    }
  });
  
  console.log('Sincronização de ficha inicializada');
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
function saveToStorage() {
  if (!sheetState) return;
  
  touch(sheetState);
  
  try {
    isSyncing = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sheetState));
    
    // 🔹 Disparar evento customizado para a aba atual
    window.dispatchEvent(new CustomEvent('characterSheet:saved', {
      detail: sheetState
    }));
    
  } catch (error) {
    console.error("Failed to save character sheet:", error);
  } finally {
    setTimeout(() => { isSyncing = false; }, 100);
  }
}

/**
 * Reset character sheet (used by future "Clear Sheet" action)
 */
export function resetCharacterSheet() {
  sheetState = clone(DEFAULT_SHEET);
  saveToStorage();
  return sheetState;
}

/* =========================
   Field-level setters
========================= */

export function setCharacterName(name) {
  if (!sheetState) loadCharacterSheet();
  sheetState.character.name = String(name || "");
  saveToStorage();
}

export function setAttribute(key, value) {
  if (!sheetState) loadCharacterSheet();
  
  const validKeys = Object.keys(DEFAULT_SHEET.attributes);
  if (validKeys.includes(key)) {
    const numValue = parseInt(value) || 0;
    sheetState.attributes[key] = Math.max(0, numValue);
    saveToStorage();
  }
}

export function setInfo(text) {
  if (!sheetState) loadCharacterSheet();
  sheetState.info = String(text || "");
  saveToStorage();
}

export function setItems(text) {
  if (!sheetState) loadCharacterSheet();
  sheetState.items = String(text || "");
  saveToStorage();
}

// 🔹 Inicializar sincronização automaticamente quando o módulo carrega
initSheetSync();