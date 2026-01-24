function loadRulebookChapter(fileName) {
  const path = `../data/rulebook/${fileName}`;

  currentChapterFile = fileName;
  localStorage.setItem(LAST_CHAPTER_KEY, fileName);

  const url = new URL(window.location);
  url.searchParams.set("chapter", fileName);
  window.history.replaceState({}, "", url);

  fetch(path)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      renderRulebookChapter(data);
      renderTOC(data);
      renderChapterSelect();
      updateChapterNavButtons();

      const lastTopicId = localStorage.getItem(LAST_TOPIC_KEY);
      if (lastTopicId) {
        const el = document.getElementById(lastTopicId);
        if (el) {
          el.scrollIntoView({ behavior: "auto", block: "start" });
        }
      }

      observeTopics();
    });
}
