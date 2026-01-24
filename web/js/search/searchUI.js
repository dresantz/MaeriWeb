/*
 * UI da Busca do Rulebook
 * Responsável apenas por:
 * - Capturar input
 * - Mostrar / esconder resultados
 */

import { initSearchRouter, handleSearch, bindSearchResultClicks } from "./searchRouter.js";
import { search } from "./searchIndex.js";
import { loadRulebookChapter } from "../rulebook/loader.js";
import { updateURLTopic } from "../rulebook/main.js";


let searchInput;
let searchResults;

export function initSearchUI() {
  searchInput = document.getElementById("search-input");
  searchResults = document.getElementById("search-results");

  if (!searchInput || !searchResults) return;

  searchInput.addEventListener("input", onSearchInput);
  document.addEventListener("click", onOutsideClick);

  initSearchRouter(searchResults);
  bindSearchResultClicks();
}

function onSearchInput(e) {
  const query = e.target.value.trim();

  if (!query) {
    clearResults();
    return;
  }

  showSearchResults(query);
}

function showSearchResults(query) {
  const results = search(query);

  if (!results.length) {
    searchResults.innerHTML = `
      <div class="search-result empty">
        Nenhum resultado encontrado
      </div>
    `;
    searchResults.classList.remove("hidden");
    return;
  }

  searchResults.innerHTML = "";

  results.forEach((result) => {
    const item = document.createElement("div");
    item.className = "search-result";

    item.innerHTML = `
      <div class="search-result-title">${result.topicTitle}</div>
      <div class="search-result-chapter">${result.chapterTitle}</div>
    `;

    item.addEventListener("click", () => {
      loadRulebookChapter(result.chapterFile);

      // Espera o render do capítulo antes de scrollar
      setTimeout(() => {
        const el = document.getElementById(result.topicId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          updateURLTopic(result.topicId);
        }
      }, 50);

      clearResults();
    });

    searchResults.appendChild(item);
  });

  searchResults.classList.remove("hidden");
}


function clearResults() {
  searchResults.innerHTML = "";
  searchResults.classList.add("hidden");
}

function onOutsideClick(e) {
  if (!e.target.closest(".search-container")) {
    clearResults();
  }
}
