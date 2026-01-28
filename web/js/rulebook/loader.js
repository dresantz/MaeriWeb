import { renderRulebookChapter } from "./renderer.js";
import { renderTOC, renderChapterSelect } from "./toc.js";
import { setCurrentChapter } from "./state.js";
import { LAST_CHAPTER_KEY } from "./constants.js";
import { updateChapterNavButtons } from "./navigation.js";
import { restoreLastTopic, observeTopics } from "./navigation.js";

let loadToken = 0;

export function loadRulebookChapter(fileName) {
  const currentToken = ++loadToken;

  const path = `../data/rulebook/${fileName}`;

  /* =========================
     Estado global
  ========================= */
  setCurrentChapter(fileName);
  localStorage.setItem(LAST_CHAPTER_KEY, fileName);

  /* =========================
     Atualiza URL (?chapter=)
  ========================= */
  const url = new URL(window.location);
  url.searchParams.set("chapter", fileName);
  window.history.replaceState({}, "", url);

  /* =========================
     Fetch do capítulo
  ========================= */
  fetch(path)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((data) => {
      // 🚫 ignora resposta obsoleta
      if (currentToken !== loadToken) return;

      /* =========================
         Renderização
      ========================= */
      renderRulebookChapter(data);
      renderTOC(data);
      renderChapterSelect();
      updateChapterNavButtons();

      /* =========================
         Scroll spy
         (observer antes do scroll)
      ========================= */
      observeTopics();

      /* =========================
         Restaurar tópico
      ========================= */
      requestAnimationFrame(() => {
        restoreLastTopic();
      });
    })
    .catch((err) => {
      if (currentToken !== loadToken) return;

      console.error("Failed to load rulebook chapter:", err);

      // rollback mínimo
      const content = document.getElementById("rulebook-content");
      if (content) {
        content.innerHTML = "<p>Failed to load chapter.</p>";
      }
    });
}
