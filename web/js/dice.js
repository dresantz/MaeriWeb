/* =========================
   Maeri RPG – Global Dice Roller
========================= */

/* ---------- Utilities ---------- */

function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

/* ---------- Dice Roller Component ---------- */

function initDiceRoller() {
  const diceButtons = document.querySelectorAll(".dice-btn");
  const resultOutput = document.getElementById("result-output");
  const totalOutput = document.getElementById("total-output");
  const historyOutput = document.getElementById("history-output");
  const rollButton = document.getElementById("roll-button");
  const clearAllButton = document.getElementById("clear-all");
  const clearHistoryButton = document.getElementById("clear-history");

  if (!diceButtons.length || !rollButton) return;

  const dicePool = {
    2: 0,
    3: 0,
    6: 0
  };

  const MAX_DICE = 16;
  const history = [];

  function getTotalDice() {
    return Object.values(dicePool).reduce((sum, qty) => sum + qty, 0);
  }

/* ---------- Visual Control Dice Limit ---------- */

  function updateLimitState() {
    const limitReached = getTotalDice() >= MAX_DICE;

    diceButtons.forEach(wrapper => {
      const button = wrapper.querySelector("button");
      const counter = wrapper.querySelector(".counter");

      button.disabled = limitReached;
      wrapper.classList.toggle("locked", limitReached);
      counter.classList.toggle("limit", limitReached);
    });
  }

  /* ---------- Dice Button Logic ---------- */
  diceButtons.forEach(wrapper => {
    const sides = wrapper.dataset.sides;
    const counter = wrapper.querySelector(".counter");
    const button = wrapper.querySelector("button");

    button.addEventListener("click", () => {
      if (getTotalDice() >= MAX_DICE) return;

      dicePool[sides]++;
      counter.textContent = dicePool[sides];

      updateLimitState();
    });

  });

  /* ---------- Roll ---------- */
  rollButton.addEventListener("click", () => {
    const resultsByDie = [];
    let total = 0;

    Object.entries(dicePool).forEach(([sides, amount]) => {
      if (amount === 0) return;

      const rolls = [];
      for (let i = 0; i < amount; i++) {
        const roll = rollDie(Number(sides));
        rolls.push(roll);
        total += roll;
      }

      resultsByDie.push(`d${sides}: ${rolls.join(", ")}`);
      history.unshift(`d${sides} x${amount} → ${rolls.join(", ")}`);
    });

    if (history.length > 3) history.length = 3;

    resultOutput.textContent =
      resultsByDie.length > 0 ? resultsByDie.join(" | ") : "—";
    totalOutput.textContent = total > 0 ? total : "—";

    historyOutput.innerHTML = "";
    history.forEach(entry => {
      const li = document.createElement("li");
      li.textContent = entry;
      historyOutput.appendChild(li);
    });
  });

  /* ---------- Clear All ---------- */
  clearAllButton.addEventListener("click", () => {
    Object.keys(dicePool).forEach(sides => {
      dicePool[sides] = 0;
      document.getElementById(`count-d${sides}`).textContent = "0";
    });

    resultOutput.textContent = "—";
    totalOutput.textContent = "—";

    updateLimitState();
  });

  /* ---------- Clear History ---------- */
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

  function forceReflow() {
    // leitura síncrona que força o browser a recalcular layout
    document.documentElement.getBoundingClientRect();
  }

  function openDice() {
    dicePanel.classList.add("open");
    diceOverlay.classList.add("active");

    // força o layout a reconhecer os elementos fixed
    forceReflow();

    document.body.classList.add("no-scroll");

    // força novo reflow após mudar overflow
    forceReflow();

    localStorage.setItem(STORAGE_KEY, "true");
  }

  function closeDice() {
    dicePanel.classList.remove("open");
    diceOverlay.classList.remove("active");

    forceReflow();

    document.body.classList.remove("no-scroll");

    forceReflow();

    localStorage.setItem(STORAGE_KEY, "false");
  }

  function toggleDice() {
    dicePanel.classList.contains("open") ? closeDice() : openDice();
  }

  // Toggle button
  diceToggle.addEventListener("click", toggleDice);

  // Click outside (overlay)
  diceOverlay.addEventListener("click", closeDice);

/* ---------- Restore state (after layout) ---------- */
  if (localStorage.getItem(STORAGE_KEY) === "true") {
    window.addEventListener("load", () => {
      openDice();
    }, { once: true });
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
