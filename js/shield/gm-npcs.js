export class GMNPCs {
  constructor(parent) {
    this.parent = parent;
    this.npcs = [];
  }

  init() {
    this.setupNPCForm();
  }

  setupNPCForm() {
    const addBtn = document.getElementById('npc-add');
    const clearBtn = document.getElementById('npc-clear');
    const searchInput = document.querySelector('.gmnotes-search-input');

    if (addBtn) addBtn.addEventListener('click', () => this.addNPC());
    if (clearBtn) clearBtn.addEventListener('click', () => this.clearNPCForm());
    if (searchInput) searchInput.addEventListener('input', (e) => this.searchNPCs(e.target.value));
  }

  addNPC() {
    const npc = {
      id: 'npc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      name: document.getElementById('npc-name')?.value || 'NPC sem nome',
      vitMax: parseInt(document.getElementById('npc-vit')?.value) || 8,
      vitCurrent: parseInt(document.getElementById('npc-vit')?.value) || 8,
      conMax: parseInt(document.getElementById('npc-con')?.value) || 8,
      conCurrent: parseInt(document.getElementById('npc-con')?.value) || 8,
      attributes: {
        f: Math.min(99, parseInt(document.getElementById('npc-f')?.value) || 2),
        v: Math.min(99, parseInt(document.getElementById('npc-v')?.value) || 2),
        d: Math.min(99, parseInt(document.getElementById('npc-d')?.value) || 2),
        a: Math.min(99, parseInt(document.getElementById('npc-a')?.value) || 2),
        i: Math.min(99, parseInt(document.getElementById('npc-i')?.value) || 2),
        s: Math.min(99, parseInt(document.getElementById('npc-s')?.value) || 2)
      },
      extra: document.getElementById('npc-extra')?.value || '',
      createdAt: new Date().toISOString()
    };

    this.npcs.push(npc);
    this.renderNPCs();
    this.parent.saveToStorage();
    this.clearNPCForm();
    this.parent.updateStatus('NPC adicionado!');
  }

  clearNPCForm() {
    document.getElementById('npc-name').value = '';
    document.getElementById('npc-vit').value = '8';
    document.getElementById('npc-con').value = '8';
    document.getElementById('npc-f').value = '2';
    document.getElementById('npc-v').value = '2';
    document.getElementById('npc-d').value = '2';
    document.getElementById('npc-a').value = '2';
    document.getElementById('npc-i').value = '2';
    document.getElementById('npc-s').value = '2';
    document.getElementById('npc-extra').value = '';
  }

  renderNPCs() {
    const container = document.getElementById('npc-list');
    if (!container) return;

    if (this.npcs.length === 0) {
      container.innerHTML = '<div class="gmnotes-empty-state">Nenhum NPC criado</div>';
      return;
    }

    container.innerHTML = this.npcs.map(npc => `
      <div class="gmnotes-npc-item" data-npc-id="${npc.id}">
        <div class="gmnotes-npc-header">
          <span class="gmnotes-npc-name">${this.parent.escapeHtml(npc.name)}</span>
          <div class="gmnotes-npc-actions">
            <button class="gmnotes-npc-btn" onclick="gmNotes.editNPC('${npc.id}')" title="Editar">✏️</button>
            <button class="gmnotes-npc-btn" onclick="gmNotes.duplicateNPC('${npc.id}')" title="Duplicar">📋</button>
            <button class="gmnotes-npc-btn" onclick="gmNotes.deleteNPC('${npc.id}')" title="Remover">🗑️</button>
          </div>
        </div>
        
        <div class="gmnotes-npc-stats">
          <div class="gmnotes-stat-group">
            <span class="gmnotes-stat-label">Vit:</span>
            <div class="gmnotes-stat-control">
              <button class="gmnotes-stat-btn" onclick="gmNotes.adjustVit('${npc.id}', -1)">-</button>
              <span class="gmnotes-stat-value">${npc.vitCurrent}/${npc.vitMax}</span>
              <button class="gmnotes-stat-btn" onclick="gmNotes.adjustVit('${npc.id}', 1)">+</button>
            </div>
          </div>
          <div class="gmnotes-stat-group">
            <span class="gmnotes-stat-label">Con:</span>
            <div class="gmnotes-stat-control">
              <button class="gmnotes-stat-btn" onclick="gmNotes.adjustCon('${npc.id}', -1)">-</button>
              <span class="gmnotes-stat-value">${npc.conCurrent}/${npc.conMax}</span>
              <button class="gmnotes-stat-btn" onclick="gmNotes.adjustCon('${npc.id}', 1)">+</button>
            </div>
          </div>
        </div>

        <div class="gmnotes-npc-attributes">
          <span class="gmnotes-attr">F ${npc.attributes.f}</span>
          <span class="gmnotes-attr">V ${npc.attributes.v}</span>
          <span class="gmnotes-attr">D ${npc.attributes.d}</span>
          <span class="gmnotes-attr">A ${npc.attributes.a}</span>
          <span class="gmnotes-attr">S ${npc.attributes.s}</span>
        </div>

        ${npc.extra ? `
        <div class="gmnotes-npc-extra">
          <span class="gmnotes-extra-label">Extra:</span>
          <span class="gmnotes-extra-text">${this.parent.escapeHtml(npc.extra)}</span>
        </div>
        ` : ''}
      </div>
    `).join('');
  }

  adjustVit(npcId, change) {
    const npc = this.npcs.find(n => n.id === npcId);
    if (npc) {
      npc.vitCurrent = Math.max(0, Math.min(npc.vitMax, npc.vitCurrent + change));
      this.renderNPCs();
      if (this.parent.combat) this.parent.combat.updateCombatHP(npcId, npc.vitCurrent);
      this.parent.saveToStorage();
    }
  }

  adjustCon(npcId, change) {
    const npc = this.npcs.find(n => n.id === npcId);
    if (npc) {
      npc.conCurrent = Math.max(0, Math.min(npc.conMax, npc.conCurrent + change));
      this.renderNPCs();
      this.parent.saveToStorage();
    }
  }

  editNPC(npcId) {
    const npc = this.npcs.find(n => n.id === npcId);
    if (!npc) return;

    document.getElementById('npc-name').value = npc.name;
    document.getElementById('npc-vit').value = npc.vitMax;
    document.getElementById('npc-con').value = npc.conMax;
    document.getElementById('npc-f').value = npc.attributes.f;
    document.getElementById('npc-v').value = npc.attributes.v;
    document.getElementById('npc-d').value = npc.attributes.d;
    document.getElementById('npc-a').value = npc.attributes.a;
    document.getElementById('npc-s').value = npc.attributes.s;
    document.getElementById('npc-extra').value = npc.extra || '';

    this.deleteNPC(npcId, false);
    this.parent.switchTab('npcs');
  }

  duplicateNPC(npcId) {
    const npc = this.npcs.find(n => n.id === npcId);
    if (npc) {
      const duplicate = JSON.parse(JSON.stringify(npc));
      duplicate.id = 'npc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      duplicate.name = npc.name + ' (Cópia)';
      this.npcs.push(duplicate);
      this.renderNPCs();
      this.parent.saveToStorage();
      this.parent.updateStatus('NPC duplicado!');
    }
  }

  deleteNPC(npcId, render = true) {
    this.npcs = this.npcs.filter(n => n.id !== npcId);
    if (this.parent.combat) this.parent.combat.removeFromCombatById(npcId);
    if (render) {
      this.renderNPCs();
      if (this.parent.combat) this.parent.combat.renderCombatOrder();
      this.parent.saveToStorage();
      this.parent.updateStatus('NPC removido');
    }
  }

  searchNPCs(query) {
    if (!query) {
      this.renderNPCs();
      return;
    }

    const filtered = this.npcs.filter(npc => 
      npc.name.toLowerCase().includes(query.toLowerCase()) ||
      npc.extra?.toLowerCase().includes(query.toLowerCase())
    );

    const container = document.getElementById('npc-list');
    if (container) {
      if (filtered.length === 0) {
        container.innerHTML = '<div class="gmnotes-empty-state">Nenhum NPC encontrado</div>';
      } else {
        const original = this.npcs;
        this.npcs = filtered;
        this.renderNPCs();
        this.npcs = original;
      }
    }
  }

  loadFromStorage(data) {
    this.npcs = data.npcs || [];
  }

  getData() {
    return this.npcs;
  }
}