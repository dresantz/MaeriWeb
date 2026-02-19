// dice-pool.js - Lógica para pool de dados 3D individuais

class DicePool {
  constructor() {
    // Estado dos dados
    this.diceCounts = {
      d2: 0,
      d3: 0,
      d6: 0
    };
    
    this.dicePool = []; // Array para armazenar os dados no pool
    this.history = [];
    this.isRolling = false;
    
    // Configurações de rotação para cada face do D6
    this.faceRotations = {
      1: [-0.1, 0.3, -1],     // Face 1 - front
      2: [-0.1, 0.6, -0.4],   // Face 2 - up
      3: [-0.85, -0.42, 0.73], // Face 3 - left
      4: [-0.8, 0.3, -0.75],  // Face 4 - right
      5: [0.3, 0.45, 0.9],    // Face 5 - bottom
      6: [-0.16, 0.6, 0.18]   // Face 6 - back
    };
    
    // Rotação padrão - face 1
    this.defaultRotation = { 
      x: this.faceRotations[1][0], 
      y: this.faceRotations[1][1], 
      z: this.faceRotations[1][2] 
    };
    
    this.init();
  }
  
  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
    } else {
      this.setupEventListeners();
    }
    
    document.addEventListener('modals:loaded', () => {
      console.log('modals:loaded - reinicializando dice-pool');
      this.setupEventListeners();
    });
  }
  
  setupEventListeners() {
    if (!this.checkElements()) return;
    
    console.log('Configurando dice-pool.js com animação contínua');
    
    document.querySelectorAll('.dice-btn[data-sides]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
          const sides = parseInt(btn.dataset.sides);
          this.addDiceToPool(sides);
        }
      });
    });
    
    const rollBtn = document.getElementById('roll-button');
    if (rollBtn) {
      rollBtn.addEventListener('click', () => this.rollDice());
    }
    
    const clearAllBtn = document.getElementById('clear-all');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => this.clearPool());
    }
    
    const clearHistoryBtn = document.getElementById('clear-history');
    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener('click', () => this.clearHistory());
    }
  }
  
  checkElements() {
    const elements = [
      'dice-pool',
      'count-d2',
      'count-d3', 
      'count-d6',
      'result-output',
      'total-output',
      'history-output'
    ];
    
    for (const id of elements) {
      if (!document.getElementById(id)) {
        console.log(`Elemento #${id} não encontrado`);
        return false;
      }
    }
    
    return true;
  }
  
  addDiceToPool(sides) {
    switch(sides) {
      case 2:
        this.diceCounts.d2++;
        break;
      case 3:
        this.diceCounts.d3++;
        break;
      case 6:
        this.diceCounts.d6++;
        break;
      default:
        return;
    }
    
    const newDice = {
      sides: sides,
      value: null,
      id: 'dice-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      rotation: { ...this.defaultRotation }
    };
    
    this.dicePool.push(newDice);
    this.updateCounters();
    this.renderPool();
  }
  
  removeDiceFromPool(id) {
    const index = this.dicePool.findIndex(dice => dice.id === id);
    if (index !== -1) {
      const dice = this.dicePool[index];
      
      switch(dice.sides) {
        case 2:
          this.diceCounts.d2--;
          break;
        case 3:
          this.diceCounts.d3--;
          break;
        case 6:
          this.diceCounts.d6--;
          break;
      }
      
      this.dicePool.splice(index, 1);
      this.updateCounters();
      this.renderPool();
    }
  }
  
  clearPool() {
    this.dicePool = [];
    this.diceCounts = { d2: 0, d3: 0, d6: 0 };
    this.updateCounters();
    this.renderPool();
    
    document.getElementById('result-output').textContent = '—';
    document.getElementById('total-output').textContent = '—';
  }
  
  updateCounters() {
    document.getElementById('count-d2').textContent = this.diceCounts.d2;
    document.getElementById('count-d3').textContent = this.diceCounts.d3;
    document.getElementById('count-d6').textContent = this.diceCounts.d6;
  }
  
    renderPool() {
    const poolContainer = document.getElementById('dice-pool');
    if (!poolContainer) return;
    
    poolContainer.innerHTML = '';
    
    if (this.dicePool.length === 0) {
        poolContainer.innerHTML = '<p class="empty-pool">Nenhum dado no pool</p>';
        return;
    }
    
    this.dicePool.forEach(dice => {
        const diceElement = document.createElement('div');
        diceElement.className = 'pool-dice-3d';
        diceElement.dataset.id = dice.id;
        
        if (dice.sides === 6) {
        let transformStyle;
        
        if (dice.value) {
            const rot = this.faceRotations[dice.value];
            transformStyle = `rotate3d(${rot[0]}, ${rot[1]}, ${rot[2]}, 180deg)`;
        } else {
            transformStyle = `rotate3d(${dice.rotation.x}, ${dice.rotation.y}, ${dice.rotation.z}, 180deg)`;
        }
        
        diceElement.innerHTML = `
        <div class="dice-3d" id="${dice.id}" data-value="${dice.value || ''}" style="transform: ${transformStyle};">
            <div class="dice-face-3d front"></div>
            <div class="dice-face-3d up"></div>
            <div class="dice-face-3d left"></div>
            <div class="dice-face-3d right"></div>
            <div class="dice-face-3d bottom"></div>
            <div class="dice-face-3d back"></div>
        </div>
        <div class="dice-info" style="position: relative; z-index: 10;">
            <span class="dice-sides">D${dice.sides}</span>
            ${dice.value ? `<span class="dice-value-badge">${dice.value}</span>` : ''}
        </div>
        <button class="remove-dice-3d" aria-label="Remover dado">✕</button>
        `;
        
        } else {
        diceElement.innerHTML = `
            <div class="simple-dice-3d">
            <span class="dice-symbol">D${dice.sides}</span>
            </div>
            <div class="dice-info">
            <span class="dice-sides">D${dice.sides}</span>
            ${dice.value ? `<span class="dice-value-badge">${dice.value}</span>` : ''}
            </div>
            <button class="remove-dice-3d" aria-label="Remover dado">✕</button>
        `;
        }
        
        poolContainer.appendChild(diceElement);
        
        // NOVO: Lógica de seleção ao clicar no dado
        diceElement.addEventListener('click', (e) => {
        // Se clicou no botão remover, não seleciona/deseleciona
        if (e.target.classList.contains('remove-dice-3d')) return;
        
        // Remove a classe selected de todos os dados
        document.querySelectorAll('.pool-dice-3d').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Adiciona a classe selected ao dado clicado
        diceElement.classList.add('selected');
        });
        
        // Evento para remover (modificado para não propagar)
        diceElement.querySelector('.remove-dice-3d').addEventListener('click', (e) => {
        e.stopPropagation(); // Impede que o clique no botão selecione o dado
        this.removeDiceFromPool(dice.id);
        });
    });
    }
  
  rollDice() {
    if (this.dicePool.length === 0) {
      alert('Adicione dados ao pool primeiro!');
      return;
    }
    
    if (this.isRolling) return;
    this.isRolling = true;
    
    this.setButtonsDisabled(true);
    
    // Gera os valores aleatórios para cada dado
    const results = this.dicePool.map(dice => {
      const value = Math.floor(Math.random() * dice.sides) + 1;
      dice.value = value;
      return value;
    });
    
    const total = results.reduce((sum, val) => sum + val, 0);
    
    // Atualiza o resultado imediatamente
    document.getElementById('result-output').textContent = results.join(' + ');
    document.getElementById('total-output').textContent = total;
    
    // Anima cada dado D6 individualmente
    const d6Dice = this.dicePool.filter(d => d.sides === 6);
    let animatedCount = 0;
    
    if (d6Dice.length === 0) {
      this.finishRoll(results, total);
    } else {
      d6Dice.forEach(dice => {
        this.animateSingleDice(dice.id, dice.value, () => {
          animatedCount++;
          if (animatedCount === d6Dice.length) {
            this.finishRoll(results, total);
          }
        });
      });
    }
  }
  
    animateSingleDice(diceId, finalValue, callback) {
    const diceElement = document.getElementById(diceId);
    if (!diceElement) {
        callback();
        return;
    }

    // Pega o elemento pai .pool-dice-3d
    const poolDice = diceElement.closest('.pool-dice-3d');
    
    // Encontra os elementos de informação e esconde
    const diceInfo = poolDice.querySelector('.dice-info');
    
    if (diceInfo) diceInfo.style.opacity = '0';
    
    // Pega a rotação inicial atual
    const finalRotation = this.faceRotations[finalValue];
    
    // Cria uma animação personalizada com easing mais natural
    const animationName = `rollFluidTo${finalValue}_${Date.now()}`;
    const styleSheet = document.createElement('style');
    
    styleSheet.textContent = `
        @keyframes ${animationName} {
        0% {
            transform: rotate3d(${this.defaultRotation.x}, ${this.defaultRotation.y}, ${this.defaultRotation.z}, 180deg);
        }
        25% {
            transform: rotate3d(0.8, 0.8, 0.8, 360deg) translateY(-15px);
        }
        50% {
            transform: rotate3d(0.6, 1.2, 0.4, 540deg) translateY(-5px);
        }
        75% {
            transform: rotate3d(1.1, 0.7, 0.9, 720deg) translateY(-2px);
        }
        85% {
            transform: rotate3d(0.9, 1.1, 0.5, 900deg) translateY(-1px);
        }
        95% {
            transform: rotate3d(${finalRotation[0] * 1.1}, ${finalRotation[1] * 1.1}, ${finalRotation[2] * 1.1}, 1000deg) translateY(0);
        }
        100% {
            transform: rotate3d(${finalRotation[0]}, ${finalRotation[1]}, ${finalRotation[2]}, 180deg);
        }
        }
    `;
    
    document.head.appendChild(styleSheet);
    
    // Remove classes anteriores e animações
    diceElement.style.animation = 'none';
    diceElement.classList.remove('throw-dice');
    
    // Força reflow
    void diceElement.offsetWidth;
    
    // Aplica a animação personalizada com easing suave
    diceElement.style.animation = `${animationName} 1.2s cubic-bezier(0.25, 0.1, 0.15, 1) forwards`;
    
    // Aguarda a animação terminar
    setTimeout(() => {
        // Remove a animação e aplica a transformação final permanentemente
        diceElement.style.animation = '';
        diceElement.style.transform = `rotate3d(${finalRotation[0]}, ${finalRotation[1]}, ${finalRotation[2]}, 180deg)`;
        
        // Remove o style sheet criado
        document.head.removeChild(styleSheet);
        
        // NOVO: Mostra os badges novamente com maior z-index
        if (diceInfo) {
        diceInfo.style.opacity = '1';
        diceInfo.style.position = 'relative';
        diceInfo.style.zIndex = '20';
        }
        
        callback();
    }, 1200);
    }
  
  finishRoll(results, total) {
    const timestamp = new Date().toLocaleTimeString();
    const historyItem = `[${timestamp}] ${results.join(' + ')} = ${total}`;
    this.history.unshift(historyItem);
    
    if (this.history.length > 10) {
      this.history.pop();
    }
    
    this.updateHistory();
    this.renderPool();
    
    this.isRolling = false;
    this.setButtonsDisabled(false);
  }
  
  setButtonsDisabled(disabled) {
    const rollBtn = document.getElementById('roll-button');
    const clearBtn = document.getElementById('clear-all');
    const diceButtons = document.querySelectorAll('.dice-btn button');
    
    if (rollBtn) rollBtn.disabled = disabled;
    if (clearBtn) clearBtn.disabled = disabled;
    
    diceButtons.forEach(btn => {
      btn.disabled = disabled;
    });
  }
  
  updateHistory() {
    const historyList = document.getElementById('history-output');
    if (!historyList) return;
    
    historyList.innerHTML = this.history.map(item => `<li>${item}</li>`).join('');
  }
  
  clearHistory() {
    this.history = [];
    this.updateHistory();
  }
}

// Inicializa o DicePool
const dicePool = new DicePool();

// Exporta para uso em outros módulos (se necessário)
export default dicePool;