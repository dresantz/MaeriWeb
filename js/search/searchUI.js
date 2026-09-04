/**
 * searchUI.js - Interface de Busca do Rulebook
 */

import {
  initSearchRouter,
  handleSearch,
  bindSearchResultClicks,
  destroySearchRouter
} from "./searchRouter.js";

let searchInput = null;
let searchResults = null;
let currentQuery = "";
let observer = null;
let initialized = false;
let highlightTimeout = null;

// ===== UTILITÁRIOS =====

function clearResults() {
  if (!searchResults) return;
  
  const active = document.activeElement;
  
  if (active?.closest("#search-results")) {
    const safeTarget = document.getElementById("rulebook-content") || searchInput;
    if (safeTarget) {
      safeTarget.setAttribute("tabindex", "-1");
      safeTarget.focus({ preventScroll: true });
      safeTarget.removeAttribute("tabindex");
    }
  }
  
  searchResults.innerHTML = "";
  searchResults.classList.add("hidden");
  searchResults.setAttribute("aria-hidden", "true");
}

function applyHighlight() {
  if (!currentQuery || !searchResults) return;
  
  const items = searchResults.querySelectorAll(".search-result");
  if (!items.length) return;
  
  const escapedTerm = currentQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedTerm})`, "gi");
  
  items.forEach(item => {
    // Remove highlights antigos
    item.querySelectorAll("mark").forEach(m => {
      m.replaceWith(document.createTextNode(m.textContent));
    });
    
    // Aplica novos highlights
    const walker = document.createTreeWalker(
      item,
      NodeFilter.SHOW_TEXT,
      { 
        acceptNode: node => 
          node.parentElement?.tagName === 'MARK' 
            ? NodeFilter.FILTER_REJECT 
            : NodeFilter.FILTER_ACCEPT 
      }
    );
    
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    
    nodes.forEach(textNode => {
      if (!regex.test(textNode.nodeValue)) return;
      
      const span = document.createElement("span");
      span.innerHTML = textNode.nodeValue.replace(regex, "<mark>$1</mark>");
      textNode.parentNode.replaceChild(span, textNode);
    });
  });
}

function onSearchInput(e) {
  currentQuery = e.target.value.trim();
  
  if (currentQuery.length < 2) {
    clearResults();
    return;
  }
  
  localStorage.removeItem('maeriLastTopic');
  
  handleSearch(currentQuery);
  searchResults?.classList.remove("hidden");
  searchResults?.setAttribute("aria-hidden", "false");
  
  // Aplica highlight APÓS os resultados serem renderizados
  if (highlightTimeout) {
    clearTimeout(highlightTimeout);
  }
  
  highlightTimeout = setTimeout(() => {
    applyHighlight();
  }, 100);
}

function onOutsideClick(e) {
  if (!searchResults || searchResults.classList.contains("hidden")) return;
  if (e.target.closest(".search-container")) return;
  clearResults();
}

// ===== INICIALIZAÇÃO =====

export function initSearchUI() {
  if (initialized) return;
  
  searchInput = document.getElementById("search-input");
  searchResults = document.getElementById("search-results");
  
  if (!searchInput || !searchResults) {
    console.warn('SearchUI: elementos não encontrados');
    return;
  }
  
  const newInput = searchInput.cloneNode(true);
  searchInput.parentNode?.replaceChild(newInput, searchInput);
  searchInput = newInput;
  
  searchInput.addEventListener("input", onSearchInput);
  document.addEventListener("click", onOutsideClick);
  
  initSearchRouter(searchResults);
  bindSearchResultClicks();
  
  // Observer para aplicar highlight quando resultados mudarem
  observer = new MutationObserver(() => {
    if (highlightTimeout) {
      clearTimeout(highlightTimeout);
    }
    
    highlightTimeout = setTimeout(() => {
      applyHighlight();
    }, 100);
  });
  
  observer.observe(searchResults, {
    childList: true,
    subtree: true
  });
  
  initialized = true;
}

// ===== CLEANUP =====

export function destroySearchUI() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  
  if (highlightTimeout) {
    clearTimeout(highlightTimeout);
    highlightTimeout = null;
  }
  
  document.removeEventListener("click", onOutsideClick);
  
  if (searchInput) {
    searchInput.removeEventListener("input", onSearchInput);
  }
  
  destroySearchRouter();
  
  initialized = false;
  searchInput = null;
  searchResults = null;
  currentQuery = "";
}