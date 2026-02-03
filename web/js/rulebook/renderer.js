import { observeTopics, restoreLastTopic } from "./navigation.js";


// Renderiza um capítulo inteiro do rulebook
export function renderRulebookChapter(chapterData) {
  const container = document.getElementById("rulebook-content");
  if (!container) return;

  observeTopics();
  restoreLastTopic();

  /* =====================================================
     RESET SEGURO
  ===================================================== */

  if (container.contains(document.activeElement)) {
    container.blur?.();
  }

  container.innerHTML = "";
  container.offsetHeight; // força reflow

  /* =====================================================
     Chapter Header
  ===================================================== */

  const header = document.createElement("header");
  header.className = "chapter-header";

  const title = createElement(
    "h1",
    null,
    chapterData.title || "Rulebook"
  );
  header.appendChild(title);

  if (chapterData.description) {
    header.appendChild(
      createElement(
        "p",
        "chapter-description",
        chapterData.description
      )
    );
  }

  container.appendChild(header);

  /* =====================================================
     Sections (Topics)
  ===================================================== */

  (chapterData.sections || []).forEach((section) => {
    const sectionEl = document.createElement("section");
    sectionEl.className = "chapter-section";

    if (section.id) {
      sectionEl.id = section.id;
      sectionEl.dataset.topic = "true";
      sectionEl.setAttribute("aria-labelledby", `${section.id}-title`);
    }

    const h2 = createElement(
      "h2",
      "section-title",
      section.title || "Untitled Section"
    );

    if (section.id) {
      h2.id = `${section.id}-title`;
    }

    sectionEl.appendChild(h2);

    (section.content || []).forEach((block) => {
      renderContentBlock(sectionEl, block);
    });

    container.appendChild(sectionEl);
  });
}

/* =====================================================
   Helpers
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
  container.appendChild(
    createElement("p", null, block.text || "")
  );
}

function renderSpellList(container, block) {
  if (!Array.isArray(block.spells)) return;

  block.spells.forEach((spell) => {
    renderContentBlock(container, {
      ...spell,
      type: "spell"
    });
  });
}

function renderSpellAsParagraph(container, spell) {
  const parts = [];

  // Nome da magia
  if (spell.name) {
    parts.push(
      spell.name.endsWith(".")
        ? spell.name
        : `${spell.name}.`
    );
  }

  // Descrição
  if (spell.description) {
    parts.push(spell.description.trim());
  }

  // Custo (ex: "4 xpm/alvo")
  if (spell.cost) {
    parts.push(
      spell.cost.endsWith(".")
        ? spell.cost
        : `${spell.cost}.`
    );
  }

  const text = parts.join(" ");

  container.appendChild(
    createElement("p", null, text)
  );
}


function renderList(container, block) {
  const listEl = document.createElement(
    block.style === "ordered" ? "ol" : "ul"
  );

  (block.items || []).forEach((item) => {
    const li = document.createElement("li");

    if (typeof item === "string") {
      li.textContent = item;
    } else if (item?.text) {
      li.appendChild(document.createTextNode(item.text));

      if (Array.isArray(item.subitems)) {
        const subUl = document.createElement("ul");
        item.subitems.forEach((sub) => {
          subUl.appendChild(
            createElement("li", null, sub)
          );
        });
        li.appendChild(subUl);
      }
    }

    listEl.appendChild(li);
  });

  container.appendChild(listEl);
}

function renderTable(container, block) {
  if (block.caption) {
    container.appendChild(
      createElement("p", "table-caption", block.caption)
    );
  }

  const wrapper = createElement("div", "table-wrapper");
  const table = document.createElement("table");

  if (block.columns?.length) {
    const thead = document.createElement("thead");
    const tr = document.createElement("tr");

    block.columns.forEach((col) =>
      tr.appendChild(createElement("th", null, col))
    );

    thead.appendChild(tr);
    table.appendChild(thead);
  }

  const tbody = document.createElement("tbody");

  (block.rows || []).forEach((row) => {
    const tr = document.createElement("tr");

    row.forEach((cell) => {
      tr.appendChild(createElement("td", null, cell));
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  wrapper.appendChild(table);
  container.appendChild(wrapper);
}

function renderSubsections(container, block) {
  (block.items || []).forEach((sub) => {
    const wrap = createElement("div", "subsection");

    if (sub.id) wrap.id = sub.id;

    wrap.appendChild(
      createElement("h3", null, sub.title || "Untitled")
    );

    (sub.content || []).forEach((subBlock) =>
      renderContentBlock(wrap, subBlock)
    );

    container.appendChild(wrap);
  });
}

/* =====================================================
   Dispatcher
===================================================== */

function renderContentBlock(container, block) {
  if (!block?.type) return;

  switch (block.type) {
    case "paragraph":
      return renderParagraph(container, block);

    case "list":
      return renderList(container, block);

    case "table":
      return renderTable(container, block);

    case "subsections":
      return renderSubsections(container, block);

    case "spellList":
      return renderSpellList(container, block);

    case "spell":
      return renderSpellAsParagraph(container, block);


    case "nestedList": {
      const ul = createElement("ul", "nested-list");

      block.items?.forEach((item) => {
        const li = document.createElement("li");

        if (item.title) {
          li.appendChild(
            createElement("strong", null, item.title)
          );
        }

        if (Array.isArray(item.items)) {
          const subUl = document.createElement("ul");
          item.items.forEach((sub) =>
            subUl.appendChild(
              createElement("li", null, sub)
            )
          );
          li.appendChild(subUl);
        }

        ul.appendChild(li);
      });

      container.appendChild(ul);
      return;
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
