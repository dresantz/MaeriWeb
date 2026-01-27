// Renderiza um capítulo inteiro do rulebook
export function renderRulebookChapter(chapterData) {
  const container = document.getElementById("rulebook-content");
  if (!container) return;

  // Limpa conteúdo anterior
  container.innerHTML = "";

  /* =========================
     Chapter Title
  ========================= */
  const title = createElement("h1", null, chapterData.title || "Rulebook");
  container.appendChild(title);

  /* =========================
     Chapter Description
  ========================= */
  if (chapterData.description) {
    const desc = createElement(
      "p",
      "chapter-description",
      chapterData.description
    );
    container.appendChild(desc);
  }

  /* =========================
     Sections (Topics)
  ========================= */
  (chapterData.sections || []).forEach((section) => {
    const sectionEl = document.createElement("section");

    if (section.id) {
      sectionEl.id = section.id;
      sectionEl.dataset.topic = "true";
    }

    const h2 = createElement("h2", null, section.title || "Untitled Section");
    sectionEl.appendChild(h2);

    (section.content || []).forEach((block) => {
      renderContentBlock(sectionEl, block);
    });

    container.appendChild(sectionEl);
  });
}

/* =====================================================
   Helper
===================================================== */

function createElement(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

/* =====================================================
   Renderizadores de blocos
===================================================== */

function renderParagraph(container, block) {
  const p = createElement("p", null, block.text || "");
  container.appendChild(p);
}

/* ✅ LISTA ATUALIZADA */
function renderList(container, block) {
  const style = block.style || "unordered";
  const listEl = document.createElement(
    style === "ordered" ? "ol" : "ul"
  );

  (block.items || []).forEach((item) => {
    const li = document.createElement("li");

    // 🟢 Lista simples (string)
    if (typeof item === "string") {
      li.textContent = item;
      listEl.appendChild(li);
      return;
    }

    // 🟢 Lista estruturada (objeto)
    if (typeof item === "object" && item !== null) {
      if (item.text) {
        const textNode = document.createTextNode(item.text);
        li.appendChild(textNode);
      }

      // Subitens
      if (Array.isArray(item.subitems) && item.subitems.length > 0) {
        const subUl = document.createElement("ul");

        item.subitems.forEach((sub) => {
          const subLi = document.createElement("li");
          subLi.textContent = sub;
          subUl.appendChild(subLi);
        });

        li.appendChild(subUl);
      }

      listEl.appendChild(li);
    }
  });

  container.appendChild(listEl);
}

function renderTable(container, block) {
  if (block.caption) {
    const caption = createElement(
      "p",
      "table-caption",
      block.caption
    );
    container.appendChild(caption);
  }

  const wrapper = createElement("div", "table-wrapper");
  const table = document.createElement("table");

  if (block.columns && block.columns.length > 0) {
    const thead = document.createElement("thead");
    const tr = document.createElement("tr");

    block.columns.forEach((colName) => {
      const th = createElement("th", null, colName);
      tr.appendChild(th);
    });

    thead.appendChild(tr);
    table.appendChild(thead);
  }

  const tbody = document.createElement("tbody");

  (block.rows || []).forEach((row) => {
    const tr = document.createElement("tr");

    row.forEach((cell) => {
      const td = createElement("td", null, cell);
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  wrapper.appendChild(table);
  container.appendChild(wrapper);
}

function renderSubsections(container, block) {
  const subsections = block.items || [];

  subsections.forEach((sub) => {
    const subWrap = createElement("div", "subsection");

    if (sub.id) subWrap.id = sub.id;

    const title = createElement("h3", null, sub.title || "Untitled");
    subWrap.appendChild(title);

    (sub.content || []).forEach((subBlock) => {
      renderContentBlock(subWrap, subBlock);
    });

    container.appendChild(subWrap);
  });
}

/* =====================================================
   Dispatcher
===================================================== */

function renderContentBlock(container, block) {
  if (!block || !block.type) return;

  switch (block.type) {
    case "paragraph":
      renderParagraph(container, block);
      break;

    case "list":
      renderList(container, block);
      break;

    case "table":
      renderTable(container, block);
      break;

    case "subsections":
      renderSubsections(container, block);
      break;

    case "nestedList": {
      const ul = document.createElement("ul");
      ul.classList.add("nested-list");

      block.items.forEach((item) => {
        const li = document.createElement("li");

        if (item.title) {
          const title = document.createElement("strong");
          title.textContent = item.title;
          li.appendChild(title);
        }

        if (Array.isArray(item.items)) {
          const subUl = document.createElement("ul");

          item.items.forEach((subItem) => {
            const subLi = document.createElement("li");
            subLi.textContent = subItem;
            subUl.appendChild(subLi);
          });

          li.appendChild(subUl);
        }

        ul.appendChild(li);
      });

      container.appendChild(ul);
      break;
    }

    default:
      container.appendChild(
        createElement(
          "p",
          "warning",
          `[Unsupported block type: ${block.type}]`
        )
      );
  }
}
