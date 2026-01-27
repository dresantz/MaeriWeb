import { RULEBOOK_CHAPTERS, LAST_TOPIC_KEY } from "./constants.js";
import { currentChapterFile } from "./state.js";
import { loadRulebookChapter } from "./loader.js";

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

  function openTOC() {
    tocToggle.textContent = ICON_OPEN;
    tocToggle.setAttribute("aria-label", "Close Rulebook Index");
    tocPanel.classList.add("open");
    tocOverlay.classList.add("active");
    document.body.classList.add("no-scroll");
    tocPanel.setAttribute("aria-hidden", "false");
  }

function closeTOC() {
  // ✅ 1. MOVE O FOCO PARA FORA DO TOC
  tocToggle.focus();

  // ✅ 2. AGORA é seguro esconder
  tocToggle.textContent = ICON_CLOSED;
  tocToggle.setAttribute("aria-label", "Open Rulebook Index");
  tocPanel.classList.remove("open");
  tocOverlay.classList.remove("active");
  document.body.classList.remove("no-scroll");
  tocPanel.setAttribute("aria-hidden", "true");
}

  tocToggle.addEventListener("click", () => {
    tocPanel.classList.contains("open") ? closeTOC() : openTOC();
  });

  tocOverlay.addEventListener("click", closeTOC);

tocList.addEventListener("click", (e) => {
  if (e.target.tagName !== "A") return;

  e.preventDefault();

  const targetId = e.target.getAttribute("href")?.slice(1);
  if (!targetId) return;

  localStorage.setItem(LAST_TOPIC_KEY, targetId);

  const el = document.getElementById(targetId);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });

  // ✅ Move o foco para fora do TOC antes de escondê-lo
  const safeFocusTarget =
    document.getElementById("rulebook-content") ||
    document.getElementById("toc-toggle");

  safeFocusTarget?.focus?.();

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

  // 👇 garante que só adiciona UMA vez
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
