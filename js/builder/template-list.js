// js/builder/template-list.js
// =========================
// Maeri RPG - Template List
// =========================

const TEMPLATE_FILES = [
  'warrior-1',
];

class TemplateList {
  constructor() {
    this.files = TEMPLATE_FILES;
    this.cache = new Map();
  }

  getAllFiles() {
    return this.files;
  }

  getFileByIndex(index) {
    return this.files[index];
  }

  getFileById(id) {
    if (this.files.includes(id)) return id;
    return this.files.find(file => file.startsWith(id + '-')) || null;
  }

  hasFile(fileName) {
    return this.files.includes(fileName);
  }

  getCount() {
    return this.files.length;
  }

  createCard(template, fileName) {
    if (!template) return null;

    const card = document.createElement('div');
    card.className = 'char-card char-card--ready';
    card.dataset.templateFile = fileName;
    
    const baseId = fileName.split('-')[0];
    card.dataset.char = baseId;
    
    card.innerHTML = `
      <div class="char-card-image ${baseId}-bg">
        <span class="char-class">${template.class || ''}</span>
      </div>
      <div class="char-card-info">
        <h4 class="char-name">${template.name || 'Sem nome'}</h4>
        <p class="char-desc">${template.description || ''}</p>
        <span class="char-level">Nível ${template.level || '?'}</span>
      </div>
    `;
    
    return card;
  }

  async renderCards(container, templateManager) {
    if (!container) return;

    container.innerHTML = '';
    
    const loadingEl = document.createElement('div');
    loadingEl.className = 'loading-state';
    loadingEl.innerHTML = '<span class="spinner"></span> <span>Carregando personagens...</span>';
    container.appendChild(loadingEl);
    
    const loadPromises = this.files.map(async (fileName) => {
      if (this.cache.has(fileName)) return this.cache.get(fileName);
      
      const template = await templateManager.loadTemplate(fileName);
      if (template) this.cache.set(fileName, template);
      return template;
    });

    const templates = await Promise.all(loadPromises);
    
    container.innerHTML = '';
    let cardsRendered = 0;
    
    templates.forEach((template, index) => {
      if (!template) return;
      
      const card = this.createCard(template, this.files[index]);
      if (card) {
        container.appendChild(card);
        cardsRendered++;
      }
    });

    if (cardsRendered === 0) {
      container.innerHTML = '<p class="error-message">Nenhum personagem pronto disponível</p>';
    }
  }

  async updateCard(fileName, container, templateManager) {
    if (!container) return;

    const oldCard = container.querySelector(`[data-template-file="${fileName}"]`);
    if (!oldCard) return;

    const template = await templateManager.loadTemplate(fileName);
    if (!template) return;

    this.cache.set(fileName, template);
    const newCard = this.createCard(template, fileName);
    if (newCard) oldCard.replaceWith(newCard);
  }

  clearCache() {
    this.cache.clear();
  }
}

const templateList = new TemplateList();
export default templateList;