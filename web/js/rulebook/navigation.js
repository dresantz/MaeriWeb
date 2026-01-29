import { RULEBOOK_CHAPTERS, LAST_TOPIC_KEY } from "./constants.js";
import { currentChapterFile } from "./state.js";
import { switchToChapterByIndex } from "./toc.js";

/* =====================================================
   🔒 CONTROLE DE SCROLL DO NAVEGADOR (NOVO)
===================================================== */

// Impede o browser de restaurar scroll automaticamente
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

// Detecta se a navegação é um reload real (F5)
const navigationEntry = performance.getEntriesByType("navigation")[0];
const isReload =
  navigationEntry && navigationEntry.type === "reload";

/* =====================================================
   Estado
===================================================== */

function getCurrentChapterIndex() {
  return RULEBOOK_CHAPTERS.findIndex(
    (ch) => ch.file === currentChapterFile
  );
}

/* =====================================================
   URL helpers
===================================================== */

export function getTopicFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("topic");
}

export function updateURLTopic(topicId) {
  const url = new URL(window.location);
  const current = url.searchParams.get("topic");

  // 🔒 evita replaceState desnecessário
  if (current === topicId) return;

  if (topicId) {
    url.searchParams.set("topic", topicId);
  } else {
    url.searchParams.delete("topic");
  }

  window.history.replaceState({}, "", url);
}

export function clearSavedTopic() {
  localStorage.removeItem(LAST_TOPIC_KEY);
}

/* =====================================================
   Botões Previous / Next
===================================================== */

export function updateChapterNavButtons() {
  const prevBtn = document.getElementById("chapter-prev");
  const nextBtn = document.getElementById("chapter-next");

  if (!prevBtn || !nextBtn) return;

  const index = getCurrentChapterIndex();

  prevBtn.disabled = index <= 0;
  nextBtn.disabled =
    index === -1 || index >= RULEBOOK_CHAPTERS.length - 1;
}

export function initChapterNavigation() {
  const prevBtn = document.getElementById("chapter-prev");
  const nextBtn = document.getElementById("chapter-next");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      const index = getCurrentChapterIndex();
      if (index <= 0) return;

      clearSavedTopic();
      updateURLTopic(null);
      switchToChapterByIndex(index - 1, false);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      const index = getCurrentChapterIndex();
      if (index === -1 || index >= RULEBOOK_CHAPTERS.length - 1) return;

      clearSavedTopic();
      updateURLTopic(null);
      switchToChapterByIndex(index + 1, false);
    });
  }

    // 🆕 Back to Top
  initBackToTopButton();
}

/* =====================================================
   Restauração de tópico (SAFE + CORRIGIDO)
===================================================== */

export function restoreLastTopic() {
  // 🔒 Só restaura se for reload real (F5)
  if (!isReload) return;

  const topicFromURL = getTopicFromURL();
  const topicFromStorage = localStorage.getItem(LAST_TOPIC_KEY);

  const topicId = topicFromURL || topicFromStorage;
  if (!topicId) return;

  // 🔒 Espera o layout estabilizar
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const el = document.getElementById(topicId);
      if (!el) return;

      el.scrollIntoView({
        behavior: "auto",
        block: "start"
      });
    });
  });
}

/* =====================================================
   Scroll Spy (SAFE)
===================================================== */

let topicObserver = null;

export function observeTopics() {
  const topics = document.querySelectorAll("[data-topic]");
  if (!topics.length) return;

  // 🔒 evita observers duplicados
  topicObserver?.disconnect();

  topicObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const id = entry.target.id;
        if (!id) return;

        localStorage.setItem(LAST_TOPIC_KEY, id);
        updateURLTopic(id);
      });
    },
    {
      rootMargin: "-40% 0px -50% 0px",
      threshold: 0
    }
  );

  // 🔒 Observa só após DOM estar estável
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      topics.forEach((topic) => topicObserver.observe(topic));
    });
  });
}
/* =====================================================
   Botão Back to Top
===================================================== */

function initBackToTopButton() {
  const btn = document.getElementById("back-to-top");
  if (!btn) return;

  // Estado inicial
  btn.style.display = "none";

  // Scroll suave ao topo
  btn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  // Exibe apenas após certo scroll
  window.addEventListener("scroll", () => {
    btn.style.display =
      window.scrollY > 300 ? "flex" : "none";
  });
}
