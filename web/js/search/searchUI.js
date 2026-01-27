/*
 * UI da Busca do Rulebook
 * Responsável apenas por:
 * - Capturar input
 * - Renderizar resultados
 * - Mostrar / esconder resultados
 */

import { initSearchRouter, handleSearch, bindSearchResultClicks } from "./searchRouter.js";

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

  handleSearch(query);
}

/* =====================================================
   Helpers
===================================================== */

function clearResults() {
  // 🔑 Move foco antes de esconder (evita warning aria-hidden)
  const safeFocusTarget =
    document.getElementById("rulebook-content") ||
    document.getElementById("search-input");

  safeFocusTarget?.focus?.();

  searchResults.innerHTML = "";
  searchResults.classList.add("hidden");
  searchResults.setAttribute("aria-hidden", "true");
}

function onOutsideClick(e) {
  if (e.target.closest(".search-container")) return;
  clearResults();
}
