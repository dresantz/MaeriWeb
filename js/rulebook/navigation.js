/**
 * navigation.js - Navegação do Rulebook
 * Gerencia navegação, scroll spy, restauração de tópico e URL
 */

import { RULEBOOK_CHAPTERS, LAST_TOPIC_KEY } from "./constants.js";
import { switchToChapterByIndex } from "./toc.js";

// ===== CONSTANTES =====
const SCROLL_THRESHOLD = 300;
const OBSERVER_MARGIN = "0px 0px -70% 0px";

// ===== ESTADO =====
let currentChapterFile = null;
let observer = null;
let lastActiveTopic = null;
let navigationInitialized = false;

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

// ===== GETTERS/SETTERS =====

export function setCurrentChapter(fileName) {
  currentChapterFile = fileName;
}

export function getCurrentChapter() {
  return currentChapterFile;
}

export function getCurrentChapterIndex() {
  if (!currentChapterFile) return -1;
  return RULEBOOK_CHAPTERS.findIndex(ch => ch.file === currentChapterFile);
}

// ===== URL HELPERS =====

export function getTopicFromURL() {
  return new URLSearchParams(window.location.search).get("topic");
}

export function updateURLTopic(topicId) {
  const url = new URL(window.location);
  
  if (url.searchParams.get("topic") === topicId) return;
  
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

// ===== NAVEGAÇÃO ENTRE CAPÍTULOS =====

export function updateChapterNavButtons() {
  const prev = document.getElementById("chapter-prev");
  const next = document.getElementById("chapter-next");
  
  if (!prev || !next) return;
  
  const index = getCurrentChapterIndex();
  
  prev.disabled = index <= 0;
  next.disabled = index === -1 || index >= RULEBOOK_CHAPTERS.length - 1;
}

function navigateChapter(direction) {
  const index = getCurrentChapterIndex();
  const target = index + direction;
  
  if (target < 0 || target >= RULEBOOK_CHAPTERS.length) return;
  
  clearSavedTopic();
  updateURLTopic(null);
  switchToChapterByIndex(target, null);
}

function addClickListener(element, handler) {
  const clone = element.cloneNode(true);
  element.parentNode?.replaceChild(clone, element);
  clone.addEventListener("click", handler);
  return clone;
}

export function initChapterNavigation() {
  if (navigationInitialized) return;
  
  const prev = document.getElementById("chapter-prev");
  const next = document.getElementById("chapter-next");
  
  if (!prev || !next) return;
  
  const prevClone = addClickListener(prev, (e) => {
    e.preventDefault();
    navigateChapter(-1);
  });
  
  const nextClone = addClickListener(next, (e) => {
    e.preventDefault();
    navigateChapter(1);
  });
  
  prevClone.id = "chapter-prev";
  nextClone.id = "chapter-next";
  
  navigationInitialized = true;
  initBackToTopButton();
}

// ===== RESTAURAÇÃO DE TÓPICO =====

export function restoreLastTopic(override = null) {
  let saved = override || getTopicFromURL() || localStorage.getItem(LAST_TOPIC_KEY);
  
  if (!saved) return;
  
  let topicId = saved;
  
  if (saved.startsWith('{')) {
    try {
      topicId = JSON.parse(saved).topicId;
    } catch {
      return;
    }
  }
  
  if (!topicId) return;
  
  const target = document.getElementById(topicId);
  if (!target) {
    localStorage.removeItem(LAST_TOPIC_KEY);
    return;
  }
  
  setTimeout(() => {
    target.scrollIntoView({ block: "start" });
  }, 100);
}

// ===== SCROLL SPY =====

export function observeTopics() {
  const topics = document.querySelectorAll("[data-topic]");
  if (!topics.length) return;
  
  observer?.disconnect();
  lastActiveTopic = null;
  
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        
        const id = entry.target.id;
        if (!id || id === lastActiveTopic) continue;
        
        lastActiveTopic = id;
        saveTopic(id);
        updateURLTopic(id);
      }
    },
    { rootMargin: OBSERVER_MARGIN, threshold: 0 }
  );
  
  topics.forEach(t => observer.observe(t));
}

// ===== SALVAR TÓPICO =====

function saveTopic(topicId) {
  const chapterIndex = getCurrentChapterIndex();
  localStorage.setItem(
    LAST_TOPIC_KEY,
    JSON.stringify({ topicId, chapterIndex })
  );
}

function saveCurrentTopicBeforeUnload() {
  const topics = document.querySelectorAll("[data-topic]");
  
  for (const topic of topics) {
    const rect = topic.getBoundingClientRect();
    if (rect.top >= 0 && rect.top < window.innerHeight * 0.3) {
      saveTopic(topic.id);
      break;
    }
  }
}

window.addEventListener('beforeunload', saveCurrentTopicBeforeUnload);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    saveCurrentTopicBeforeUnload();
  }
});

// ===== BACK TO TOP =====

function initBackToTopButton() {
  const btn = document.getElementById("back-to-top");
  if (!btn) return;
  
  const btnClone = addClickListener(btn, () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  
  btnClone.id = "back-to-top";
  btnClone.style.display = "none";
  
  window.addEventListener("scroll", () => {
    btnClone.style.display = window.scrollY > SCROLL_THRESHOLD ? "flex" : "none";
  });
}

// ===== RESET =====

export function resetNavigation() {
  navigationInitialized = false;
}