import { renderRulebookChapter } from "./renderer.js";
import { renderTOC, renderChapterSelect } from "./toc.js";
import { setCurrentChapter } from "./state.js";
import { LAST_CHAPTER_KEY } from "./constants.js";
import {
  updateChapterNavButtons,
  restoreLastTopic,
  observeTopics,
  updateURLTopic
} from "./navigation.js";

let loadToken = 0;

export function loadRulebookChapter(fileName, topicOverride = null) {
  const currentToken = ++loadToken;
  const path = `../data/rulebook/${fileName}`;

  /* =========================
     Estado global
  ========================= */
  setCurrentChapter(fileName);
  localStorage.setItem(LAST_CHAPTER_KEY, fileName);

  /* =========================
     URL (?chapter)
  ========================= */
  const url = new URL(window.location);
  const currentChapter = url.searchParams.get("chapter");

  if (currentChapter !== fileName) {
    url.searchParams.set("chapter", fileName);
    url.searchParams.delete("topic");
    window.history.replaceState({}, "", url);
  }

  /* =========================
     Fetch
  ========================= */
  fetch(path)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((data) => {
      if (currentToken !== loadToken) return;

      /* =========================
         Render
      ========================= */
      renderRulebookChapter(data);
      renderTOC(data);
      renderChapterSelect();
      updateChapterNavButtons();

      /* =========================
         Scroll Spy
      ========================= */
      observeTopics();

      /* =========================
         Restore de tópico
         (APENAS UMA VEZ)
      ========================= */
      requestAnimationFrame(() => {
        restoreLastTopic(topicOverride);

        if (topicOverride) {
          updateURLTopic(topicOverride);
        }
      });
    })
    .catch((err) => {
      if (currentToken !== loadToken) return;

      console.error("Failed to load rulebook chapter:", err);

      const content = document.getElementById("rulebook-content");
      if (content) {
        content.innerHTML = "<p>Failed to load chapter.</p>";
      }
    });
}
