import { RULEBOOK_CHAPTERS, LAST_TOPIC_KEY } from "./constants.js";
import { currentChapterFile } from "./state.js";
import { switchToChapterByIndex } from "./toc.js";

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
}

/* =====================================================
   Restauração de tópico (SAFE)
===================================================== */

export function restoreLastTopic() {
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
