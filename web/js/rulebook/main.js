/*
 * Main entry point do Rulebook
 * Responsável por:
 * - Inicializar eventos globais
 * - Bootstrap da navegação
 */

import { initTOCToggle } from "./toc.js";
import { loadRulebookChapter } from "./loader.js";
import { RULEBOOK_CHAPTERS } from "./constants.js";
import { currentChapterFile } from "./state.js";
import {
  initChapterNavigation,
  restoreLastTopic,
  clearSavedTopic
} from "./navigation.js";
import { buildIndex } from "../search/searchIndex.js";
import { initSearchUI } from "../search/searchUI.js";

/* =====================================================
   Pre-indexation
===================================================== */

async function preloadSearchIndex() {
  const chaptersData = [];

  for (const chapter of RULEBOOK_CHAPTERS) {
    try {
      const res = await fetch(`../data/rulebook/${chapter.file}`);
      if (!res.ok) continue;

      const data = await res.json();
      data.__file = chapter.file;

      chaptersData.push(data);
    } catch {
      // falha silenciosa: busca não é crítica
    }
  }

  buildIndex(chaptersData);
}

/* =====================================================
   Entry point
===================================================== */

document.addEventListener("DOMContentLoaded", async () => {
  await preloadSearchIndex();

  initTOCToggle();
  initChapterSelect();
  initChapterNavigation();
  initSearchUI();

  loadInitialChapter();
});

/* =====================================================
   Capítulo inicial
===================================================== */

function loadInitialChapter() {
  const chapter =
    currentChapterFile || RULEBOOK_CHAPTERS[0].file;

  loadRulebookChapter(chapter);

  // restaura tópico após render
  restoreLastTopic();
}

/* =====================================================
   Select de capítulos
===================================================== */

function initChapterSelect() {
  const select = document.getElementById("chapter-select");
  if (!select) return;

  select.addEventListener("change", (e) => {
    clearSavedTopic();
    loadRulebookChapter(e.target.value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
