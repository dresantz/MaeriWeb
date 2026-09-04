// js/shield/gm-combat.js
export class GMCombat {
  constructor(parent) {
    this.parent = parent;
    this.combatOrder = [];
    this.selectedItemId = null;
    this.confirmationActive = false;
    this.npcColor = '#3f2020';
    this.playerColor = '#1d412a';
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
    const resetActionsBtn = document.getElementById('combat-reset-actions');

    removeSelectedBtn?.addEventListener('click', () => this.showRemoveConfirmation('selected'));
    removeAllBtn?.addEventListener('click', () => this.showRemoveConfirmation('all'));
    resetActionsBtn?.addEventListener('click', () => this.resetAllActions());
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

  resetAllActions() {
    if (this.combatOrder.length === 0) {
      this.parent.updateStatus('Nenhum token na ordem de combate');
      return;
    }

    const hasActed = this.combatOrder.some(item => item.hasActed === true);
    if (!hasActed) {
      this.parent.updateStatus('Todos os tokens já estão com ações pendentes');
      return;
    }

    this.combatOrder.forEach(item => {
      item.hasActed = false;
    });

    document.querySelectorAll('.gmnotes-token-checkbox').forEach(checkbox => {
      checkbox.checked = false;
    });

    this.parent.saveToStorage();
    this.parent.updateStatus('✅ Todas as ações foram reiniciadas');
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

      const item = e.target.closest('.gmnotes-combat-token');
      if (!item) return;

      const checkbox = e.target.closest('.gmnotes-token-checkbox');
      if (checkbox) {
        const tokenId = checkbox.dataset.tokenId;
        this.toggleTokenAction(tokenId);
        e.stopPropagation();
        return;
      }

      const navBtn = e.target.closest('.gmnotes-token-nav-btn');
      if (navBtn) {
        const tokenId = item.dataset.combatId;
        const direction = navBtn.dataset.direction;
        this.moveToken(tokenId, direction);
        e.stopPropagation();
        e.preventDefault();
        return;
      }

      if (e.target.closest('.gmnotes-token-stat-btn')) {
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
          const prev = document.querySelector(`.gmnotes-combat-token[data-combat-id="${this.selectedItemId}"]`);
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
    document.querySelectorAll('.gmnotes-combat-token').forEach(el => {
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
    
    const prev = document.querySelector(`.gmnotes-combat-token[data-combat-id="${this.selectedItemId}"]`);
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
        color: this.npcColor,
        hasActed: false
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
        color: this.playerColor,
        hasActed: false
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

    container.className = 'gmnotes-combat-grid';
    container.innerHTML = this.combatOrder.map(item => this.renderToken(item)).join('');
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
          <div class="gmnotes-token-type">
            <input type="checkbox" class="gmnotes-token-checkbox" 
                  data-token-id="${item.id}"
                  ${item.hasActed ? 'checked' : ''}
                  title="Ação realizada">
          </div>
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

  toggleTokenAction(tokenId) {
    const item = this.combatOrder.find(i => i.id === tokenId);
    if (!item) return;

    item.hasActed = !item.hasActed;
    this.parent.saveToStorage();
    
    const checkbox = document.querySelector(`.gmnotes-token-checkbox[data-token-id="${tokenId}"]`);
    if (checkbox) {
      checkbox.checked = item.hasActed;
    }
    
    this.parent.updateStatus(`${item.name} ${item.hasActed ? '✅ ação realizada' : '⏳ ação pendente'}`);
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
            color: this.npcColor,
            hasActed: item.hasActed || false
          };
        }
      }
      return {
        ...item,
        color: this.playerColor,
        hasActed: item.hasActed || false
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