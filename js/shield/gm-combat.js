export class GMCombat {
  constructor(parent) {
    this.parent = parent;
    this.combatOrder = [];
    this.selectedItemId = null;
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
    if (removeSelectedBtn) removeSelectedBtn.addEventListener('click', () => this.removeSelected());
    if (removeAllBtn) removeAllBtn.addEventListener('click', () => this.removeFromCombat());
  }

  setupSelectionHandler() {
    const container = document.getElementById('combat-order');
    if (!container) return;

    container.addEventListener('click', (e) => {
      const item = e.target.closest('.gmnotes-combat-item');
      if (!item) return;

      if (this.selectedItemId) {
        const prevSelected = document.querySelector(`.gmnotes-combat-item[data-combat-id="${this.selectedItemId}"]`);
        if (prevSelected) prevSelected.classList.remove('selected');
      }

      this.selectedItemId = item.dataset.combatId;
      item.classList.add('selected');
      e.stopPropagation();
    });
  }

  setupClickOutsideHandler() {
    document.addEventListener('click', (e) => {
      const combatList = document.getElementById('combat-order');
      
      if (!this.selectedItemId) return;
      
      if (combatList && !combatList.contains(e.target)) {
        this.clearSelection();
      }
    });
  }

  clearSelection() {
    if (this.selectedItemId) {
      const prevSelected = document.querySelector(`.gmnotes-combat-item[data-combat-id="${this.selectedItemId}"]`);
      if (prevSelected) prevSelected.classList.remove('selected');
      this.selectedItemId = null;
    }
  }

  // NOVO: Atualiza os botões de combate em NPCs e Jogadores
  updateCombatButtons() {
    if (this.parent.npcs && typeof this.parent.npcs.renderNPCs === 'function') {
      this.parent.npcs.renderNPCs();
    }
    if (this.parent.players && typeof this.parent.players.renderPlayers === 'function') {
      this.parent.players.renderPlayers();
    }
  }

  removeSelected() {
    if (!this.selectedItemId) {
      this.parent.updateStatus('Nenhum personagem selecionado');
      return;
    }

    const item = this.combatOrder.find(i => i.id === this.selectedItemId);
    if (!item) return;

    if (confirm(`Remover ${item.name} da ordem de combate?`)) {
      this.combatOrder = this.combatOrder.filter(i => i.id !== this.selectedItemId);
      
      this.clearSelection();
      
      this.renderCombatOrder();
      this.updateCombatButtons(); // Agora funciona!
      this.parent.saveToStorage();
      this.parent.updateStatus(`${item.name} removido do combate`);
    }
  }

  removeFromCombat() {
    if (confirm('Remover todos da ordem?')) {
      this.combatOrder = [];
      this.clearSelection();
      this.renderCombatOrder();
      this.updateCombatButtons(); // Adicionado também aqui
      this.parent.saveToStorage();
      this.parent.updateStatus('Ordem limpa');
    }
  }

  removeFromCombatById(id) {
    this.combatOrder = this.combatOrder.filter(item => item.id !== id);
    if (this.selectedItemId === id) {
      this.clearSelection();
    }
    this.updateCombatButtons(); // Adicionado também aqui
  }

  // Toggle NPC no combate
  toggleNPCInCombat(npcId, btnElement) {
    const npc = this.parent.npcs.npcs.find(n => n.id === npcId);
    if (!npc) return;

    const exists = this.combatOrder.some(item => item.id === npcId);

    if (exists) {
      this.parent.npcs.showTemporaryFeedback(btnElement, 'combat-removing');
      this.parent.updateStatus(`${npc.name} já está no combate`);
    } else {
      this.combatOrder.push({
        id: npc.id,
        name: npc.name,
        type: 'npc',
        initiative: 10,
        vit: npc.vitCurrent,
        vitMax: npc.vitMax,
        con: npc.conCurrent || 0,
        conMax: npc.conMax || 0,
        condition: 'normal'
      });

      this.renderCombatOrder();
      this.parent.npcs.renderNPCs();
      this.parent.saveToStorage();
      this.parent.updateStatus(`${npc.name} adicionado ao combate`);
    }
  }

  // Toggle Jogador no combate
  togglePlayerInCombat(playerId, btnElement) {
    const player = this.parent.players.players.find(p => p.id === playerId);
    if (!player) return;

    const exists = this.combatOrder.some(item => item.id === playerId);

    if (exists) {
      this.parent.players.showTemporaryFeedback(btnElement, 'combat-removing');
      this.parent.updateStatus(`${player.name} já está no combate`);
    } else {
      this.combatOrder.push({
        id: player.id,
        name: player.name,
        type: 'player',
        initiative: 10,
        condition: 'normal'
      });

      this.renderCombatOrder();
      this.parent.players.renderPlayers();
      this.parent.saveToStorage();
      this.parent.updateStatus(`${player.name} adicionado ao combate`);
    }
  }

  renderCombatOrder() {
    const container = document.getElementById('combat-order');
    if (!container) return;

    if (this.combatOrder.length === 0) {
      container.innerHTML = '<div class="gmnotes-empty-state">Ordem vazia. Adicione NPCs ou jogadores.</div>';
      return;
    }

    const sorted = [...this.combatOrder].sort((a, b) => b.initiative - a.initiative);

    container.innerHTML = sorted.map((item, index) => {
      const selectedClass = item.id === this.selectedItemId ? 'selected' : '';
      
      return `
      <div class="gmnotes-combat-item ${selectedClass}" data-combat-id="${item.id}" data-combat-index="${index}">
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
    `}).join('');
  }

  adjustCombatVit(combatId, change) {
    const item = this.combatOrder.find(i => i.id === combatId);
    if (item && item.type === 'npc') {
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
    if (item && item.type === 'npc') {
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

  updateCombatHP(npcId, vit) {
    const combatItem = this.combatOrder.find(i => i.id === npcId);
    if (combatItem) {
      combatItem.vit = vit;
      this.renderCombatOrder();
    }
  }

  startCombat() {
    if (this.combatOrder.length > 0) {
      document.querySelectorAll('.gmnotes-combat-item').forEach((item, index) => {
        item.classList.toggle('active-turn', index === 0);
      });
      this.parent.updateStatus('Combate iniciado!');
    }
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
    if (confirm('Resetar ordem de combate?')) {
      this.combatOrder = [];
      this.clearSelection();
      this.renderCombatOrder();
      this.updateCombatButtons(); // Adicionado também aqui
      this.parent.saveToStorage();
    }
  }

  loadFromStorage(data) {
    this.combatOrder = data.combatOrder || [];
    this.clearSelection();
    
    if (this.combatOrder.length > 0) {
      this.combatOrder = this.combatOrder.map(combatItem => {
        if (combatItem.type === 'npc') {
          const npc = this.parent.npcs?.npcs.find(n => n.id === combatItem.id);
          if (npc) {
            return {
              ...combatItem,
              vit: npc.vitCurrent,
              vitMax: npc.vitMax,
              con: npc.conCurrent || 0,
              conMax: npc.conMax || 0
            };
          }
        }
        return combatItem;
      });
    }
    
    setTimeout(() => {
      this.renderCombatOrder();
    }, 50);
  }

  getData() {
    return this.combatOrder;
  }
}