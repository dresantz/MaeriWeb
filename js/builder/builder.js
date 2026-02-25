// =========================
// Maeri RPG - Builder Module
// Gerencia a página Área do Jogador
// =========================

class PlayerAreaManager {
  constructor() {
    this.tabButtons = document.querySelectorAll('.tab-button');
    this.tabPanels = document.querySelectorAll('.tab-panel');
    this.builderSteps = document.querySelectorAll('.builder-step');
    this.builderPreview = document.querySelector('.builder-preview');
    this.charCards = document.querySelectorAll('.char-card');
    this.charsCounter = document.querySelector('.chars-counter');
    
    this.init();
  }

  init() {
    this.setupTabs();
    this.setupBuilderSteps();
    this.setupCharCards();
    this.updateCharsCounter();
  }

  // ===== SISTEMA DE ABAS =====
  setupTabs() {
    this.tabButtons.forEach(button => {
      button.addEventListener('click', () => this.switchTab(button.id));
      
      // Suporte a teclado para acessibilidade
      button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.switchTab(button.id);
        }
      });
    });
  }

  switchTab(selectedId) {
    // Atualiza botões
    this.tabButtons.forEach(button => {
      const isSelected = button.id === selectedId;
      button.classList.toggle('active', isSelected);
      button.setAttribute('aria-selected', isSelected);
      
      // Habilita/desabilita foco para navegação por teclado
      if (isSelected) {
        button.removeAttribute('tabindex');
      } else {
        button.setAttribute('tabindex', '-1');
      }
    });

    // Atualiza painéis
    this.tabPanels.forEach(panel => {
      const isActive = panel.id === selectedId.replace('tab-', '') + '-panel';
      panel.classList.toggle('active', isActive);
      panel.setAttribute('aria-hidden', !isActive);
    });

    // Dispara evento customizado
    this.dispatchEvent('tab:changed', { tabId: selectedId });
  }

  // ===== CONSTRUTOR =====
  setupBuilderSteps() {
    this.builderSteps.forEach((step, index) => {
      step.addEventListener('click', () => this.handleBuilderStep(step));
      
      // Suporte a teclado
      step.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.handleBuilderStep(step);
        }
      });

      // Navegação entre etapas com setas
      step.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          const nextStep = this.builderSteps[index + 1] || this.builderSteps[0];
          nextStep.focus();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          const prevStep = this.builderSteps[index - 1] || this.builderSteps[this.builderSteps.length - 1];
          prevStep.focus();
        }
      });
    });
  }

  handleBuilderStep(step) {
    const stepNum = step.dataset.step;
    const stepTitle = step.querySelector('.step-title').textContent;
    
    // Remove active de todos os steps
    this.builderSteps.forEach(s => s.classList.remove('active'));
    
    // Adiciona active no step selecionado
    step.classList.add('active');
    
    // Atualiza preview
    this.updateBuilderPreview(stepNum, stepTitle);
    
    // Dispara evento
    this.dispatchEvent('builder:stepSelected', { 
      step: stepNum, 
      title: stepTitle 
    });
  }

  updateBuilderPreview(stepNum, stepTitle) {
    if (!this.builderPreview) return;
    
    const previewContent = this.createPreviewContent(stepNum, stepTitle);
    this.builderPreview.innerHTML = previewContent;
    
    // Animação de entrada
    this.builderPreview.style.animation = 'none';
    this.builderPreview.offsetHeight; // Reflow
    this.builderPreview.style.animation = 'fadeIn 0.3s ease';
  }

  createPreviewContent(stepNum, stepTitle) {
    const previews = {
      '1': {
        title: 'Mentalidade',
        description: 'Escolha sua essência, origem e arquétipo.',
        options: ['Bárbaro', 'Guerreiro', 'Paladino', 'Clérigo', 'Mago', 'Ladino']
      },
      '2': {
        title: 'Complementos',
        description: 'Aprimore suas habilidades com talentos e perícias.',
        options: ['Força', 'Destreza', 'Constituição', 'Inteligência', 'Sabedoria', 'Carisma']
      },
      '3': {
        title: 'Narrativa',
        description: 'Forje a história e os laços do seu personagem.',
        options: ['Antecedente', 'Ideais', 'Vínculos', 'Fraquezas']
      },
      '4': {
        title: 'Inventário',
        description: 'Equipe seu herói com armas, armaduras e itens.',
        options: ['Armas', 'Armaduras', 'Poções', 'Equipamento de Aventura']
      }
    };

    const preview = previews[stepNum] || previews['1'];
    
    return `
      <div class="preview-header">
        <h3 class="preview-title">Etapa ${stepNum}: ${preview.title}</h3>
        <p class="preview-description">${preview.description}</p>
      </div>
      <div class="preview-options">
        ${preview.options.map(opt => `
          <button class="preview-option" data-option="${opt}">
            <span class="option-icon">⚔️</span>
            <span class="option-name">${opt}</span>
          </button>
        `).join('')}
      </div>
    `;
  }

  // ===== PERSONAGENS =====
  setupCharCards() {
    this.charCards.forEach(card => {
      card.addEventListener('click', () => this.handleCharCard(card));
      
      // Prevenir clique em cards vazios (comportamento diferente)
      if (card.classList.contains('char-card--empty')) {
        card.addEventListener('click', (e) => this.handleEmptyCharCard(e, card));
      }
    });
  }

  handleCharCard(card) {
    if (card.classList.contains('char-card--empty')) {
      // Card vazio - criar novo personagem
      this.createNewCharacter();
    } else {
      // Card de personagem existente - selecionar/abrir
      this.selectCharacter(card);
    }
  }

  handleEmptyCharCard(e, card) {
    e.preventDefault();
    this.showNewCharacterModal();
  }

  createNewCharacter() {
    // Placeholder para criação de novo personagem
    console.log('Criar novo personagem');
    this.showToast('Funcionalidade de criação em desenvolvimento');
  }

  selectCharacter(card) {
    // Remove seleção anterior
    this.charCards.forEach(c => c.classList.remove('selected'));
    
    // Adiciona seleção no card atual
    card.classList.add('selected');
    
    // Pega dados do personagem
    const charData = this.extractCharData(card);
    
    // Dispara evento
    this.dispatchEvent('character:selected', charData);
    
    // Feedback visual
    this.showToast(`${charData.name || 'Personagem'} selecionado`);
  }

  extractCharData(card) {
    if (card.classList.contains('char-card--ready')) {
      return {
        name: card.querySelector('.char-name')?.textContent || 'Personagem',
        class: card.querySelector('.char-class')?.textContent || '',
        level: card.querySelector('.char-level')?.textContent || 'Nível 1',
        description: card.querySelector('.char-desc')?.textContent || '',
        type: 'ready'
      };
    }
    return { type: 'empty' };
  }

  updateCharsCounter() {
    if (!this.charsCounter) return;
    
    // Conta personagens salvos (não vazios)
    const savedChars = document.querySelectorAll('.saved-chars .char-card:not(.char-card--empty)');
    this.charsCounter.textContent = `${savedChars.length}/3`;
  }

  // ===== UTILITÁRIOS =====
  showNewCharacterModal() {
    // Placeholder para modal de criação
    const modal = document.createElement('div');
    modal.className = 'char-modal';
    modal.innerHTML = `
      <div class="char-modal-content">
        <h3>Criar Novo Personagem</h3>
        <p>Escolha como deseja criar:</p>
        <div class="modal-options">
          <button class="modal-option" data-type="builder">
            <span class="option-icon">🏗️</span>
            <span>Usar Construtor</span>
          </button>
          <button class="modal-option" data-type="quick">
            <span class="option-icon">⚡</span>
            <span>Criação Rápida</span>
          </button>
          <button class="modal-option" data-type="import">
            <span class="option-icon">📥</span>
            <span>Importar</span>
          </button>
        </div>
        <button class="modal-close">Fechar</button>
      </div>
    `;

    document.body.appendChild(modal);
    
    // Força reflow para animação
    modal.offsetHeight;
    modal.classList.add('active');

    // Event listeners
    modal.querySelector('.modal-close').addEventListener('click', () => {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
      }
    });
  }

  showToast(message, duration = 2000) {
    const toast = document.createElement('div');
    toast.className = 'builder-toast';
    toast.textContent = message;
    toast.setAttribute('role', 'alert');
    
    document.body.appendChild(toast);
    
    // Força reflow
    toast.offsetHeight;
    toast.classList.add('active');
    
    setTimeout(() => {
      toast.classList.remove('active');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  dispatchEvent(eventName, detail) {
    const event = new CustomEvent(eventName, { 
      detail, 
      bubbles: true,
      cancelable: true 
    });
    document.dispatchEvent(event);
  }

  // ===== NAVEGAÇÃO POR TECLADO =====
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Atalhos globais
      if (e.altKey) {
        switch(e.key) {
          case '1':
            e.preventDefault();
            this.switchTab('tab-builder');
            break;
          case '2':
            e.preventDefault();
            this.switchTab('tab-chars');
            break;
        }
      }
      
      // Fechar modal com ESC
      if (e.key === 'Escape') {
        const modal = document.querySelector('.char-modal.active');
        if (modal) {
          modal.classList.remove('active');
          setTimeout(() => modal.remove(), 300);
        }
      }
    });
  }
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
  // Aguarda modais carregarem (se necessário)
  if (document.readyState === 'complete') {
    new PlayerAreaManager();
  } else {
    window.addEventListener('load', () => new PlayerAreaManager());
  }
});

// Export para uso em outros módulos (se necessário)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PlayerAreaManager;
}

// Export default para ES Modules
export default PlayerAreaManager;

// Também manter para compatibilidade com CommonJS (opcional)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PlayerAreaManager;
}