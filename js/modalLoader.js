/*
 * Modal Loader - Carrega modais e seus scripts
 */

const MODAL_PATHS = [
  'pages/sheet-modal.html',
  'pages/spells-modal.html',
  'pages/dice-modal.html'
];

const MODAL_SCRIPTS = [
  'js/sheet.js',
  'js/spells.js',
  'js/dice.js'
];

export async function loadGlobalModals() {
  const root = document.getElementById('modal-root');
  if (!root || root.dataset.loaded === 'true') return;
  
  // Detecta se está em pages/ ou raiz
  const isInPages = window.location.pathname.includes('/pages/');
  const prefix = isInPages ? '../' : './';
  
  try {
    // 1. Carrega HTML dos modais
    for (const path of MODAL_PATHS) {
      const fullPath = isInPages ? `../${path}` : path;
      const response = await fetch(fullPath);
      if (!response.ok) continue;
      const html = await response.text();
      root.innerHTML += html;
    }
    
    root.dataset.loaded = 'true';
    
    // 2. Carrega scripts dos modais
    for (const scriptPath of MODAL_SCRIPTS) {
      const fullPath = isInPages ? `../${scriptPath}` : scriptPath;
      const script = document.createElement('script');
      script.src = fullPath;
      script.type = 'module';
      document.body.appendChild(script);
    }
    
    document.dispatchEvent(new CustomEvent('modals:loaded'));
    
  } catch (error) {
    console.log('Erro ao carregar modais:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadGlobalModals);
} else {
  loadGlobalModals();
}