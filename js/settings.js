/**
 * Settings Modal - Controle do modal de configurações
 * Versão com foco corrigido
 */

const SettingsManager = (function() {
  'use strict';
  
  let isOpen = false;
  
  function getModal() {
    return document.getElementById('settings-modal');
  }
  
  function getOverlay() {
    return document.querySelector('#settings-modal .modal-overlay');
  }
  
  function getCloseButton() {
    return document.querySelector('#settings-modal .modal-close');
  }
  
  function openSettings() {
    const modal = getModal();
    
    if (isOpen || !modal) return;
    
    isOpen = true;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    
    // Foco no botão de fechar
    const closeBtn = getCloseButton();
    if (closeBtn) {
      closeBtn.focus();
    }
    
    document.dispatchEvent(new CustomEvent('settings:opened'));
  }
  
  function closeSettings() {
    const modal = getModal();
    
    if (!isOpen || !modal) return;
    
    // ===== ORDEM CORRETA =====
    
    // 1. Remove o foco do elemento dentro do modal
    const closeBtn = getCloseButton();
    if (closeBtn && document.activeElement === closeBtn) {
      closeBtn.blur();
    }
    
    // 2. Move o foco para o botão de engrenagem
    const settingsBtn = document.getElementById('settings-button');
    if (settingsBtn) {
      settingsBtn.focus();
    }
    
    // 3. Agora esconde o modal
    isOpen = false;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    
    document.dispatchEvent(new CustomEvent('settings:closed'));
  }
  
  function init() {
    const settingsBtn = document.getElementById('settings-button');
    const modal = getModal();
    const overlay = getOverlay();
    const closeBtn = getCloseButton();
    
    if (!settingsBtn || !modal || !overlay || !closeBtn) {
      console.warn('Elementos do modal de configurações não encontrados');
      return;
    }
    
    if (modal.dataset.modalInitialized === 'true') {
      return;
    }
    
    modal.dataset.modalInitialized = 'true';
    
    settingsBtn.addEventListener('click', openSettings);
    closeBtn.addEventListener('click', closeSettings);
    overlay.addEventListener('click', closeSettings);
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeSettings();
      }
    });
  }
  
  return {
    init: init,
    open: openSettings,
    close: closeSettings,
    isOpen: () => isOpen
  };
})();

function initializeSettings() {
  if (document.getElementById('settings-modal')) {
    SettingsManager.init();
  } else {
    document.addEventListener('modals:loaded', SettingsManager.init);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSettings);
} else {
  initializeSettings();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SettingsManager;
}