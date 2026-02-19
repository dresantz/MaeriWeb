// sheet.js - Controle da ficha de personagem

let isSheetOpen = false;

function openSheet() {
  const modal = document.getElementById('sheet-modal');
  const overlay = document.getElementById('sheet-overlay');
  
  if (isSheetOpen || !modal || !overlay) return;
  
  isSheetOpen = true;
  modal.classList.add('active');
  overlay.classList.add('active');
  document.body.classList.add('no-scroll');
  loadSheetData();
}

function closeSheet() {
  const modal = document.getElementById('sheet-modal');
  const overlay = document.getElementById('sheet-overlay');
  
  if (!isSheetOpen || !modal || !overlay) return;
  
  saveSheetData();
  
  isSheetOpen = false;
  modal.classList.remove('active');
  overlay.classList.remove('active');
  document.body.classList.remove('no-scroll');
}

function saveSheetData() {
  // 🔹 IMPORTANTE: Pegar APENAS os inputs dentro do modal ativo
  const modal = document.getElementById('sheet-modal');
  if (!modal) return;
  
  const nameInput = modal.querySelector('#character-name');
  const infoInput = modal.querySelector('#character-info');
  const itemsInput = modal.querySelector('#character-items');
  
  const data = {
    name: nameInput?.value || '',
    info: infoInput?.value || '',
    items: itemsInput?.value || '',
    attributes: {}
  };
  
  // 🔹 Pegar APENAS os rune-inputs dentro deste modal
  modal.querySelectorAll('.rune-input').forEach(input => {
    const key = input.dataset.key;
    if (key) {
      data.attributes[key] = input.value || '0';
    }
  });
  
  localStorage.setItem('maeri-sheet', JSON.stringify(data));
}

function loadSheetData() {
  const modal = document.getElementById('sheet-modal');
  if (!modal) return;
  
  const saved = localStorage.getItem('maeri-sheet');
  if (!saved) return;
  
  try {
    const data = JSON.parse(saved);
    
    const nameInput = modal.querySelector('#character-name');
    const infoInput = modal.querySelector('#character-info');
    const itemsInput = modal.querySelector('#character-items');
    
    if (nameInput) nameInput.value = data.name || '';
    if (infoInput) infoInput.value = data.info || '';
    if (itemsInput) itemsInput.value = data.items || '';
    
    // 🔹 Pegar APENAS os rune-inputs dentro deste modal
    modal.querySelectorAll('.rune-input').forEach(input => {
      const key = input.dataset.key;
      if (key && data.attributes && data.attributes.hasOwnProperty(key)) {
        input.value = data.attributes[key];
      }
    });
  } catch (e) {}
}

function initSheet() {
  const sheetBtn = document.getElementById('sheet-button');
  const sheetClose = document.getElementById('sheet-close');
  const sheetOverlay = document.getElementById('sheet-overlay');
  
  if (sheetBtn) sheetBtn.addEventListener('click', openSheet);
  if (sheetClose) sheetClose.addEventListener('click', closeSheet);
  if (sheetOverlay) sheetOverlay.addEventListener('click', closeSheet);
  
  // 🔹 IMPORTANTE: Salvar apenas quando input em elementos do modal ativo
  document.addEventListener('input', (e) => {
    const target = e.target;
    // Verifica se o input está dentro do modal ativo
    if (target.closest('#sheet-modal.active')) {
      if (target.id === 'character-name' || 
          target.id === 'character-info' || 
          target.id === 'character-items' ||
          target.classList.contains('rune-input')) {
        saveSheetData();
      }
    }
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isSheetOpen) closeSheet();
  });
  
  const clearBtn = document.getElementById('clear-sheet-button');
  const confirmBtn = document.getElementById('confirm-clear-sheet');
  const cancelBtn = document.getElementById('cancel-clear-sheet');
  const confirmBox = document.getElementById('clear-confirmation');
  
  if (clearBtn && confirmBtn && cancelBtn && confirmBox) {
    clearBtn.addEventListener('click', () => confirmBox.hidden = false);
    cancelBtn.addEventListener('click', () => confirmBox.hidden = true);
    
    confirmBtn.addEventListener('click', () => {
      const modal = document.getElementById('sheet-modal');
      if (!modal) return;
      
      modal.querySelector('#character-name').value = '';
      modal.querySelector('#character-info').value = '';
      modal.querySelector('#character-items').value = '';
      modal.querySelectorAll('.rune-input').forEach(input => input.value = '0');
      
      localStorage.removeItem('maeri-sheet');
      confirmBox.hidden = true;
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSheet);
} else {
  initSheet();
}

document.addEventListener('modals:loaded', initSheet);