/*
 * Motor de busca do Rulebook
 * Responsável por:
 * - Executar consultas
 * - Retornar resultados ranqueados
 */

import { getIndex } from "./searchIndex.js";

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function search(query, limit = 10) {
  const q = normalize(query);
  if (!q) return [];

  const results = [];

  getIndex().forEach((entry) => {
    if (entry.text.includes(q)) {
      results.push({
        chapterFile: entry.chapterFile,
        chapterTitle: entry.chapterTitle,
        topicId: entry.topicId,
        topicTitle: entry.topicTitle,
      });
    }
  });

  return results.slice(0, limit);
}
