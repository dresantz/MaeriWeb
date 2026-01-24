/*
 * Roteador da busca
 * Responsável por:
 * - Conectar resultados à navegação
 * - Renderizar resultados básicos
 */

import { search } from "./searchEngine.js";
import { loadRulebookChapter } from "../rulebook/loader.js";
import { updateURLTopic, clearSavedTopic } from "../rulebook/main.js";


let resultsContainer;

/* =====================================================
   Inicialização
===================================================== */

export function initSearchRouter(container) {
  resultsContainer = container;
}

/* =====================================================
   Busca + renderização
===================================================== */

export function handleSearch(query) {
  if (!resultsContainer) return;

  const results = search(query);

  if (!results.length) {
    resultsContainer.innerHTML = `
      <div class="search-result empty">
        Nenhum resultado encontrado
      </div>
    `;
    resultsContainer.classList.remove("hidden");
    return;
  }

  resultsContainer.innerHTML = results
    .map(
      (r) => `
      <div 
        class="search-result"
        data-chapter="${r.chapterFile}"
        data-topic="${r.topicId}"
      >
        <strong>${r.topicTitle}</strong>
        <span>${r.chapterTitle}</span>
      </div>
    `
    )
    .join("");

  resultsContainer.classList.remove("hidden");
}

/* =====================================================
   Clique em resultado
===================================================== */

export function bindSearchResultClicks() {
  if (!resultsContainer) return;

  resultsContainer.addEventListener("click", (e) => {
    const item = e.target.closest(".search-result");
    if (!item) return;

    const chapter = item.dataset.chapter;
    const topic = item.dataset.topic;

    loadRulebookChapter(chapter);
    updateURLTopic(topic);

    resultsContainer.classList.add("hidden");
  });
}
