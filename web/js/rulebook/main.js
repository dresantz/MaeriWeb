/*
 * Main entry point do Rulebook
 * Responsável por:
 * - Inicializar eventos globais
 * - Controlar troca de capítulos
 * - Ativar persistência de tópico por scroll
 */

import { initTOCToggle } from "./toc.js";
import { loadRulebookChapter } from "./loader.js";
import { RULEBOOK_CHAPTERS, LAST_TOPIC_KEY } from "./constants.js";
import { currentChapterFile } from "./state.js";
import { initChapterNavigation } from "./navigation.js";
import { buildIndex } from "../search/searchIndex.js";
import { initSearchUI } from "../search/searchUI.js";

/* =====================================================
   Pre-indexation
===================================================== */

async function preloadSearchIndex() {
  const chaptersData = [];

  for (const chapter of RULEBOOK_CHAPTERS) {
    const path = `../data/rulebook/${chapter.file}`;

    const res = await fetch(path);
    if (!res.ok) continue;

    const data = await res.json();

    // Marca o capítulo de origem (sem afetar render)
    data.__file = chapter.file;

    chaptersData.push(data);
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
   Capítulo inicial (URL / localStorage / fallback)
===================================================== */

function loadInitialChapter() {
  loadRulebookChapter(currentChapterFile || RULEBOOK_CHAPTERS[0].file);
}

/* =====================================================
   Select de capítulos
===================================================== */

function initChapterSelect() {
  const chapterSelect = document.getElementById("chapter-select");
  if (!chapterSelect) return;

  chapterSelect.addEventListener("change", (e) => {
    clearSavedTopic();
    loadRulebookChapter(e.target.value);
    scrollToTop();
  });
}

/* =====================================================
   Scroll Spy – persistência do último tópico lido
===================================================== */

export function observeTopics() {
  const topics = document.querySelectorAll("section[data-topic]");
  if (!topics.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const topicId = entry.target.id;
        if (!topicId) return;

        localStorage.setItem(LAST_TOPIC_KEY, topicId);
        updateURLTopic(topicId);
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -70% 0px",
      threshold: 0
    }
  );

  topics.forEach((topic) => observer.observe(topic));
}

/* =====================================================
   Helpers
===================================================== */

export function clearSavedTopic() {
  localStorage.removeItem(LAST_TOPIC_KEY);
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function getTopicFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("topic");
}

/* =====================================================
   URL de tópicos
===================================================== */

export function updateURLTopic(topicId) {
  const params = new URLSearchParams(window.location.search);

  if (topicId) {
    params.set("topic", topicId);
  } else {
    params.delete("topic");
  }

  const newURL = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, "", newURL);
}
