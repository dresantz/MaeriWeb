/**
 * searchIndex.js - Índice e motor de busca do Rulebook
 */

import { getCurrentChapter } from "../rulebook/navigation.js";

const index = [];

// ===== NORMALIZAÇÃO =====

function normalizeText(text = "") {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ===== EXTRAÇÃO DE TEXTO =====

function extractTextFromBlock(block) {
  if (!block) return "";
  
  let text = "";
  
  // Texto direto
  if (block.text) text += " " + block.text;
  if (block.name) text += " " + block.name;
  if (block.description) text += " " + block.description;
  if (block.cost) text += " " + block.cost;
  if (block.title) text += " " + block.title;
  if (block.caption) text += " " + block.caption;
  
  // Colunas de tabela
  if (Array.isArray(block.columns)) {
    block.columns.forEach(col => text += " " + col);
  }
  
  // Linhas de tabela
  if (Array.isArray(block.rows)) {
    block.rows.forEach(row => {
      if (Array.isArray(row)) {
        row.forEach(cell => text += " " + cell);
      }
    });
  }
  
  // Itens simples
  if (Array.isArray(block.items)) {
    block.items.forEach(item => {
      if (typeof item === "string") {
        text += " " + item;
      } else if (item?.text) {
        text += " " + item.text;
      } else if (item?.title) {
        text += " " + item.title;
      }
      
      // Sub-itens
      if (item?.subitems) {
        item.subitems.forEach(sub => text += " " + sub);
      }
      if (item?.items) {
        item.items.forEach(sub => {
          if (typeof sub === "string") {
            text += " " + sub;
          } else if (sub?.text) {
            text += " " + sub.text;
          } else if (sub?.title) {
            text += " " + sub.title;
          }
        });
      }
    });
  }
  
  // Spells
  if (Array.isArray(block.spells)) {
    block.spells.forEach(spell => {
      text += " " + extractTextFromBlock(spell);
    });
  }
  
  // Subseções (recursivo)
  if (Array.isArray(block.content)) {
    block.content.forEach(subBlock => {
      text += " " + extractTextFromBlock(subBlock);
    });
  }
  
  return text;
}

function extractTextFromSection(section) {
  let text = section.title || "";
  
  (section.content || []).forEach(block => {
    text += " " + extractTextFromBlock(block);
  });
  
  return normalizeText(text);
}

// ===== CONSTRUÇÃO DO ÍNDICE =====

export function buildIndex(chaptersData) {
  index.length = 0;
  
  chaptersData.forEach((chapter) => {
    const chapterFile = chapter.__file;
    
    (chapter.sections || []).forEach((section) => {
      if (!section.topic_id) return;
      
      index.push({
        chapterFile,
        chapterTitle: chapter.title || "",
        _chapterTitleNorm: normalizeText(chapter.title || ""),
        topicId: section.topic_id,
        topicTitle: section.title || "",
        _topicTitleNorm: normalizeText(section.title || ""),
        text: extractTextFromSection(section)
      });
    });
  });
}

// ===== BUSCA + RANKING =====

export function search(query, { limit = 20 } = {}) {
  if (!query || query.length < 2) return [];
  
  const q = normalizeText(query);
  const terms = q.split(" ").filter(Boolean);
  const results = [];
  
  const currentChapter = getCurrentChapter();
  
  for (const entry of index) {
    let score = 0;
    
    const topicTitle = entry._topicTitleNorm;
    const chapterTitle = entry._chapterTitleNorm;
    const text = entry.text;
    const words = text.split(" ");
    const textLength = text.length || 1;
    
    let topicMatch = false;
    let chapterMatch = false;
    let phraseMatch = false;
    
    // ===== MATCH EXATO NO TÍTULO (MAIOR PESO) =====
    if (topicTitle === q) {
      score += 50;
      topicMatch = true;
      phraseMatch = true;
    }
    
    if (topicTitle.includes(q)) {
      score += 25;
      topicMatch = true;
      phraseMatch = true;
    }
    
    if (text.includes(q)) {
      score += 8;
      phraseMatch = true;
    }
    
    // ===== MATCH POR TERMOS =====
    for (const term of terms) {
      if (topicTitle.includes(term)) {
        score += 15;
        topicMatch = true;
      }
      
      if (chapterTitle.includes(term)) {
        score += 4;
        chapterMatch = true;
      }
      
      if (text.includes(term)) {
        score += 2;
      }
    }
    
    // ===== ORDEM CORRETA =====
    if (terms.length > 1) {
      const orderedRegex = new RegExp(terms.join(".*"));
      if (orderedRegex.test(topicTitle)) score += 8;
      else if (orderedRegex.test(text)) score += 3;
    }
    
    // ===== PROXIMIDADE =====
    const positions = terms.map((term) =>
      words.reduce((acc, w, i) => {
        if (w === term) acc.push(i);
        return acc;
      }, [])
    );
    
    if (positions.every((p) => p.length > 0)) {
      const all = positions.flat();
      const min = Math.min(...all);
      const max = Math.max(...all);
      const windowSize = max - min;
      
      if (windowSize <= 6) score += 8;
      else if (windowSize <= 12) score += 4;
      
      score -= windowSize * 0.1;
    }
    
    // ===== BOOST CONTEXTUAL =====
    if (entry.chapterFile === currentChapter) {
      score += 5;
    }
    
    if (score <= 0) continue;
    
    // Normalização menos agressiva
    const normalizedScore = score / Math.log(textLength + 100);
    
    results.push({
      ...entry,
      score: normalizedScore,
      _rawScore: score,
      _textLength: textLength,
      _topicMatch: topicMatch,
      _chapterMatch: chapterMatch,
      _phraseMatch: phraseMatch
    });
  }
  
  return results
    .sort((a, b) => {
      // Ordena pelo score bruto primeiro
      if (b._rawScore !== a._rawScore) return b._rawScore - a._rawScore;
      if (b._phraseMatch !== a._phraseMatch) return b._phraseMatch ? 1 : -1;
      if (b._topicMatch !== a._topicMatch) return b._topicMatch ? 1 : -1;
      if (b._chapterMatch !== a._chapterMatch) return b._chapterMatch ? 1 : -1;
      return a._textLength - b._textLength;
    })
    .slice(0, limit);
}