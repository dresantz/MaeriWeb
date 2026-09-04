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
  updateURLTopic
} from "./navigation.js";

let loadToken = 0;

// ===== UTILITÁRIOS =====

function updateURL(fileName) {
  const url = new URL(window.location);
  
  if (url.searchParams.get("chapter") !== fileName) {
    url.searchParams.set("chapter", fileName);
    url.searchParams.delete("topic");
    window.history.replaceState({}, "", url);
  }
}

function showLoadError() {
  const content = document.getElementById("rulebook-content");
  if (content) {
    content.innerHTML = `
      <div class="error-message">
        <p>Erro ao carregar capítulo.</p>
        <button onclick="location.reload()" class="reload-button">Recarregar</button>
      </div>
    `;
  }
}

// ===== FUNÇÃO PRINCIPAL =====

export function loadRulebookChapter(fileName, topicOverride = null) {
  const currentToken = ++loadToken;
  
  // Atualiza estado global
  setCurrentChapter(fileName);
  localStorage.setItem(LAST_CHAPTER_KEY, fileName);
  updateURL(fileName);
  
  fetch(`../data/rulebook/${fileName}`)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      if (currentToken !== loadToken) return;
      
      // Renderiza o capítulo
      renderRulebookChapter(data);
      renderTOC(data);
      renderChapterSelect();
      updateChapterNavButtons();
      
      // Ativa scroll spy e restaura tópico
      setTimeout(() => {
        observeTopics();
        restoreLastTopic(topicOverride);
        
        if (topicOverride) {
          updateURLTopic(topicOverride);
        }
      }, 100);
    })
    .catch(err => {
      if (currentToken !== loadToken) return;
      console.error("Failed to load rulebook chapter:", err);
      showLoadError();
    });
}