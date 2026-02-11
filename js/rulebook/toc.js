/* =====================================================
   TOC - Índice do Livro de Regras
===================================================== */

import { RULEBOOK_CHAPTERS } from "./constants.js";
import { currentChapterFile } from "./state.js";
import { loadRulebookChapter } from "./loader.js";
import { updateURLTopic } from "./navigation.js";

let isTocOpen = false;
let tocInitialized = false;

const ICON_CLOSED = "☰";
const ICON_OPEN = "✕";

/* =========================
   Renderizar índice
========================= */
export function renderTOC(chapterData) {
  const tocList = document.getElementById("toc-list");
  const tocChapterTitle = document.getElementById("toc-chapter-title");

  if (!tocList || !tocChapterTitle) return;

  tocChapterTitle.textContent = chapterData.title || "Livro de Regras";
  tocList.innerHTML = "";

  (chapterData.sections || []).forEach((section) => {
    if (!section.id) return;

    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = `#${section.id}`;
    a.textContent = section.title || "Sem título";
    li.appendChild(a);
    tocList.appendChild(li);
  });
}

/* =========================
   Abrir/fechar TOC
========================= */
function openToc() {
  const panel = document.getElementById('toc-panel');
  const overlay = document.getElementById('toc-overlay');
  const toggle = document.getElementById('toc-toggle');
  
  if (isTocOpen || !panel || !overlay || !toggle) return;
  
  isTocOpen = true;
  panel.classList.add('active');
  overlay.classList.add('active');
  document.body.classList.add('no-scroll');
  toggle.textContent = ICON_OPEN;
  toggle.setAttribute('aria-label', 'Fechar índice');
}

function closeToc() {
  const panel = document.getElementById('toc-panel');
  const overlay = document.getElementById('toc-overlay');
  const toggle = document.getElementById('toc-toggle');
  
  if (!isTocOpen || !panel || !overlay || !toggle) return;
  
  isTocOpen = false;
  panel.classList.remove('active');
  overlay.classList.remove('active');
  document.body.classList.remove('no-scroll');
  toggle.textContent = ICON_CLOSED;
  toggle.setAttribute('aria-label', 'Abrir índice');
}

/* =========================
   Inicializar TOC
========================= */
export function initTOCToggle() {
  if (tocInitialized) return;
  tocInitialized = true;

  const toggle = document.getElementById('toc-toggle');
  const panel = document.getElementById('toc-panel');
  const overlay = document.getElementById('toc-overlay');
  const tocList = document.getElementById('toc-list');

  if (!toggle || !panel || !overlay || !tocList) return;

  // Único botão: abre e fecha
  toggle.addEventListener('click', () => {
    isTocOpen ? closeToc() : openToc();
  });

  // Links do índice
  tocList.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    e.preventDefault();
    const targetId = link.getAttribute('href')?.slice(1);
    if (!targetId) return;

    updateURLTopic(targetId);
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    closeToc();
  });

  // Tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isTocOpen) closeToc();
  });
}

/* =========================
   Select de capítulos
========================= */
export function renderChapterSelect() {
  const select = document.getElementById('chapter-select');
  if (!select) return;

  select.innerHTML = '';

  RULEBOOK_CHAPTERS.forEach((ch, index) => {
    const option = document.createElement('option');
    option.value = ch.file;
    option.textContent = ch.title;
    option.selected = ch.file === currentChapterFile;
    option.dataset.index = index;
    select.appendChild(option);
  });

  select.onchange = () => {
    loadRulebookChapter(select.value);
  };
}

/* =========================
   Navegação entre capítulos
========================= */
export function switchToChapterByIndex(index) {
  const chapter = RULEBOOK_CHAPTERS[index];
  if (!chapter) return;

  loadRulebookChapter(chapter.file);

  const select = document.getElementById('chapter-select');
  if (select) select.value = chapter.file;
}