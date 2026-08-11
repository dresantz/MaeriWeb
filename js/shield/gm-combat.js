// js/shield/gm-combat.js
export class GMCombat {
  constructor(parent) {
    this.parent = parent;
    this.combatOrder = [];
    this.selectedItemId = null;
    this.confirmationActive = false;
    this.tokenSize = 80;
    this.gridMode = true;
    // Cores fixas
    this.npcColor = '#8B0000'; // Vermelho escuro para NPCs
    this.playerColor = '#1a6b3c'; // Verde escuro para Jogadores
    // Para o sistema de troca
    this.swapSourceId = null;
  }

  init() {
    this.setupCombat();
    this.setupSelectionHandler();
    this.setupClickOutsideHandler();
  }

  setupCombat() {
    const removeSelectedBtn = document.getElementById('combat-remove-selected');
    const removeAllBtn = document.getElementById('combat-remove-all');
    const toggleViewBtn = document.getElementById('combat-toggle-view');

    removeSelectedBtn?.addEventListener('click', () => this.showRemoveConfirmation('selected'));
    removeAllBtn?.addEventListener('click', () => this.showRemoveConfirmation('all'));
    toggleViewBtn?.addEventListener('click', () => this.toggleView());
  }

  toggleView() {
    this.gridMode = !this.gridMode;
    this.renderCombatOrder();
    const btn = document.getElementById('combat-toggle-view');
    if (btn) {
      btn.textContent = this.gridMode ? '📋 Ver Lista' : '🗺️ Ver Tokens';
    }
  }

  showRemoveConfirmation(type) {
    if (this.confirmationActive) return;

    const selectedId = this.selectedItemId;
    
    if (type === 'selected' && !selectedId) {
      this.parent.updateStatus('Nenhum personagem selecionado');
      return;
    }

    if (type === 'all' && this.combatOrder.length === 0) {
      this.parent.updateStatus('Ordem já está vazia');
      return;
    }

    const item = type === 'selected' 
      ? this.combatOrder.find(i => i.id === selectedId)
      : null;

    const message = type === 'selected' 
      ? `Remover ${item?.name || 'selecionado'} da ordem?` 
      : 'Remover todos os personagens?';

    const container = document.getElementById('combat-confirmation');
    if (!container) return;

    this.setButtonsDisabled(true);
    this.confirmationActive = true;

    container.innerHTML = `
      <div class="gmnotes-confirmation-box">
        <div class="gmnotes-confirmation-message">${message}</div>
        <div class="gmnotes-confirmation-actions">
          <button class="gmnotes-confirm-btn" id="confirm-yes">Sim</button>
          <button class="gmnotes-cancel-btn" id="confirm-no">Cancelar</button>
        </div>
      </div>
    `;

    const confirmYes = document.getElementById('confirm-yes');
    const confirmNo = document.getElementById('confirm-no');

    const cleanup = () => {
      container.innerHTML = '';
      this.setButtonsDisabled(false);
      this.confirmationActive = false;
    };

    confirmYes?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (type === 'selected') {
        this.removeSelectedById(selectedId);
      } else {
        this.removeAll();
      }
      cleanup();
    });
    
    confirmNo?.addEventListener('click', (e) => {
      e.stopPropagation();
      cleanup();
    });
  }

  removeSelectedById(id) {
    if (!id) return;

    const item = this.combatOrder.find(i => i.id === id);
    if (!item) return;

    this.combatOrder = this.combatOrder.filter(i => i.id !== id);
    
    if (this.selectedItemId === id) {
      this.clearSelection();
    }
    
    this.renderCombatOrder();
    this.updateCombatButtons();
    this.parent.saveToStorage();
    this.parent.updateStatus(`${item.name} removido`);
  }

  removeAll() {
    if (this.combatOrder.length === 0) return;
    
    this.combatOrder = [];
    this.clearSelection();
    this.renderCombatOrder();
    this.updateCombatButtons();
    this.parent.saveToStorage();
    this.parent.updateStatus('Ordem limpa');
  }

  setButtonsDisabled(disabled) {
    ['remove-selected', 'remove-all'].forEach(id => {
      const btn = document.getElementById(`combat-${id}`);
      if (!btn) return;
      
      if (disabled) {
        btn.setAttribute('disabled', 'disabled');
        btn.classList.add('disabled');
      } else {
        btn.removeAttribute('disabled');
        btn.classList.remove('disabled');
      }
    });
  }

  moveToken(id, direction) {
    const currentIndex = this.combatOrder.findIndex(item => item.id === id);
    if (currentIndex === -1) return;

    let newIndex;
    let directionName;
    
    if (direction === 'left') {
      newIndex = currentIndex - 1;
      directionName = 'esquerda';
    } else {
      newIndex = currentIndex + 1;
      directionName = 'direita';
    }

    if (newIndex < 0 || newIndex >= this.combatOrder.length) {
      this.parent.updateStatus(`Token já está no ${direction === 'left' ? 'início' : 'final'} da ordem`);
      return;
    }

    const [item] = this.combatOrder.splice(currentIndex, 1);
    this.combatOrder.splice(newIndex, 0, item);

    // Mantém a seleção no token movido
    this.selectedItemId = id;
    this.swapSourceId = id;

    this.renderCombatOrder();
    this.parent.saveToStorage();
    this.parent.updateStatus(`${item.name} movido para ${directionName}`);
  }

  setupSelectionHandler() {
    const container = document.getElementById('combat-order');
    if (!container) return;

    container.addEventListener('click', (e) => {
      if (this.confirmationActive) return;

      const item = e.target.closest('.gmnotes-combat-token, .gmnotes-combat-item');
      if (!item) return;

      // Verifica se clicou em um botão de navegação (setas)
      const navBtn = e.target.closest('.gmnotes-token-nav-btn');
      if (navBtn) {
        const tokenId = item.dataset.combatId;
        const direction = navBtn.dataset.direction;
        this.moveToken(tokenId, direction);
        e.stopPropagation();
        e.preventDefault();
        return;
      }

      if (e.target.closest('.gmnotes-token-stat-btn, .gmnotes-combat-stat-btn')) {
        return;
      }

      const clickedId = item.dataset.combatId;
      
      if (this.swapSourceId) {
        if (this.swapSourceId === clickedId) {
          this.clearSwapMode();
          this.clearSelection();
          this.parent.updateStatus('Seleção cancelada');
          this.renderCombatOrder();
          e.stopPropagation();
          return;
        }
        
        this.swapTokens(this.swapSourceId, clickedId);
        this.clearSwapMode();
        this.clearSelection();
        this.renderCombatOrder();
        this.parent.updateStatus('Troca realizada');
        e.stopPropagation();
        return;
      }
      
      if (this.selectedItemId === clickedId) {
        this.clearSelection();
        this.clearSwapMode();
        this.parent.updateStatus('Seleção cancelada');
        this.renderCombatOrder();
      } else {
        if (this.selectedItemId) {
          const prev = document.querySelector(`.gmnotes-combat-token[data-combat-id="${this.selectedItemId}"], .gmnotes-combat-item[data-combat-id="${this.selectedItemId}"]`);
          prev?.classList.remove('selected');
          prev?.classList.remove('swap-source');
        }
        
        this.selectedItemId = clickedId;
        this.swapSourceId = clickedId;
        item.classList.add('selected');
        item.classList.add('swap-source');
        
        this.parent.updateStatus(`Clique em outro token para trocar com ${this.combatOrder.find(i => i.id === clickedId)?.name}`);
        this.renderCombatOrder();
      }
      
      e.stopPropagation();
    });
  }

  swapTokens(id1, id2) {
    const index1 = this.combatOrder.findIndex(i => i.id === id1);
    const index2 = this.combatOrder.findIndex(i => i.id === id2);
    
    if (index1 === -1 || index2 === -1) return;
    
    [this.combatOrder[index1], this.combatOrder[index2]] = [this.combatOrder[index2], this.combatOrder[index1]];
    
    this.renderCombatOrder();
    this.parent.saveToStorage();
  }

  clearSwapMode() {
    this.swapSourceId = null;
    document.querySelectorAll('.gmnotes-combat-token, .gmnotes-combat-item').forEach(el => {
      el.classList.remove('swap-source');
    });
  }

  setupClickOutsideHandler() {
    document.addEventListener('click', (e) => {
      if (this.confirmationActive) return;
      
      const combatList = document.getElementById('combat-order');
      const confirmationBox = document.querySelector('.gmnotes-confirmation-box');
      
      if (this.selectedItemId && combatList && !combatList.contains(e.target) && !confirmationBox) {
        this.clearSelection();
        this.clearSwapMode();
        this.parent.updateStatus('Seleção cancelada');
        this.renderCombatOrder();
      }
    });
  }

  clearSelection() {
    if (!this.selectedItemId) return;
    
    const prev = document.querySelector(`.gmnotes-combat-token[data-combat-id="${this.selectedItemId}"], .gmnotes-combat-item[data-combat-id="${this.selectedItemId}"]`);
    prev?.classList.remove('selected');
    this.selectedItemId = null;
    this.clearSwapMode();
  }

  updateCombatButtons() {
    this.parent.npcs?.renderNPCs();
    this.parent.players?.renderPlayers();
  }

  removeFromCombatById(id) {
    this.combatOrder = this.combatOrder.filter(item => item.id !== id);
    if (this.selectedItemId === id) {
      this.clearSelection();
      this.clearSwapMode();
    }
    this.renderCombatOrder();
    this.updateCombatButtons();
  }

  toggleNPCInCombat(npcId, btnElement) {
    const npc = this.parent.npcs?.npcs.find(n => n.id === npcId);
    if (!npc) return;

    if (this.combatOrder.some(item => item.id === npcId)) {
      this.parent.updateStatus(`${npc.name} já está no combate`);
    } else {
      this.combatOrder.push({
        id: npc.id,
        name: npc.name,
        type: 'npc',
        vit: npc.vitCurrent,
        vitMax: npc.vitMax,
        con: npc.conCurrent || 0,
        conMax: npc.conMax || 0,
        color: this.npcColor
      });

      this.renderCombatOrder();
      this.parent.npcs?.renderNPCs();
      this.parent.saveToStorage();
      this.parent.updateStatus(`${npc.name} adicionado`);
    }
  }

  togglePlayerInCombat(playerId, btnElement) {
    const player = this.parent.players?.players.find(p => p.id === playerId);
    if (!player) return;

    if (this.combatOrder.some(item => item.id === playerId)) {
      this.parent.updateStatus(`${player.name} já está no combate`);
    } else {
      this.combatOrder.push({
        id: player.id,
        name: player.name,
        type: 'player',
        color: this.playerColor
      });

      this.renderCombatOrder();
      this.parent.players?.renderPlayers();
      this.parent.saveToStorage();
      this.parent.updateStatus(`${player.name} adicionado`);
    }
  }

  renderCombatOrder() {
    const container = document.getElementById('combat-order');
    if (!container) return;

    if (this.combatOrder.length === 0) {
      container.innerHTML = '<div class="gmnotes-empty-state">Ordem vazia</div>';
      return;
    }

    if (this.gridMode) {
      container.className = 'gmnotes-combat-grid';
      container.innerHTML = this.combatOrder.map(item => this.renderToken(item)).join('');
    } else {
      container.className = 'gmnotes-combat-list';
      container.innerHTML = this.combatOrder.map(item => this.renderListItem(item)).join('');
    }
  }

  renderToken(item) {
    const isSelected = item.id === this.selectedItemId;
    const isSwapSource = item.id === this.swapSourceId;
    const color = item.type === 'npc' ? this.npcColor : this.playerColor;
    
    const currentIndex = this.combatOrder.findIndex(i => i.id === item.id);
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === this.combatOrder.length - 1;

    return `
      <div class="gmnotes-combat-token ${isSelected ? 'selected' : ''} ${isSwapSource ? 'swap-source' : ''}"
          data-combat-id="${item.id}"
          style="border-color: ${color}">
        
        <div class="gmnotes-token-header" style="background: ${color}">
          <div class="gmnotes-token-name">${this.parent.escapeHtml(item.name)}</div>
          <div class="gmnotes-token-type">${item.type === 'npc' ? '⚔️' : '👤'}</div>
        </div>

        <div class="gmnotes-token-body">
          ${item.type === 'npc' ? this.renderTokenStats(item) : ''}
        </div>

        ${isSelected ? `
          <div class="gmnotes-token-nav">
            <button class="gmnotes-token-nav-btn ${isFirst ? 'disabled' : ''}" 
                    data-direction="left"
                    ${isFirst ? 'disabled' : ''}
                    title="Mover para esquerda">
              ◀
            </button>
            <button class="gmnotes-token-nav-btn ${isLast ? 'disabled' : ''}" 
                    data-direction="right"
                    ${isLast ? 'disabled' : ''}
                    title="Mover para direita">
              ▶
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  renderTokenStats(item) {
    return `
      <div class="gmnotes-token-stats">
        <div class="gmnotes-token-stat">
          <span class="gmnotes-token-stat-label">Vit</span>
          <div class="gmnotes-token-stat-control">
            <button class="gmnotes-token-stat-btn" onclick="gmNotes.adjustCombatVit('${item.id}', -1)">-</button>
            <span class="gmnotes-token-stat-value">
              <span class="gmnotes-token-stat-current">${item.vit}</span>/
              <span class="gmnotes-token-stat-max">${item.vitMax}</span>
            </span>
            <button class="gmnotes-token-stat-btn" onclick="gmNotes.adjustCombatVit('${item.id}', 1)">+</button>
          </div>
        </div>
        <div class="gmnotes-token-stat">
          <span class="gmnotes-token-stat-label">Con</span>
          <div class="gmnotes-token-stat-control">
            <button class="gmnotes-token-stat-btn" onclick="gmNotes.adjustCombatCon('${item.id}', -1)">-</button>
            <span class="gmnotes-token-stat-value">
              <span class="gmnotes-token-stat-current">${item.con || 0}</span>/
              <span class="gmnotes-token-stat-max">${item.conMax || 0}</span>
            </span>
            <button class="gmnotes-token-stat-btn" onclick="gmNotes.adjustCombatCon('${item.id}', 1)">+</button>
          </div>
        </div>
      </div>
    `;
  }

  renderListItem(item) {
    const isSelected = item.id === this.selectedItemId;
    const isSwapSource = item.id === this.swapSourceId;
    
    const currentIndex = this.combatOrder.findIndex(i => i.id === item.id);
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === this.combatOrder.length - 1;

    return `
      <div class="gmnotes-combat-item ${isSelected ? 'selected' : ''} ${isSwapSource ? 'swap-source' : ''}" 
           data-combat-id="${item.id}">
        <div class="gmnotes-combat-name">${this.parent.escapeHtml(item.name)}</div>
        <div class="gmnotes-combat-type">${item.type === 'npc' ? '⚔️ NPC' : '👤 Jogador'}</div>
        ${item.type === 'npc' ? this.renderNPCStats(item) : ''}
        ${isSelected ? `
          <div class="gmnotes-token-nav">
            <button class="gmnotes-token-nav-btn ${isFirst ? 'disabled' : ''}" 
                    data-direction="left"
                    ${isFirst ? 'disabled' : ''}
                    title="Mover para esquerda">
              ◀
            </button>
            <button class="gmnotes-token-nav-btn ${isLast ? 'disabled' : ''}" 
                    data-direction="right"
                    ${isLast ? 'disabled' : ''}
                    title="Mover para direita">
              ▶
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  renderNPCStats(item) {
    return `
      <div class="gmnotes-combat-stats-row">
        ${this.renderStatControl('Vit', item.vit, item.vitMax, item.id, 'adjustCombatVit')}
        ${this.renderStatControl('Con', item.con || 0, item.conMax || 0, item.id, 'adjustCombatCon')}
      </div>
    `;
  }

  renderStatControl(label, current, max, id, method) {
    return `
      <div class="gmnotes-combat-stat">
        <span class="gmnotes-combat-stat-label">${label}:</span>
        <div class="gmnotes-combat-stat-control">
          <button class="gmnotes-combat-stat-btn" onclick="gmNotes.${method}('${id}', -1)">-</button>
          <span class="gmnotes-combat-stat-value">
            <span class="gmnotes-combat-stat-current">${current}</span>/
            <span class="gmnotes-combat-stat-max">${max}</span>
          </span>
          <button class="gmnotes-combat-stat-btn" onclick="gmNotes.${method}('${id}', 1)">+</button>
        </div>
      </div>
    `;
  }

  adjustCombatVit(combatId, change) {
    const item = this.combatOrder.find(i => i.id === combatId);
    if (item?.type !== 'npc') return;

    item.vit = Math.max(0, Math.min(item.vitMax, item.vit + change));
    this.renderCombatOrder();
    
    const npc = this.parent.npcs?.npcs.find(n => n.id === combatId);
    if (npc) {
      npc.vitCurrent = item.vit;
      this.parent.npcs?.renderNPCs();
    }
    this.parent.saveToStorage();
  }

  adjustCombatCon(combatId, change) {
    const item = this.combatOrder.find(i => i.id === combatId);
    if (item?.type !== 'npc') return;

    item.con = Math.max(0, Math.min(item.conMax, (item.con || 0) + change));
    this.renderCombatOrder();
    
    const npc = this.parent.npcs?.npcs.find(n => n.id === combatId);
    if (npc) {
      npc.conCurrent = item.con;
      this.parent.npcs?.renderNPCs();
    }
    this.parent.saveToStorage();
  }

  loadFromStorage(data) {
    this.combatOrder = (data.combatOrder || []).map(item => {
      if (item.type === 'npc') {
        const npc = this.parent.npcs?.npcs.find(n => n.id === item.id);
        if (npc) {
          return {
            ...item,
            vit: npc.vitCurrent,
            vitMax: npc.vitMax,
            con: npc.conCurrent || 0,
            conMax: npc.conMax || 0,
            color: this.npcColor
          };
        }
      }
      return {
        ...item,
        color: this.playerColor
      };
    });
    
    this.clearSelection();
    this.clearSwapMode();
    
    setTimeout(() => {
      this.renderCombatOrder();
      this.parent.npcs?.renderNPCs();
      this.parent.players?.renderPlayers();
    }, 50);
  }

  getData() {
    return this.combatOrder;
  }
}