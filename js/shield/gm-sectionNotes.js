export class GMSectionNotes {
  constructor(parent) {
    this.parent = parent;
    this.sessions = [];
    this.currentSession = null;
    this.autoSaveTimer = null;
    this.sessionInputActive = false;
  }

  init() {
    this.setupNotes();
  }

  setupNotes() {
    const textarea = document.getElementById('gmnotes-textarea');
    const saveBtn = document.getElementById('gmnotes-save');
    const clearBtn = document.getElementById('gmnotes-clear');
    const toolbarBtns = document.querySelectorAll('.gmnotes-toolbar-btn[data-format]');
    const newSessionBtn = document.querySelector('.gmnotes-session-new');

    if (textarea) {
      textarea.addEventListener('input', () => this.triggerAutoSave());
      this.loadCurrentSession();
    }

    if (saveBtn) saveBtn.addEventListener('click', () => this.saveNotes());
    if (clearBtn) clearBtn.addEventListener('click', () => this.clearNotes());
    
    toolbarBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.formatText(btn.dataset.format);
      });
    });

    if (newSessionBtn) {
      newSessionBtn.addEventListener('click', () => this.showNewSessionInput());
    }
  }

  showNewSessionInput() {
    if (this.sessionInputActive) return;

    const container = document.querySelector('.gmnotes-sessions-list');
    if (!container) return;

    this.sessionInputActive = true;

    // Esconde o botão "Nova Sessão" temporariamente
    const newBtn = container.querySelector('.gmnotes-session-new');
    if (newBtn) newBtn.style.display = 'none';

    // Cria input para nome da sessão
    const inputHtml = `
      <div class="gmnotes-session-input-container">
        <input type="text" class="gmnotes-session-input" placeholder="Nome da sessão..." maxlength="50">
        <div class="gmnotes-session-input-actions">
          <button class="gmnotes-session-confirm">✓</button>
          <button class="gmnotes-session-cancel">✕</button>
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', inputHtml);

    const input = container.querySelector('.gmnotes-session-input');
    const confirmBtn = container.querySelector('.gmnotes-session-confirm');
    const cancelBtn = container.querySelector('.gmnotes-session-cancel');

    input.focus();

    const cleanup = () => {
      container.querySelector('.gmnotes-session-input-container')?.remove();
      if (newBtn) newBtn.style.display = '';
      this.sessionInputActive = false;
    };

    confirmBtn.addEventListener('click', () => {
      const name = input.value.trim();
      if (name) {
        this.createNewSession(name);
        cleanup();
      }
    });

    cancelBtn.addEventListener('click', cleanup);

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const name = input.value.trim();
        if (name) {
          this.createNewSession(name);
          cleanup();
        }
      } else if (e.key === 'Escape') {
        cleanup();
      }
    });
  }

  triggerAutoSave() {
    if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
    this.autoSaveTimer = setTimeout(() => this.saveNotes(true), 2000);
  }

  saveNotes(auto = false) {
    const textarea = document.getElementById('gmnotes-textarea');
    if (!textarea) return;

    const content = textarea.value;
    
    if (this.currentSession) {
      const session = this.sessions.find(s => s.name === this.currentSession);
      if (session) session.content = content;
    } else {
      localStorage.setItem('gmnotes_draft', content);
    }
    
    this.parent.saveToStorage();
    
    const status = document.getElementById('gmnotes-status');
    if (status) {
      status.textContent = auto ? 'Salvo' : 'Notas salvas!';
      setTimeout(() => { status.textContent = 'Pronto'; }, 2000);
    }
  }

  clearNotes() {
    const container = document.querySelector('.gmnotes-sessions-list');
    if (!container) return;

    // Cria confirmação inline
    const confirmHtml = `
      <div class="gmnotes-confirmation-box" style="margin-top: 0.5rem;">
        <div class="gmnotes-confirmation-message">Limpar todas as notas?</div>
        <div class="gmnotes-confirmation-actions">
          <button class="gmnotes-confirm-btn" id="clear-yes">Sim</button>
          <button class="gmnotes-cancel-btn" id="clear-no">Cancelar</button>
        </div>
      </div>
    `;

    const existingConfirm = container.querySelector('.gmnotes-confirmation-box');
    if (existingConfirm) existingConfirm.remove();

    container.insertAdjacentHTML('beforeend', confirmHtml);

    const confirmYes = document.getElementById('clear-yes');
    const confirmNo = document.getElementById('clear-no');

    const cleanup = () => {
      container.querySelector('.gmnotes-confirmation-box')?.remove();
    };

    confirmYes.addEventListener('click', () => {
      document.getElementById('gmnotes-textarea').value = '';
      this.saveNotes();
      cleanup();
    });

    confirmNo.addEventListener('click', cleanup);
  }

  formatText(format) {
    const textarea = document.getElementById('gmnotes-textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    let formatted = '';

    switch(format) {
      case 'bold': formatted = `**${selected}**`; break;
      case 'italic': formatted = `*${selected}*`; break;
      case 'underline': formatted = `_${selected}_`; break;
      case 'list': formatted = selected.split('\n').map(line => `- ${line}`).join('\n'); break;
    }

    textarea.value = textarea.value.substring(0, start) + formatted + textarea.value.substring(end);
    textarea.focus();
    textarea.setSelectionRange(start + formatted.length, start + formatted.length);
  }

  loadCurrentSession() {
    const textarea = document.getElementById('gmnotes-textarea');
    if (textarea) {
      const draft = localStorage.getItem('gmnotes_draft');
      if (draft) textarea.value = draft;
    }
  }

  createNewSession(name) {
    this.sessions.push({
      name: name,
      content: '',
      date: new Date().toISOString()
    });
    this.currentSession = name;
    document.getElementById('gmnotes-textarea').value = '';
    this.renderSessions();
    this.parent.saveToStorage();
  }

  loadSession(sessionName) {
    const session = this.sessions.find(s => s.name === sessionName);
    if (session) {
      this.currentSession = sessionName;
      document.getElementById('gmnotes-textarea').value = session.content || '';
    }
  }

  renderSessions() {
    const container = document.querySelector('.gmnotes-sessions-list');
    if (!container) return;

    const sessionButtons = this.sessions.map(s => 
      `<button class="gmnotes-session-item ${s.name === this.currentSession ? 'active' : ''}">${this.parent.escapeHtml(s.name)}</button>`
    ).join('');
    
    container.innerHTML = sessionButtons + '<button class="gmnotes-session-item gmnotes-session-new">+ Nova Sessão</button>';
    
    document.querySelectorAll('.gmnotes-session-item:not(.gmnotes-session-new)').forEach(btn => {
      btn.addEventListener('click', () => this.loadSession(btn.textContent));
    });

    const newBtn = document.querySelector('.gmnotes-session-new');
    if (newBtn) newBtn.addEventListener('click', () => this.showNewSessionInput());
  }

  loadFromStorage(data) {
    this.sessions = data.sessions || [];
    this.currentSession = data.currentSession || null;
  }

  getData() {
    return {
      sessions: this.sessions,
      currentSession: this.currentSession
    };
  }
}