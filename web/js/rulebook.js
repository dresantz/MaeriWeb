function renderRulebook(chapterData) {
  const container = document.getElementById("rulebook-content");
  if (!container) return;

  container.innerHTML = "";

  // Chapter title
  const chapterTitle = document.createElement("h1");
  chapterTitle.textContent = chapterData.title;
  container.appendChild(chapterTitle);

  // Description
  if (chapterData.description) {
    const desc = document.createElement("p");
    desc.textContent = chapterData.description;
    container.appendChild(desc);
  }

  // Sections
  chapterData.sections.forEach(section => {
    const sectionEl = document.createElement("section");
    sectionEl.id = section.id;

    const title = document.createElement("h2");
    title.textContent = section.title;
    sectionEl.appendChild(title);

    section.content.forEach(block => {
      if (block.type === "paragraph") {
        const p = document.createElement("p");
        p.textContent = block.text;
        sectionEl.appendChild(p);
      }

      if (block.type === "list") {
        const ul = document.createElement("ul");
        block.items.forEach(item => {
          const li = document.createElement("li");
          li.textContent = item;
          ul.appendChild(li);
        });
        sectionEl.appendChild(ul);
      }
    });

    container.appendChild(sectionEl);
  });
}

function loadChapter(chapterFile) {
  fetch(`/web/data/rulebook/${chapterFile}`)
    .then(response => response.json())
    .then(data => renderRulebook(data))
    .catch(error => {
      console.error("Failed to load rulebook chapter:", error);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  loadChapter("01-basico.json");
});

/* =========================
   Maeri RPG – Rulebook Renderer (JSON)
   Supports: paragraph, list, table, subsections
========================= */

function createElement(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

function renderParagraph(container, block) {
  const p = createElement("p", null, block.text || "");
  container.appendChild(p);
}

function renderList(container, block) {
  const style = block.style || "unordered";
  const listEl = document.createElement(style === "ordered" ? "ol" : "ul");

  (block.items || []).forEach((itemText) => {
    const li = createElement("li", null, itemText);
    listEl.appendChild(li);
  });

  container.appendChild(listEl);
}

function renderTable(container, block) {
  // Optional caption above the table
  if (block.caption) {
    const caption = createElement("p", "table-caption", block.caption);
    container.appendChild(caption);
  }

  const wrapper = createElement("div", "table-wrapper");
  const table = document.createElement("table");

  // Header
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

  // Body
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

    default: {
      // Unknown block type
      const warning = createElement(
        "p",
        "warning",
        `[Unsupported block type: ${block.type}]`
      );
      container.appendChild(warning);
    }
  }
}

function renderRulebookChapter(chapterData) {
  const container = document.getElementById("rulebook-content");
  if (!container) return;

  container.innerHTML = "";

  // Chapter title
  const title = createElement("h1", null, chapterData.title || "Rulebook");
  container.appendChild(title);

  // Description
  if (chapterData.description) {
    const desc = createElement("p", "chapter-description", chapterData.description);
    container.appendChild(desc);
  }

  // Sections
  (chapterData.sections || []).forEach((section) => {
    const sectionEl = document.createElement("section");
    if (section.id) sectionEl.id = section.id;

    const h2 = createElement("h2", null, section.title || "Untitled Section");
    sectionEl.appendChild(h2);

    (section.content || []).forEach((block) => {
      renderContentBlock(sectionEl, block);
    });

    container.appendChild(sectionEl);
  });
}

function loadRulebookChapter(fileName) {
  // Important:
  // - rulebook.html lives in /web/pages/
  // - JSON lives in /web/data/rulebook/
  // So from rulebook.html, the relative path is:
  // ../data/rulebook/<fileName>

  const path = `../data/rulebook/${fileName}`;

  fetch(path)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((data) => {
      renderRulebookChapter(data);
    })
    .catch((error) => {
      console.error("Failed to load rulebook chapter:", error);

      const container = document.getElementById("rulebook-content");
      if (container) {
        container.innerHTML = `
          <section>
            <h2>Error</h2>
            <p>Failed to load this chapter. Please check the console for details.</p>
          </section>
        `;
      }
    });
}

document.addEventListener("DOMContentLoaded", () => {
  // Chapter 1: O Básico
  loadRulebookChapter("01-o-basico.json");
});
