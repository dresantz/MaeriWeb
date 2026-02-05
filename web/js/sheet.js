/* =========================
   Character Sheet – UI Control
   + Persistence Integration
========================= */

import {
  resetCharacterSheet
} from "./characterSheetStore.js";

import {
  loadCharacterSheet,
  getCharacterSheet,
  setCharacterName,
  setAttribute,
  setInfo,
  setItems
} from "./characterSheetStore.js";

document.addEventListener("DOMContentLoaded", () => {
  const sheetButton = document.getElementById("sheet-button");
  const sheetModal = document.getElementById("sheet-modal");
  const sheetOverlay = document.getElementById("sheet-overlay");
  const sheetClose = document.getElementById("sheet-close");

  const clearButton = document.getElementById("clear-sheet-button");
  const confirmBox = document.getElementById("clear-confirmation");
  const confirmClear = document.getElementById("confirm-clear-sheet");
  const cancelClear = document.getElementById("cancel-clear-sheet");


  if (!sheetButton || !sheetModal || !sheetOverlay || !sheetClose) {
    console.warn("Sheet modal elements not found.");
    return;
  }

  if (clearButton && confirmBox && confirmClear && cancelClear) {

  clearButton.addEventListener("click", () => {
    confirmBox.hidden = false;
    clearButton.disabled = true;
  });

  cancelClear.addEventListener("click", () => {
    confirmBox.hidden = true;
    clearButton.disabled = false;
  });

  confirmClear.addEventListener("click", () => {
    resetCharacterSheet();
    hydrateSheet();

    confirmBox.hidden = true;
    clearButton.disabled = false;
  });
}


  // Inputs
  const nameInput = document.getElementById("character-name");
  const infoTextarea = document.getElementById("character-info");
  const itemsTextarea = document.getElementById("character-items");
  const attributeInputs = sheetModal.querySelectorAll(
    ".attributes-grid input"
  );

  let lastFocusedElement = null;

  /* =========================
     Data → UI
  ========================= */

  function hydrateSheet() {
    const sheet = getCharacterSheet();

    if (nameInput) {
      nameInput.value = sheet.character.name || "";
    }

    if (infoTextarea) {
      infoTextarea.value = sheet.info || "";
    }

    if (itemsTextarea) {
      itemsTextarea.value = sheet.items || "";
    }

    attributeInputs.forEach((input) => {
      const key = input
        .closest("label")
        ?.textContent.trim()
        ?.charAt(0);

      if (key && sheet.attributes[key] !== undefined) {
        input.value = sheet.attributes[key];
      }
    });
  }

  /* =========================
     UI → Data (Autosave)
  ========================= */

  if (nameInput) {
    nameInput.addEventListener("input", (e) => {
      setCharacterName(e.target.value);
    });
  }

  if (infoTextarea) {
    infoTextarea.addEventListener("input", (e) => {
      setInfo(e.target.value);
    });
  }

  if (itemsTextarea) {
    itemsTextarea.addEventListener("input", (e) => {
      setItems(e.target.value);
    });
  }

  attributeInputs.forEach((input) => {
    input.addEventListener("input", (e) => {
      const key = e.target
        .closest("label")
        ?.textContent.trim()
        ?.charAt(0);

      if (key) {
        setAttribute(key, e.target.value);
      }
    });
  });

  /* =========================
     Modal Control
  ========================= */

  function openSheet() {
    lastFocusedElement = document.activeElement;

    // Ensure data is loaded
    loadCharacterSheet();
    hydrateSheet();

    sheetModal.setAttribute("aria-hidden", "false");
    sheetOverlay.setAttribute("aria-hidden", "false");

    sheetModal.inert = false;
    sheetOverlay.inert = false;

    document.body.classList.add("no-scroll");

    const firstInput = sheetModal.querySelector(
      "input, textarea, button"
    );
    firstInput?.focus();
  }

  function closeSheet() {
    document.activeElement?.blur();

    sheetModal.setAttribute("aria-hidden", "true");
    sheetOverlay.setAttribute("aria-hidden", "true");

    sheetModal.inert = true;
    sheetOverlay.inert = true;

    document.body.classList.remove("no-scroll");

    lastFocusedElement?.focus();
  }

  /* =========================
     Events
  ========================= */

  sheetButton.addEventListener("click", openSheet);
  sheetClose.addEventListener("click", closeSheet);
  sheetOverlay.addEventListener("click", closeSheet);

  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      sheetModal.getAttribute("aria-hidden") === "false"
    ) {
      closeSheet();
    }
  });
});
