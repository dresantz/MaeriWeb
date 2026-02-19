// dice.js - Apenas controle de abertura/fechamento do modal
// A lógica dos dados foi movida para dice-pool.js

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

function initDice() {
  console.log('Inicializando dice.js (controle do modal)');
  
  const diceBtn = document.getElementById('dice-toggle');
  const diceClose = document.getElementById('dice-close');
  const dicePanel = document.getElementById('dice-panel');
  const diceOverlay = document.getElementById('dice-overlay');
  
  if (!diceBtn || !diceClose || !dicePanel || !diceOverlay) {
    console.log('Elementos do dice modal não encontrados');
    return;
  }
  
  // Se já inicializado, não duplica listeners
  if (dicePanel.dataset.modalInitialized === 'true') return;
  dicePanel.dataset.modalInitialized = 'true';
  
  console.log('Configurando listeners do dice modal');
  
  // Abrir modal
  diceBtn.addEventListener('click', openDice);
  
  // Fechar modal (botão X)
  diceClose.addEventListener('click', closeDice);
  
  // Fechar modal (clique no overlay)
  diceOverlay.addEventListener('click', closeDice);
  
  // Fechar modal (tecla ESC)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isDiceOpen) {
      closeDice();
    }
  });
}

// Inicializa quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDice);
} else {
  initDice();
}

// Reinicializa quando modais forem carregados
document.addEventListener('modals:loaded', () => {
  console.log('modals:loaded - reinicializando dice.js');
  initDice();
});