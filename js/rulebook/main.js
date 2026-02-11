/*
 * main.js - Livro de Regras
 */

import { initTOCToggle, renderChapterSelect } from "./toc.js";
import { loadRulebookChapter } from "./loader.js";
import { RULEBOOK_CHAPTERS } from "./constants.js";
import { currentChapterFile } from "./state.js";
import { initChapterNavigation, restoreLastTopic } from "./navigation.js";
import { buildIndex } from "../search/searchIndex.js";
import { initSearchUI } from "../search/searchUI.js";

// Índice de busca
async function preloadSearchIndex() {
  const chaptersData = [];

  for (const chapter of RULEBOOK_CHAPTERS) {
    try {
      const res = await fetch(`../data/rulebook/${chapter.file}`);
      if (!res.ok) continue;
      const data = await res.json();
      data.__file = chapter.file;
      chaptersData.push(data);
    } catch {}
  }

  buildIndex(chaptersData);
}

// Inicialização
document.addEventListener("DOMContentLoaded", async () => {
  await preloadSearchIndex();

  initTOCToggle();
  renderChapterSelect();
  initChapterNavigation();
  initSearchUI();

  const chapter = currentChapterFile || RULEBOOK_CHAPTERS[0].file;
  loadRulebookChapter(chapter);
  restoreLastTopic();
});