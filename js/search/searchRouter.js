import { search } from "./searchIndex.js";
import { loadRulebookChapter } from "../rulebook/loader.js";

let resultsContainer = null;

/* =====================================================
   Utils
===================================================== */

function escapeHTML(str = "") {
  return str.replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[m]);
}

/* =====================================================
   Inicialização
===================================================== */

export function initSearchRouter(container) {
  if (!container) return;
  resultsContainer = container;
}

/* =====================================================
   Busca + renderização
===================================================== */

export function handleSearch(query) {
  if (!resultsContainer) return;

  const results = search(query, { limit: 20 });

  if (!results.length) {
    resultsContainer.innerHTML = `
      <div class="search-result empty">
        Nenhum resultado encontrado
      </div>
    `;
    resultsContainer.classList.remove("hidden");
    resultsContainer.setAttribute("aria-hidden", "false");
    return;
  }

  resultsContainer.innerHTML = results
    .map((r) => `
      <div
        class="search-result"
        data-chapter="${r.chapterFile}"
        data-topic="${r.topicId}"
        role="button"
        tabindex="0"
      >
        <strong>${escapeHTML(r.topicTitle)}</strong>
        <span>${escapeHTML(r.chapterTitle)}</span>
      </div>
    `)
    .join("");

  resultsContainer.classList.remove("hidden");
  resultsContainer.setAttribute("aria-hidden", "false");
}

/* =====================================================
   Clique / teclado
===================================================== */

export function bindSearchResultClicks() {
  if (!resultsContainer) return;

  resultsContainer.addEventListener("click", activateResult);

  resultsContainer.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;

    e.preventDefault();

    const focused = document.activeElement;
    if (focused?.classList.contains("search-result")) {
      activateResult({
        target: focused,
        preventDefault() {},
        stopPropagation() {}
      });
    }
  });
}

function activateResult(e) {
  e.preventDefault();
  e.stopPropagation();

  const item = e.target.closest(".search-result");
  if (!item) return;

  const { chapter, topic } = item.dataset;

  /* 1️⃣ Foco seguro */
  const safeFocusTarget =
    document.getElementById("rulebook-content") ||
    document.getElementById("toc-toggle");

  if (safeFocusTarget) {
    safeFocusTarget.setAttribute("tabindex", "-1");
    safeFocusTarget.focus({ preventScroll: true });
    safeFocusTarget.removeAttribute("tabindex");
  }

  /* 2️⃣ Esconde busca */
  resultsContainer.classList.add("hidden");
  resultsContainer.setAttribute("aria-hidden", "true");

  /* 3️⃣ Navegação centralizada no loader */
  loadRulebookChapter(chapter, topic);
}
