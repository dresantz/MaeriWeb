/**
 * gmnotes.js - Painel do Mestre (Escudo do Mestre)
 * Controla as abas NPCs, Jogadores, Combate e Notas na página
 */

import { GMPlayers } from './gm-players.js';
import { GMNPCs } from './gm-npcs.js';
import { GMCombat } from './gm-combat.js';
import { GMSectionNotes } from './gm-sectionNotes.js';

class GMNotes {
  constructor() {
    // Estado
    this.currentTab = 'npcs';
    
    // Inicializa módulos com referência à instância principal
    this.players = new GMPlayers(this);
    this.npcs = new GMNPCs(this);
    this.combat = new GMCombat(this);
    this.notes = new GMSectionNotes(this);
    
    this.init();
  }

  init() {
    this.cacheElements();
    this.setupTabs();
    this.setupCollapsibleSections();
    this.setupEventListeners();
    this.initializeModules();
    this.loadFromStorage();
  }

  cacheElements() {
    this.tabBtns = document.querySelectorAll('.gmnotes-tab-btn');
    this.tabPanes = document.querySelectorAll('.gmnotes-tab-pane');
    this.exportBtn = document.getElementById('gmnotes-export');
    this.importBtn = document.getElementById('gmnotes-import');
    this.statusEl = document.getElementById('gmnotes-status');
    this.saveIndicator = document.querySelector('.gmnotes-save-indicator');
  }

  initializeModules() {
    this.players.init();
    this.npcs.init();
    this.combat.init();
    this.notes.init();
    
    this.players.renderPlayers();
    this.npcs.renderNPCs();
    this.combat.renderCombatOrder();
    this.notes.renderSessions();
  }

  setupTabs() {
    this.tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (tab) this.switchTab(tab);
      });
    });
  }

  switchTab(tabId) {
    this.tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    this.tabPanes.forEach(pane => {
      pane.classList.toggle('active', pane.id === `tab-${tabId}`);
    });

    this.currentTab = tabId;
  }

  // Controla seções recolhíveis
  setupCollapsibleSections() {
    const toggles = document.querySelectorAll('.gmnotes-collapsible-toggle');
    
    toggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        const header = toggle.closest('.gmnotes-collapsible-header');
        const content = header?.nextElementSibling;
        
        if (!content) return;
        
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        
        if (isExpanded) {
          content.style.display = 'none';
          toggle.textContent = '+';
          toggle.setAttribute('aria-expanded', 'false');
        } else {
          content.style.display = 'block';
          toggle.textContent = '−';
          toggle.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  setupEventListeners() {
    // Exportação/Importação
    if (this.exportBtn) {
      this.exportBtn.addEventListener('click', () => this.exportData());
    }
    
    if (this.importBtn) {
      this.importBtn.addEventListener('click', () => this.importData());
    }
  }

  // ========== MÉTODOS DELEGADOS ==========
  // NPCs
  adjustVit(npcId, change) { this.npcs.adjustVit(npcId, change); }
  adjustCon(npcId, change) { this.npcs.adjustCon(npcId, change); }
  editNPC(npcId) { this.npcs.editNPC(npcId); }
  duplicateNPC(npcId) { this.npcs.duplicateNPC(npcId); }
  deleteNPC(npcId) { this.npcs.deleteNPC(npcId); }
  toggleNPCInCombat(npcId, btnElement) { this.combat.toggleNPCInCombat(npcId, btnElement); }

  // Players
  editPlayer(playerId) { this.players.editPlayer(playerId); }
  deletePlayer(playerId) { this.players.deletePlayer(playerId); }
  togglePlayerInCombat(playerId, btnElement) { this.combat.togglePlayerInCombat(playerId, btnElement); }

  // Combat
  adjustCombatVit(combatId, change) { this.combat.adjustCombatVit(combatId, change); }
  adjustCombatCon(combatId, change) { this.combat.adjustCombatCon(combatId, change); }

  // ========== EXPORTAÇÃO/IMPORTAÇÃO ==========
  exportData() {
    const data = {
      npcs: this.npcs.getData(),
      players: this.players.getData(),
      combatOrder: this.combat.getData(),
      ...this.notes.getData(),
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gmnotes-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    
    // Aguarda o início do download para revogar a URL
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    
    this.updateStatus('Dados exportados!');
  }

  importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          
          if (confirm('Isso substituirá todos os dados atuais. Continuar?')) {
            this.loadData(data);
            this.updateStatus('Dados importados com sucesso!');
          }
        } catch (error) {
          alert(`Erro ao importar arquivo: ${error.message}`);
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  }

  loadData(data) {
    this.npcs.loadFromStorage(data);
    this.players.loadFromStorage(data);
    this.combat.loadFromStorage(data);
    this.notes.loadFromStorage(data);
    
    this.npcs.renderNPCs();
    this.players.renderPlayers();
    this.combat.renderCombatOrder();
    this.notes.renderSessions();
    
    this.saveToStorage();
  }

  // ========== ARMAZENAMENTO ==========
  saveToStorage() {
    const data = {
      npcs: this.npcs.getData(),
      players: this.players.getData(),
      combatOrder: this.combat.getData(),
      ...this.notes.getData()
    };
    
    localStorage.setItem('gmnotes_data', JSON.stringify(data));
    this.updateSaveIndicator();
  }

  loadFromStorage() {
    const saved = localStorage.getItem('gmnotes_data');
    if (!saved) return;

    try {
      const data = JSON.parse(saved);
      this.npcs.loadFromStorage(data);
      this.players.loadFromStorage(data);
      this.combat.loadFromStorage(data);
      this.notes.loadFromStorage(data);
      
      // Pequeno delay para garantir renderização após carregamento
      setTimeout(() => this.combat.renderCombatOrder(), 50);
    } catch (error) {
      console.error('Erro ao carregar dados salvos:', error);
    }
  }

  updateSaveIndicator() {
    if (!this.saveIndicator) return;
    
    this.saveIndicator.textContent = '💾 Salvando...';
    setTimeout(() => {
      this.saveIndicator.textContent = '💾 Salvo';
    }, 500);
  }

  // ========== UTILITÁRIOS ==========
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  updateStatus(message) {
    if (!this.statusEl) return;
    
    this.statusEl.textContent = message;
    setTimeout(() => {
      this.statusEl.textContent = 'Pronto';
    }, 3000);
  }
}

// Inicializa e expõe globalmente
const gmNotes = new GMNotes();
window.gmNotes = gmNotes;