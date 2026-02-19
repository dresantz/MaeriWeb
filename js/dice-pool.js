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
    // Estes valores foram extraídos do código original da internet
    this.faceRotations = {
      1: [-0.1, 0.3, -1],     // Face 1 - front
      2: [-0.1, 0.6, -0.4],   // Face 2 - up
      3: [-0.85, -0.42, 0.73], // Face 3 - left
      4: [-0.8, 0.3, -0.75],  // Face 4 - right
      5: [0.3, 0.45, 0.9],    // Face 5 - bottom
      6: [-0.16, 0.6, 0.18]   // Face 6 - back
    };
    
    // Rotação padrão - vou usar a face 1 como padrão
    // para não dar a impressão de que já está com um resultado
    this.defaultRotation = { 
      x: this.faceRotations[1][0], 
      y: this.faceRotations[1][1], 
      z: this.faceRotations[1][2] 
    };
    
    this.init();
  }
  
  init() {
    // Aguarda o DOM estar pronto
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
    } else {
      this.setupEventListeners();
    }
    
    // Escuta evento de modais carregados
    document.addEventListener('modals:loaded', () => {
      console.log('modals:loaded - reinicializando dice-pool');
      this.setupEventListeners();
    });
  }
  
  setupEventListeners() {
    // Verifica se os elementos existem
    if (!this.checkElements()) return;
    
    console.log('Configurando dice-pool.js com dados 3D individuais');
    
    // Botões de dados
    document.querySelectorAll('.dice-btn[data-sides]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Impede que o clique no contador ou área ao redor dispare múltiplas vezes
        if (e.target.tagName === 'BUTTON') {
          const sides = parseInt(btn.dataset.sides);
          this.addDiceToPool(sides);
        }
      });
    });
    
    // Botão de rolar
    const rollBtn = document.getElementById('roll-button');
    if (rollBtn) {
      rollBtn.addEventListener('click', () => this.rollDice());
    }
    
    // Botão limpar pool
    const clearAllBtn = document.getElementById('clear-all');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => this.clearPool());
    }
    
    // Botão limpar histórico
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
    // Incrementa o contador apropriado
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
    
    // Cria um novo dado com ID único
    const newDice = {
      sides: sides,
      value: null,
      id: 'dice-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      // Usa a rotação padrão (face 1) para todos os dados novos
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
      
      // Decrementa o contador apropriado
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
    
    // Limpa resultados
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
    
    // Limpa o container
    poolContainer.innerHTML = '';
    
    // Se não houver dados, mostra mensagem
    if (this.dicePool.length === 0) {
      poolContainer.innerHTML = '<p class="empty-pool">Nenhum dado no pool</p>';
      return;
    }
    
    // Renderiza cada dado no pool como um dado 3D
    this.dicePool.forEach(dice => {
      const diceElement = document.createElement('div');
      diceElement.className = 'pool-dice-3d';
      diceElement.dataset.id = dice.id;
      
      if (dice.sides === 6) {
        // Para D6, cria o dado 3D completo com rotação baseada no valor (se existir)
        let transformStyle;
        
        if (dice.value) {
          // Se já tem valor (após rolagem), usa a rotação da face correspondente
          const rot = this.faceRotations[dice.value];
          transformStyle = `rotate3d(${rot[0]}, ${rot[1]}, ${rot[2]}, 180deg)`;
        } else {
          // Se não tem valor (dado novo), usa rotação padrão
          transformStyle = `rotate3d(${dice.rotation.x}, ${dice.rotation.y}, ${dice.rotation.z}, 180deg)`;
        }
        
        diceElement.innerHTML = `
          <div class="dice-3d-wrapper">
            <div class="dice-3d" id="${dice.id}" data-value="${dice.value || ''}" style="transform: ${transformStyle};">
              <div class="dice-face-3d front"></div>
              <div class="dice-face-3d up"></div>
              <div class="dice-face-3d left"></div>
              <div class="dice-face-3d right"></div>
              <div class="dice-face-3d bottom"></div>
              <div class="dice-face-3d back"></div>
            </div>
          </div>
          <div class="dice-info">
            <span class="dice-sides">D${dice.sides}</span>
            ${dice.value ? `<span class="dice-value-badge">${dice.value}</span>` : ''}
          </div>
          <button class="remove-dice-3d" aria-label="Remover dado">✕</button>
        `;
        
        // Aplica a classe de cor vermelha (como no exemplo)
        setTimeout(() => {
          const dice3d = document.getElementById(dice.id);
          if (dice3d) dice3d.classList.add('red');
        }, 0);
        
      } else {
        // Para D2 e D3 (futuramente), representação simples por enquanto
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
      
      // Adiciona evento para remover
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
    
    // Desabilita botões durante a rolagem
    this.setButtonsDisabled(true);
    
    // Primeiro, rola todos os dados (define os valores)
    const results = this.dicePool.map(dice => {
      const value = Math.floor(Math.random() * dice.sides) + 1;
      dice.value = value;
      return value;
    });
    
    const total = results.reduce((sum, val) => sum + val, 0);
    
    // Anima cada dado D6 individualmente
    const d6Dice = this.dicePool.filter(d => d.sides === 6);
    let animatedCount = 0;
    
    if (d6Dice.length === 0) {
      // Se não tem D6, resolve direto
      this.finishRoll(results, total);
    } else {
      // Anima cada D6
      d6Dice.forEach(dice => {
        this.animateSingleDice(dice.id, dice.value, () => {
          animatedCount++;
          if (animatedCount === d6Dice.length) {
            // Todos os dados terminaram a animação
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
    
    // Remove classes anteriores
    diceElement.classList.remove('throw', 'rolling');
    
    // Força reflow para reiniciar animação
    void diceElement.offsetWidth;
    
    // Adiciona classe de rolagem
    diceElement.classList.add('throw');
    
    // Aguarda a animação terminar
    setTimeout(() => {
      diceElement.classList.remove('throw');
      
      // Aplica a rotação correspondente à face final
      const rotation = this.faceRotations[finalValue];
      if (rotation) {
        diceElement.style.transform = `rotate3d(${rotation[0]}, ${rotation[1]}, ${rotation[2]}, 180deg)`;
        
        // Log para debug
        console.log(`Dado ${diceId} - Valor ${finalValue} - Rotação:`, rotation);
      }
      
      callback();
    }, 1000); // 1 segundo para animação completa
  }
  
  finishRoll(results, total) {
    // Atualiza o resultado
    document.getElementById('result-output').textContent = results.join(' + ');
    document.getElementById('total-output').textContent = total;
    
    // Adiciona ao histórico
    const timestamp = new Date().toLocaleTimeString();
    const historyItem = `[${timestamp}] ${results.join(' + ')} = ${total}`;
    this.history.unshift(historyItem);
    
    // Mantém apenas os últimos 10 itens
    if (this.history.length > 10) {
      this.history.pop();
    }
    
    this.updateHistory();
    
    // Re-renderiza o pool para mostrar os badges de valor
    // e garantir que as rotações estão corretas
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