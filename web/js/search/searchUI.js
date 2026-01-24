/*
 * UI da Busca do Rulebook
 * Responsável apenas por:
 * - Capturar input
 * - Mostrar / esconder resultados
 */

let searchInput;
let searchResults;

export function initSearchUI() {
  searchInput = document.getElementById("search-input");
  searchResults = document.getElementById("search-results");

  if (!searchInput || !searchResults) return;

  searchInput.addEventListener("input", onSearchInput);
  document.addEventListener("click", onOutsideClick);
}

function onSearchInput(e) {
  const query = e.target.value.trim();

  if (!query) {
    clearResults();
    return;
  }

  // Por enquanto, só visual
  showPlaceholderResults(query);
}

function showPlaceholderResults(query) {
  searchResults.innerHTML = `
    <div class="search-result">
      Buscando por "<strong>${query}</strong>"...
    </div>
  `;
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
