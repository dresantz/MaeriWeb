// dice.js - Controle de dados

let isDiceOpen = false;

function openDice() {
  const panel = document.getElementById('dice-panel');
  const overlay = document.getElementById('dice-overlay');
  
  if (isDiceOpen || !panel || !overlay) return;
  
  isDiceOpen = true;
  panel.classList.add('active');
  overlay.classList.add('active');
  document.body.classList.add('no-scroll');
}

function closeDice() {
  const panel = document.getElementById('dice-panel');
  const overlay = document.getElementById('dice-overlay');
  
  if (!isDiceOpen || !panel || !overlay) return;
  
  isDiceOpen = false;
  panel.classList.remove('active');
  overlay.classList.remove('active');
  document.body.classList.remove('no-scroll');
}

function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

const dicePool = { 2: 0, 3: 0, 6: 0 };
const MAX_DICE = 16;
const history = [];

function getTotalDice() {
  return Object.values(dicePool).reduce((sum, qty) => sum + qty, 0);
}

function updateLimitState() {
  const limitReached = getTotalDice() >= MAX_DICE;
  
  document.querySelectorAll('.dice-btn').forEach(wrapper => {
    const button = wrapper.querySelector('button');
    const counter = wrapper.querySelector('.counter');
    if (button) button.disabled = limitReached;
    wrapper.classList.toggle('locked', limitReached);
    counter?.classList.toggle('limit', limitReached);
  });
}

function initDice() {
  const diceBtn = document.getElementById('dice-toggle');
  const diceClose = document.getElementById('dice-close');
  const dicePanel = document.getElementById('dice-panel');
  
  if (!diceBtn || !diceClose || !dicePanel) return;
  if (dicePanel.dataset.initialized === 'true') return;
  
  dicePanel.dataset.initialized = 'true';
  
  diceBtn.addEventListener('click', openDice);
  diceClose.addEventListener('click', closeDice);
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isDiceOpen) closeDice();
  });
  
  document.querySelectorAll('.dice-btn').forEach(wrapper => {
    const sides = wrapper.dataset.sides;
    const button = wrapper.querySelector('button');
    const counter = document.getElementById(`count-d${sides}`);
    
    if (button && sides) {
      button.addEventListener('click', () => {
        if (getTotalDice() >= MAX_DICE) return;
        dicePool[sides]++;
        if (counter) counter.textContent = dicePool[sides];
        updateLimitState();
      });
    }
  });
  
  const rollBtn = document.getElementById('roll-button');
  const resultOutput = document.getElementById('result-output');
  const totalOutput = document.getElementById('total-output');
  const historyOutput = document.getElementById('history-output');
  
  if (rollBtn && resultOutput && totalOutput) {
    rollBtn.addEventListener('click', () => {
      const results = [];
      let total = 0;
      
      Object.entries(dicePool).forEach(([sides, amount]) => {
        if (amount === 0) return;
        const rolls = Array.from({ length: amount }, () => rollDie(Number(sides)));
        total += rolls.reduce((a, b) => a + b, 0);
        results.push(`d${sides}: ${rolls.join(', ')}`);
        history.unshift(`d${sides} x${amount} → ${rolls.join(', ')}`);
      });
      
      if (history.length > 3) history.length = 3;
      
      resultOutput.textContent = results.length ? results.join(' | ') : '—';
      totalOutput.textContent = total || '—';
      
      if (historyOutput) {
        historyOutput.innerHTML = '';
        history.forEach(entry => {
          const li = document.createElement('li');
          li.textContent = entry;
          historyOutput.appendChild(li);
        });
      }
    });
  }
  
  const clearAll = document.getElementById('clear-all');
  if (clearAll) {
    clearAll.addEventListener('click', () => {
      Object.keys(dicePool).forEach(sides => {
        dicePool[sides] = 0;
        const counter = document.getElementById(`count-d${sides}`);
        if (counter) counter.textContent = '0';
      });
      if (resultOutput) resultOutput.textContent = '—';
      if (totalOutput) totalOutput.textContent = '—';
      updateLimitState();
    });
  }
  
  const clearHistory = document.getElementById('clear-history');
  if (clearHistory && historyOutput) {
    clearHistory.addEventListener('click', () => {
      history.length = 0;
      historyOutput.innerHTML = '';
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDice);
} else {
  initDice();
}
document.addEventListener('modals:loaded', initDice);