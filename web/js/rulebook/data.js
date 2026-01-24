// Chapters list
const RULEBOOK_CHAPTERS = [
  { file: "01-o-basico.json", title: "O Básico" },
  { file: "02-personagem.json", title: "Personagem" },
  { file: "03-combate.json", title: "Combate" }
  // Depois você adiciona os próximos aqui:
];

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
