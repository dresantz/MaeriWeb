import { RULEBOOK_CHAPTERS } from '../rulebook/constants.js';

const modal = document.getElementById('shield-modal');
const modalTitle = document.getElementById('shield-modal-title');
const modalBody = document.getElementById('shield-modal-body');
const closeBtn = document.getElementById('shield-modal-close');

let allData = null;

// Carrega TODOS os capítulos uma vez
async function loadAllChapters() {
  if (allData) return allData;
  
  allData = { sections: [] };
  
  for (const chapter of RULEBOOK_CHAPTERS) {
    try {
      const response = await fetch(`../../data/rulebook/${chapter.file}`);
      const data = await response.json();
      allData.sections.push(...(data.sections || []));
    } catch (e) {
      console.warn(`Erro ao carregar ${chapter.file}:`, e);
    }
  }
  
  return allData;
}

// Busca todos os conteúdos com teste_item ou id="teste_item"
function findTesteItems(data) {
  let items = [];

  function search(obj) {
    if (!obj) return;
    if (obj.teste_item) {
      items.push({ type: 'paragraph', text: obj.teste_item });
    }
    if (obj.id === 'teste_item' && obj.items) {
      items.push({ type: 'list', items: obj.items });
    }
    if (obj.content) obj.content.forEach(search);
    if (obj.sections) obj.sections.forEach(search);
    if (Array.isArray(obj)) obj.forEach(search);
  }

  search(data);
  return items;
}

// Renderiza o conteúdo no modal
function renderShieldContent(items) {
  if (!modalBody) return;
  modalBody.innerHTML = '';
  
  items.forEach(item => {
    if (item.type === 'paragraph') {
      const p = document.createElement('p');
      p.textContent = item.text;
      modalBody.appendChild(p);
    }
    if (item.type === 'list') {
      const ul = document.createElement('ul');
      item.items.forEach(text => {
        const li = document.createElement('li');
        li.textContent = text;
        ul.appendChild(li);
      });
      modalBody.appendChild(ul);
    }
  });
}

// Abre o modal
async function openShieldModal() {
  const data = await loadAllChapters();
  const items = findTesteItems(data);
  if (modalTitle) modalTitle.textContent = 'Testes';
  renderShieldContent(items);
  if (modal) modal.classList.add('active');
}

// Fecha o modal
function closeShieldModal() {
  if (modal) modal.classList.remove('active');
  if (modalBody) modalBody.innerHTML = '';
}

// Event listeners
if (closeBtn) closeBtn.addEventListener('click', closeShieldModal);
if (modal) modal.addEventListener('click', (e) => {
  if (e.target === modal) closeShieldModal();
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.shield-button').forEach(btn => {
    if (btn.textContent.trim() === 'Testes') {
      btn.addEventListener('click', openShieldModal);
    }
  });
});