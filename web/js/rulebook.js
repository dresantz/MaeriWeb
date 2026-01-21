function renderRulebook(chapterData) {
  const container = document.getElementById("rulebook-content");
  if (!container) return;

  container.innerHTML = "";

  // Chapter title
  const chapterTitle = document.createElement("h1");
  chapterTitle.textContent = chapterData.title;
  container.appendChild(chapterTitle);

  // Description
  if (chapterData.description) {
    const desc = document.createElement("p");
    desc.textContent = chapterData.description;
    container.appendChild(desc);
  }

  // Sections
  chapterData.sections.forEach(section => {
    const sectionEl = document.createElement("section");
    sectionEl.id = section.id;

    const title = document.createElement("h2");
    title.textContent = section.title;
    sectionEl.appendChild(title);

    section.content.forEach(block => {
      if (block.type === "paragraph") {
        const p = document.createElement("p");
        p.textContent = block.text;
        sectionEl.appendChild(p);
      }

      if (block.type === "list") {
        const ul = document.createElement("ul");
        block.items.forEach(item => {
          const li = document.createElement("li");
          li.textContent = item;
          ul.appendChild(li);
        });
        sectionEl.appendChild(ul);
      }
    });

    container.appendChild(sectionEl);
  });
}

function loadChapter(chapterFile) {
  fetch(`/web/data/rulebook/${chapterFile}`)
    .then(response => response.json())
    .then(data => renderRulebook(data))
    .catch(error => {
      console.error("Failed to load rulebook chapter:", error);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  loadChapter("01-basico.json");
});
