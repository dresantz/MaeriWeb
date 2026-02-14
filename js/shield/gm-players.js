export class GMPlayers {
  constructor(parent) {
    this.parent = parent;
    this.players = [];
  }

  init() {
    this.setupPlayerForm();
  }

  setupPlayerForm() {
    const addBtn = document.getElementById('player-add');
    if (addBtn) addBtn.addEventListener('click', () => this.addPlayer());
  }

  addPlayer() {
    const player = {
      id: 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      name: document.getElementById('player-name')?.value || 'Jogador sem nome',
      info: document.getElementById('player-info')?.value || '',
      createdAt: new Date().toISOString()
    };

    if (player.name) {
      this.players.push(player);
      this.renderPlayers();
      this.parent.saveToStorage();
      this.clearPlayerForm();
      this.parent.updateStatus('Jogador adicionado!');
    } else {
      alert('Preencha o nome do jogador');
    }
  }

  clearPlayerForm() {
    document.getElementById('player-name').value = '';
    document.getElementById('player-info').value = '';
  }

  // Verifica se jogador está na ordem de combate
  isInCombat(playerId) {
    return this.parent.combat.combatOrder.some(item => item.id === playerId);
  }

  // Feedback visual temporário
  showTemporaryFeedback(btn, type) {
    btn.classList.add(type);
    setTimeout(() => {
      btn.classList.remove(type);
    }, 800);
  }

  renderPlayers() {
    const container = document.getElementById('players-list');
    if (!container) return;

    if (this.players.length === 0) {
      container.innerHTML = '<div class="gmnotes-empty-state">Nenhum jogador cadastrado</div>';
      return;
    }

    container.innerHTML = this.players.map(player => {
      const inCombat = this.isInCombat(player.id);
      const combatButtonClass = inCombat ? 'gmnotes-npc-btn combat-added' : 'gmnotes-npc-btn';
      
      return `
      <div class="gmnotes-player-item" data-player-id="${player.id}">
        <div class="gmnotes-player-header">
          <span class="gmnotes-player-name">${this.parent.escapeHtml(player.name)}</span>
          <div class="gmnotes-player-actions">
          <button class="${combatButtonClass}" onclick="gmNotes.togglePlayerInCombat('${player.id}', this)" title="${inCombat ? 'Já está no combate' : 'Adicionar ao Combate'}">⚔️</button>
            <button class="gmnotes-npc-btn" onclick="gmNotes.editPlayer('${player.id}')" title="Editar">✏️</button>
            <button class="gmnotes-npc-btn" onclick="gmNotes.deletePlayer('${player.id}')" title="Remover">🗑️</button>
          </div>
        </div>
        ${player.info ? `
        <div class="gmnotes-player-info">
          ${this.parent.escapeHtml(player.info)}
        </div>
        ` : ''}
      </div>
    `}).join('');
  }

  editPlayer(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (player) {
      document.getElementById('player-name').value = player.name;
      document.getElementById('player-info').value = player.info || '';
      
      this.deletePlayer(playerId, false);
      this.parent.switchTab('players');
    }
  }

  deletePlayer(playerId, render = true) {
    this.players = this.players.filter(p => p.id !== playerId);
    if (this.parent.combat) {
      this.parent.combat.removeFromCombatById(playerId);
    }
    if (render) {
      this.renderPlayers();
      if (this.parent.combat) {
        this.parent.combat.renderCombatOrder();
      }
      this.parent.saveToStorage();
    }
  }

  loadFromStorage(data) {
    this.players = data.players || [];
  }

  getData() {
    return this.players;
  }
}