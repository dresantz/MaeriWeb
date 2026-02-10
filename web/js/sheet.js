/* =========================
   Character Sheet – UI Control
   + Persistence Integration
========================= */

import {
  resetCharacterSheet,
  loadCharacterSheet,
  getCharacterSheet,
  setCharacterName,
  setAttribute,
  setInfo,
  setItems,
  initSheetSync
} from "./characterSheetStore.js";

// 🔹 Controle de estado do modal
let isModalOpen = false;
let isInitialized = false;

function initSheetModal() {
  console.log('🚀 Initializing sheet modal...');
  
  // Prevent double init
  if (isInitialized) {
    console.log('Sheet modal already initialized');
    return;
  }
  isInitialized = true;
  
  // Garantir que a sincronização está ativa
  initSheetSync();

  const sheetButton = document.getElementById("sheet-button");
  const sheetModal = document.getElementById("sheet-modal");
  const sheetOverlay = document.getElementById("sheet-overlay");
  const sheetClose = document.getElementById("sheet-close");

  if (!sheetButton || !sheetModal || !sheetOverlay || !sheetClose) {
    console.error("❌ Sheet modal elements not found:", {
      sheetButton: !!sheetButton,
      sheetModal: !!sheetModal,
      sheetOverlay: !!sheetOverlay,
      sheetClose: !!sheetClose
    });
    return;
  }

  console.log('✅ All sheet elements found');

  const clearButton = document.getElementById("clear-sheet-button");
  const confirmBox = document.getElementById("clear-confirmation");
  const confirmClear = document.getElementById("confirm-clear-sheet");
  const cancelClear = document.getElementById("cancel-clear-sheet");

  // Inputs
  const nameInput = document.getElementById("character-name");
  const infoTextarea = document.getElementById("character-info");
  const itemsTextarea = document.getElementById("character-items");
  const attributeInputs = sheetModal.querySelectorAll(".attributes-grid input[data-key]");

  let lastFocusedElement = null;

  /* =========================
     Data → UI
  ========================= */
  function hydrateSheet() {
    const sheet = getCharacterSheet();
    console.log('💾 Hydrating sheet with data:', sheet);

    if (nameInput) {
      nameInput.value = sheet.character.name || "";
    }
    
    if (infoTextarea) {
      infoTextarea.value = sheet.info || "";
    }
    
    if (itemsTextarea) {
      itemsTextarea.value = sheet.items || "";
    }

    attributeInputs.forEach((input) => {
      const key = input.dataset.key;
      if (key && sheet.attributes[key] !== undefined) {
        input.value = sheet.attributes[key];
      }
    });
  }

  /* =========================
     UI → Data (Autosave)
  ========================= */
  if (nameInput) {
    nameInput.addEventListener("input", (e) => {
      console.log('✏️ Character name changed:', e.target.value);
      setCharacterName(e.target.value);
    });
  }
  
  if (infoTextarea) {
    infoTextarea.addEventListener("input", (e) => {
      setInfo(e.target.value);
    });
  }
  
  if (itemsTextarea) {
    itemsTextarea.addEventListener("input", (e) => {
      setItems(e.target.value);
    });
  }

  attributeInputs.forEach((input) => {
    input.addEventListener("input", (e) => {
      const key = e.target.dataset.key;
      const value = e.target.value;
      console.log(`⚙️ Attribute ${key} changed to:`, value);
      setAttribute(key, value);
    });
  });

  /* =========================
     Clear Sheet Logic
  ========================= */
  if (clearButton && confirmBox && confirmClear && cancelClear) {
    clearButton.addEventListener("click", () => {
      confirmBox.hidden = false;
      clearButton.disabled = true;
      
      // Scroll suave para a confirmação
      requestAnimationFrame(() => {
        confirmBox.scrollIntoView({ 
          behavior: "smooth", 
          block: "nearest" 
        });
      });
    });

    cancelClear.addEventListener("click", () => {
      confirmBox.hidden = true;
      clearButton.disabled = false;
    });

    confirmClear.addEventListener("click", () => {
      console.log('🗑️ Clearing character sheet');
      resetCharacterSheet();
      hydrateSheet();
      confirmBox.hidden = true;
      clearButton.disabled = false;
    });
  }

  /* =========================
     Modal Control
  ========================= */
  function openSheet() {
    if (isModalOpen) return;
    
    console.log('📖 Opening sheet modal...');
    lastFocusedElement = document.activeElement;
    isModalOpen = true;

    // Carregar dados atuais
    loadCharacterSheet();
    hydrateSheet();

    // Mostrar modal e overlay
    sheetModal.setAttribute("aria-hidden", "false");
    sheetOverlay.setAttribute("aria-hidden", "false");
    sheetModal.removeAttribute("inert");
    sheetOverlay.removeAttribute("inert");
    
    // Adicionar classes para estilização
    sheetModal.classList.add("active", "visible");
    sheetOverlay.classList.add("active", "visible");

    // Prevenir scroll do body
    document.body.classList.add("no-scroll", "modal-open");

    // Focar no primeiro campo após pequeno delay
    setTimeout(() => {
      const firstInput = nameInput || sheetModal.querySelector("input, textarea, button");
      if (firstInput && firstInput.focus) {
        firstInput.focus();
        console.log('🎯 Focus set to:', firstInput.id || firstInput.tagName);
      }
    }, 50);
    
    console.log('✅ Sheet modal opened successfully');
  }

  function closeSheet() {
    if (!isModalOpen) return;
    
    console.log('📕 Closing sheet modal...');
    isModalOpen = false;
    
    // Esconder modal e overlay
    sheetModal.setAttribute("aria-hidden", "true");
    sheetOverlay.setAttribute("aria-hidden", "true");
    sheetModal.setAttribute("inert", "true");
    sheetOverlay.setAttribute("inert", "true");
    
    // Remover classes de estilização
    sheetModal.classList.remove("active", "visible");
    sheetOverlay.classList.remove("active", "visible");

    // Restaurar scroll do body
    document.body.classList.remove("no-scroll", "modal-open");
    
    // Restaurar foco ao elemento anterior
    setTimeout(() => {
      if (lastFocusedElement && 
          document.body.contains(lastFocusedElement) && 
          lastFocusedElement.focus) {
        lastFocusedElement.focus();
        console.log('↩️ Focus returned to:', lastFocusedElement.id || lastFocusedElement.tagName);
      }
    }, 10);
  }

  /* =========================
     Event Listeners
  ========================= */
  
  // 🔹 Botão para abrir a ficha
  sheetButton.addEventListener("click", (e) => {
    e.stopPropagation();
    openSheet();
  });
  
  // 🔹 Botão de fechar (×)
  sheetClose.addEventListener("click", (e) => {
    e.stopPropagation();
    closeSheet();
  });
  
  // 🔹 Overlay (clique fora para fechar)
  sheetOverlay.addEventListener("click", (e) => {
    if (e.target === sheetOverlay) {
      closeSheet();
    }
  });
  
  // 🔹 Tecla Escape para fechar
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isModalOpen) {
      event.preventDefault();
      event.stopPropagation();
      closeSheet();
    }
  }, true); // Use capture phase para garantir execução

  /* =========================
     Sincronização entre abas
  ========================= */
  
  // 🔹 Atualizar UI quando ficha for atualizada em outra aba
  window.addEventListener('characterSheet:updated', (event) => {
    console.log('🔄 Sheet updated from sync, refreshing UI');
    if (isModalOpen) {
      hydrateSheet();
    }
  });
  
  // 🔹 Também ouvir eventos de save da aba atual
  window.addEventListener('characterSheet:saved', (event) => {
    console.log('💾 Sheet saved in current tab');
  });
  
  // 🔹 Fallback: ouvir eventos storage diretamente
  window.addEventListener('storage', (event) => {
    if (event.key === "maeri.characterSheet.v1") {
      console.log('📡 Storage event detected');
      setTimeout(() => {
        if (isModalOpen) {
          hydrateSheet();
        }
      }, 100);
    }
  });

  // 🔹 Prevenir que cliques dentro do modal fechem ele
  sheetModal.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  
  console.log('✅ Sheet modal initialization complete');
  
  // 🔹 Teste inicial: tentar abrir se houver algum dado
  const sheet = getCharacterSheet();
  if (sheet.character.name || sheet.info || sheet.items) {
    console.log('📝 Found existing character data');
  }
}

/* =========================
   Inicialização
========================= */

// Método 1: Quando modais carregarem
document.addEventListener("modals:loaded", () => {
  console.log('📦 Modals loaded, initializing sheet');
  // Pequeno delay para garantir que o DOM está pronto
  setTimeout(initSheetModal, 100);
});

// Método 2: Se já carregou (fallback)
if (document.getElementById('modal-root')?.dataset.loaded === 'true') {
  console.log('⚡ Modals already loaded, initializing immediately');
  setTimeout(initSheetModal, 200);
}

// Método 3: Quando DOM estiver pronto (segundo fallback)
document.addEventListener('DOMContentLoaded', () => {
  console.log('🏠 DOM ready, checking if we should init sheet');
  // Verificar após 1 segundo se ainda não inicializou
  setTimeout(() => {
    if (!isInitialized && document.getElementById('sheet-modal')) {
      console.log('🔄 Fallback: Initializing sheet from DOMContentLoaded');
      initSheetModal();
    }
  }, 1000);
});

// 🔹 Exportar funções para debugging
window.debugSheet = {
  openSheet: () => {
    const btn = document.getElementById('sheet-button');
    if (btn) btn.click();
  },
  closeSheet: () => {
    const modal = document.getElementById('sheet-modal');
    if (modal) {
      modal.classList.remove('active', 'visible');
      modal.setAttribute('aria-hidden', 'true');
      modal.setAttribute('inert', 'true');
      document.body.classList.remove('no-scroll', 'modal-open');
      isModalOpen = false;
    }
  },
  getState: () => ({ isModalOpen, isInitialized }),
  hydrate: () => {
    if (typeof hydrateSheet === 'function') hydrateSheet();
  }
};