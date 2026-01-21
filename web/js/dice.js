// Maeri RPG Dice Roller
// All rolls are based on d6 and converted when necessary

function rollD6() {
  return Math.floor(Math.random() * 6) + 1;
}

function convertRoll(d6Result, targetDie) {
  if (targetDie === 6) {
    return d6Result;
  }

  if (targetDie === 3) {
    // 1-2 -> 1 | 3-4 -> 2 | 5-6 -> 3
    return Math.ceil(d6Result / 2);
  }

  if (targetDie === 2) {
    // 1-3 -> 1 | 4-6 -> 2
    return d6Result <= 3 ? 1 : 2;
  }

  return d6Result;
}

document.getElementById("roll-button").addEventListener("click", () => {
  const diceType = parseInt(document.getElementById("dice-type").value);
  const diceAmount = parseInt(document.getElementById("dice-amount").value);

  let results = [];

  for (let i = 0; i < diceAmount; i++) {
    const d6Roll = rollD6();
    const finalResult = convertRoll(d6Roll, diceType);
    results.push(finalResult);
  }

  document.getElementById("result-output").textContent =
    results.join(", ");
});
