/**
 * main.js - Livro de Regras
 * Ponto de entrada principal para o módulo rulebook
 */

import { initTOCToggle, renderChapterSelect } from "./toc.js";
import { loadRulebookChapter } from "./loader.js";
import { RULEBOOK_CHAPTERS, LAST_CHAPTER_KEY } from "./constants.js";
import { initChapterNavigation } from "./navigation.js";
import { buildIndex } from "../search/searchIndex.js";
import { initSearchUI } from "../search/searchUI.js";

// ===== CONSTANTES =====
const DATA_PATH = '../data/rulebook/';
const REQUIRED_ELEMENTS = ['toc-panel', 'chapter-select', 'rulebook-content'];
const PRESERVED_ELEMENTS = ['dice-panel', 'dice-overlay'];
const MODAL_SELECTORS = '.modal.active, .drawer.active, .overlay.active';

// ===== ESTADO =====
let rulebookInitialized = false;

// ===== UI RESET =====

function closeGenericModals() {
  document.querySelectorAll(MODAL_SELECTORS).forEach(el => {
    if (!PRESERVED_ELEMENTS.includes(el.id)) {
      el.classList.remove('open', 'active');
    }
  });
}

function unlockBodyScroll() {
  document.body.classList.remove('no-scroll');
  
  ['overflow', 'paddingRight', 'marginRight', 'width', 'position', 'top', 'left']
    .forEach(prop => document.body.style[prop] = '');
}

function resetUI() {
  unlockBodyScroll();
  closeGenericModals();
}

// ===== UTILITÁRIOS =====

function checkRequiredElements() {
  const missing = REQUIRED_ELEMENTS.filter(id => !document.getElementById(id));
  
  if (missing.length) {
    console.warn(`Elementos não encontrados: ${missing.join(', ')}`);
    return false;
  }
  
  return true;
}

// ===== ÍNDICE DE BUSCA =====

async function preloadSearchIndex() {
  const results = await Promise.all(
    RULEBOOK_CHAPTERS.map(async (chapter) => {
      try {
        const response = await fetch(`${DATA_PATH}${chapter.file}`);
        if (!response.ok) return null;
        
        const data = await response.json();
        return { ...data, __file: chapter.file, __title: chapter.title };
      } catch (error) {
        console.warn(`Erro ao carregar ${chapter.file}:`, error.message);
        return null;
      }
    })
  );
  
  const chaptersData = results.filter(Boolean);
  
  if (chaptersData.length) {
    buildIndex(chaptersData);
  } else {
    console.error('Nenhum capítulo carregado para o índice de busca');
  }
}

// ===== INICIALIZAÇÃO =====

async function initRulebook() {
  if (rulebookInitialized) return;
  
  if (!checkRequiredElements()) return;
  
  try {
    await preloadSearchIndex();
    
    initTOCToggle();
    renderChapterSelect();
    initChapterNavigation();
    initSearchUI();
    
    // Prioridade: URL > localStorage > primeiro capítulo
    const urlParams = new URLSearchParams(window.location.search);
    const chapterToLoad = urlParams.get("chapter") || 
                          localStorage.getItem(LAST_CHAPTER_KEY) || 
                          RULEBOOK_CHAPTERS[0]?.file;
    
    if (!chapterToLoad) {
      throw new Error('Nenhum capítulo disponível');
    }
    
    await loadRulebookChapter(chapterToLoad);
    rulebookInitialized = true;
    
  } catch (error) {
    console.error('Erro ao inicializar rulebook:', error);
    
    const content = document.getElementById('rulebook-content');
    if (content) {
      content.innerHTML = `
        <div class="error-message">
          <h2>Erro ao carregar livro de regras</h2>
          <p>Não foi possível carregar o conteúdo. Tente recarregar a página.</p>
          <button onclick="location.reload()" class="reload-button">Recarregar</button>
        </div>
      `;
    }
  }
}

// ===== INICIALIZAÇÃO AUTOMÁTICA =====

if (document.getElementById('modal-root')?.dataset.loaded === 'true') {
  initRulebook();
} else {
  document.addEventListener('modals:loaded', initRulebook, { once: true });
}

// Reset da UI quando modais são carregados
document.addEventListener('modals:loaded', resetUI);

export { initRulebook, resetUI };