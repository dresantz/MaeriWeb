import { RULEBOOK_CHAPTERS, LAST_TOPIC_KEY } from "./constants.js";
import { currentChapterFile } from "./state.js";
import { loadRulebookChapter } from "./loader.js";
import { initTOCKeyboardNavigation } from "./tocKeyboard.js";

/* =====================================================
   Renderização do TOC
===================================================== */

export function renderTOC(chapterData) {
  const tocList = document.getElementById("toc-list");
  const tocChapterTitle = document.getElementById("toc-chapter-title");

  if (!tocList || !tocChapterTitle) return;

  tocChapterTitle.textContent = chapterData.title || "Rulebook";
  tocList.innerHTML = "";

  (chapterData.sections || []).forEach((section) => {
    if (!section.id) return;

    const li = document.createElement("li");
    const a = document.createElement("a");

    a.href = `#${section.id}`;
    a.textContent = section.title || "Untitled";
    a.tabIndex = -1; // foco controlado via teclado

    li.appendChild(a);
    tocList.appendChild(li);
  });
}

/* =====================================================
   Abertura / fechamento do TOC
===================================================== */

const ICON_CLOSED = "☰";
const ICON_OPEN = "✕";

export function initTOCToggle() {
  const tocToggle = document.getElementById("toc-toggle");
  const tocPanel = document.getElementById("toc-panel");
  const tocOverlay = document.getElementById("toc-overlay");
  const tocList = document.getElementById("toc-list");

  if (!tocToggle || !tocPanel || !tocOverlay || !tocList) return;

  let keyboardAPI = null;

  function openTOC() {
    tocToggle.textContent = ICON_OPEN;
    tocToggle.setAttribute("aria-label", "Close Rulebook Index");

    tocPanel.classList.add("open");
    tocOverlay.classList.add("active");
    document.body.classList.add("no-scroll");
    tocPanel.setAttribute("aria-hidden", "false");

    // ✅ 1. Garante que o TOC abre sempre no topo
    tocPanel.scrollTop = 0;
    tocList.scrollTop = 0;

    // ✅ 2. Inicializa teclado uma única vez
    keyboardAPI ??= initTOCKeyboardNavigation({
      tocList,
      onClose: closeTOC
    });

    // ✅ 3. Foco seguro: container primeiro (não rola)
    tocPanel.focus({ preventScroll: true });

    // ✅ 4. Depois de estabilizar, move foco lógico
    requestAnimationFrame(() => {
      keyboardAPI.focusFirst();
    });
  }

  function closeTOC() {
    tocToggle.focus({ preventScroll: true });

    tocToggle.textContent = ICON_CLOSED;
    tocToggle.setAttribute("aria-label", "Open Rulebook Index");

    tocPanel.classList.remove("open");
    tocOverlay.classList.remove("active");
    document.body.classList.remove("no-scroll");
    tocPanel.setAttribute("aria-hidden", "true");

    keyboardAPI?.reset();
  }

  tocToggle.addEventListener("click", () => {
    tocPanel.classList.contains("open") ? closeTOC() : openTOC();
  });

  tocOverlay.addEventListener("click", closeTOC);

  tocList.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;

    e.preventDefault();

    const targetId = link.getAttribute("href")?.slice(1);
    if (!targetId) return;

    localStorage.setItem(LAST_TOPIC_KEY, targetId);

    const el = document.getElementById(targetId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });

    const safeFocusTarget =
      document.getElementById("rulebook-content") || tocToggle;

    safeFocusTarget?.focus?.({ preventScroll: true });
    closeTOC();
  });
}

/* =====================================================
   Select de capítulos
===================================================== */

export function renderChapterSelect() {
  const select = document.getElementById("chapter-select");
  if (!select) return;

  select.innerHTML = "";

  RULEBOOK_CHAPTERS.forEach((ch) => {
    const option = document.createElement("option");
    option.value = ch.file;
    option.textContent = ch.title;
    option.selected = ch.file === currentChapterFile;
    select.appendChild(option);
  });

  select.onchange = () => {
    loadRulebookChapter(select.value);
  };
}

/* =====================================================
   Troca de capítulo por índice
===================================================== */

export function switchToChapterByIndex(newIndex, closeTOC = true) {
  if (newIndex < 0 || newIndex >= RULEBOOK_CHAPTERS.length) return;

  const chapter = RULEBOOK_CHAPTERS[newIndex];
  loadRulebookChapter(chapter.file);

  window.scrollTo({ top: 0, behavior: "smooth" });

  const select = document.getElementById("chapter-select");
  if (select) select.value = chapter.file;

  if (!closeTOC) return;

  const tocPanel = document.getElementById("toc-panel");
  const tocOverlay = document.getElementById("toc-overlay");
  const tocToggle = document.getElementById("toc-toggle");

  if (!tocPanel || !tocOverlay || !tocToggle) return;

  tocPanel.classList.remove("open");
  tocOverlay.classList.remove("active");
  document.body.classList.remove("no-scroll");
  tocToggle.textContent = ICON_CLOSED;
  tocToggle.setAttribute("aria-label", "Open Rulebook Index");
}
