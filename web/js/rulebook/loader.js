/**
 * Carrega um capítulo do Rulebook
 * Responsável por:
 * - Buscar o JSON do capítulo
 * - Atualizar estado global
 * - Atualizar URL (?chapter=)
 * - Renderizar conteúdo e TOC
 * - Restaurar tópico (URL ou localStorage)
 * - Ativar observador de scroll
 */
function loadRulebookChapter(fileName) {
  // Caminho do JSON
  // rulebook.html está em /web/pages/
  // JSON está em /web/data/rulebook/
  const path = `../data/rulebook/${fileName}`;

  /* =========================
     Estado global
  ========================= */
  currentChapterFile = fileName;
  localStorage.setItem(LAST_CHAPTER_KEY, fileName);

  /* =========================
     Atualiza URL (?chapter=)
     Mantém outros parâmetros (ex: topic)
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
      /* =========================
         Renderização
      ========================= */
      renderRulebookChapter(data);
      renderTOC(data);
      renderChapterSelect();
      updateChapterNavButtons();

      /* =========================
         Restaurar tópico
         Prioridade:
         1) URL (?topic=)
         2) localStorage
      ========================= */
      restoreLastTopic();

      /* =========================
         Ativar scroll spy
      ========================= */
      observeTopics();
    })
    .catch((err) => {
      console.error("Failed to load rulebook chapter:", err);
    });
}
