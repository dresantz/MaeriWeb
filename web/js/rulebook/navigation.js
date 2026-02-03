import { RULEBOOK_CHAPTERS, LAST_TOPIC_KEY } from "./constants.js";
import { currentChapterFile } from "./state.js";
import { switchToChapterByIndex } from "./toc.js";

/* =====================================================
   Scroll restoration control
===================================================== */

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

const navEntry = performance.getEntriesByType("navigation")[0];
const isReload = navEntry?.type === "reload";

/* =====================================================
   Helpers
===================================================== */

function getCurrentChapterIndex() {
  return RULEBOOK_CHAPTERS.findIndex(
    (ch) => ch.file === currentChapterFile
  );
}

export function getTopicFromURL() {
  return new URLSearchParams(window.location.search).get("topic");
}

export function updateURLTopic(topicId) {
  const url = new URL(window.location);
  const current = url.searchParams.get("topic");

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
   Chapter navigation
===================================================== */

export function updateChapterNavButtons() {
  const prev = document.getElementById("chapter-prev");
  const next = document.getElementById("chapter-next");

  if (!prev || !next) return;

  const index = getCurrentChapterIndex();

  prev.disabled = index <= 0;
  next.disabled =
    index === -1 || index >= RULEBOOK_CHAPTERS.length - 1;
}

export function initChapterNavigation() {
  const prev = document.getElementById("chapter-prev");
  const next = document.getElementById("chapter-next");

  prev?.addEventListener("click", () => navigateChapter(-1));
  next?.addEventListener("click", () => navigateChapter(1));

  initBackToTopButton();
}

function navigateChapter(direction) {
  const index = getCurrentChapterIndex();
  const target = index + direction;

  if (target < 0 || target >= RULEBOOK_CHAPTERS.length) return;

  // 🔑 PATCH: reset explícito de estado antes da troca
  clearSavedTopic();
  updateURLTopic(null);

  // 🔑 PATCH: TOC decide se fecha ou não
  switchToChapterByIndex(target, false);
}

/* =====================================================
   Topic restore
===================================================== */

export function restoreLastTopic(override = null) {
  // só restaura automaticamente em reload
  // OU quando há override explícito (ex: busca)
  if (!override && !isReload) return;

  let saved = override || getTopicFromURL() || localStorage.getItem(LAST_TOPIC_KEY);
  if (!saved) return;

  let topicId = saved;
  let chapterIndex = null;

  // se veio do localStorage (JSON)
  try {
    const parsed = JSON.parse(saved);
    topicId = parsed.topicId;
    chapterIndex = parsed.chapterIndex;
  } catch {
    // segue fluxo antigo (URL override, por exemplo)
  }


  if (!topicId) return;

  if (
  chapterIndex !== null &&
  chapterIndex !== getCurrentChapterIndex()
  ) {
    switchToChapterByIndex(chapterIndex, false);
    return; // ⛔ espera o capítulo renderizar
  }

  // 🛡️ garante que o tópico existe no capítulo atual
  const target = document.getElementById(topicId);
  if (!target) return;

  // 🧘 double RAF garante DOM + layout prontos
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      target.scrollIntoView({ block: "start" });
    });
  });
}


/* =====================================================
   Scroll Spy (anti-spam patch)
===================================================== */

let observer = null;
let lastActiveTopic = null;

export function observeTopics() {
  const topics = document.querySelectorAll("[data-topic]");
  if (!topics.length) return;

  observer?.disconnect();

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;

        const id = entry.target.id;
        if (!id) continue;

        // 🛡️ PATCH: evita spam de URL / localStorage
        if (id === lastActiveTopic) return;

        lastActiveTopic = id;

        const chapterIndex = getCurrentChapterIndex();

        localStorage.setItem(
          LAST_TOPIC_KEY,
          JSON.stringify({
            topicId: id,
            chapterIndex
          })
        );

        updateURLTopic(id);
      }
    },
    {
      rootMargin: "0px 0px -70% 0px",
      threshold: 0
    }
  );

  // 🧘 garante DOM estável antes de observar
  requestAnimationFrame(() => {
    topics.forEach((t) => observer.observe(t));
  });
}


/* =====================================================
   Back to Top
===================================================== */

function initBackToTopButton() {
  const btn = document.getElementById("back-to-top");
  if (!btn) return;

  btn.style.display = "none";

  btn.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" })
  );

  window.addEventListener("scroll", () => {
    btn.style.display =
      window.scrollY > 300 ? "flex" : "none";
  });
}
