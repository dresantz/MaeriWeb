import { RULEBOOK_CHAPTERS, LAST_TOPIC_KEY } from "./constants.js";
import { currentChapterFile } from "./state.js";
import { loadRulebookChapter } from "./loader.js";
import { initTOCKeyboardNavigation } from "./tocKeyboard.js";
import { unlockBodyScroll } from "./uiReset.js";

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
    a.tabIndex = -1;

    li.appendChild(a);
    tocList.appendChild(li);
  });
}

/* =====================================================
   Abertura / fechamento do TOC
===================================================== */

const ICON_CLOSED = "☰";
const ICON_OPEN = "✕";

let tocInitialized = false;

export function initTOCToggle() {
  if (tocInitialized) return;
  tocInitialized = true;

  const tocToggle = document.getElementById("toc-toggle");
  const tocPanel = document.getElementById("toc-panel");
  const tocOverlay = document.getElementById("toc-overlay");
  const tocList = document.getElementById("toc-list");

  if (!tocToggle || !tocPanel || !tocOverlay || !tocList) return;

  let keyboardAPI = null;

  if (!tocPanel.hasAttribute("tabindex")) {
    tocPanel.tabIndex = -1;
  }

  function openTOC() {
    tocToggle.textContent = ICON_OPEN;
    tocToggle.setAttribute("aria-label", "Close Rulebook Index");

    tocPanel.classList.add("open");
    tocOverlay.classList.add("active");
    document.body.classList.add("no-scroll");
    tocPanel.setAttribute("aria-hidden", "false");

    tocPanel.scrollTop = 0;
    tocList.scrollTop = 0;

    keyboardAPI ??= initTOCKeyboardNavigation({
      tocList,
      onClose: closeTOC
    });

    tocPanel.focus({ preventScroll: true });

    requestAnimationFrame(() => {
      keyboardAPI.focusFirst();
    });
  }

  function closeTOC() {
    tocToggle.textContent = ICON_CLOSED;
    tocToggle.setAttribute("aria-label", "Open Rulebook Index");

    tocPanel.classList.remove("open");
    tocOverlay.classList.remove("active");
    tocPanel.setAttribute("aria-hidden", "true");

    // 🔑 reset definitivo de scroll e layout
    unlockBodyScroll();

    keyboardAPI?.reset();
    tocToggle.focus({ preventScroll: true });
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

    closeTOC();
  });

  // 🛟 segurança extra: resize nunca pode manter body travado
  window.addEventListener("resize", unlockBodyScroll);
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
    unlockBodyScroll(); // 👈 evita herdar estado quebrado
    loadRulebookChapter(select.value);
  };
}

/* =====================================================
   Troca de capítulo por índice
===================================================== */

export function switchToChapterByIndex(newIndex, shouldCloseTOC = true) {
  if (newIndex < 0 || newIndex >= RULEBOOK_CHAPTERS.length) return;

  const chapter = RULEBOOK_CHAPTERS[newIndex];

  unlockBodyScroll(); // 👈 reset antes de tudo
  loadRulebookChapter(chapter.file);

  window.scrollTo({ top: 0, behavior: "smooth" });

  const select = document.getElementById("chapter-select");
  if (select) select.value = chapter.file;

  if (!shouldCloseTOC) return;

  const tocPanel = document.getElementById("toc-panel");
  const tocOverlay = document.getElementById("toc-overlay");
  const tocToggle = document.getElementById("toc-toggle");

  if (!tocPanel || !tocOverlay || !tocToggle) return;

  tocPanel.classList.remove("open");
  tocOverlay.classList.remove("active");
  tocToggle.textContent = ICON_CLOSED;
  tocToggle.setAttribute("aria-label", "Open Rulebook Index");

  unlockBodyScroll();
}
