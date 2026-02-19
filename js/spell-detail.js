// spell-detail.js - Modal de detalhes da magia

let isSpellDetailOpen = false;
let currentSpell = null;

// Torna a função global
window.openSpellDetail = function(spell) {
  console.log('Abrindo detalhe da magia:', spell.name);
  
  // 🔹 CORREÇÃO: Busca os elementos diretamente no documento, não dentro do spells-modal
  const modal = document.getElementById('spell-detail-modal');
  const overlay = document.getElementById('spell-detail-overlay');
  
  if (!modal || !overlay) {
    console.log('Modal de detalhe não encontrado');
    return;
  }
  
  currentSpell = spell;
  
  // Preenche os dados - busca diretamente no documento
  const title = document.getElementById('spell-detail-title');
  const cost = document.getElementById('spell-detail-cost');
  const school = document.getElementById('spell-detail-school');
  const level = document.getElementById('spell-detail-level');
  const description = document.getElementById('spell-detail-description');
  const tagsContainer = document.getElementById('spell-detail-tags');
  
  if (title) title.textContent = spell.name;
  if (cost) cost.textContent = spell.cost || '—';
  
  // Formata o nome da escola
  const schoolNames = {
    'neofita': 'Neófita',
    'bruxaria': 'Bruxaria',
    'divinacao': 'Divinação',
    'feiticaria': 'Feitiçaria'
  };
  if (school) school.textContent = schoolNames[spell.school] || spell.school;
  
  if (level) level.textContent = `Nível ${spell.level}`;
  if (description) description.textContent = spell.description || '';
  
  // Renderiza tags
  if (tagsContainer) {
    tagsContainer.innerHTML = '';
    
    if (spell.tags && Array.isArray(spell.tags)) {
      spell.tags.forEach(tag => {
        const tagSpan = document.createElement('span');
        tagSpan.className = 'spell-detail-tag';
        tagSpan.textContent = tag;
        tagsContainer.appendChild(tagSpan);
      });
    }
    
    if (spell.combat) {
      const combatTag = document.createElement('span');
      combatTag.className = 'spell-detail-tag combat';
      combatTag.textContent = 'combate';
      tagsContainer.appendChild(combatTag);
    }
  }
  
  isSpellDetailOpen = true;
  modal.classList.add('active');
  overlay.classList.add('active');
  document.body.classList.add('no-scroll');
};

window.closeSpellDetail = function() {
  const modal = document.getElementById('spell-detail-modal');
  const overlay = document.getElementById('spell-detail-overlay');
  
  if (!isSpellDetailOpen || !modal || !overlay) return;
  
  isSpellDetailOpen = false;
  modal.classList.remove('active');
  overlay.classList.remove('active');
  document.body.classList.remove('no-scroll');
  currentSpell = null;
};

// Inicialização
function initSpellDetail() {
  console.log('Inicializando spell-detail.js');
  
  const closeBtn = document.getElementById('spell-detail-close');
  const overlay = document.getElementById('spell-detail-overlay');
  
  if (closeBtn) {
    closeBtn.onclick = window.closeSpellDetail;
  }
  
  if (overlay) {
    overlay.onclick = window.closeSpellDetail;
  }
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isSpellDetailOpen) {
      window.closeSpellDetail();
    }
  });
}

// Bootstrap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSpellDetail);
} else {
  initSpellDetail();
}

document.addEventListener('modals:loaded', initSpellDetail);