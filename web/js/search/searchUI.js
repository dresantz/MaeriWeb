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
  observer = new MutationObserver(() => {
    applyHighlight();
  });

  observer.observe(searchResults, {
    childList: true,
    subtree: true
  });
}

function highlightTerm(text, term) {
  if (!term) return text;

  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");

  return text.replace(regex, "<mark>$1</mark>");
}

function applyHighlight() {
  if (!currentQuery) return;

  const items = searchResults.querySelectorAll(".search-result");

  items.forEach((item) => {
    if (item.dataset.highlighted) return;

    highlightNode(item, currentQuery);
    item.dataset.highlighted = "true";
  });
}

function highlightNode(element, term) {
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null,
    false
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
  const safeFocusTarget =
    document.getElementById("rulebook-content") ||
    searchInput;

  safeFocusTarget?.focus?.();

  searchResults.innerHTML = "";
  searchResults.classList.add("hidden");
  searchResults.setAttribute("aria-hidden", "true");
}

function onOutsideClick(e) {
  if (e.target.closest(".search-container")) return;
  clearResults();
}
