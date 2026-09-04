/**
 * renderer.js - Renderização do conteúdo do rulebook
 * Converte dados JSON em elementos DOM
 */

import { observeTopics } from "./navigation.js";

// ===== CONSTANTES =====
const MARK_CLASS = 'mark';

// ===== UTILITÁRIOS =====

function createElement(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

function applyTopicId(element, block) {
  if (block.topic_id) {
    element.id = block.topic_id;
    element.dataset.topic = 'true';
  } else if (block.id) {
    element.id = block.id;
  }
}

function applyMarkings(element, text) {
  if (!text) return;
  
  let html = text
    .replace(/\[(.*?)\]/g, `<span class="${MARK_CLASS}">$1</span>`)
    .replace(/\*\*(.*?)\*\*/g, `<strong>$1</strong>`)
    .replace(/\*(.*?)\*/g, `<em>$1</em>`)
    .replace(/__(.*?)__/g, `<u>$1</u>`);
  
  element.innerHTML = html;
}

// ===== HANDLERS DE BLOCOS =====

const blockHandlers = {
  paragraph: (block) => {
    const p = document.createElement('p');
    applyTopicId(p, block);
    applyMarkings(p, block.text);
    return p;
  },
  
  list: (block) => {
    const listEl = document.createElement(block.style === 'ordered' ? 'ol' : 'ul');
    
    (block.items || []).forEach(item => {
      const li = document.createElement('li');
      
      if (typeof item === 'string') {
        applyMarkings(li, item);
      } else if (item?.text) {
        applyMarkings(li, item.text);
        
        if (Array.isArray(item.subitems)) {
          const subUl = document.createElement('ul');
          item.subitems.forEach(sub => {
            const subLi = createElement('li', null, sub);
            applyTopicId(subLi, sub);
            subUl.appendChild(subLi);
          });
          li.appendChild(subUl);
        }
      }
      
      listEl.appendChild(li);
    });
    
    return listEl;
  },
  
  nestedList: (block) => {
    const ul = createElement('ul', 'nested-list');
    
    (block.items || []).forEach(item => {
      const li = document.createElement('li');
      
      if (item.title) {
        li.appendChild(createElement('strong', null, item.title));
      }
      
      if (Array.isArray(item.items)) {
        const subUl = document.createElement('ul');
        item.items.forEach(sub => {
          const subLi = createElement('li', null, sub);
          applyTopicId(subLi, sub);
          subUl.appendChild(subLi);
        });
        li.appendChild(subUl);
      }
      
      ul.appendChild(li);
    });
    
    return ul;
  },
  
  table: (block) => {
    const fragment = document.createDocumentFragment();
    
    if (block.caption) {
      fragment.appendChild(createElement('p', 'table-caption', block.caption));
    }
    
    const wrapper = createElement('div', 'table-wrapper');
    const table = document.createElement('table');
    
    if (block.columns?.length) {
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');
      block.columns.forEach(col => tr.appendChild(createElement('th', null, col)));
      thead.appendChild(tr);
      table.appendChild(thead);
    }
    
    const tbody = document.createElement('tbody');
    (block.rows || []).forEach(row => {
      const tr = document.createElement('tr');
      row.forEach(cell => {
        const td = document.createElement('td');
        applyTopicId(td, cell);
        applyMarkings(td, cell);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    wrapper.appendChild(table);
    fragment.appendChild(wrapper);
    
    return fragment;
  },
  
  subsections: (block) => {
    const fragment = document.createDocumentFragment();
    
    (block.items || []).forEach(sub => {
      const wrap = createElement('div', 'subsection');
      applyTopicId(wrap, sub);
      wrap.appendChild(createElement('h3', null, sub.title || 'Untitled'));
      
      (sub.content || []).forEach(subBlock => {
        const element = processBlock(subBlock);
        if (element) wrap.appendChild(element);
      });
      
      fragment.appendChild(wrap);
    });
    
    return fragment;
  },
  
  spellList: (block) => {
    const fragment = document.createDocumentFragment();
    
    (block.spells || []).forEach(spell => {
      const element = blockHandlers.spell({ ...spell, type: 'spell' });
      if (element) fragment.appendChild(element);
    });
    
    return fragment;
  },
  
  spell: (block) => {
    const parts = [];
    
    if (block.name) {
      parts.push(block.name.endsWith('.') ? block.name : `${block.name}.`);
    }
    
    if (block.description) {
      const desc = block.description.trim();
      parts.push(desc.endsWith('.') ? desc : `${desc}.`);
    }
    
    if (block.cost) {
      parts.push(block.cost.endsWith('.') ? block.cost : `${block.cost}.`);
    }
    
    if (!parts.length) return null;
    
    const p = createElement('p', 'spell-entry');
    applyTopicId(p, block);
    applyMarkings(p, parts.join(' '));
    
    return p;
  }
};

function processBlock(block) {
  if (!block?.type) return null;
  const handler = blockHandlers[block.type];
  return handler ? handler(block) : null;
}

// ===== RENDERIZADOR PRINCIPAL =====

export function renderRulebookChapter(chapterData) {
  const container = document.getElementById('rulebook-content');
  if (!container) return;
  
  container.innerHTML = '';
  
  const fragment = document.createDocumentFragment();
  
  // Header
  const header = createElement('header', 'chapter-header');
  header.appendChild(createElement('h1', null, chapterData.id || 'Rulebook'));
  
  if (chapterData.description) {
    header.appendChild(createElement('p', 'chapter-description', chapterData.description));
  }
  
  fragment.appendChild(header);
  
  // Seções
  (chapterData.sections || []).forEach(section => {
    const sectionEl = createElement('section', 'chapter-section');
    
    if (section.topic_id) {
      sectionEl.id = section.topic_id;
      sectionEl.dataset.topic = 'true';
      sectionEl.setAttribute('aria-labelledby', `${section.topic_id}-title`);
    }
    
    const h2 = createElement('h2', 'section-title', section.title || 'Untitled Section');
    if (section.topic_id) h2.id = `${section.topic_id}-title`;
    sectionEl.appendChild(h2);
    
    (section.content || []).forEach(block => {
      const element = processBlock(block);
      if (element) sectionEl.appendChild(element);
    });
    
    fragment.appendChild(sectionEl);
  });
  
  container.appendChild(fragment);
  
  requestAnimationFrame(() => {
    observeTopics();
  });
}

export { processBlock };