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
  
  isSheetOpen = false;
  modal.classList.remove('active');
  overlay.classList.remove('active');
  document.body.classList.remove('no-scroll');
  saveSheetData();
}

function saveSheetData() {
  const data = {
    name: document.getElementById('character-name')?.value || '',
    info: document.getElementById('character-info')?.value || '',
    items: document.getElementById('character-items')?.value || '',
    attributes: {}
  };
  
  document.querySelectorAll('.rune-input').forEach(input => {
    const key = input.dataset.key;
    if (key) data.attributes[key] = input.value || '0';
  });
  
  localStorage.setItem('maeri-sheet', JSON.stringify(data));
}

function loadSheetData() {
  const saved = localStorage.getItem('maeri-sheet');
  if (!saved) return;
  
  try {
    const data = JSON.parse(saved);
    document.getElementById('character-name').value = data.name || '';
    document.getElementById('character-info').value = data.info || '';
    document.getElementById('character-items').value = data.items || '';
    
    document.querySelectorAll('.rune-input').forEach(input => {
      const key = input.dataset.key;
      if (key && data.attributes[key]) input.value = data.attributes[key];
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
  
  document.addEventListener('input', (e) => {
    const target = e.target;
    if (target.id === 'character-name' || 
        target.id === 'character-info' || 
        target.id === 'character-items' ||
        target.classList.contains('rune-input')) {
      saveSheetData();
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
      document.getElementById('character-name').value = '';
      document.getElementById('character-info').value = '';
      document.getElementById('character-items').value = '';
      document.querySelectorAll('.rune-input').forEach(input => input.value = '0');
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