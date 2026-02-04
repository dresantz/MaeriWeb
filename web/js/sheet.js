/* =========================
   Character Sheet – UI Control
========================= */

document.addEventListener("DOMContentLoaded", () => {
  const sheetButton = document.getElementById("sheet-button");
  const sheetModal = document.getElementById("sheet-modal");
  const sheetOverlay = document.getElementById("sheet-overlay");
  const sheetClose = document.getElementById("sheet-close");

  if (!sheetButton || !sheetModal || !sheetOverlay || !sheetClose) {
    console.warn("Sheet modal elements not found.");
    return;
  }

    let lastFocusedElement = null;

    function openSheet() {
    lastFocusedElement = document.activeElement;

    sheetModal.setAttribute("aria-hidden", "false");
    sheetOverlay.setAttribute("aria-hidden", "false");

    sheetModal.inert = false;
    sheetOverlay.inert = false;

    document.body.classList.add("no-scroll");

    const firstInput = sheetModal.querySelector("input, textarea, button");
    if (firstInput) {
        firstInput.focus();
    }
    }

    function closeSheet() {
    document.activeElement?.blur();

    sheetModal.setAttribute("aria-hidden", "true");
    sheetOverlay.setAttribute("aria-hidden", "true");

    sheetModal.inert = true;
    sheetOverlay.inert = true;

    document.body.classList.remove("no-scroll");

    if (lastFocusedElement) {
        lastFocusedElement.focus();
    }
    }



  // Open
  sheetButton.addEventListener("click", openSheet);

  // Close
  sheetClose.addEventListener("click", closeSheet);
  sheetOverlay.addEventListener("click", closeSheet);

  // Optional: ESC key support
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && sheetModal.getAttribute("aria-hidden") === "false") {
      closeSheet();
    }
  });
});
