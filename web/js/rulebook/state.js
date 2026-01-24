/*
 * Estado global do Rulebook
 * Centraliza informações compartilhadas entre módulos
 */

export let currentChapterFile = null;

/**
 * Atualiza o capítulo atual
 */
export function setCurrentChapter(fileName) {
  currentChapterFile = fileName;
}
