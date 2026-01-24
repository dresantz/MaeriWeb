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
   URL helpers (antes estavam no main.js ❌)
===================================================== */

export function getTopicFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("topic");
}

export function updateURLTopic(topicId) {
  const url = new URL(window.location);

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
      clearSavedTopic();
      updateURLTopic(null);
      switchToChapterByIndex(getCurrentChapterIndex() - 1, false);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      clearSavedTopic();
      updateURLTopic(null);
      switchToChapterByIndex(getCurrentChapterIndex() + 1, false);
    });
  }
}

/* =====================================================
   Restauração de tópico
===================================================== */

export function restoreLastTopic() {
  const topicFromURL = getTopicFromURL();
  const topicFromStorage = localStorage.getItem(LAST_TOPIC_KEY);

  const topicId = topicFromURL || topicFromStorage;
  if (!topicId) return;

  const el = document.getElementById(topicId);
  if (el) el.scrollIntoView({ behavior: "auto", block: "start" });
}

/* =====================================================
   Scroll Spy (observeTopics)
===================================================== */

export function observeTopics() {
  const topics = document.querySelectorAll("[data-topic]");
  if (!topics.length) return;

  const observer = new IntersectionObserver(
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
      threshold: 0,
    }
  );

  topics.forEach((topic) => observer.observe(topic));
}
