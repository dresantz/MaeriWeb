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
    
    // Configurações de rotação para cada face do dado
    this.faceRotations = {
      1: [-0.1, 0.3, -1],     // Face 1 - front
      2: [-0.1, 0.6, -0.4],   // Face 2 - up
      3: [-0.85, -0.42, 0.73], // Face 3 - left
      4: [-0.8, 0.3, -0.75],  // Face 4 - right
      5: [0.3, 0.45, 0.9],    // Face 5 - bottom
      6: [-0.16, 0.6, 0.18]   // Face 6 - back
    };

    // Configurações de rotação para D3
    this.d3FaceMappings = {
      1: 1,  // Face 1 → valor 1
      2: 1,  // Face 2 → valor 1
      3: 2,  // Face 3 → valor 2
      4: 2,  // Face 4 → valor 2
      5: 3,  // Face 5 → valor 3
      6: 3   // Face 6 → valor 3
    };

      this.d2FaceMappings = {
    1: 1,  // Face 1 → valor 1
    2: 1,  // Face 2 → valor 1
    3: 1,  // Face 3 → valor 1
    4: 2,  // Face 4 → valor 2
    5: 2,  // Face 5 → valor 2
    6: 2   // Face 6 → valor 2
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
      this.setupEventListeners();
    });
  }
  
  setupEventListeners() {
    if (!this.checkElements()) return;
    
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
      
      // DADO DE 6
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
      
      // DADO DE 3.
      } else if (dice.sides === 3) {
        let transformStyle;

      // Determina qual face mostrar baseado no valor (se existir)
      if (dice.value) {
        // Para D3, precisamos escolher uma das duas faces possíveis para aquele valor
        const possibleFaces = Object.keys(this.d3FaceMappings)
          .filter(face => this.d3FaceMappings[face] === dice.value);
        const randomIndex = Math.floor(Math.random() * possibleFaces.length);
        const faceToShow = parseInt(possibleFaces[randomIndex]);
        const rot = this.faceRotations[faceToShow];
        transformStyle = `rotate3d(${rot[0]}, ${rot[1]}, ${rot[2]}, 180deg)`;
      } else {
        transformStyle = `rotate3d(${dice.rotation.x}, ${dice.rotation.y}, ${dice.rotation.z}, 180deg)`;
      }        

      diceElement.innerHTML = `
        <div class="dice-3d d3" id="${dice.id}" data-value="${dice.value || ''}" style="transform: ${transformStyle};">
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
      
      // DADO DE 2.
      } else if (dice.sides === 2) {
            let transformStyle;

            // Determina qual face mostrar baseado no valor (se existir)
            if (dice.value) {
              // Para D2, escolhe uma das três faces possíveis para aquele valor
              const possibleFaces = Object.keys(this.d2FaceMappings)
                .filter(face => this.d2FaceMappings[face] === dice.value);
              const randomIndex = Math.floor(Math.random() * possibleFaces.length);
              const faceToShow = parseInt(possibleFaces[randomIndex]);
              const rot = this.faceRotations[faceToShow];
              transformStyle = `rotate3d(${rot[0]}, ${rot[1]}, ${rot[2]}, 180deg)`;
            } else {
              transformStyle = `rotate3d(${dice.rotation.x}, ${dice.rotation.y}, ${dice.rotation.z}, 180deg)`;
            }        

            diceElement.innerHTML = `
              <div class="dice-3d d2" id="${dice.id}" data-value="${dice.value || ''}" style="transform: ${transformStyle};">
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
            // Placeholder para outros dados (mantém como está)
            diceElement.innerHTML = `
              <div class="dice-placeholder">
                <span>D${dice.sides}</span>
              </div>
              <div class="dice-info">
                <span class="dice-sides">D${dice.sides}</span>
                ${dice.value ? `<span class="dice-value-badge">${dice.value}</span>` : ''}
              </div>
              <button class="remove-dice-3d" aria-label="Remover dado">✕</button>
            `;
          }
          
          poolContainer.appendChild(diceElement);
          
          // Eventos (iguais para todos - não mexer)
          diceElement.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-dice-3d')) return;
            
            document.querySelectorAll('.pool-dice-3d').forEach(el => {
              el.classList.remove('selected');
            });
            
            diceElement.classList.add('selected');
          });
          
          diceElement.querySelector('.remove-dice-3d').addEventListener('click', (e) => {
            e.stopPropagation();
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
      let value;
      if (dice.sides === 6) {
        value = Math.floor(Math.random() * 6) + 1;
      } else if (dice.sides === 3) {
        value = Math.floor(Math.random() * 3) + 1;
      // NOVO: Condição para D2
      } else if (dice.sides === 2) {
        value = Math.floor(Math.random() * 2) + 1; // 1 ou 2
      } else {
        value = Math.floor(Math.random() * dice.sides) + 1;
      }
      dice.value = value;
      return value;
    });
    
    const total = results.reduce((sum, val) => sum + val, 0);
    
    document.getElementById('result-output').textContent = results.join(' + ');
    document.getElementById('total-output').textContent = total;
    
    // Anima cada dado individualmente (já inclui D2)
    const diceToAnimate = this.dicePool.filter(d => d.sides === 6 || d.sides === 3 || d.sides === 2);
    let animatedCount = 0;
    
    if (diceToAnimate.length === 0) {
      this.finishRoll(results, total);
    } else {
      diceToAnimate.forEach(dice => {
        this.animateSingleDice(dice.id, dice.value, dice.sides, () => {
          animatedCount++;
          if (animatedCount === diceToAnimate.length) {
            this.finishRoll(results, total);
          }
        });
      });
    }
  }
  
  animateSingleDice(diceId, finalValue, sides, callback) {
    const diceElement = document.getElementById(diceId);
    if (!diceElement) {
      callback();
      return;
    }

    const poolDice = diceElement.closest('.pool-dice-3d');
    const diceInfo = poolDice.querySelector('.dice-info');
    
    if (diceInfo) diceInfo.style.opacity = '0';
    
    // Determina qual face física mostrar baseado no valor e tipo de dado
    let faceToShow;
    if (sides === 6) {
      faceToShow = finalValue; // D6: valor direto = face física

    } else if (sides === 3) {
      const possibleFaces = Object.keys(this.d3FaceMappings)
        .filter(face => this.d3FaceMappings[face] === finalValue);
      const randomIndex = Math.floor(Math.random() * possibleFaces.length);
      faceToShow = parseInt(possibleFaces[randomIndex]);

    } else if (sides === 2) {
      const possibleFaces = Object.keys(this.d2FaceMappings)
        .filter(face => this.d2FaceMappings[face] === finalValue);
      const randomIndex = Math.floor(Math.random() * possibleFaces.length);
      faceToShow = parseInt(possibleFaces[randomIndex]);
    }
    
    const finalRotation = this.faceRotations[faceToShow];
    const animationName = `rollTo${finalValue}_${Date.now()}`;
    const styleSheet = document.createElement('style');
    
    styleSheet.textContent = `
    @keyframes ${animationName} {
        0% { transform: rotate3d(${this.defaultRotation.x}, ${this.defaultRotation.y}, ${this.defaultRotation.z}, 180deg); }
        10% { transform: rotate3d(0.5, 0.8, 0.7, 270deg); }
        20% { transform: rotate3d(0.9, 0.7, 0.1, 360deg); }
        30% { transform: rotate3d(0.6, 1.0, 0.5, 450deg); }
        40% { transform: rotate3d(0.7, 1.1, 0.5, 540deg); }
        50% { transform: rotate3d(0.1, 0.9, 0.7, 630deg); }
        60% { transform: rotate3d(1.0, 0.1, 0.9, 720deg); }
        70% { transform: rotate3d(0.7, 1.0, 0.1, 810deg); }
        80% { transform: rotate3d(0.8, 0.2, 0.6, 900deg); }
        90% { transform: rotate3d(0.9, 0.1, 0.7, 990deg); }
        100% { transform: rotate3d(${finalRotation[0]}, ${finalRotation[1]}, ${finalRotation[2]}, 180deg); }
    }
    `;
    
    document.head.appendChild(styleSheet);
    
    diceElement.style.animation = 'none';
    void diceElement.offsetWidth;
    diceElement.style.animation = `${animationName} 1.2s cubic-bezier(0.25, 0.1, 0.15, 1) forwards`;
    
    setTimeout(() => {
      diceElement.style.animation = '';
      diceElement.style.transform = `rotate3d(${finalRotation[0]}, ${finalRotation[1]}, ${finalRotation[2]}, 180deg)`;
      
      document.head.removeChild(styleSheet);
      
      if (diceInfo) {
        diceInfo.style.opacity = '1';
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
export default dicePool;