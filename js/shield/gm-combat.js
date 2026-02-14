export class GMCombat {
  constructor(parent) {
    this.parent = parent;
    this.combatOrder = [];
    this.selectedItemId = null;
    this.confirmationActive = false;
  }

  init() {
    this.setupCombat();
    this.setupSelectionHandler();
    this.setupClickOutsideHandler();
  }

  setupCombat() {
    const startBtn = document.getElementById('combat-start');
    const nextBtn = document.getElementById('combat-next');
    const resetBtn = document.getElementById('combat-reset');
    const removeSelectedBtn = document.getElementById('combat-remove-selected');
    const removeAllBtn = document.getElementById('combat-remove-all');

    if (startBtn) startBtn.addEventListener('click', () => this.startCombat());
    if (nextBtn) nextBtn.addEventListener('click', () => this.nextTurn());
    if (resetBtn) resetBtn.addEventListener('click', () => this.resetCombat());
    if (removeSelectedBtn) removeSelectedBtn.addEventListener('click', () => this.showRemoveConfirmation('selected'));
    if (removeAllBtn) removeAllBtn.addEventListener('click', () => this.showRemoveConfirmation('all'));
  }

  showRemoveConfirmation(type) {
    if (this.confirmationActive) return;

    const item = type === 'selected' 
      ? this.combatOrder.find(i => i.id === this.selectedItemId)
      : null;

    if (type === 'selected' && !this.selectedItemId) {
      this.parent.updateStatus('Nenhum personagem selecionado');
      return;
    }

    if (type === 'all' && this.combatOrder.length === 0) {
      this.parent.updateStatus('Ordem já está vazia');
      return;
    }

    const message = type === 'selected' 
      ? `Remover ${item.name} da ordem?` 
      : 'Remover todos os personagens?';

    const container = document.getElementById('combat-confirmation');
    if (!container) return;

    this.setButtonsDisabled(true);
    this.confirmationActive = true;

    container.innerHTML = `
      <div class="gmnotes-confirmation-box">
        <div class="gmnotes-confirmation-message">${message}</div>
        <div class="gmnotes-confirmation-actions">
          <button class="gmnotes-confirm-btn" data-confirm="yes">Sim</button>
          <button class="gmnotes-cancel-btn" data-confirm="no">Cancelar</button>
        </div>
      </div>
    `;

    const handleConfirm = (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;

      if (btn.dataset.confirm === 'yes') {
        if (type === 'selected') this.removeSelected();
        else this.removeFromCombat();
      }
      this.hideConfirmation();
      document.removeEventListener('click', handleConfirm);
    };

    setTimeout(() => {
      container.addEventListener('click', handleConfirm);
    }, 0);
  }

  hideConfirmation() {
    const container = document.getElementById('combat-confirmation');
    if (container) container.innerHTML = '';
    this.setButtonsDisabled(false);
    this.confirmationActive = false;
  }

  setButtonsDisabled(disabled) {
    ['remove-selected', 'remove-all'].forEach(id => {
      const btn = document.getElementById(`combat-${id}`);
      if (btn) btn.classList.toggle('disabled', disabled);
    });
  }

  setupSelectionHandler() {
    const container = document.getElementById('combat-order');
    if (!container) return;

    container.addEventListener('click', (e) => {
      if (this.confirmationActive) return;

      const item = e.target.closest('.gmnotes-combat-item');
      if (!item) return;

      if (this.selectedItemId) {
        const prev = document.querySelector(`.gmnotes-combat-item[data-combat-id="${this.selectedItemId}"]`);
        if (prev) prev.classList.remove('selected');
      }

      this.selectedItemId = item.dataset.combatId;
      item.classList.add('selected');
      e.stopPropagation();
    });
  }

  setupClickOutsideHandler() {
    document.addEventListener('click', (e) => {
      const combatList = document.getElementById('combat-order');
      if (this.selectedItemId && combatList && !combatList.contains(e.target)) {
        this.clearSelection();
      }
    });
  }

  clearSelection() {
    if (this.selectedItemId) {
      const prev = document.querySelector(`.gmnotes-combat-item[data-combat-id="${this.selectedItemId}"]`);
      if (prev) prev.classList.remove('selected');
      this.selectedItemId = null;
    }
  }

  updateCombatButtons() {
    if (this.parent.npcs) this.parent.npcs.renderNPCs();
    if (this.parent.players) this.parent.players.renderPlayers();
  }

  removeSelected() {
    if (!this.selectedItemId) return;

    const item = this.combatOrder.find(i => i.id === this.selectedItemId);
    if (!item) return;

    this.combatOrder = this.combatOrder.filter(i => i.id !== this.selectedItemId);
    this.clearSelection();
    this.renderCombatOrder();
    this.updateCombatButtons();
    this.parent.saveToStorage();
    this.parent.updateStatus(`${item.name} removido`);
  }

  removeFromCombat() {
    this.combatOrder = [];
    this.clearSelection();
    this.renderCombatOrder();
    this.updateCombatButtons();
    this.parent.saveToStorage();
    this.parent.updateStatus('Ordem limpa');
  }

  removeFromCombatById(id) {
    this.combatOrder = this.combatOrder.filter(item => item.id !== id);
    if (this.selectedItemId === id) this.clearSelection();
    this.updateCombatButtons();
  }

  toggleNPCInCombat(npcId, btnElement) {
    const npc = this.parent.npcs.npcs.find(n => n.id === npcId);
    if (!npc) return;

    if (this.combatOrder.some(item => item.id === npcId)) {
      this.parent.npcs.showTemporaryFeedback(btnElement, 'combat-removing');
      this.parent.updateStatus(`${npc.name} já está no combate`);
    } else {
      this.combatOrder.push({
        id: npc.id,
        name: npc.name,
        type: 'npc',
        initiative: 1,
        vit: npc.vitCurrent,
        vitMax: npc.vitMax,
        con: npc.conCurrent || 0,
        conMax: npc.conMax || 0,
        condition: 'normal'
      });

      this.renderCombatOrder();
      this.parent.npcs.renderNPCs();
      this.parent.saveToStorage();
      this.parent.updateStatus(`${npc.name} adicionado`);
    }
  }

  togglePlayerInCombat(playerId, btnElement) {
    const player = this.parent.players.players.find(p => p.id === playerId);
    if (!player) return;

    if (this.combatOrder.some(item => item.id === playerId)) {
      this.parent.players.showTemporaryFeedback(btnElement, 'combat-removing');
      this.parent.updateStatus(`${player.name} já está no combate`);
    } else {
      this.combatOrder.push({
        id: player.id,
        name: player.name,
        type: 'player',
        initiative: 1,
        condition: 'normal'
      });

      this.renderCombatOrder();
      this.parent.players.renderPlayers();
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

    const sorted = [...this.combatOrder].sort((a, b) => a.initiative - b.initiative);

    container.innerHTML = sorted.map(item => `
      <div class="gmnotes-combat-item ${item.id === this.selectedItemId ? 'selected' : ''}" 
           data-combat-id="${item.id}">
        <div class="gmnotes-combat-name">${this.parent.escapeHtml(item.name)}</div>
        
        <div class="gmnotes-combat-controls-row">
          <div class="gmnotes-combat-initiative">
            <input type="number" class="gmnotes-combat-initiative-input" value="${item.initiative}" min="1" max="99" 
                   onchange="gmNotes.updateCombatInitiative('${item.id}', this.value)">
          </div>
          <div class="gmnotes-combat-status">
            <select class="gmnotes-combat-condition" onchange="gmNotes.updateCombatCondition('${item.id}', this.value)">
              <option value="normal" ${item.condition === 'normal' ? 'selected' : ''}>Normal</option>
              <option value="inconsciente" ${item.condition === 'inconsciente' ? 'selected' : ''}>Inconsciente</option>
              <option value="envenenado" ${item.condition === 'envenenado' ? 'selected' : ''}>Envenenado</option>
              <option value="paralisado" ${item.condition === 'paralisado' ? 'selected' : ''}>Paralisado</option>
            </select>
          </div>
        </div>
        
        ${item.type === 'npc' ? `
        <div class="gmnotes-combat-stats-row">
          <div class="gmnotes-combat-stat">
            <span class="gmnotes-combat-stat-label">Vit:</span>
            <div class="gmnotes-combat-stat-control">
              <button class="gmnotes-combat-stat-btn" onclick="gmNotes.adjustCombatVit('${item.id}', -1)">-</button>
              <span class="gmnotes-combat-stat-value">
                <span class="gmnotes-combat-stat-current">${item.vit}</span>/<span class="gmnotes-combat-stat-max">${item.vitMax}</span>
              </span>
              <button class="gmnotes-combat-stat-btn" onclick="gmNotes.adjustCombatVit('${item.id}', 1)">+</button>
            </div>
          </div>
          <div class="gmnotes-combat-stat">
            <span class="gmnotes-combat-stat-label">Con:</span>
            <div class="gmnotes-combat-stat-control">
              <button class="gmnotes-combat-stat-btn" onclick="gmNotes.adjustCombatCon('${item.id}', -1)">-</button>
              <span class="gmnotes-combat-stat-value">
                <span class="gmnotes-combat-stat-current">${item.con || 0}</span>/<span class="gmnotes-combat-stat-max">${item.conMax || 0}</span>
              </span>
              <button class="gmnotes-combat-stat-btn" onclick="gmNotes.adjustCombatCon('${item.id}', 1)">+</button>
            </div>
          </div>
        </div>
        ` : ''}
      </div>
    `).join('');
  }

  adjustCombatVit(combatId, change) {
    const item = this.combatOrder.find(i => i.id === combatId);
    if (item?.type === 'npc') {
      item.vit = Math.max(0, Math.min(item.vitMax, item.vit + change));
      this.renderCombatOrder();
      
      const npc = this.parent.npcs.npcs.find(n => n.id === combatId);
      if (npc) {
        npc.vitCurrent = item.vit;
        this.parent.npcs.renderNPCs();
      }
      this.parent.saveToStorage();
    }
  }

  adjustCombatCon(combatId, change) {
    const item = this.combatOrder.find(i => i.id === combatId);
    if (item?.type === 'npc') {
      item.con = Math.max(0, Math.min(item.conMax, (item.con || 0) + change));
      this.renderCombatOrder();
      
      const npc = this.parent.npcs.npcs.find(n => n.id === combatId);
      if (npc) {
        npc.conCurrent = item.con;
        this.parent.npcs.renderNPCs();
      }
      this.parent.saveToStorage();
    }
  }

  updateCombatInitiative(combatId, value) {
    const item = this.combatOrder.find(i => i.id === combatId);
    if (item) {
      item.initiative = Math.min(99, parseInt(value) || 1);
      this.renderCombatOrder();
      this.parent.saveToStorage();
    }
  }

  updateCombatCondition(combatId, condition) {
    const item = this.combatOrder.find(i => i.id === combatId);
    if (item) {
      item.condition = condition;
      this.parent.saveToStorage();
    }
  }

  startCombat() {
    if (this.combatOrder.length === 0) return;
    
    document.querySelectorAll('.gmnotes-combat-item').forEach((item, index) => {
      item.classList.toggle('active-turn', index === 0);
    });
    this.parent.updateStatus('Combate iniciado!');
  }

  nextTurn() {
    const items = document.querySelectorAll('.gmnotes-combat-item');
    const activeIndex = Array.from(items).findIndex(item => item.classList.contains('active-turn'));
    
    items.forEach(item => item.classList.remove('active-turn'));
    
    if (activeIndex < items.length - 1) {
      items[activeIndex + 1].classList.add('active-turn');
    } else {
      items[0].classList.add('active-turn');
    }
  }

  resetCombat() {
    this.combatOrder = [];
    this.clearSelection();
    this.renderCombatOrder();
    this.updateCombatButtons();
    this.parent.saveToStorage();
    this.parent.updateStatus('Ordem resetada');
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
            conMax: npc.conMax || 0
          };
        }
      }
      return item;
    });
    
    this.clearSelection();
    setTimeout(() => this.renderCombatOrder(), 50);
  }

  getData() {
    return this.combatOrder;
  }
}