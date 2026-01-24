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
      updateURLTopic(null);
      const index = getCurrentChapterIndex();
      switchToChapterByIndex(index - 1, false);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      clearSavedTopic();
      updateURLTopic(null);
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
            updateURLTopic(topicId);
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


function getTopicFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("topic");
}

/* =====================================================
   URL de tópicos
===================================================== */

function updateURLTopic(topicId) {
  const params = new URLSearchParams(window.location.search);

  if (topicId) {
    params.set("topic", topicId);
  } else {
    params.delete("topic");
  }

  const newURL = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, "", newURL);
}
/**
 * Restaura o último tópico visitado
 * Prioridade:
 * 1) URL (?topic=)
 * 2) localStorage
 */
function restoreLastTopic() {
  const topicFromURL = getTopicFromURL();
  const topicFromStorage = localStorage.getItem(LAST_TOPIC_KEY);

  const topicId = topicFromURL || topicFromStorage;
  if (!topicId) return;

  const el = document.getElementById(topicId);
  if (el) {
    el.scrollIntoView({ behavior: "auto", block: "start" });
  }
}
