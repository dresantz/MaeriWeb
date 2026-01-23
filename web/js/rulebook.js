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

function renderTOC(chapterData) {
  const tocList = document.getElementById("toc-list");
  const tocChapterTitle = document.getElementById("toc-chapter-title");

  if (!tocList || !tocChapterTitle) return;

  tocChapterTitle.textContent = chapterData.title || "Rulebook";

  tocList.innerHTML = "";

  (chapterData.sections || []).forEach((section) => {
    const li = document.createElement("li");
    const a = document.createElement("a");

    a.href = `#${section.id}`;
    a.textContent = section.title || "Untitled";

    li.appendChild(a);
    tocList.appendChild(li);
  });
}

function getCurrentChapterIndex() {
  return RULEBOOK_CHAPTERS.findIndex(ch => ch.file === currentChapterFile);
}

function updateChapterNavButtons() {
  const prevBtn = document.getElementById("chapter-prev");
  const nextBtn = document.getElementById("chapter-next");

  if (!prevBtn || !nextBtn) return;

  const index = getCurrentChapterIndex();

  prevBtn.disabled = index <= 0;
  nextBtn.disabled = index === -1 || index >= RULEBOOK_CHAPTERS.length - 1;
}

function switchToChapterByIndex(newIndex) {
  if (newIndex < 0 || newIndex >= RULEBOOK_CHAPTERS.length) return;

  const chapter = RULEBOOK_CHAPTERS[newIndex];
  loadRulebookChapter(chapter.file);

  // Smooth scroll to top for reading flow
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Keep select in sync
  const select = document.getElementById("chapter-select");
  if (select) select.value = chapter.file;

  // Close TOC after switching
  const tocPanel = document.getElementById("toc-panel");
  const tocOverlay = document.getElementById("toc-overlay");
  const tocToggle = document.getElementById("toc-toggle");

  if (tocPanel && tocOverlay && tocToggle) {
    tocPanel.classList.remove("open");
    tocOverlay.classList.remove("active");
    document.body.classList.remove("no-scroll");
    tocToggle.textContent = "☰";
    tocToggle.setAttribute("aria-label", "Open Rulebook Index");
  }
}


/* =========================
   Chapter Catalog
========================= */

const RULEBOOK_CHAPTERS = [
  { file: "01-o-basico.json", title: "O Básico" },
  { file: "02-personagem.json", title: "Personagem" }
  // Depois você adiciona os próximos aqui:
  // { file: "03-....json", title: "..." },
];

let currentChapterFile = RULEBOOK_CHAPTERS[0].file;

function renderChapterSelect() {
  const select = document.getElementById("chapter-select");
  if (!select) return;

  select.innerHTML = "";

  RULEBOOK_CHAPTERS.forEach((ch) => {
    const option = document.createElement("option");
    option.value = ch.file;
    option.textContent = ch.title;
    if (ch.file === currentChapterFile) option.selected = true;
    select.appendChild(option);
  });
}

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

const ICON_CLOSED = "☰";
const ICON_OPEN = "✕";

function initTOCToggle() {
  const tocToggle = document.getElementById("toc-toggle");
  const tocPanel = document.getElementById("toc-panel");
  const tocOverlay = document.getElementById("toc-overlay");
  const tocList = document.getElementById("toc-list");

  if (!tocToggle || !tocPanel || !tocOverlay || !tocList) return;

  function openTOC() {
    tocToggle.textContent = ICON_OPEN;
tocToggle.setAttribute("aria-label", "Close Rulebook Index");
    tocPanel.classList.add("open");
    tocOverlay.classList.add("active");
    document.body.classList.add("no-scroll");
    tocPanel.setAttribute("aria-hidden", "false");
  }

  function closeTOC() {
    tocToggle.textContent = ICON_CLOSED;
tocToggle.setAttribute("aria-label", "Open Rulebook Index");
    tocPanel.classList.remove("open");
    tocOverlay.classList.remove("active");
    document.body.classList.remove("no-scroll");
    tocPanel.setAttribute("aria-hidden", "true");
  }

  tocToggle.addEventListener("click", () => {
  const isOpen = tocPanel.classList.contains("open");
  if (isOpen) closeTOC();
  else openTOC();
});
  tocOverlay.addEventListener("click", closeTOC);

  // Close after clicking any item
  tocList.addEventListener("click", (e) => {
    const target = e.target;
    if (target.tagName === "A") {
      closeTOC();
    }
  });
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

  currentChapterFile = fileName;

  fetch(path)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((data) => {
      renderRulebookChapter(data);
      renderTOC(data);
      renderChapterSelect();
      updateChapterNavButtons();
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
  initTOCToggle();
  const chapterSelect = document.getElementById("chapter-select");
if (chapterSelect) {
  chapterSelect.addEventListener("change", (e) => {
    loadRulebookChapter(e.target.value);
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Fecha o TOC se estiver aberto
    const tocPanel = document.getElementById("toc-panel");
    const tocOverlay = document.getElementById("toc-overlay");
    const tocToggle = document.getElementById("toc-toggle");

    if (tocPanel && tocOverlay && tocToggle) {
      tocPanel.classList.remove("open");
      tocOverlay.classList.remove("active");
      document.body.classList.remove("no-scroll");
      tocToggle.textContent = "☰";
      tocToggle.setAttribute("aria-label", "Open Rulebook Index");
    }
  });
}
  const prevBtn = document.getElementById("chapter-prev");
  const nextBtn = document.getElementById("chapter-next");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      const index = getCurrentChapterIndex();
      switchToChapterByIndex(index - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      const index = getCurrentChapterIndex();
      switchToChapterByIndex(index + 1);
    });
  }

  loadRulebookChapter(currentChapterFile);
  updateChapterNavButtons();
});