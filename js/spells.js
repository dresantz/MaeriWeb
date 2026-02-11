// spells.js - Controle de magias

let isSpellsOpen = false;

function openSpells() {
  const modal = document.getElementById('spells-modal');
  const overlay = document.getElementById('spells-overlay');
  
  if (isSpellsOpen || !modal || !overlay) return;
  
  isSpellsOpen = true;
  modal.classList.add('active');
  overlay.classList.add('active');
  document.body.classList.add('no-scroll');
  document.getElementById('spells-search')?.focus();
}

function closeSpells() {
  const modal = document.getElementById('spells-modal');
  const overlay = document.getElementById('spells-overlay');
  
  if (!isSpellsOpen || !modal || !overlay) return;
  
  isSpellsOpen = false;
  modal.classList.remove('active');
  overlay.classList.remove('active');
  document.body.classList.remove('no-scroll');
}

// Estado
let spells = [];
let filteredSpells = [];
let sortState = { key: 'name', direction: 'asc' };
let searchTimeout = null;

// Extração
function extractSpellsFromChapter(chapter) {
  const result = [];
  if (!chapter.sections) return result;
  
  chapter.sections.forEach(section => {
    if (!section.content) return;
    section.content.forEach(block => {
      if (block.type === 'spellList' && Array.isArray(block.spells)) {
        block.spells.forEach(spell => {
          result.push({ ...spell });
        });
      }
    });
  });
  return result;
}

// Carregamento
async function loadSpells() {
  try {
    const response = await fetch('/data/rulebook/04-magia.json');
    const data = await response.json();
    spells = extractSpellsFromChapter(data);
    applyFilters();
  } catch (e) {}
}

// Filtro e ordenação
function applyFilters() {
  const searchTerm = document.getElementById('spells-search')?.value.toLowerCase() || '';
  
  filteredSpells = spells.filter(spell => 
    spell.name.toLowerCase().includes(searchTerm)
  );
  
  filteredSpells.sort((a, b) => {
    let result = 0;
    if (sortState.key === 'name' || sortState.key === 'school') {
      result = a[sortState.key].localeCompare(b[sortState.key]);
    } else if (sortState.key === 'level') {
      result = a.level - b.level;
    }
    return sortState.direction === 'asc' ? result : -result;
  });
  
  renderSpells();
}

// Renderização
function renderSpells() {
  const list = document.getElementById('spells-list');
  if (!list) return;
  
  list.innerHTML = '';
  
  filteredSpells.forEach(spell => {
    const li = document.createElement('li');
    li.className = 'spell-item';
    li.innerHTML = `
      <div class="spell-name">${spell.name}</div>
      <div class="spell-meta">${spell.school} · Nível ${spell.level}</div>
    `;
    list.appendChild(li);
  });
}

// Inicialização
function initSpells() {
  const spellsBtn = document.getElementById('spells-button');
  const spellsClose = document.getElementById('spells-close');
  const spellsOverlay = document.getElementById('spells-overlay');
  const spellsModal = document.getElementById('spells-modal');
  
  if (!spellsBtn || !spellsClose || !spellsOverlay || !spellsModal) return;
  if (spellsModal.dataset.initialized === 'true') return;
  
  spellsModal.dataset.initialized = 'true';
  
  spellsBtn.addEventListener('click', openSpells);
  spellsClose.addEventListener('click', closeSpells);
  spellsOverlay.addEventListener('click', closeSpells);
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isSpellsOpen) closeSpells();
  });
  
  // Search
  const searchInput = document.getElementById('spells-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(applyFilters, 200);
    });
  }
  
  // Sort buttons
  document.querySelectorAll('.spells-sort button').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.sort;
      if (sortState.key === key) {
        sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
      } else {
        sortState.key = key;
        sortState.direction = 'asc';
      }
      
      document.querySelectorAll('.spells-sort button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    });
  });
  
  loadSpells();
}

// Bootstrap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initSpells());
} else {
  initSpells();
}
document.addEventListener('modals:loaded', () => initSpells());