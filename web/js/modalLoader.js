/*
 * Modal Loader – Robust version
 * Loads global modal components into #modal-root
 * Works both in root (index.html) and inside /pages/
 */

const MODALS_LOADED_FLAG = "modals:loaded";
let isLoading = false; // 🔹 Flag para evitar carregamentos concorrentes
let isLoaded = false; // 🔹 Flag para saber se já carregou

/**
 * Detecta o caminho base correto para os modais
 */
function getBasePath() {
  const path = window.location.pathname;
  const isInPages = path.includes('/pages/') || window.location.href.includes('/pages/');

  if (isInPages) {
    return "../"; // Volta um nível para acessar pages/
  }

  return "./"; // Modais estão no mesmo diretório ou subdiretório
}

const BASE = getBasePath();

// lista de modais globais
const MODAL_PATHS = [
  `${BASE}pages/dice-modal.html`,
  `${BASE}pages/sheet-modal.html`,
  `${BASE}pages/spells-modal.html`,
];

/**
 * Carrega os modais globais e injeta em #modal-root
 */
export async function loadGlobalModals() {
  // 🔹 Evitar múltiplas chamadas simultâneas
  if (isLoading) {
    console.log('Modal loading already in progress');
    return;
  }
  
  if (isLoaded) {
    console.log('Modals already loaded');
    return;
  }
  
  const root = document.getElementById("modal-root");
  
  if (!root) {
    console.warn("modal-root not found.");
    return;
  }

  // evita carregamento duplicado
  if (root.dataset.loaded === "true") {
    isLoaded = true;
    return;
  }

  isLoading = true;
  
  try {
    console.log('Starting to load modals...');
    
    const requests = MODAL_PATHS.map(path => fetch(path));
    const responses = await Promise.all(requests);

    // verifica se algum fetch falhou
    for (let i = 0; i < responses.length; i++) {
      if (!responses[i].ok) {
        throw new Error(`Failed to fetch modal at: ${MODAL_PATHS[i]} (status: ${responses[i].status})`);
      }
    }

    const htmlParts = await Promise.all(responses.map(r => r.text()));
    root.innerHTML = htmlParts.join("\n");
    root.dataset.loaded = "true";
    isLoaded = true;

    // 🔹 IMPORTANTE: Remover qualquer modal duplicado
    const allModals = root.querySelectorAll('[id]');
    const seenIds = new Set();
    allModals.forEach(modal => {
      if (seenIds.has(modal.id)) {
        console.log(`Removing duplicate modal: ${modal.id}`);
        modal.remove();
      } else {
        seenIds.add(modal.id);
      }
    });

    // dispara evento global para iniciar modais
    const event = new CustomEvent(MODALS_LOADED_FLAG, {
      detail: {
        timestamp: Date.now(),
        modalsLoaded: MODAL_PATHS.length
      }
    });
    document.dispatchEvent(event);
    console.log("Global modals loaded successfully.");
  } catch (error) {
    console.error("Error loading modals:", error);
    isLoaded = false;
  } finally {
    isLoading = false;
  }
}

/**
 * Auto-init: aguarda DOM ready
 */
function initModalLoader() {
  console.log('Modal loader initializing...');
  
  // 🔹 Garantir que só inicialize uma vez
  if (document.body.dataset.modalLoaderInitialized) return;
  document.body.dataset.modalLoaderInitialized = "true";
  
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      console.log('DOMContentLoaded - Loading modals');
      loadGlobalModals();
    });
  } else {
    console.log('DOM already ready - Loading modals');
    loadGlobalModals();
  }
}

// inicializa automaticamente
initModalLoader();