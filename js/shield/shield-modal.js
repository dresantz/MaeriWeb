/**
 * shield-modal.js - Controle do Escudo do Mestre
 * Modal de Regras Rápidas + Carregamento de conteúdo
 */

import { RULEBOOK_CHAPTERS } from '../rulebook/constants.js';

// ===== CONSTANTES =====
const BASE_PATH = window.BASE_PATH || (window.location.hostname.includes('github.io') ? '/maeri/' : '/');

const BUTTON_CONFIG = {
  'Testes':        { id: 'teste_item',     prop: 'teste_item',     title: 'Testes' },
  'Combate':       { id: 'combate_item',   prop: 'combate_item',   title: 'Combate' },
  'Iniciativa':    { id: 'init_item',      prop: 'init_item',      title: 'Iniciativa' },
  'Magia':         { id: 'magia_item',     prop: 'magia_item',     title: 'Magia' },
  'Condições':     { id: 'condic_item',    prop: 'condic_item',    title: 'Condições' },
  'Seres':         { id: 'seres_item',     prop: 'seres_item',     title: 'Seres' },
  'Classes':       { id: 'classes_item',   prop: 'classes_item',   title: 'Classes' },
  'Técnicas':      { id: 'tec_item',       prop: 'tec_item',       title: 'Técnicas' },
  'Estudos':       { id: 'estudos_item',   prop: 'estudos_item',   title: 'Estudos' },
  'Segredos':      { id: 'segredos_item',  prop: 'segredos_item',  title: 'Segredos' },
  'Aventura':      { id: 'aventura_item',  prop: 'aventura_item',  title: 'Aventura' },
  'Armas':         { id: 'armas_item',     prop: 'armas_item',     title: 'Armas' },
  'Montarias':     { id: 'montarias_item', prop: 'montarias_item', title: 'Montarias' },
  'Loja Combate':  { id: 'lojacomb_item',  prop: 'lojacomb_item',  title: 'Loja Combate' },
  'Loja Arcana':   { id: 'lojarc_item',    prop: 'lojarc_item',    title: 'Loja Arcana' }
};

// ===== ESTADO =====
let allData = null;
let isLoading = false;
let lastFocusedElement = null;

// ===== ELEMENTOS DO DOM =====
const rulesButton = document.getElementById('rules-button');
const backButton = document.getElementById('shield-back-button');

// ===== FUNÇÕES AUXILIARES =====

function getModalElements() {
  const modal = document.getElementById('shield-modal');
  if (!modal) return null;
  
  return {
    modal,
    title: modal.querySelector('.shield-modal-header h2'),
    body: modal.querySelector('.shield-modal-body'),
    closeBtn: modal.querySelector('.shield-modal-close')
  };
}

function setBackButtonVisible(visible) {
  if (backButton) {
    backButton.style.display = visible ? 'block' : 'none';
  }
}

// ===== CARREGAMENTO DE DADOS =====

async function loadAllChapters() {
  if (allData) return allData;
  
  allData = { sections: [] };
  
  const fetchPromises = RULEBOOK_CHAPTERS.map(async (chapter) => {
    try {
      const response = await fetch(`${BASE_PATH}data/rulebook/${chapter.file}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} - ${chapter.file}`);
      }
      const data = await response.json();
      allData.sections.push(...(data.sections || []));
    } catch (e) {
      console.warn(`Erro ao carregar ${chapter.file}:`, e.message);
    }
  });
  
  await Promise.all(fetchPromises);
  return allData;
}

// ===== BUSCA DE ITENS =====

function findItemsByType(data, config) {
  const items = [];

  function search(obj) {
    if (!obj) return;
    
    if (obj[config.prop]) {
      items.push({ type: 'paragraph', text: obj[config.prop] });
    }
    
    if (obj.id === config.id) {
      if (obj.items) items.push({ type: 'list', items: obj.items });
      if (obj.text) items.push({ type: 'paragraph', text: obj.text });
    }
    
    if (obj.content) obj.content.forEach(search);
    if (obj.sections) obj.sections.forEach(search);
    if (Array.isArray(obj)) obj.forEach(search);
  }

  search(data);
  return items;
}

// ===== RENDERIZAÇÃO =====

function renderShieldContent(items) {
  const elements = getModalElements();
  if (!elements) return;
  
  if (items.length === 0) {
    elements.body.innerHTML = '<p class="gmnotes-empty-state">Nenhuma informação encontrada.</p>';
    return;
  }
  
  elements.body.innerHTML = items.map(item => {
    if (item.type === 'paragraph') {
      return `<p>${item.text}</p>`;
    }
    if (item.type === 'list') {
      const listItems = item.items.map(text => `<li>${text}</li>`).join('');
      return `<ul>${listItems}</ul>`;
    }
    return '';
  }).join('');
}

function renderRulesGrid() {
  const elements = getModalElements();
  if (!elements) return;
  
  elements.body.innerHTML = `
    <div class="shield-grid">
      <button class="shield-button">Combate</button>
      <button class="shield-button">Testes</button>
      <button class="shield-button">Iniciativa</button>
      <button class="shield-button">Aventura</button>
      <button class="shield-button">Magia</button>
      <button class="shield-button">Condições</button>
      <button class="shield-button">Seres</button>
      <button class="shield-button">Classes</button>
      <button class="shield-button">Técnicas</button>
      <button class="shield-button">Estudos</button>
      <button class="shield-button">Armas</button>
      <button class="shield-button">Montarias</button>
      <button class="shield-button">Loja Combate</button>
      <button class="shield-button">Loja Arcana</button>
    </div>
  `;
}

// ===== ABERTURA/FECHAMENTO =====

function openRulesModal() {
  const elements = getModalElements();
  if (!elements) return;
  
  lastFocusedElement = document.activeElement;
  
  elements.title.textContent = 'Regras Rápidas';
  setBackButtonVisible(false);
  renderRulesGrid();
  elements.modal.classList.add('active');
  elements.modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');
  
  setTimeout(() => {
    if (elements.closeBtn) elements.closeBtn.focus();
  }, 100);
}

function closeRulesModal() {
  const elements = getModalElements();
  if (!elements) return;
  
  if (elements.closeBtn && document.activeElement === elements.closeBtn) {
    elements.closeBtn.blur();
  }
  
  elements.modal.classList.remove('active');
  elements.modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');
  
  setTimeout(() => {
    if (lastFocusedElement && lastFocusedElement.focus) {
      lastFocusedElement.focus();
    } else if (rulesButton) {
      rulesButton.focus();
    }
  }, 100);
  
  setBackButtonVisible(false);
  if (elements.body) elements.body.innerHTML = '';
}

function showRulesGrid() {
  const elements = getModalElements();
  if (!elements) return;
  
  elements.title.textContent = 'Regras Rápidas';
  setBackButtonVisible(false);
  renderRulesGrid();
}

async function showRuleContent(buttonText) {
  const config = BUTTON_CONFIG[buttonText];
  if (!config) return;
  
  if (isLoading) return;
  
  try {
    isLoading = true;
    const data = await loadAllChapters();
    const items = findItemsByType(data, config);
    
    const elements = getModalElements();
    if (elements) {
      elements.title.textContent = config.title;
      setBackButtonVisible(true);
      renderShieldContent(items);
    }
  } catch (error) {
    console.error('Erro ao carregar regra:', error);
    const elements = getModalElements();
    if (elements) {
      elements.title.textContent = 'Erro';
      setBackButtonVisible(true);
      elements.body.innerHTML = '<p>Não foi possível carregar o conteúdo.</p>';
    }
  } finally {
    isLoading = false;
  }
}

// ===== EVENTOS =====

function setupEventListeners() {
  if (rulesButton) {
    rulesButton.addEventListener('click', openRulesModal);
  }
  
  if (backButton) {
    backButton.addEventListener('click', showRulesGrid);
  }
  
  // Delegação global para cliques em .shield-button e .shield-modal-close
  document.addEventListener('click', (e) => {
    const closeBtn = e.target.closest('.shield-modal-close');
    if (closeBtn) {
      e.stopPropagation();
      closeRulesModal();
      return;
    }
    
    const btn = e.target.closest('.shield-button');
    if (btn) {
      const elements = getModalElements();
      if (elements?.modal.classList.contains('active')) {
        e.stopPropagation();
        e.preventDefault();
        showRuleContent(btn.textContent.trim());
      }
    }
  });
  
  // Fechar com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const elements = getModalElements();
      if (elements?.modal.classList.contains('active')) {
        closeRulesModal();
      }
    }
  });
  
  // Fechar clicando no overlay
  document.addEventListener('click', (e) => {
    const elements = getModalElements();
    if (elements?.modal.classList.contains('active') && e.target === elements.modal) {
      closeRulesModal();
    }
  });
}

// ===== INICIALIZAÇÃO =====

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupEventListeners);
} else {
  setupEventListeners();
}