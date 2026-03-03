/**
 * loader.js - Carregamento de capítulos do rulebook
 */

import { renderRulebookChapter } from "./renderer.js";
import { renderTOC, renderChapterSelect } from "./toc.js";
import { LAST_CHAPTER_KEY, getChapterIndex } from "./constants.js";
import {
  setCurrentChapter,
  updateChapterNavButtons,
  restoreLastTopic,
  observeTopics,
  updateURLTopic,
  getTopicFromURL
} from "./navigation.js";

let loadToken = 0;

export function loadRulebookChapter(fileName, topicOverride = null) {

  const currentToken = ++loadToken;
  const path = `../data/rulebook/${fileName}`;

  // Atualiza estado global
  setCurrentChapter(fileName);
  localStorage.setItem(LAST_CHAPTER_KEY, fileName);

  // Atualiza URL
const url = new URL(window.location);
const currentChapter = url.searchParams.get("chapter");

if (currentChapter !== fileName) {
  url.searchParams.set("chapter", fileName);
  url.searchParams.delete("topic");
  window.history.replaceState({}, "", url);
}

  fetch(path)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      if (currentToken !== loadToken) return;

      renderRulebookChapter(data);
      renderTOC(data);
      renderChapterSelect();
      updateChapterNavButtons();

      // Ativa o scroll spy depois de renderizar
      setTimeout(() => {
        observeTopics();
      }, 100);

      requestAnimationFrame(() => {
        // SEMPRE chama restoreLastTopic, ela que decide de onde pegar
        restoreLastTopic(topicOverride);
        
        // Se tinha topicOverride, atualiza a URL
        if (topicOverride) {
          updateURLTopic(topicOverride);
        }
      });
    })
    .catch(err => {
      if (currentToken !== loadToken) return;
      console.error("Failed to load rulebook chapter:", err);

      const content = document.getElementById("rulebook-content");
      if (content) {
        content.innerHTML = "<p>Failed to load chapter.</p>";
      }
    });
}