/*
 * Navegação por teclado do TOC
 * Responsável apenas por:
 * - Foco
 * - Setas
 * - Enter / Espaço
 * - Escape
 */

export function initTOCKeyboardNavigation({
  tocList,
  onClose
}) {
  if (!tocList) return;

  tocList.setAttribute("role", "listbox");
  tocList.tabIndex = -1;

  let activeIndex = -1;

  function getItems() {
    return Array.from(tocList.querySelectorAll("a"));
  }

  function setActive(index) {
    const items = getItems();
    if (!items.length) return;

    if (activeIndex >= 0 && items[activeIndex]) {
      items[activeIndex].classList.remove("active");
      items[activeIndex].setAttribute("aria-selected", "false");
    }

    activeIndex = Math.max(0, Math.min(index, items.length - 1));

    const el = items[activeIndex];
    el.classList.add("active");
    el.setAttribute("aria-selected", "true");
    el.focus();
  }

  tocList.addEventListener("keydown", (e) => {
    const items = getItems();
    if (!items.length) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive(activeIndex + 1);
        break;

      case "ArrowUp":
        e.preventDefault();
        setActive(activeIndex - 1);
        break;

      case "Home":
        e.preventDefault();
        setActive(0);
        break;

      case "End":
        e.preventDefault();
        setActive(items.length - 1);
        break;

      case "Enter":
      case " ":
        e.preventDefault();
        items[activeIndex]?.click();
        break;

      case "Escape":
        e.preventDefault();
        onClose?.();
        break;
    }
  });

  return {
    focusFirst() {
      requestAnimationFrame(() => setActive(0));
    },
    reset() {
      activeIndex = -1;
    }
  };
}
