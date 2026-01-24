

function renderTOC(chapterData) {
  const tocList = document.getElementById("toc-list");
  const tocChapterTitle = document.getElementById("toc-chapter-title");

  if (!tocList || !tocChapterTitle) return;

  tocChapterTitle.textContent = chapterData.title || "Rulebook";

  tocList.innerHTML = "";

  (chapterData.sections || []).forEach((section) => {
    const li = document.createElement("li");
    const a = document.createElement("a");

    a.href = `#${section.id}`;
    a.textContent = section.title || "Untitled";

    li.appendChild(a);
    tocList.appendChild(li);
  });
}

const ICON_CLOSED = "☰";
const ICON_OPEN = "✕";

function initTOCToggle() {
  const tocToggle = document.getElementById("toc-toggle");
  const tocPanel = document.getElementById("toc-panel");
  const tocOverlay = document.getElementById("toc-overlay");
  const tocList = document.getElementById("toc-list");

  if (!tocToggle || !tocPanel || !tocOverlay || !tocList) return;

  function openTOC() {
    tocToggle.textContent = ICON_OPEN;
tocToggle.setAttribute("aria-label", "Close Rulebook Index");
    tocPanel.classList.add("open");
    tocOverlay.classList.add("active");
    document.body.classList.add("no-scroll");
    tocPanel.setAttribute("aria-hidden", "false");
  }

  function closeTOC() {
    tocToggle.textContent = ICON_CLOSED;
tocToggle.setAttribute("aria-label", "Open Rulebook Index");
    tocPanel.classList.remove("open");
    tocOverlay.classList.remove("active");
    document.body.classList.remove("no-scroll");
    tocPanel.setAttribute("aria-hidden", "true");
  }

  tocToggle.addEventListener("click", () => {
  const isOpen = tocPanel.classList.contains("open");
  if (isOpen) closeTOC();
  else openTOC();
});
  tocOverlay.addEventListener("click", closeTOC);

  // Close after clicking any item
  tocList.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      const targetId = e.target.getAttribute("href")?.replace("#", "");
      if (targetId) {
        localStorage.setItem(LAST_TOPIC_KEY, targetId);
      }
      closeTOC();
    }
  });
}

function renderChapterSelect() {
  const select = document.getElementById("chapter-select");
  if (!select) return;

  select.innerHTML = "";

  RULEBOOK_CHAPTERS.forEach((ch) => {
    const option = document.createElement("option");
    option.value = ch.file;
    option.textContent = ch.title;
    if (ch.file === currentChapterFile) option.selected = true;
    select.appendChild(option);
  });
}

function getCurrentChapterIndex() {
  return RULEBOOK_CHAPTERS.findIndex(ch => ch.file === currentChapterFile);
}

function updateChapterNavButtons() {
  const prevBtn = document.getElementById("chapter-prev");
  const nextBtn = document.getElementById("chapter-next");

  if (!prevBtn || !nextBtn) return;

  const index = getCurrentChapterIndex();

  prevBtn.disabled = index <= 0;
  nextBtn.disabled = index === -1 || index >= RULEBOOK_CHAPTERS.length - 1;
}

function switchToChapterByIndex(newIndex, closeTOC = true) {
  if (newIndex < 0 || newIndex >= RULEBOOK_CHAPTERS.length) return;

  const chapter = RULEBOOK_CHAPTERS[newIndex];
  loadRulebookChapter(chapter.file);

  // Smooth scroll to top for reading flow
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Keep select in sync
  const select = document.getElementById("chapter-select");

  if (select) select.value = chapter.file;

  // Close TOC after switching
  if (closeTOC) {
    const tocPanel = document.getElementById("toc-panel");
    const tocOverlay = document.getElementById("toc-overlay");
    const tocToggle = document.getElementById("toc-toggle");

    if (tocPanel && tocOverlay && tocToggle) {
      tocPanel.classList.remove("open");
      tocOverlay.classList.remove("active");
      document.body.classList.remove("no-scroll");
      tocToggle.textContent = "☰";
      tocToggle.setAttribute("aria-label", "Open Rulebook Index");
    }
  }
}