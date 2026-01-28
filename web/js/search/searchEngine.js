/*
 * Motor de busca do Rulebook
 * Fachada sobre o índice
 */

import { search as indexSearch } from "./searchIndex.js";

export function search(query, options = {}) {
  return indexSearch(query, {
    limit: options.limit ?? 20
  });
}
