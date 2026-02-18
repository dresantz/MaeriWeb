// js/shield/gm-sectionNotes.js
export class GMSectionNotes {
  constructor(parent) {
    this.parent = parent;
    this.sessions = [];
    this.currentSession = null;
    this.autoSaveTimer = null;
  }

  init() {
    this.setupNotes();
    this.renderSessions();
  }

  setupNotes() {
    const textarea = document.getElementById('gmnotes-textarea');
    const saveBtn = document.getElementById('gmnotes-save');
    const clearBtn = document.getElementById('gmnotes-clear');

    if (textarea) {
      textarea.addEventListener('input', () => this.triggerAutoSave());
    }

    if (saveBtn) saveBtn.addEventListener('click', () => this.saveNotes());
    if (clearBtn) clearBtn.addEventListener('click', () => this.showClearConfirm());
  }

  triggerAutoSave() {
    if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
    this.autoSaveTimer = setTimeout(() => this.saveNotes(true), 2000);
  }

  saveNotes(auto = false) {
    const textarea = document.getElementById('gmnotes-textarea');
    if (!textarea) return;

    if (this.currentSession) {
      const session = this.sessions.find(s => s.name === this.currentSession);
      if (session) {
        session.content = textarea.value;
        console.log(`Notas salvas na sessão: "${this.currentSession}"`, session.content);
      }
    } else {
      localStorage.setItem('gmnotes_draft', textarea.value);
    }
    
    this.parent.saveToStorage();
    this.parent.updateStatus(auto ? 'Salvo' : 'Notas salvas!');
  }

  saveCurrentSession() {
    const textarea = document.getElementById('gmnotes-textarea');
    if (!textarea) return;

    if (this.currentSession) {
      const session = this.sessions.find(s => s.name === this.currentSession);
      if (session) {
        session.content = textarea.value;
        console.log(`Sessão atual salva: "${this.currentSession}"`, session.content);
      }
    }
  }

  showNewSessionModal() {
    const container = document.querySelector('.gmnotes-sessions-list');
    if (!container) return;

    this.removeExistingModals();

    const modalHtml = `
      <div class="gmnotes-session-modal">
        <div class="gmnotes-session-modal-content">
          <h4>Nova Sessão</h4>
          <input type="text" class="gmnotes-session-modal-input" placeholder="Nome da sessão..." maxlength="50" autofocus>
          <div class="gmnotes-session-modal-actions">
            <button class="gmnotes-session-modal-create">Criar</button>
            <button class="gmnotes-session-modal-cancel">Cancelar</button>
          </div>
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', modalHtml);

    const modal = container.querySelector('.gmnotes-session-modal');
    const input = modal.querySelector('.gmnotes-session-modal-input');
    const createBtn = modal.querySelector('.gmnotes-session-modal-create');
    const cancelBtn = modal.querySelector('.gmnotes-session-modal-cancel');

    input.focus();

    const createSession = () => {
      const name = input.value.trim();
      if (name) {
        this.saveCurrentSession();
        
        this.sessions.push({
          name: name,
          content: '',
          date: new Date().toISOString()
        });
        
        this.currentSession = name;
        document.getElementById('gmnotes-textarea').value = '';
        
        this.renderSessions();
        this.parent.saveToStorage();
        this.parent.updateStatus(`Sessão "${name}" criada!`);
      }
      modal.remove();
    };

    createBtn.addEventListener('click', createSession);
    cancelBtn.addEventListener('click', () => modal.remove());

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        createSession();
      } else if (e.key === 'Escape') {
        modal.remove();
      }
    });
  }

  loadSession(sessionName) {
    // CORREÇÃO: Remove espaços extras e quebras de linha
    const cleanName = sessionName.trim();
    console.log(`Tentando carregar sessão: "${cleanName}"`);
    
    const session = this.sessions.find(s => s.name === cleanName);
    if (session) {
      console.log(`Sessão encontrada:`, session);
      
      this.saveCurrentSession();
      
      this.currentSession = cleanName;
      
      const textarea = document.getElementById('gmnotes-textarea');
      if (textarea) {
        textarea.value = session.content || '';
        console.log(`Conteúdo carregado:`, textarea.value);
      }
      
      this.renderSessions();
      
      if (textarea) {
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
      
      this.parent.updateStatus(`Sessão "${cleanName}" carregada`);
    } else {
      console.error(`Sessão "${cleanName}" não encontrada!`);
      console.log(`Sessões disponíveis:`, this.sessions.map(s => `"${s.name}"`));
    }
  }

  showDeleteConfirm(sessionName) {
    const cleanName = sessionName.trim();
    const container = document.querySelector('.gmnotes-sessions-list');
    if (!container) return;

    this.removeExistingModals();

    const modalHtml = `
      <div class="gmnotes-confirm-modal">
        <div class="gmnotes-confirm-content">
          <p>Excluir a sessão "${cleanName}"?</p>
          <div class="gmnotes-confirm-actions">
            <button class="gmnotes-confirm-yes">Sim</button>
            <button class="gmnotes-confirm-no">Cancelar</button>
          </div>
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', modalHtml);

    const modal = container.querySelector('.gmnotes-confirm-modal');
    const yesBtn = modal.querySelector('.gmnotes-confirm-yes');
    const noBtn = modal.querySelector('.gmnotes-confirm-no');

    yesBtn.addEventListener('click', () => {
      if (this.currentSession === cleanName) {
        const textarea = document.getElementById('gmnotes-textarea');
        localStorage.setItem('gmnotes_draft', textarea.value);
        this.currentSession = null;
      }
      
      this.sessions = this.sessions.filter(s => s.name !== cleanName);
      
      if (this.sessions.length === 0) {
        document.getElementById('gmnotes-textarea').value = localStorage.getItem('gmnotes_draft') || '';
      }
      
      this.renderSessions();
      this.parent.saveToStorage();
      this.parent.updateStatus('Sessão excluída!');
      modal.remove();
    });

    noBtn.addEventListener('click', () => modal.remove());
  }

  showClearConfirm() {
    const container = document.querySelector('.gmnotes-sessions-list');
    if (!container) return;

    this.removeExistingModals();

    const modalHtml = `
      <div class="gmnotes-confirm-modal">
        <div class="gmnotes-confirm-content">
          <p>Limpar todas as notas?</p>
          <div class="gmnotes-confirm-actions">
            <button class="gmnotes-confirm-yes">Sim</button>
            <button class="gmnotes-confirm-no">Cancelar</button>
          </div>
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', modalHtml);

    const modal = container.querySelector('.gmnotes-confirm-modal');
    const yesBtn = modal.querySelector('.gmnotes-confirm-yes');
    const noBtn = modal.querySelector('.gmnotes-confirm-no');

    yesBtn.addEventListener('click', () => {
      document.getElementById('gmnotes-textarea').value = '';
      this.saveNotes();
      modal.remove();
    });

    noBtn.addEventListener('click', () => modal.remove());
  }

  removeExistingModals() {
    document.querySelectorAll('.gmnotes-confirm-modal, .gmnotes-session-modal').forEach(m => m.remove());
  }

  renderSessions() {
    const container = document.querySelector('.gmnotes-sessions-list');
    if (!container) return;

    if (this.sessions.length === 0) {
      container.innerHTML = '<button class="gmnotes-session-item gmnotes-session-new">+ Nova Sessão</button>';
    } else {
      container.innerHTML = this.sessions.map(s => `
        <div class="gmnotes-session-wrapper">
          <button class="gmnotes-session-item ${s.name === this.currentSession ? 'active' : ''}">
            ${this.parent.escapeHtml(s.name)}
          </button>
          <button class="gmnotes-session-delete" title="Excluir sessão">🗑️</button>
        </div>
      `).join('') + '<button class="gmnotes-session-item gmnotes-session-new">+ Nova Sessão</button>';
    }

    // Eventos das sessões - CORREÇÃO: usa textContent.trim()
    container.querySelectorAll('.gmnotes-session-item:not(.gmnotes-session-new)').forEach(btn => {
      btn.addEventListener('click', () => {
        const sessionName = btn.textContent.trim();
        this.loadSession(sessionName);
      });
    });

    // Eventos dos botões de excluir
    container.querySelectorAll('.gmnotes-session-delete').forEach((btn, index) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showDeleteConfirm(this.sessions[index].name);
      });
    });

    // Evento do botão Nova Sessão
    const newBtn = container.querySelector('.gmnotes-session-new');
    if (newBtn) {
      const newBtnClone = newBtn.cloneNode(true);
      newBtn.parentNode.replaceChild(newBtnClone, newBtn);
      newBtnClone.addEventListener('click', () => this.showNewSessionModal());
    }
  }

  loadFromStorage(data) {
    console.log('Carregando dados do storage:', data);
    
    this.sessions = data.sessions || [];
    this.currentSession = data.currentSession || null;
    
    setTimeout(() => {
      const textarea = document.getElementById('gmnotes-textarea');
      if (textarea) {
        if (this.currentSession) {
          const session = this.sessions.find(s => s.name === this.currentSession);
          if (session) {
            textarea.value = session.content || '';
            console.log(`Sessão atual carregada: "${this.currentSession}"`, session.content);
          } else {
            console.warn(`Sessão atual "${this.currentSession}" não encontrada`);
            this.currentSession = null;
            textarea.value = localStorage.getItem('gmnotes_draft') || '';
          }
        } else {
          textarea.value = localStorage.getItem('gmnotes_draft') || '';
          console.log('Rascunho carregado');
        }
      }
      this.renderSessions();
    }, 50);
  }

  getData() {
    return {
      sessions: this.sessions,
      currentSession: this.currentSession
    };
  }
}