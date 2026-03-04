// =========================
// Maeri RPG - Etapa 4: Inventário
// Gerencia a visualização de moedas, limites de peso e itens disponíveis por contato
// =========================

class InventarioManager {
  constructor(previewElement) {
    this.previewElement = previewElement;
    this.contatosData = null;
    this.selectedContato = null;
    
    // Caminhos dos dados padronizados
    this.DATA_PATHS = {
      SOCIAL: '../data/rulebook/05-circulo-social-comercio.json'
    };
  }

  render() {
    if (!this.previewElement) return;
    
    this.previewElement.innerHTML = `
      <div class="inventario-container">
        <!-- Informações de Moedas -->
        <div class="moedas-section">
          <h3 class="inventario-subtitle">Moedas</h3>
          <p class="moedas-text">As moedas são definidas da seguinte maneira:</p>
          
          <div class="moedas-grid">
            <div class="moeda-item">
              <span class="moeda-simbolo">Fo</span>
              <span class="moeda-nome">Florins de Ouro</span>
              <span class="moeda-calculo">I + 1d6</span>
              <span class="moeda-valor" id="moeda-florins">—</span>
            </div>
            <div class="moeda-item">
              <span class="moeda-simbolo">Dp</span>
              <span class="moeda-nome">Denares de Prata</span>
              <span class="moeda-calculo">V + 1d6</span>
              <span class="moeda-valor" id="moeda-denares">—</span>
            </div>
            <div class="moeda-item">
              <span class="moeda-simbolo">Tc</span>
              <span class="moeda-nome">Tostões de Cobre</span>
              <span class="moeda-calculo">S + 1d6</span>
              <span class="moeda-valor" id="moeda-tostoes">—</span>
            </div>
          </div>
        </div>

        <!-- Limites de Peso -->
        <div class="peso-section">
          <h3 class="inventario-subtitle">Limites de Peso</h3>
          <p class="peso-text">Os limites de peso médio e máximo são definidos assim:</p>
          
          <div class="peso-grid">
            <div class="peso-item">
              <span class="peso-tipo">Médio</span>
              <span class="peso-calculo">F x 2</span>
              <span class="peso-valor" id="peso-medio">—</span>
            </div>
            <div class="peso-item">
              <span class="peso-tipo">Máximo</span>
              <span class="peso-calculo">F x 4</span>
              <span class="peso-valor" id="peso-maximo">—</span>
            </div>
          </div>
        </div>

        <!-- Itens por Contato -->
        <div class="itens-contato-section">
          <h3 class="inventario-subtitle">Itens Disponíveis</h3>
          <p class="itens-intro">Os itens são adquiridos nas lojas de acordo com os Contatos escolhidos:</p>
          
          <div class="contatos-buttons" id="inventario-contatos-buttons-container">
            <div class="loading-state">
              <span class="spinner"></span>
              <span>Carregando contatos...</span>
            </div>
          </div>
          
          <div class="contato-details" id="inventario-contato-details-container" style="display: none;">
            <h3 class="contato-title"></h3>
            <div class="contato-descricao"></div>
            <div class="contato-itens">
              <h4>Itens Disponíveis</h4>
              <div class="itens-list"></div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Configura delegação de eventos
    this.setupEventDelegation();
    
    // Carrega os dados dos contatos
    this.loadContatosData();
  }

  // ===== UTILITÁRIOS =====
  showSectionLoading(containerId, message) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
        <div class="loading-state">
          <span class="spinner"></span>
          <span>${message}</span>
        </div>
      `;
    }
  }

  showSectionError(containerId, message) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `<button class="error-button" disabled>${message}</button>`;
    }
  }

  closeWithAnimation(container, callback) {
    if (!container) return;
    
    container.classList.add('closing');
    
    setTimeout(() => {
      container.style.display = 'none';
      container.classList.remove('closing');
      if (callback) callback();
    }, 300);
  }

  setupEventDelegation() {
    if (!this.previewElement) return;
    
    this.previewElement.addEventListener('click', (event) => {
      const button = event.target.closest('[data-inventario-contato-index]');
      if (!button) return;
      
      this.selectContato(button.dataset.inventarioContatoIndex);
    });
  }

  // ===== CÁLCULOS =====
  rollD6() {
    return Math.floor(Math.random() * 6) + 1;
  }

  calcularMoedas(atributos) {
    const { inteligencia = 0, vontade = 0, sagacidade = 0 } = atributos;
    
    return {
      florins: inteligencia + this.rollD6(),
      denares: vontade + this.rollD6(),
      tostoes: sagacidade + this.rollD6()
    };
  }

  calcularPeso(forca = 0) {
    return {
      medio: forca * 2,
      maximo: forca * 4
    };
  }

  atualizarValores(atributos) {
    if (!this.previewElement) return;
    
    // Atualiza moedas
    const moedas = this.calcularMoedas(atributos);
    const florinsEl = document.getElementById('moeda-florins');
    const denaresEl = document.getElementById('moeda-denares');
    const tostoesEl = document.getElementById('moeda-tostoes');
    
    if (florinsEl) florinsEl.textContent = moedas.florins;
    if (denaresEl) denaresEl.textContent = moedas.denares;
    if (tostoesEl) tostoesEl.textContent = moedas.tostoes;
    
    // Atualiza peso
    const peso = this.calcularPeso(atributos.forca);
    const pesoMedioEl = document.getElementById('peso-medio');
    const pesoMaximoEl = document.getElementById('peso-maximo');
    
    if (pesoMedioEl) pesoMedioEl.textContent = peso.medio;
    if (pesoMaximoEl) pesoMaximoEl.textContent = peso.maximo;
  }

  // ===== INTEGRAÇÃO COM ETAPA 3 =====
  setSelectedContatos(contatosSelecionados) {
    if (!contatosSelecionados?.contato || !this.contatosData) return;
    
    const index = this.contatosData.findIndex(
      c => c.nome === contatosSelecionados.contato.data.nome
    );
    
    if (index !== -1) {
      this.selectContato(index);
    }
  }

  // ===== CONTATOS =====
  encontrarContato(item, tiposContato) {
    for (const tipo of tiposContato) {
      if (item[tipo.campo]) {
        return { 
          tipo, 
          nome: item[tipo.campo].replace('.', '').trim() 
        };
      }
    }
    return null;
  }

  ehListaItens(item, currentContato) {
    return item.type === 'list' && 
           currentContato && 
           item.id === currentContato.tipo.idLista;
  }

  criarContato(contatoInfo, item) {
    return {
      nome: contatoInfo.nome,
      descricao: item.text,
      tipo: contatoInfo.tipo
    };
  }

  finalizarContato(currentContato, currentItems, section) {
    if (currentContato && currentItems.length > 0) {
      this.contatosData.push({
        id: `${section?.id || 'contato'}-${currentContato.nome.toLowerCase().replace(/\s+/g, '-')}`,
        nome: currentContato.nome,
        descricao: currentContato.descricao,
        itens: [...currentItems]
      });
    }
  }

  processarSectionContatos(section, tiposContato) {
    let currentContato = null;
    let currentItems = [];
    
    section.content.forEach(item => {
      const contatoInfo = this.encontrarContato(item, tiposContato);
      
      if (contatoInfo) {
        this.finalizarContato(currentContato, currentItems, section);
        currentContato = this.criarContato(contatoInfo, item);
        currentItems = [];
      } else if (this.ehListaItens(item, currentContato)) {
        currentItems = [...currentItems, ...item.items];
      }
    });
    
    this.finalizarContato(currentContato, currentItems, section);
  }

  async loadContatosData() {
    try {
      const response = await fetch(this.DATA_PATHS.SOCIAL);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.sections || !Array.isArray(data.sections)) {
        throw new Error('Formato de dados inválido: sections não encontrada');
      }
      
      this.contatosData = [];
      
      // Mapeamento de tipos de contato e seus respectivos campos
      const tiposContato = [
        { campo: 'lojacomb_item', idLista: 'lojacomb_item' },
        { campo: 'lojarc_item', idLista: 'lojarc_item' },
        { campo: 'montarias_item', idLista: 'montarias_item' }
      ];
      
      data.sections
        .filter(section => !section.topic_id.includes('introducao'))
        .forEach(section => this.processarSectionContatos(section, tiposContato));
      
      if (this.contatosData.length === 0) {
        throw new Error('Nenhum contato encontrado');
      }
      
      this.renderContatosButtons();
    } catch (error) {
      console.error('Erro ao carregar dados dos contatos:', error);
      this.showSectionError('inventario-contatos-buttons-container', 'Erro ao carregar contatos');
    }
  }

  renderContatosButtons() {
    const container = document.getElementById('inventario-contatos-buttons-container');
    if (!container || !this.contatosData || this.contatosData.length === 0) return;
    
    let buttonsHtml = '';
    this.contatosData.forEach((contato, index) => {
      buttonsHtml += `
        <button class="contato-button" data-inventario-contato-index="${index}">
          ${contato.nome}
        </button>
      `;
    });
    
    container.innerHTML = buttonsHtml;
  }

  selectContato(index) {
    const detailsContainer = document.getElementById('inventario-contato-details-container');
    const selectedButton = document.querySelector(`[data-inventario-contato-index="${index}"]`);
    
    const isSameContato = this.selectedContato && this.selectedContato.index === index;
    
    if (isSameContato) {
      this.closeWithAnimation(detailsContainer, () => {
        this.selectedContato = null;
      });
      
      document.querySelectorAll('[data-inventario-contato-index]').forEach(btn => {
        btn.classList.remove('selected');
      });
      
      return;
    }
    
    document.querySelectorAll('[data-inventario-contato-index]').forEach(btn => {
      btn.classList.remove('selected');
    });
    
    if (selectedButton) {
      selectedButton.classList.add('selected');
    }
    
    this.selectedContato = {
      index: index,
      data: this.contatosData[index]
    };
    
    this.renderContatoDetails();
  }

  renderContatoDetails() {
    if (!this.selectedContato) return;
    
    const detailsContainer = document.getElementById('inventario-contato-details-container');
    const titleElement = detailsContainer.querySelector('.contato-title');
    const descricaoElement = detailsContainer.querySelector('.contato-descricao');
    const itensList = detailsContainer.querySelector('.itens-list');
    
    const contato = this.selectedContato.data;
    
    titleElement.textContent = contato.nome;
    descricaoElement.innerHTML = `<p>${contato.descricao}</p>`;
    
    let itensHtml = '';
    contato.itens.forEach(item => {
      itensHtml += `
        <div class="item-lista">
          ${item}
        </div>
      `;
    });
    
    itensList.innerHTML = itensHtml;
    detailsContainer.style.display = 'block';
  }
}

export default InventarioManager;