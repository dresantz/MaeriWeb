import { observeTopics, restoreLastTopic } from "./navigation.js";

export function renderRulebookChapter(chapterData) {
  const container = document.getElementById("rulebook-content");
  if (!container) return;

  container.innerHTML = ""; // Limpa o conteúdo anterior
  container.offsetHeight; // Força reflow do DOM

  const header = document.createElement("header");
  header.className = "chapter-header";
  header.appendChild(createElement("h1", null, chapterData.title || "Rulebook"));
  if (chapterData.description) {
    header.appendChild(createElement("p", "chapter-description", chapterData.description));
  }
  container.appendChild(header); // Adiciona cabeçalho do capítulo

  (chapterData.sections || []).forEach((section) => {
    const sectionEl = document.createElement("section");
    sectionEl.className = "chapter-section";
    if (section.id) {
      sectionEl.id = section.id;
      sectionEl.dataset.topic = "true";
      sectionEl.setAttribute("aria-labelledby", `${section.id}-title`);
    }

    const h2 = createElement("h2", "section-title", section.title || "Untitled Section");
    if (section.id) h2.id = `${section.id}-title`;
    sectionEl.appendChild(h2); // Título da seção

    (section.content || []).forEach((block) => renderContentBlock(sectionEl, block));
    container.appendChild(sectionEl); // Adiciona seção completa
  });

  observeTopics(); // Ativa observadores de navegação
  restoreLastTopic(); // Restaura último tópico visitado
}

function createElement(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el; // Cria elemento DOM com atributos básicos
}

function renderParagraph(container, block) {
  const p = document.createElement("p");
  p.innerHTML = (block.text || "").replace(/\[(.*?)\]/g, '<span class="mark">$1</span>');
  container.appendChild(p); // Renderiza parágrafo com marcações [ ]
}

function renderSpellList(container, block) {
  if (!Array.isArray(block.spells)) return;
  block.spells.forEach((spell) => renderContentBlock(container, { ...spell, type: "spell" })); // Processa lista de magias
}

function renderSpellAsParagraph(container, spell) {
  const parts = [];
  if (spell.name) parts.push(spell.name.endsWith(".") ? spell.name : `${spell.name}.`);
  if (spell.description) parts.push(spell.description.trim());
  if (spell.cost) parts.push(spell.cost.endsWith(".") ? spell.cost : `${spell.cost}.`);
  container.appendChild(createElement("p", null, parts.join(" "))); // Magia em formato texto
}

function renderList(container, block) {
  const listEl = document.createElement(block.style === "ordered" ? "ol" : "ul");
  (block.items || []).forEach((item) => {
    const li = document.createElement("li");
    if (typeof item === "string") {
      li.innerHTML = item.replace(/\[(.*?)\]/g, '<span class="mark">$1</span>');
    } else if (item?.text) {
      li.innerHTML = item.text.replace(/\[(.*?)\]/g, '<span class="mark">$1</span>');
      if (Array.isArray(item.subitems)) {
        const subUl = document.createElement("ul");
        item.subitems.forEach((sub) => subUl.appendChild(createElement("li", null, sub)));
        li.appendChild(subUl); // Subitens aninhados
      }
    }
    listEl.appendChild(li);
  });
  container.appendChild(listEl); // Renderiza lista ordenada ou não
}

function renderTable(container, block) {
  if (block.caption) container.appendChild(createElement("p", "table-caption", block.caption));
  const wrapper = createElement("div", "table-wrapper");
  const table = document.createElement("table");

  if (block.columns?.length) {
    const thead = document.createElement("thead");
    const tr = document.createElement("tr");
    block.columns.forEach((col) => tr.appendChild(createElement("th", null, col)));
    thead.appendChild(tr);
    table.appendChild(thead); // Cabeçalho da tabela
  }

  const tbody = document.createElement("tbody");
  (block.rows || []).forEach((row) => {
    const tr = document.createElement("tr");
    row.forEach((cell) => {
      const td = createElement("td", null, cell);
      td.innerHTML = td.innerHTML.replace(/\[(.*?)\]/g, '<span class="mark">$1</span>');
      tr.appendChild(td); // Célula com suporte a marcações
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  wrapper.appendChild(table);
  container.appendChild(wrapper); // Tabela completa com wrapper responsivo
}

function renderSubsections(container, block) {
  (block.items || []).forEach((sub) => {
    const wrap = createElement("div", "subsection");
    if (sub.id) wrap.id = sub.id;
    wrap.appendChild(createElement("h3", null, sub.title || "Untitled"));
    (sub.content || []).forEach((subBlock) => renderContentBlock(wrap, subBlock));
    container.appendChild(wrap); // Subseção com título e conteúdo próprio
  });
}

function renderContentBlock(container, block) {
  if (!block?.type) return;
  switch (block.type) {
    case "paragraph": return renderParagraph(container, block);
    case "list": return renderList(container, block);
    case "table": return renderTable(container, block);
    case "subsections": return renderSubsections(container, block);
    case "spellList": return renderSpellList(container, block);
    case "spell": return renderSpellAsParagraph(container, block);
    case "nestedList": {
      const ul = createElement("ul", "nested-list");
      block.items?.forEach((item) => {
        const li = document.createElement("li");
        if (item.title) li.appendChild(createElement("strong", null, item.title));
        if (Array.isArray(item.items)) {
          const subUl = document.createElement("ul");
          item.items.forEach((sub) => subUl.appendChild(createElement("li", null, sub)));
          li.appendChild(subUl); // Lista aninhada com títulos
        }
        ul.appendChild(li);
      });
      container.appendChild(ul); // Lista hierárquica
      return;
    }
  }
}