/*
 * Main entry point do Rulebook
 * Responsável por:
 * - Inicializar eventos globais
 * - Controlar troca de capítulos
 * - Ativar persistência de tópico por scroll
 */

document.addEventListener("DOMContentLoaded", () => {
  initRulebook();
});

/* =====================================================
   Inicialização principal
===================================================== */

function initRulebook() {
  initTOCToggle();
  initChapterSelect();
  initChapterNavigation();
  loadInitialChapter();
}

/* =====================================================
   Capítulo inicial (URL / localStorage / fallback)
===================================================== */

function loadInitialChapter() {
  loadRulebookChapter(currentChapterFile);
}

/* =====================================================
   Select de capítulos
===================================================== */

function initChapterSelect() {
  const chapterSelect = document.getElementById("chapter-select");
  if (!chapterSelect) return;

  chapterSelect.addEventListener("change", (e) => {
    clearSavedTopic();
    loadRulebookChapter(e.target.value);
    scrollToTop();
  });
}

/* =====================================================
   Navegação: capítulo anterior / próximo
===================================================== */

function initChapterNavigation() {
  const prevBtn = document.getElementById("chapter-prev");
  const nextBtn = document.getElementById("chapter-next");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      clearSavedTopic();
      const index = getCurrentChapterIndex();
      switchToChapterByIndex(index - 1, false);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      clearSavedTopic();
      const index = getCurrentChapterIndex();
      switchToChapterByIndex(index + 1, false);
    });
  }
}

/* =====================================================
   Scroll Spy – persistência do último tópico lido
===================================================== */

function observeTopics() {
  const topics = document.querySelectorAll("section[data-topic]");
  if (!topics.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const topicId = entry.target.id;
          if (topicId) {
            localStorage.setItem(LAST_TOPIC_KEY, topicId);
          }
        }
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -60% 0px",
      threshold: 0
    }
  );

  topics.forEach((topic) => observer.observe(topic));
}

/* =====================================================
   Helpers
===================================================== */

function clearSavedTopic() {
  localStorage.removeItem(LAST_TOPIC_KEY);
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
