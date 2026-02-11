/* =========================
   NotPat – News / Patch Notes
   Home Toggle Controller
========================= */

document.addEventListener("DOMContentLoaded", () => {
  const notpatToggle = document.getElementById("notpat-toggle");
  const notpatContent = document.getElementById("notpat-content");

  if (!notpatToggle || !notpatContent) return;

  let showingNews = true;

  const newsHTML = `
    <ul class="news-list">
      <li><strong>29/01</strong> — Bem-vindo ao Maeri RPG WebApp.</li>
      <li><strong>30/01</strong> — Sistema de dados atualizado.</li>
      <li><strong>31/01</strong> — Nova interface mobile-first.</li>
    </ul>
  `;

  const patchHTML = `
    <ul class="patch-list">
      <li><strong>v0.3.1</strong> — Ajustes no Dice Roller.</li>
      <li><strong>v0.3.0</strong> — Nova Home mobile-first.</li>
      <li><strong>v0.2.5</strong> — Refatoração de CSS base.</li>
    </ul>
  `;

  function switchContent() {
    notpatContent.classList.add("is-switching");

    setTimeout(() => {
      if (showingNews) {
        notpatToggle.textContent = "Patch Notes";
        notpatToggle.setAttribute("aria-pressed", "true");
        notpatContent.innerHTML = patchHTML;
      } else {
        notpatToggle.textContent = "Notícias";
        notpatToggle.setAttribute("aria-pressed", "false");
        notpatContent.innerHTML = newsHTML;
      }

      showingNews = !showingNews;
      notpatContent.classList.remove("is-switching");
    }, 200);
  }

  notpatToggle.addEventListener("click", switchContent);
});
