// js/shield/gm-sectionnotes.js

export class GMSectionNotes {
  constructor(parent) {
    this.parent = parent;
    this.sessions = [];
    this.currentSession = null;
    this.autoSaveTimer = null;
  }

  init() {
    this.setupNotes();
  }

  setupNotes() {
    const textarea = document.getElementById('gmnotes-textarea');
    const saveBtn = document.getElementById('gmnotes-save');
    const clearBtn = document.getElementById('gmnotes-clear');
    const toolbarBtns = document.querySelectorAll('.gmnotes-toolbar-btn[data-format]');
    const sessionBtns = document.querySelectorAll('.gmnotes-session-item:not(.gmnotes-session-new)');
    const newSessionBtn = document.querySelector('.gmnotes-session-new');

    if (textarea) {
      textarea.addEventListener('input', () => {
        this.triggerAutoSave();
      });

      this.loadCurrentSession();
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveNotes());
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearNotes());
    }

    toolbarBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.formatText(btn.dataset.format);
      });
    });

    sessionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.loadSession(btn.textContent);
      });
    });

    if (newSessionBtn) {
      newSessionBtn.addEventListener('click', () => {
        this.createNewSession();
      });
    }
  }

  triggerAutoSave() {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
    
    this.autoSaveTimer = setTimeout(() => {
      this.saveNotes(true);
    }, 2000);
  }

  saveNotes(auto = false) {
    const textarea = document.getElementById('gmnotes-textarea');
    if (textarea) {
      const content = textarea.value;
      
      if (this.currentSession) {
        const session = this.sessions.find(s => s.name === this.currentSession);
        if (session) {
          session.content = content;
        }
      } else {
        localStorage.setItem('gmnotes_draft', content);
      }
      
      this.parent.saveToStorage();
      
      const status = document.getElementById('gmnotes-status');
      if (status) {
        status.textContent = auto ? 'Salvo automaticamente' : 'Notas salvas!';
        setTimeout(() => {
          status.textContent = 'Pronto';
        }, 2000);
      }
    }
  }

  clearNotes() {
    if (confirm('Limpar todas as notas?')) {
      document.getElementById('gmnotes-textarea').value = '';
      this.saveNotes();
    }
  }

  formatText(format) {
    const textarea = document.getElementById('gmnotes-textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    let formatted = '';

    switch(format) {
      case 'bold':
        formatted = `**${selected}**`;
        break;
      case 'italic':
        formatted = `*${selected}*`;
        break;
      case 'underline':
        formatted = `_${selected}_`;
        break;
      case 'list':
        formatted = selected.split('\n').map(line => `- ${line}`).join('\n');
        break;
    }

    textarea.value = textarea.value.substring(0, start) + formatted + textarea.value.substring(end);
    textarea.focus();
    textarea.setSelectionRange(start + formatted.length, start + formatted.length);
  }

  loadCurrentSession() {
    const textarea = document.getElementById('gmnotes-textarea');
    if (textarea) {
      const draft = localStorage.getItem('gmnotes_draft');
      if (draft) {
        textarea.value = draft;
      }
    }
  }

  createNewSession() {
    const name = prompt('Nome da nova sessão:');
    if (name) {
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
      btn.addEventListener('click', () => {
        this.loadSession(btn.textContent);
      });
    });

    const newBtn = document.querySelector('.gmnotes-session-new');
    if (newBtn) {
      newBtn.addEventListener('click', () => {
        this.createNewSession();
      });
    }
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