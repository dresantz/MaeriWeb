/*
 * Índice global de busca do Rulebook
 * Responsável apenas por:
 * - Armazenar dados indexados
 * - Construir o índice a partir dos capítulos
 * - Expor acesso de leitura
 */

const index = [];

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Constrói o índice global
 * @param {Array} chaptersData Array com os JSONs dos capítulos
 */
export function buildIndex(chaptersData) {
  index.length = 0;

  chaptersData.forEach((chapter) => {
    const chapterFile = chapter.__file;

    (chapter.sections || []).forEach((section) => {
      if (!section.id) return;

      index.push({
        chapterFile,
        chapterTitle: chapter.title,
        topicId: section.id,
        topicTitle: section.title || "",
        text: extractText(section)
      });
    });
  });
}

/**
 * Retorna o índice completo (read-only)
 */
export function getIndex() {
  return index;
}

/* =====================================================
   Helpers
===================================================== */

function extractText(section) {
  let text = section.title || "";

  (section.content || []).forEach((block) => {
    if (block.text) text += " " + block.text;

    if (Array.isArray(block.items)) {
      block.items.forEach((item) => {
        if (typeof item === "string") text += " " + item;
      });
    }
  });

  return normalizeText(text);
}

export function search(query, { limit = 20 } = {}) {
  if (!query || query.length < 2) return [];

  const q = normalizeText(query);
  const terms = q.split(" ");

  const results = [];

  for (const entry of index) {
    let score = 0;

    const haystack = `${entry.chapterTitle} ${entry.topicTitle} ${entry.text}`;

    for (const term of terms) {
      if (haystack.includes(term)) {
        score += 1;
      }
    }

    if (score > 0) {
      results.push({
        ...entry,
        score
      });
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// remover quando tivermos a UI
window.__searchIndex = index;
