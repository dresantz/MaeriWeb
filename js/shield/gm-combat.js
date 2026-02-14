export class GMCombat {
  constructor(parent) {
    this.parent = parent;
    this.combatOrder = [];
  }

  init() {
    this.setupCombat();
  }

  setupCombat() {
    const startBtn = document.getElementById('combat-start');
    const nextBtn = document.getElementById('combat-next');
    const resetBtn = document.getElementById('combat-reset');
    const removeBtn = document.querySelector('.gmnotes-combat-remove');

    if (startBtn) startBtn.addEventListener('click', () => this.startCombat());
    if (nextBtn) nextBtn.addEventListener('click', () => this.nextTurn());
    if (resetBtn) resetBtn.addEventListener('click', () => this.resetCombat());
    if (removeBtn) removeBtn.addEventListener('click', () => this.removeFromCombat());
  }

  // Adicionar NPC específico à ordem de combate
  addNPCToCombat(npcId) {
    const npc = this.parent.npcs.npcs.find(n => n.id === npcId);
    if (!npc) return;

    const exists = this.combatOrder.some(item => item.id === npcId);
    if (exists) {
      alert(`${npc.name} já está na ordem de combate`);
      return;
    }

    this.combatOrder.push({
      id: npc.id,
      name: npc.name,
      type: 'npc',
      initiative: 10,
      vit: npc.vitCurrent,
      vitMax: npc.vitMax,
      condition: 'normal'
    });

    this.renderCombatOrder();
    this.parent.saveToStorage();
    this.parent.updateStatus(`${npc.name} adicionado ao combate`);
    this.parent.switchTab('combat');
  }

  // Adicionar jogador específico à ordem de combate
  addPlayerToCombat(playerId) {
    const player = this.parent.players.players.find(p => p.id === playerId);
    if (!player) return;

    const exists = this.combatOrder.some(item => item.id === playerId);
    if (exists) {
      alert(`${player.name} já está na ordem de combate`);
      return;
    }

    this.combatOrder.push({
      id: player.id,
      name: player.name,
      type: 'player',
      initiative: 10,
      condition: 'normal'
    });

    this.renderCombatOrder();
    this.parent.saveToStorage();
    this.parent.updateStatus(`${player.name} adicionado ao combate`);
    this.parent.switchTab('combat');
  }

  removeFromCombat() {
    if (confirm('Remover todos da ordem?')) {
      this.combatOrder = [];
      this.renderCombatOrder();
      this.parent.saveToStorage();
      this.parent.updateStatus('Ordem limpa');
    }
  }

  removeFromCombatById(id) {
    this.combatOrder = this.combatOrder.filter(item => item.id !== id);
  }

  renderCombatOrder() {
    const container = document.getElementById('combat-order');
    if (!container) return;

    if (this.combatOrder.length === 0) {
      container.innerHTML = '<div class="gmnotes-empty-state">Ordem vazia. Adicione NPCs ou jogadores.</div>';
      return;
    }

    const sorted = [...this.combatOrder].sort((a, b) => b.initiative - a.initiative);

    container.innerHTML = sorted.map((item, index) => `
      <div class="gmnotes-combat-item" data-combat-id="${item.id}" data-combat-index="${index}">
        <div class="gmnotes-combat-initiative">
          <input type="number" class="gmnotes-combat-initiative-input" value="${item.initiative}" min="1" max="99" 
                 onchange="gmNotes.updateCombatInitiative('${item.id}', this.value)">
        </div>
        <div class="gmnotes-combat-info">
          <span class="gmnotes-combat-name">${this.parent.escapeHtml(item.name)}</span>
        </div>
        ${item.type === 'npc' ? `
        <div class="gmnotes-combat-hp">
          <button class="gmnotes-combat-hp-btn" onclick="gmNotes.adjustCombatVit('${item.id}', -1)">-</button>
          <span class="gmnotes-hp-current">${item.vit}</span>/<span class="gmnotes-hp-max">${item.vitMax}</span>
          <button class="gmnotes-combat-hp-btn" onclick="gmNotes.adjustCombatVit('${item.id}', 1)">+</button>
        </div>
        ` : ''}
        <div class="gmnotes-combat-status">
          <select class="gmnotes-combat-condition" onchange="gmNotes.updateCombatCondition('${item.id}', this.value)">
            <option value="normal" ${item.condition === 'normal' ? 'selected' : ''}>Normal</option>
            <option value="inconsciente" ${item.condition === 'inconsciente' ? 'selected' : ''}>Inconsciente</option>
            <option value="envenenado" ${item.condition === 'envenenado' ? 'selected' : ''}>Envenenado</option>
            <option value="paralisado" ${item.condition === 'paralisado' ? 'selected' : ''}>Paralisado</option>
          </select>
        </div>
      </div>
    `).join('');
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
      this.renderCombatOrder();
      this.parent.saveToStorage();
    }
  }

  loadFromStorage(data) {
    this.combatOrder = data.combatOrder || [];
  }

  getData() {
    return this.combatOrder;
  }
}