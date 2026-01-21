/* =========================
   Maeri RPG – Global Dice Roller
========================= */

/* ---------- Utilities ---------- */

function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

/* ---------- Dice Roller Component ---------- */

function initDiceRoller() {
  const rollButton = document.getElementById("roll-button");
  const diceTypeSelect = document.getElementById("dice-type");
  const diceAmountInput = document.getElementById("dice-amount");
  const resultOutput = document.getElementById("result-output");
  const totalOutput = document.getElementById("total-output");
  const historyOutput = document.getElementById("history-output");
  const clearHistoryButton = document.getElementById("clear-history");

  // If core elements are missing, do not initialize
  if (
    !rollButton ||
    !diceTypeSelect ||
    !diceAmountInput ||
    !resultOutput ||
    !totalOutput ||
    !historyOutput
  ) {
    return;
  }

  const history = [];

  rollButton.addEventListener("click", () => {
    const diceType = parseInt(diceTypeSelect.value);
    const diceAmount = parseInt(diceAmountInput.value);

    const results = [];
    let total = 0;

    for (let i = 0; i < diceAmount; i++) {
      const roll = rollDie(diceType);
      results.push(roll);
      total += roll;
    }

    resultOutput.textContent = results.join(", ");
    totalOutput.textContent = total;

    history.unshift(`d${diceType} x${diceAmount} → ${results.join(", ")}`);
    if (history.length > 3) history.pop();

    historyOutput.innerHTML = "";
    history.forEach(entry => {
      const li = document.createElement("li");
      li.textContent = entry;
      historyOutput.appendChild(li);
    });
  });

  if (clearHistoryButton) {
    clearHistoryButton.addEventListener("click", () => {
      history.length = 0;
      historyOutput.innerHTML = "";
    });
  }
}

/* ---------- Floating Toggle ---------- */

function initDiceToggle() {
  const diceToggle = document.getElementById("dice-toggle");
  const dicePanel = document.getElementById("dice-panel");
  const diceOverlay = document.getElementById("dice-overlay");

  if (!diceToggle || !dicePanel || !diceOverlay) return;

  const STORAGE_KEY = "maeriDiceOpen";

  function openDice() {
    dicePanel.classList.add("open");
    diceOverlay.classList.add("active");
    document.body.classList.add("no-scroll");
    localStorage.setItem(STORAGE_KEY, "true");
  }

  function closeDice() {
    dicePanel.classList.remove("open");
    diceOverlay.classList.remove("active");
    document.body.classList.remove("no-scroll");
    localStorage.setItem(STORAGE_KEY, "false");
  }

  function toggleDice() {
    dicePanel.classList.contains("open") ? closeDice() : openDice();
  }

  // Toggle button
  diceToggle.addEventListener("click", toggleDice);

  // Click outside (overlay)
  diceOverlay.addEventListener("click", closeDice);

  /* ---------- Restore state ---------- */
  if (localStorage.getItem(STORAGE_KEY) === "true") {
    openDice();
  }

  /* ---------- Swipe Down to Close ---------- */
  let startY = null;

  dicePanel.addEventListener("touchstart", (e) => {
    startY = e.touches[0].clientY;
  });

  dicePanel.addEventListener("touchend", (e) => {
    if (startY === null) return;

    const endY = e.changedTouches[0].clientY;
    const diffY = endY - startY;

    // Swipe down threshold
    if (diffY > 80) {
      closeDice();
    }

    startY = null;
  });
}


/* ---------- Init on DOM Ready ---------- */

document.addEventListener("DOMContentLoaded", () => {
  initDiceRoller();
  initDiceToggle();
});
