// Storage keys
const LAST_CHAPTER_KEY = "maeriLastChapter";
const LAST_TOPIC_KEY = "maeriLastTopic";

// Helpers
function chapterExists(fileName) {
  return RULEBOOK_CHAPTERS.some(ch => ch.file === fileName);
}

function getChapterFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("chapter");
}

// Initial chapter resolution (URL > localStorage > default)
const urlChapter = getChapterFromURL();
const savedChapter = localStorage.getItem(LAST_CHAPTER_KEY);

let currentChapterFile;

if (urlChapter && chapterExists(urlChapter)) {
  currentChapterFile = urlChapter;
} else if (savedChapter && chapterExists(savedChapter)) {
  currentChapterFile = savedChapter;
} else {
  currentChapterFile = RULEBOOK_CHAPTERS[0].file;
}