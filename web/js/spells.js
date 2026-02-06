/* =====================================================
   Spells Modal Controller
   - Open / Close modal
   - Load spells
   - Search & Sort
   - Render columns
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
    /* =========================
       Elements
    ========================= */
    
    const spellsButton = document.getElementById("spells-button");
    const spellsModal = document.getElementById("spells-modal");
    const spellsOverlay = document.getElementById("spells-overlay");
    const spellsClose = document.getElementById("spells-close");
    
    const searchInput = document.getElementById("spells-search");
    const sortButtons = document.querySelectorAll(".spells-sort button");
    const columns = document.querySelectorAll(".spells-column");
    
    if (!spellsButton || !spellsModal || !spellsOverlay || !spellsClose) {
  console.warn("Spells modal elements not found.");
  return;
}


    /* =========================
       State
    ========================= */
    
    let spells = [];
    let filteredSpells = [];
    
    const sortState = {
      key: "name",
      direction: "asc"
    };
    
    /* =========================
       Modal Control
    ========================= */
    
    function openSpellsModal() {
    spellsModal.removeAttribute("inert");
    spellsOverlay.removeAttribute("inert");

    spellsModal.setAttribute("aria-hidden", "false");
    spellsOverlay.setAttribute("aria-hidden", "false");

    document.body.classList.add("no-scroll");

    searchInput?.focus();
    }


    function closeSpellsModal() {
    // 1. Move focus back to the button that opened the modal
    spellsButton.focus();

    // 2. Disable interaction first
    spellsModal.setAttribute("inert", "");
    spellsOverlay.setAttribute("inert", "");

    // 3. Now hide from assistive tech
    spellsModal.setAttribute("aria-hidden", "true");
    spellsOverlay.setAttribute("aria-hidden", "true");

    document.body.classList.remove("no-scroll");
    }

    
    /* =========================
       Events
    ========================= */
    
    spellsButton.addEventListener("click", openSpellsModal);
    spellsClose.addEventListener("click", closeSpellsModal);
    spellsOverlay.addEventListener("click", closeSpellsModal);
    
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && spellsModal.getAttribute("aria-hidden") === "false") {
        closeSpellsModal();
      }
    });
    
    /* =========================
       Extract Spells
    ========================= */
    
    function extractSpellsFromChapter(chapter) {
      const result = [];
    
      if (!chapter.sections) return result;
    
      chapter.sections.forEach(section => {
        if (!section.content) return;
    
        section.content.forEach(block => {
          if (block.type === "spellList" && Array.isArray(block.spells)) {
            block.spells.forEach(spell => {
              result.push({
                ...spell,
                category: block.category ?? null,
                sourceSection: section.id
              });
            });
          }
        });
      });
    
      return result;
    }
    
    /* =========================
       Load Spells
    ========================= */
    
    async function loadSpells() {
      try {
        const response = await fetch("./data/rulebook/04-magia.json");
        const data = await response.json();
    
        spells = extractSpellsFromChapter(data);
        applyFilters();
    
      } catch (error) {
        console.error("Failed to load spells:", error);
      }
    }
    
    /* =========================
       Filters & Sort
    ========================= */
    
    function applyFilters() {
      const searchTerm = searchInput.value.toLowerCase().trim();
    
      filteredSpells = spells.filter(spell =>
        spell.name.toLowerCase().includes(searchTerm)
      );
    
      applySort();
    }
    
    function applySort() {
      filteredSpells.sort((a, b) => {
        let result = 0;
    
        if (sortState.key === "name" || sortState.key === "school") {
          result = a[sortState.key].localeCompare(b[sortState.key]);
        } else if (sortState.key === "level") {
          result = a.level - b.level;
        }
    
        return sortState.direction === "asc" ? result : -result;
      });
    
      renderSpells();
    }
    
    /* =========================
       Sort Button Logic
    ========================= */
    
    sortButtons.forEach(button => {
      button.addEventListener("click", () => {
        const key = button.dataset.sort;
    
        if (sortState.key === key) {
          sortState.direction = sortState.direction === "asc" ? "desc" : "asc";
        } else {
          sortState.key = key;
          sortState.direction = "asc";
        }
    
        sortButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
    
        applySort();
      });
    });
    
    /* =========================
       Search
    ========================= */
    
    let searchTimeout = null;
    
    searchInput.addEventListener("input", () => {
      clearTimeout(searchTimeout);
    
      searchTimeout = setTimeout(() => {
        applyFilters();
      }, 200);
    });
    
    /* =========================
       Render
    ========================= */
    
    function renderSpells() {
    columns.forEach(col => (col.innerHTML = ""));

    const columnCount = columns.length;
    if (columnCount === 0) return;

    const total = filteredSpells.length;
    const rowCount = Math.ceil(total / columnCount);

    for (let row = 0; row < rowCount; row++) {
        for (let col = 0; col < columnCount; col++) {
        const index = row * columnCount + col;
        if (index >= total) return;

        const spell = filteredSpells[index];

        const li = document.createElement("li");
        li.className = "spell-item";
        li.dataset.id = spell.id;

        li.innerHTML = `
            <div class="spell-name">${spell.name}</div>
            <div class="spell-meta">
            ${spell.school} · Nível ${spell.level}
            </div>
        `;

        columns[col].appendChild(li);
        }
    }
    }


    
    /* =========================
       Init
    ========================= */
    
    loadSpells();
  
});


