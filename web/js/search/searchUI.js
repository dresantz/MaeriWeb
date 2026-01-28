/*
 * UI da Busca do Rulebook
 * Responsável apenas por:
 * - Capturar input
 * - Renderizar resultados
 * - Mostrar / esconder resultados
 */

import {
  initSearchRouter,
  handleSearch,
  bindSearchResultClicks
} from "./searchRouter.js";

let searchInput;
let searchResults;
let currentQuery = "";
let observer;

export function initSearchUI() {
  searchInput = document.getElementById("search-input");
  searchResults = document.getElementById("search-results");

  if (!searchInput || !searchResults) return;

  searchInput.addEventListener("input", onSearchInput);

  // ❗ remove capture global destrutivo
  document.addEventListener("click", onOutsideClick);

  initSearchRouter(searchResults);
  bindSearchResultClicks();

  initHighlightObserver();
}

function onSearchInput(e) {
  currentQuery = e.target.value.trim();

  if (currentQuery.length < 2) {
    clearResults();
    return;
  }

  handleSearch(currentQuery);

  searchResults.classList.remove("hidden");
  searchResults.setAttribute("aria-hidden", "false");
}

/* =====================================================
   Highlight (aplicado APÓS render)
===================================================== */

function initHighlightObserver() {
  if (!searchResults) return;

  observer = new MutationObserver(() => {
    requestAnimationFrame(applyHighlight);
  });

  observer.observe(searchResults, {
    childList: true,
    subtree: true
  });
}

function applyHighlight() {
  if (!currentQuery || !searchResults) return;

  const items = searchResults.querySelectorAll(".search-result");

  items.forEach((item) => {
    item.querySelectorAll("mark").forEach((m) => {
      m.replaceWith(document.createTextNode(m.textContent));
    });

    highlightNode(item, currentQuery);
  });
}

function highlightNode(element, term) {
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null
  );

  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");

  const nodes = [];

  while (walker.nextNode()) {
    nodes.push(walker.currentNode);
  }

  nodes.forEach((textNode) => {
    if (!regex.test(textNode.nodeValue)) return;

    const span = document.createElement("span");
    span.innerHTML = textNode.nodeValue.replace(
      regex,
      "<mark>$1</mark>"
    );

    textNode.parentNode.replaceChild(span, textNode);
  });
}

/* =====================================================
   Helpers
===================================================== */

function clearResults() {
  if (!searchResults) return;

  const active = document.activeElement;

  // 🔒 Só move foco se ele estiver DENTRO da busca
  if (active && active.closest("#search-results")) {
    const safeTarget =
      document.getElementById("rulebook-content") ||
      searchInput;

    safeTarget?.setAttribute("tabindex", "-1");
    safeTarget?.focus({ preventScroll: true });
    safeTarget?.removeAttribute("tabindex");
  }

  searchResults.innerHTML = "";
  searchResults.classList.add("hidden");
  searchResults.setAttribute("aria-hidden", "true");
}

function onOutsideClick(e) {
  // Só reage se a busca estiver aberta
  if (searchResults.classList.contains("hidden")) return;

  if (e.target.closest(".search-container")) return;

  clearResults();
}
