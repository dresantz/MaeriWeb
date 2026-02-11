/*
 * Modal Loader - Carrega modais e seus scripts
 */

const MODAL_PATHS = [
  'pages/sheet-modal.html',
  'pages/spells-modal.html',
  'pages/dice-modal.html'
];

const MODAL_SCRIPTS = [
  './js/sheet.js',
  './js/spells.js',
  './js/dice.js'
];

export async function loadGlobalModals() {
  const root = document.getElementById('modal-root');
  if (!root || root.dataset.loaded === 'true') return;
  
  try {
    // 1. Carrega HTML dos modais
    for (const path of MODAL_PATHS) {
      const response = await fetch(path);
      if (!response.ok) continue;
      const html = await response.text();
      root.innerHTML += html;
    }
    
    root.dataset.loaded = 'true';
    
    // 2. Carrega scripts dos modais
    for (const scriptPath of MODAL_SCRIPTS) {
      const script = document.createElement('script');
      script.src = scriptPath;
      script.type = 'module';
      document.body.appendChild(script);
    }
    
    // 3. Dispara evento
    document.dispatchEvent(new CustomEvent('modals:loaded'));
    
  } catch (error) {
    console.log('Erro ao carregar modais:', error);
  }
}

// Inicializa quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadGlobalModals);
} else {
  loadGlobalModals();
}