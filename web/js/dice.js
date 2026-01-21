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

  if (!diceToggle || !dicePanel) return;

  diceToggle.addEventListener("click", () => {
    dicePanel.classList.toggle("open");
  });
}

/* ---------- Init on DOM Ready ---------- */

document.addEventListener("DOMContentLoaded", () => {
  initDiceRoller();
  initDiceToggle();
});
