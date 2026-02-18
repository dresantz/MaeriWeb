// js/shield/gm-players.js
export class GMPlayers {
  constructor(parent) {
    this.parent = parent;
    this.players = [];
    this.filteredPlayers = null; // Para armazenar resultados de busca (se adicionar busca depois)
  }

  init() {
    this.setupPlayerForm();
  }

  setupPlayerForm() {
    const addBtn = document.getElementById('player-add');
    if (addBtn) addBtn.addEventListener('click', () => this.addPlayer());
    
    // Se tiver campo de busca no futuro, configurar aqui
    const searchInput = document.querySelector('.gmnotes-players-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.searchPlayers(e.target.value));
    }
  }

  addPlayer() {
    const nameInput = document.getElementById('player-name');
    const infoInput = document.getElementById('player-info');
    
    const player = {
      id: 'player_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11),
      name: nameInput?.value?.trim() || 'Jogador sem nome',
      info: infoInput?.value?.trim() || '',
      createdAt: new Date().toISOString()
    };

    if (player.name && player.name !== 'Jogador sem nome') {
      this.players.push(player);
      this.filteredPlayers = null; // Limpa qualquer filtro ativo
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
    return this.parent.combat?.combatOrder?.some(item => item.id === playerId) || false;
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
    if (!container) {
      console.log('Container players-list não encontrado');
      return;
    }

    // Decide qual array renderizar (filtrado ou completo)
    const playersToRender = this.filteredPlayers || this.players;

    if (playersToRender.length === 0) {
      container.innerHTML = '<div class="gmnotes-empty-state">Nenhum jogador cadastrado</div>';
      return;
    }

    container.innerHTML = playersToRender.map(player => {
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
    const wasInCombat = this.isInCombat(playerId);
    this.players = this.players.filter(p => p.id !== playerId);
    
    if (this.parent.combat && wasInCombat) {
      this.parent.combat.removeFromCombatById(playerId);
    }
    
    if (render) {
      this.renderPlayers();
      if (this.parent.combat) {
        this.parent.combat.renderCombatOrder();
      }
      this.parent.saveToStorage();
      this.parent.updateStatus('Jogador removido');
    }
  }

  // Método de busca preparado para uso futuro
  searchPlayers(query) {
    if (!query || query.trim() === '') {
      this.filteredPlayers = null; // Limpa o filtro
      this.renderPlayers();
      return;
    }

    const searchTerm = query.toLowerCase().trim();
    this.filteredPlayers = this.players.filter(player => 
      player.name.toLowerCase().includes(searchTerm) ||
      (player.info && player.info.toLowerCase().includes(searchTerm))
    );

    this.renderPlayers();
  }

  loadFromStorage(data) {
    // Garante que os jogadores sejam carregados corretamente
    if (data && data.players) {
      this.players = data.players;
    } else {
      this.players = [];
    }
    this.filteredPlayers = null; // Limpa qualquer filtro ao carregar
    
    // Só renderiza se o container existir
    if (document.getElementById('players-list')) {
      this.renderPlayers();
    }
  }

  getData() {
    return this.players;
  }
}