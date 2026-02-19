// spells.js - Controle de magias com filtros combinados

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

// Estado dos filtros
let filters = {
  schools: {
    neofita: false,
    bruxaria: false,
    divinacao: false,
    feiticaria: false
  },
  levels: {
    1: false,
    3: false,
    5: false
  }
};

let searchTimeout = null;

// Helper para normalizar nomes das escolas
function normalizeSchool(school) {
  const schoolMap = {
    'neófita': 'neofita',
    'neofita': 'neofita',
    'bruxaria': 'bruxaria',
    'divinação': 'divinacao',
    'divinacao': 'divinacao',
    'feitiçaria': 'feiticaria',
    'feiticaria': 'feiticaria'
  };
  return schoolMap[school.toLowerCase()] || school.toLowerCase();
}

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
  } catch (e) {
    console.error('Erro ao carregar magias:', e);
  }
}

// Aplica todos os filtros combinados
function applyFilters() {
  const searchTerm = document.getElementById('spells-search')?.value.toLowerCase() || '';
  
  // Verifica se há algum filtro ativo
  const hasActiveSchool = Object.values(filters.schools).some(v => v);
  const hasActiveLevel = Object.values(filters.levels).some(v => v);
  
  filteredSpells = spells.filter(spell => {
    // Filtro de busca por nome
    const matchesSearch = spell.name.toLowerCase().includes(searchTerm);
    if (!matchesSearch) return false;
    
    // Filtro de escola (se houver filtros ativos)
    if (hasActiveSchool) {
      const spellSchool = normalizeSchool(spell.school);
      if (!filters.schools[spellSchool]) return false;
    }
    
    // Filtro de nível (se houver filtros ativos)
    if (hasActiveLevel) {
      if (!filters.levels[spell.level]) return false;
    }
    
    return true;
  });
  
  renderSpells();
}

// Configura listeners dos filtros
function setupFilterListeners() {
  // Toggle dos dropdowns
  document.querySelectorAll('.filter-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const options = e.target.nextElementSibling;
      const isVisible = options.style.display === 'block';
      
      // Fecha todos os outros dropdowns
      document.querySelectorAll('.filter-options').forEach(opt => {
        opt.style.display = 'none';
      });
      
      // Abre/fecha o atual
      options.style.display = isVisible ? 'none' : 'block';
      
      // Atualiza seta
      if (isVisible) {
        e.target.innerHTML = e.target.innerHTML.replace('▲', '▼');
      } else {
        e.target.innerHTML = e.target.innerHTML.replace('▼', '▲');
      }
    });
  });
  
  // Fecha dropdowns ao clicar fora
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.filter-group')) {
      document.querySelectorAll('.filter-options').forEach(opt => {
        opt.style.display = 'none';
      });
      document.querySelectorAll('.filter-toggle').forEach(btn => {
        btn.innerHTML = btn.innerHTML.replace('▲', '▼');
      });
    }
  });
  
  // Checkboxes de escola
  document.querySelectorAll('[data-school]').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const school = e.target.dataset.school;
      filters.schools[school] = e.target.checked;
      applyFilters();
    });
  });
  
  // Checkboxes de nível
  document.querySelectorAll('[data-level]').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const level = parseInt(e.target.dataset.level);
      filters.levels[level] = e.target.checked;
      applyFilters();
    });
  });
}

// Sincroniza UI dos filtros com o estado
function syncFilterUI() {
  // Sincroniza escolas
  Object.keys(filters.schools).forEach(school => {
    const checkbox = document.querySelector(`[data-school="${school}"]`);
    if (checkbox) checkbox.checked = filters.schools[school];
  });
  
  // Sincroniza níveis
  Object.keys(filters.levels).forEach(level => {
    const checkbox = document.querySelector(`[data-level="${level}"]`);
    if (checkbox) checkbox.checked = filters.levels[level];
  });
}

// Renderização da lista de magias
function renderSpells() {
  const list = document.getElementById('spells-list');
  if (!list) return;
  
  list.innerHTML = '';
  
  if (filteredSpells.length === 0) {
    const li = document.createElement('li');
    li.className = 'spell-item empty-state';
    li.innerHTML = '<div class="spell-name">Nenhuma magia encontrada</div>';
    list.appendChild(li);
    return;
  }
  
  filteredSpells.forEach(spell => {
    const li = document.createElement('li');
    li.className = 'spell-item';
    li.innerHTML = `
      <div class="spell-name">${spell.name}</div>
      <div class="spell-meta">
        <span>${spell.school}</span>
        <span>Nível ${spell.level}</span>
      </div>
    `;
    list.appendChild(li);
  });
}

// Limpa todos os filtros
function clearFilters() {
  filters = {
    schools: {
      neofita: false,
      bruxaria: false,
      divinacao: false,
      feiticaria: false
    },
    levels: {
      1: false,
      3: false,
      5: false
    }
  };
  
  // Atualiza UI dos checkboxes
  syncFilterUI();
  
  applyFilters();
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
  
  // Configura listeners dos filtros
  setupFilterListeners();
  
  // Sincroniza UI com estado inicial
  syncFilterUI();
  
  // Carrega magias
  loadSpells();
}

// Bootstrap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initSpells());
} else {
  initSpells();
}

document.addEventListener('modals:loaded', () => initSpells());