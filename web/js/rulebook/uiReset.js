document.addEventListener("DOMContentLoaded", () => {
  // 🔑 reset global definitivo (scroll + layout)
  unlockBodyScroll();

  // Fecha SOMENTE overlays genéricos (exclui Dice Roller)
  document.querySelectorAll(
    ".modal.open, .drawer.open, .overlay.open"
  ).forEach(el => {
    if (el.id === "dice-panel" || el.id === "dice-overlay") return;
    el.classList.remove("open");
  });

  document.querySelectorAll(
    ".modal.active, .drawer.active, .overlay.active"
  ).forEach(el => {
    if (el.id === "dice-panel" || el.id === "dice-overlay") return;
    el.classList.remove("active");
  });
});

export function unlockBodyScroll() {
  requestAnimationFrame(() => {
    document.body.classList.remove("no-scroll");

    // 🔥 limpeza defensiva de TODAS as propriedades críticas
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
    document.body.style.marginRight = "";
    document.body.style.width = "";
    document.body.style.position = "";

    // 🔁 força reflow imediato (corrige deslocamento fantasma)
    void document.body.offsetWidth;
  });
}
