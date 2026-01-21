function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

const history = [];

document.getElementById("roll-button").addEventListener("click", () => {
  const diceType = parseInt(document.getElementById("dice-type").value);
  const diceAmount = parseInt(document.getElementById("dice-amount").value);

  const results = [];
  let total = 0;

  for (let i = 0; i < diceAmount; i++) {
    const roll = rollDie(diceType);
    results.push(roll);
    total += roll;
  }

  document.getElementById("result-output").textContent =
    results.join(", ");

  document.getElementById("total-output").textContent = total;

  // Update history (keep last 3)
  history.unshift(`d${diceType} x${diceAmount} → ${results.join(", ")}`);
  if (history.length > 3) history.pop();

  const historyList = document.getElementById("history-output");
  historyList.innerHTML = "";

  history.forEach(entry => {
    const li = document.createElement("li");
    li.textContent = entry;
    historyList.appendChild(li);
  });
});

document.getElementById("clear-history").addEventListener("click", () => {
  history.length = 0;
  document.getElementById("history-output").innerHTML = "";
});
