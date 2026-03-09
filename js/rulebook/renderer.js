/**
 * renderer.js - Renderização do conteúdo do rulebook
 * Converte dados JSON em elementos DOM
 * 
 * Dependências:
 * - ./navigation.js: Scroll spy
 */

/*
 * [marcar]
 * **negrito**
 * *itálico*
 * __sublinhado__
 */

import { observeTopics } from "./navigation.js";

// ===== CONSTANTES =====
const MARK_PATTERN = /\[(.*?)\]/g;
const MARK_CLASS = 'mark';

// ===== UTILITÁRIOS =====

/**
 * Cria um elemento DOM com atributos básicos
 */
function createElement(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

/**
 * Aplica marcações [texto] em um elemento
 */
function applyMarkings(element, text) {
  if (!text) return;

  let html = text;

  // marcação existente [texto]
  html = html.replace(/\[(.*?)\]/g, `<span class="${MARK_CLASS}">$1</span>`);

  // negrito **texto**
  html = html.replace(/\*\*(.*?)\*\*/g, `<strong>$1</strong>`);

  // itálico *texto*
  html = html.replace(/\*(.*?)\*/g, `<em>$1</em>`);

  // sublinhado __texto__
  html = html.replace(/__(.*?)__/g, `<u>$1</u>`);

  element.innerHTML = html;
}

/**
 * Processa um bloco de conteúdo recursivamente
 */
function processBlock(block) {
  if (!block?.type) return null;
  
  const handlers = {
    paragraph: renderParagraph,
    list: renderList,
    table: renderTable,
    subsections: renderSubsections,
    spellList: renderSpellList,
    spell: renderSpellAsParagraph,
    nestedList: renderNestedList
  };
  
  const handler = handlers[block.type];
  return handler ? handler(block) : null;
}

// ===== RENDERIZADORES ESPECÍFICOS =====

function renderParagraph(block) {
  const p = document.createElement('p');
  
  if (block.topic_id) {
    p.id = block.topic_id;
    p.dataset.topic = 'true';
  } 
  else if (block.id) {
    p.id = block.id;
  }
  
  applyMarkings(p, block.text);
  return p;
}

function renderList(block) {
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
          if (sub.topic_id) {
            subLi.id = sub.topic_id;
            subLi.dataset.topic = 'true';
          } else if (sub.id) {
            subLi.id = sub.id;
          }
          subUl.appendChild(subLi);
        });
        li.appendChild(subUl);
      }
    }
    
    listEl.appendChild(li);
  });
  
  return listEl;
}

function renderNestedList(block) {
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
        if (sub.topic_id) {
          subLi.id = sub.topic_id;
          subLi.dataset.topic = 'true';
        } else if (sub.id) {
          subLi.id = sub.id;
        }
        subUl.appendChild(subLi);
      });
      li.appendChild(subUl);
    }
    
    ul.appendChild(li);
  });
  
  return ul;
}

function renderTable(block) {
  const fragment = document.createDocumentFragment();
  
  if (block.caption) {
    fragment.appendChild(createElement('p', 'table-caption', block.caption));
  }
  
  const wrapper = createElement('div', 'table-wrapper');
  const table = document.createElement('table');

  if (block.columns?.length) {
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    block.columns.forEach(col => {
      tr.appendChild(createElement('th', null, col));
    });
    thead.appendChild(tr);
    table.appendChild(thead);
  }

  const tbody = document.createElement('tbody');
  (block.rows || []).forEach(row => {
    const tr = document.createElement('tr');
    row.forEach(cell => {
      const td = createElement('td', null, cell);
      applyMarkings(td, cell);
      if (cell.topic_id) {
        td.id = cell.topic_id;
        td.dataset.topic = 'true';
      } else if (cell.id) {
        td.id = cell.id;
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  
  table.appendChild(tbody);
  wrapper.appendChild(table);
  fragment.appendChild(wrapper);
  
  return fragment;
}

function renderSubsections(block) {
  const fragment = document.createDocumentFragment();
  
  (block.items || []).forEach(sub => {
    const wrap = createElement('div', 'subsection');
    
    if (sub.topic_id) {
      wrap.id = sub.topic_id;
      wrap.dataset.topic = 'true';
    }
    else if (sub.id) {
      wrap.id = sub.id;
    }
    
    wrap.appendChild(createElement('h3', null, sub.title || 'Untitled'));
    
    (sub.content || []).forEach(subBlock => {
      const element = processBlock(subBlock);
      if (element) wrap.appendChild(element);
    });
    
    fragment.appendChild(wrap);
  });
  
  return fragment;
}

function renderSpellList(block) {
  const fragment = document.createDocumentFragment();
  
  (block.spells || []).forEach(spell => {
    const element = renderSpellAsParagraph({ ...spell, type: 'spell' });
    if (element) fragment.appendChild(element);
  });
  
  return fragment;
}

function renderSpellAsParagraph(block) {
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
  
  if (parts.length === 0) return null;
  
  const p = document.createElement('p');
  p.className = 'spell-entry';
  
  if (block.topic_id) {
    p.id = block.topic_id;
    p.dataset.topic = 'true';
  }
  else if (block.id) {
    p.id = block.id;
  }
  
  applyMarkings(p, parts.join(' '));
  
  return p;
}

// ===== RENDERIZADOR PRINCIPAL =====

/**
 * Renderiza um capítulo completo do rulebook
 */
export function renderRulebookChapter(chapterData) {
  const container = document.getElementById('rulebook-content');
  if (!container) {
    console.error('Container rulebook-content não encontrado');
    return;
  }

  container.innerHTML = '';
  container.offsetHeight;

  const fragment = document.createDocumentFragment();

  const header = document.createElement('header');
  header.className = 'chapter-header';
  header.appendChild(createElement('h1', null, chapterData.id || 'Rulebook'));
  
  if (chapterData.description) {
    header.appendChild(createElement('p', 'chapter-description', chapterData.description));
  }
  
  fragment.appendChild(header);

  (chapterData.sections || []).forEach(section => {
    const sectionEl = document.createElement('section');
    sectionEl.className = 'chapter-section';
    
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
    // 👇 SÓ ativa o scroll spy, NÃO restaura tópico
    observeTopics();
    // A restauração é feita pelo loader quando necessário
  });
}

export { processBlock };