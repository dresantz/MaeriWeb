// =========================
// Maeri RPG - Etapa 2: Complementos
// Gerencia a seleção do tipo de ser do personagem, estudos, técnicas marciais e estudos mágicos
// =========================

class ComplementosManager {
  constructor(previewElement) {
    this.previewElement = previewElement;
    this.seresData = null;
    this.estudosData = null;
    this.tecnicasData = null;
    this.magiasData = null;
    this.selectedSer = null;
    this.selectedEstudo = null;
    this.selectedTecnica = null;
    this.selectedMagia = null;
    
    // Caminhos dos dados (padronizados como relativos à raiz)
    this.DATA_PATHS = {
      SERES: '../data/rulebook/06-seres.json',
      PERSONAGEM: '../data/rulebook/02-personagem.json',
      SOCIAL: '../data/rulebook/05-circulo-social-comercio.json',
      MAGIA: '../data/rulebook/04-magia.json'
    };
  }

  render() {
    if (!this.previewElement) return;
    
    this.previewElement.innerHTML = `
      <div class="complementos-container">
        <!-- Seção de Seres -->
        <p class="complementos-intro">Escolha o tipo de ser do personagem:</p>
        
        <div class="seres-buttons" id="seres-buttons-container">
          <div class="loading-state">
            <span class="spinner"></span>
            <span>Carregando seres...</span>
          </div>
        </div>
        
        <div class="ser-details" id="ser-details-container" style="display: none;">
          <h3 class="ser-title"></h3>
          <div class="ser-caracteristicas"></div>
          <div class="ser-descricao"></div>
        </div>

        <!-- Seção de Estudos -->
        <div class="estudos-section" id="estudos-section">
          <p class="estudos-intro">Escolha onde gastar Aspectos</p>
          <p class="estudos-subtitle">Estudos</p>
          
          <div class="estudos-buttons" id="estudos-buttons-container">
            <div class="loading-state">
              <span class="spinner"></span>
              <span>Carregando estudos...</span>
            </div>
          </div>
          
          <div class="estudo-details" id="estudo-details-container" style="display: none;">
            <h3 class="estudo-title"></h3>
            <div class="estudo-descricao"></div>
            <div class="estudo-conhecimentos">
              <h4>Conhecimentos</h4>
              <div class="conhecimentos-list"></div>
            </div>
          </div>
        </div>

        <!-- Seção de Técnicas Marciais -->
        <div class="tecnicas-section" id="tecnicas-section">
          <p class="tecnicas-subtitle">Técnicas Marciais</p>
          
          <div class="tecnicas-buttons" id="tecnicas-buttons-container">
            <div class="loading-state">
              <span class="spinner"></span>
              <span>Carregando técnicas...</span>
            </div>
          </div>
          
          <div class="tecnica-details" id="tecnica-details-container" style="display: none;">
            <h3 class="tecnica-title"></h3>
            <div class="tecnica-descricao"></div>
          </div>
        </div>

        <!-- Seção de Estudos Mágicos -->
        <div class="magias-section" id="magias-section">
          <p class="magias-subtitle">Estudos Mágicos</p>
          
          <div class="magias-buttons" id="magias-buttons-container">
            <div class="loading-state">
              <span class="spinner"></span>
              <span>Carregando estudos mágicos...</span>
            </div>
          </div>
          
          <div class="magia-details" id="magia-details-container" style="display: none;">
            <h3 class="magia-title"></h3>
            <div class="magia-descricao"></div>
            <div class="magia-efeitos">
              <h4>Efeitos Menores</h4>
              <div class="efeitos-list"></div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Configura delegação de eventos
    this.setupEventDelegation();
    
    // Carrega todos os dados
    this.loadSeresData();
    this.loadEstudosData();
    this.loadTecnicasData();
    this.loadMagiasData();
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

  validateSelections() {
    const selections = {
      ser: this.selectedSer,
      estudo: this.selectedEstudo,
      tecnica: this.selectedTecnica,
      magia: this.selectedMagia
    };
    
    // Disparar evento com estado atual
    const event = new CustomEvent('complementos:updated', {
      detail: selections,
      bubbles: true
    });
    
    this.previewElement?.dispatchEvent(event);
    
    return selections;
  }

  setupEventDelegation() {
    if (!this.previewElement) return;
    
    this.previewElement.addEventListener('click', (event) => {
      const button = event.target.closest('.ser-button, .estudo-button, .tecnica-button, .magia-button');
      if (!button) return;
      
      if (button.classList.contains('ser-button')) {
        this.selectSer(button.dataset.serId);
      } else if (button.classList.contains('estudo-button')) {
        this.selectEstudo(button.dataset.estudoIndex);
      } else if (button.classList.contains('tecnica-button')) {
        this.selectTecnica(button.dataset.tecnicaIndex);
      } else if (button.classList.contains('magia-button')) {
        this.selectMagia(button.dataset.magiaIndex);
      }
    });
  }

  // ===== SERES =====
  async loadSeresData() {
    try {
      const response = await fetch(this.DATA_PATHS.SERES);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.sections || !Array.isArray(data.sections)) {
        throw new Error('Formato de dados inválido: sections não encontrada');
      }
      
      this.seresData = data.sections.filter(section => 
        section.topic_id !== 'o-que-sao-seres' && 
        section.topic_id !== 'introducao'
      );
      
      if (this.seresData.length === 0) {
        throw new Error('Nenhum ser encontrado');
      }
      
      this.renderSeresButtons();
    } catch (error) {
      console.error('Erro ao carregar dados dos seres:', error);
      this.showSectionError('seres-buttons-container', 'Erro ao carregar seres');
    }
  }

  renderSeresButtons() {
    const container = document.getElementById('seres-buttons-container');
    if (!container || !this.seresData) return;
    
    let buttonsHtml = '';
    this.seresData.forEach(ser => {
      buttonsHtml += `
        <button class="ser-button" data-ser-id="${ser.topic_id}">
          ${ser.title}
        </button>
      `;
    });
    
    container.innerHTML = buttonsHtml;
  }

  selectSer(serId) {
    const detailsContainer = document.getElementById('ser-details-container');
    const selectedButton = document.querySelector(`[data-ser-id="${serId}"]`);
    
    const isSameSer = this.selectedSer && this.selectedSer.topic_id === serId;
    
    if (isSameSer) {
      this.closeWithAnimation(detailsContainer, () => {
        this.selectedSer = null;
        this.validateSelections();
      });
      
      document.querySelectorAll('.ser-button').forEach(btn => {
        btn.classList.remove('selected');
      });
      
      return;
    }
    
    document.querySelectorAll('.ser-button').forEach(btn => {
      btn.classList.remove('selected');
    });
    
    if (selectedButton) {
      selectedButton.classList.add('selected');
    }
    
    this.selectedSer = this.seresData.find(ser => ser.topic_id === serId);
    this.renderSerDetails();
    this.validateSelections();
  }

  renderSerDetails() {
    if (!this.selectedSer) return;
    
    const detailsContainer = document.getElementById('ser-details-container');
    const titleElement = detailsContainer.querySelector('.ser-title');
    const caracteristicasElement = detailsContainer.querySelector('.ser-caracteristicas');
    const descricaoElement = detailsContainer.querySelector('.ser-descricao');
    
    const caracteristicasList = this.selectedSer.content.filter(item => item.id === 'seres_item');
    const descricao = this.selectedSer.content.find(item => item.item_descrip);
    
    titleElement.textContent = this.selectedSer.title;
    
    if (caracteristicasList.length > 0) {
      let caracteristicasHtml = '<h4>Características</h4>';
      
      caracteristicasList.forEach(item => {
        const textParts = item.text.split('. ');
        const titulo = textParts.length > 1 ? textParts[0] : 'Característica';
        const descricaoChar = textParts.length > 1 ? textParts.slice(1).join('. ') : item.text;
        
        caracteristicasHtml += `
          <div class="caracteristica-item">
            <strong>${titulo}:</strong> ${descricaoChar}
          </div>
        `;
      });
      
      caracteristicasElement.innerHTML = caracteristicasHtml;
    } else {
      caracteristicasElement.innerHTML = '';
    }
    
    if (descricao) {
      descricaoElement.innerHTML = `
        <h4>Descrição</h4>
        <p>${descricao.item_descrip || descricao.text}</p>
      `;
    } else {
      descricaoElement.innerHTML = '';
    }
    
    detailsContainer.style.display = 'block';
  }

  // ===== ESTUDOS =====
  async loadEstudosData() {
    try {
      const response = await fetch(this.DATA_PATHS.PERSONAGEM);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.sections || !Array.isArray(data.sections)) {
        throw new Error('Formato de dados inválido: sections não encontrada');
      }
      
      const estudosSection = data.sections.find(s => s.topic_id === 'estudo-e-conhecimento');
      
      if (!estudosSection) {
        throw new Error('Seção de estudos não encontrada');
      }
      
      this.processarEstudos(estudosSection.content);
      
      if (!this.estudosData || this.estudosData.length === 0) {
        throw new Error('Nenhum estudo encontrado');
      }
      
      this.renderEstudosButtons();
    } catch (error) {
      console.error('Erro ao carregar dados dos estudos:', error);
      this.showSectionError('estudos-buttons-container', 'Erro ao carregar estudos');
    }
  }

  isRegraGeral(texto) {
    if (!texto) return false;
    const textoLower = texto.toLowerCase();
    const regrasGerais = ['custo', 'xpm', 'teste', 'fonte', 'repouso'];
    return regrasGerais.some(regra => textoLower.includes(regra));
  }

  isNewEstudo(item) {
    return item.estudos_item && !this.isRegraGeral(item.estudos_item);
  }

  isConhecimento(item) {
    return item.id === 'estudos_item';
  }

  createEstudo(item) {
    return {
      nome: item.estudos_item,
      descricao: item.text,
      conhecimentos: []
    };
  }

  processarEstudos(content) {
    this.estudosData = [];
    let currentEstudo = null;
    
    content.forEach(item => {
      if (this.isNewEstudo(item)) {
        if (currentEstudo) {
          this.estudosData.push(currentEstudo);
        }
        currentEstudo = this.createEstudo(item);
      } else if (this.isConhecimento(item) && currentEstudo) {
        currentEstudo.conhecimentos.push(item.text);
      }
    });
    
    if (currentEstudo) {
      this.estudosData.push(currentEstudo);
    }
  }

  renderEstudosButtons() {
    const container = document.getElementById('estudos-buttons-container');
    if (!container || !this.estudosData) return;
    
    let buttonsHtml = '';
    this.estudosData.forEach((estudo, index) => {
      buttonsHtml += `
        <button class="estudo-button" data-estudo-index="${index}">
          ${estudo.nome}
        </button>
      `;
    });
    
    container.innerHTML = buttonsHtml;
  }

  selectEstudo(index) {
    const detailsContainer = document.getElementById('estudo-details-container');
    const selectedButton = document.querySelector(`[data-estudo-index="${index}"]`);
    
    const isSameEstudo = this.selectedEstudo && this.selectedEstudo.index === index;
    
    if (isSameEstudo) {
      this.closeWithAnimation(detailsContainer, () => {
        this.selectedEstudo = null;
        this.validateSelections();
      });
      
      document.querySelectorAll('.estudo-button').forEach(btn => {
        btn.classList.remove('selected');
      });
      
      return;
    }
    
    document.querySelectorAll('.estudo-button').forEach(btn => {
      btn.classList.remove('selected');
    });
    
    if (selectedButton) {
      selectedButton.classList.add('selected');
    }
    
    this.selectedEstudo = {
      index: index,
      data: this.estudosData[index]
    };
    
    this.renderEstudoDetails();
    this.validateSelections();
  }

  renderEstudoDetails() {
    if (!this.selectedEstudo) return;
    
    const detailsContainer = document.getElementById('estudo-details-container');
    const titleElement = detailsContainer.querySelector('.estudo-title');
    const descricaoElement = detailsContainer.querySelector('.estudo-descricao');
    const conhecimentosList = detailsContainer.querySelector('.conhecimentos-list');
    
    const estudo = this.selectedEstudo.data;
    
    titleElement.textContent = estudo.nome;
    descricaoElement.innerHTML = `<p>${estudo.descricao}</p>`;
    
    let conhecimentosHtml = '';
    estudo.conhecimentos.forEach(conhecimento => {
      const textParts = conhecimento.split('. ');
      const titulo = textParts.length > 1 ? textParts[0] : 'Conhecimento';
      const descricao = textParts.length > 1 ? textParts.slice(1).join('. ') : conhecimento;
      
      conhecimentosHtml += `
        <div class="conhecimento-item">
          <strong>${titulo}:</strong> ${descricao}
        </div>
      `;
    });
    
    conhecimentosList.innerHTML = conhecimentosHtml;
    detailsContainer.style.display = 'block';
  }

  // ===== TÉCNICAS MARCIAIS =====
  async loadTecnicasData() {
    try {
      const response = await fetch(this.DATA_PATHS.SOCIAL);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.sections || !Array.isArray(data.sections)) {
        throw new Error('Formato de dados inválido: sections não encontrada');
      }
      
      const tecnicasSection = data.sections.find(s => s.topic_id === 'tecnicas-marcais');
      
      if (!tecnicasSection) {
        throw new Error('Seção de técnicas marciais não encontrada');
      }
      
      const listaTecnicas = tecnicasSection.content.find(c => c.type === 'list' && c.id === 'tec_item');
      
      if (!listaTecnicas || !listaTecnicas.items) {
        throw new Error('Lista de técnicas não encontrada');
      }
      
      this.processarTecnicas(listaTecnicas.items);
      
      if (!this.tecnicasData || this.tecnicasData.length === 0) {
        throw new Error('Nenhuma técnica encontrada');
      }
      
      this.renderTecnicasButtons();
    } catch (error) {
      console.error('Erro ao carregar dados das técnicas marciais:', error);
      this.showSectionError('tecnicas-buttons-container', 'Erro ao carregar técnicas');
    }
  }

  processarTecnicas(items) {
    this.tecnicasData = items.map(item => {
      const firstDotIndex = item.indexOf('.');
      const titulo = item.substring(0, firstDotIndex).trim();
      const descricao = item.substring(firstDotIndex + 1).trim();
      
      return {
        titulo: titulo,
        descricao: descricao
      };
    });
  }

  renderTecnicasButtons() {
    const container = document.getElementById('tecnicas-buttons-container');
    if (!container || !this.tecnicasData) return;
    
    let buttonsHtml = '';
    this.tecnicasData.forEach((tecnica, index) => {
      buttonsHtml += `
        <button class="tecnica-button" data-tecnica-index="${index}">
          ${tecnica.titulo}
        </button>
      `;
    });
    
    container.innerHTML = buttonsHtml;
  }

  selectTecnica(index) {
    const detailsContainer = document.getElementById('tecnica-details-container');
    const selectedButton = document.querySelector(`[data-tecnica-index="${index}"]`);
    
    const isSameTecnica = this.selectedTecnica && this.selectedTecnica.index === index;
    
    if (isSameTecnica) {
      this.closeWithAnimation(detailsContainer, () => {
        this.selectedTecnica = null;
        this.validateSelections();
      });
      
      document.querySelectorAll('.tecnica-button').forEach(btn => {
        btn.classList.remove('selected');
      });
      
      return;
    }
    
    document.querySelectorAll('.tecnica-button').forEach(btn => {
      btn.classList.remove('selected');
    });
    
    if (selectedButton) {
      selectedButton.classList.add('selected');
    }
    
    this.selectedTecnica = {
      index: index,
      data: this.tecnicasData[index]
    };
    
    this.renderTecnicaDetails();
    this.validateSelections();
  }

  renderTecnicaDetails() {
    if (!this.selectedTecnica) return;
    
    const detailsContainer = document.getElementById('tecnica-details-container');
    const titleElement = detailsContainer.querySelector('.tecnica-title');
    const descricaoElement = detailsContainer.querySelector('.tecnica-descricao');
    
    const tecnica = this.selectedTecnica.data;
    
    titleElement.textContent = tecnica.titulo;
    descricaoElement.innerHTML = `<p>${tecnica.descricao}</p>`;
    
    detailsContainer.style.display = 'block';
  }

  // ===== ESTUDOS MÁGICOS =====
  async loadMagiasData() {
    try {
      const response = await fetch(this.DATA_PATHS.MAGIA);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.sections || !Array.isArray(data.sections)) {
        throw new Error('Formato de dados inválido: sections não encontrada');
      }
      
      // Lista de IDs dos Estudos Mágicos válidos
      const estudosMagicosValidos = [
        'neofita',
        'bruxaria',
        'divinacao',
        'feiticaria'
      ];
      
      // Filtra apenas as seções que são estudos mágicos
      this.magiasData = data.sections.filter(section => 
        estudosMagicosValidos.includes(section.topic_id)
      );
      
      if (this.magiasData.length === 0) {
        throw new Error('Nenhum estudo mágico encontrado');
      }
      
      this.renderMagiasButtons();
    } catch (error) {
      console.error('Erro ao carregar dados dos estudos mágicos:', error);
      this.showSectionError('magias-buttons-container', 'Erro ao carregar estudos mágicos');
    }
  }

  renderMagiasButtons() {
    const container = document.getElementById('magias-buttons-container');
    if (!container || !this.magiasData) return;
    
    let buttonsHtml = '';
    this.magiasData.forEach((magia, index) => {
      buttonsHtml += `
        <button class="magia-button" data-magia-index="${index}">
          ${magia.title}
        </button>
      `;
    });
    
    container.innerHTML = buttonsHtml;
  }

  selectMagia(index) {
    const detailsContainer = document.getElementById('magia-details-container');
    const selectedButton = document.querySelector(`[data-magia-index="${index}"]`);
    
    const isSameMagia = this.selectedMagia && this.selectedMagia.index === index;
    
    if (isSameMagia) {
      this.closeWithAnimation(detailsContainer, () => {
        this.selectedMagia = null;
        this.validateSelections();
      });
      
      document.querySelectorAll('.magia-button').forEach(btn => {
        btn.classList.remove('selected');
      });
      
      return;
    }
    
    document.querySelectorAll('.magia-button').forEach(btn => {
      btn.classList.remove('selected');
    });
    
    if (selectedButton) {
      selectedButton.classList.add('selected');
    }
    
    this.selectedMagia = {
      index: index,
      data: this.magiasData[index]
    };
    
    this.renderMagiaDetails();
    this.validateSelections();
  }

  renderMagiaDetails() {
    if (!this.selectedMagia) return;
    
    const detailsContainer = document.getElementById('magia-details-container');
    const titleElement = detailsContainer.querySelector('.magia-title');
    const descricaoElement = detailsContainer.querySelector('.magia-descricao');
    const efeitosList = detailsContainer.querySelector('.efeitos-list');
    
    const magia = this.selectedMagia.data;
    
    titleElement.textContent = magia.title;
    
    // Coleta todos os parágrafos de descrição (antes da lista de efeitos)
    const descricaoParagrafos = [];
    const efeitos = [];
    let encontrouEfeitos = false;
    
    magia.content.forEach(item => {
      if (item.type === 'paragraph' && !encontrouEfeitos) {
        if (item.text.includes('Efeitos Menores')) {
          encontrouEfeitos = true;
        } else {
          descricaoParagrafos.push(`<p>${item.text}</p>`);
        }
      } else if (item.type === 'list' && item.items) {
        efeitos.push(...item.items);
      }
    });
    
    descricaoElement.innerHTML = descricaoParagrafos.join('');
    
    let efeitosHtml = '';
    efeitos.forEach(efeito => {
      efeitosHtml += `
        <div class="efeito-item">
          ${efeito}
        </div>
      `;
    });
    
    efeitosList.innerHTML = efeitosHtml;
    detailsContainer.style.display = 'block';
  }
}

export default ComplementosManager;