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

  function clearActive() {
    const items = getItems();
    items.forEach(item => {
      item.classList.remove("active");
      item.setAttribute("aria-selected", "false");
    });
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
        setActive(activeIndex < 0 ? 0 : activeIndex + 1);
        break;

      case "ArrowUp":
        e.preventDefault();
        setActive(activeIndex <= 0 ? 0 : activeIndex - 1);
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
        if (activeIndex < 0) {
          setActive(0);
        } else {
          items[activeIndex]?.click();
        }
        break;

      case "Escape":
        e.preventDefault();
        clearActive();
        activeIndex = -1;
        onClose?.();
        break;
    }
  });

  return {
    focusFirst() {
      requestAnimationFrame(() => {
        clearActive();
        setActive(0);
      });
    },
    reset() {
      clearActive();
      activeIndex = -1;
    }
  };
}
