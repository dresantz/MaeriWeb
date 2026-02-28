// sheet.js - Controle da ficha de personagem com abas e limpar ficha

let isSheetOpen = false;
let currentPanel = 'complemento'; // painel ativo: complemento, narrativa, itens

function openSheet() {
  const modal = document.getElementById('sheet-modal');
  const overlay = document.getElementById('sheet-overlay');
  
  if (isSheetOpen || !modal || !overlay) return;
  
  isSheetOpen = true;
  modal.classList.add('active');
  overlay.classList.add('active');
  document.body.classList.add('no-scroll');
  loadSheetData();
  
  // Garantir que o painel correto está visível ao abrir
  switchPanel(currentPanel);
}

function closeSheet() {
  const modal = document.getElementById('sheet-modal');
  const overlay = document.getElementById('sheet-overlay');
  
  if (!isSheetOpen || !modal || !overlay) return;
  
  saveSheetData();
  
  isSheetOpen = false;
  modal.classList.remove('active');
  overlay.classList.remove('active');
  document.body.classList.remove('no-scroll');
}

// Função para trocar entre os painéis
function switchPanel(panelId) {
  const modal = document.getElementById('sheet-modal');
  if (!modal) return;
  
  // Atualizar variável global
  currentPanel = panelId;
  
  // Esconder todos os painéis
  const panels = ['complemento', 'narrativa', 'itens'];
  panels.forEach(id => {
    const panel = modal.querySelector(`#panel-${id}`);
    const tab = modal.querySelector(`#tab-${id}`);
    if (panel) panel.hidden = (id !== panelId);
    if (tab) tab.setAttribute('aria-expanded', (id === panelId) ? 'true' : 'false');
  });
}

function saveSheetData() {
  const modal = document.getElementById('sheet-modal');
  if (!modal) return;
  
  // Coletar todos os dados da ficha
  const data = {
    // Cabeçalho
    name: modal.querySelector('#char-name')?.value || '',
    level: modal.querySelector('#char-level')?.value || '1',
    
    // Atributos
    attributes: {
      f: modal.querySelector('#attr-f')?.value || '',
      v: modal.querySelector('#attr-v')?.value || '',
      d: modal.querySelector('#attr-d')?.value || '',
      s: modal.querySelector('#attr-s')?.value || '',
      i: modal.querySelector('#attr-i')?.value || '',
      a: modal.querySelector('#attr-a')?.value || ''
    },
    
    // Status Vitais
    vit: {
      current: modal.querySelector('#vit-current')?.value || '0',
      total: modal.querySelector('#vit-total')?.value || '0'
    },
    con: {
      current: modal.querySelector('#con-current')?.value || '0',
      total: modal.querySelector('#con-total')?.value || '0'
    },
    
    // Notas
    notas: modal.querySelector('#notas')?.value || '',
    
    // Painel Complemento
    complemento: {
      ser: modal.querySelector('#ser')?.value || '',
      estudos: modal.querySelector('#estudos')?.value || '',
      tecnicas: modal.querySelector('#tecnicas')?.value || '',
      magias: modal.querySelector('#magias')?.value || '',
      xp: {
        m: modal.querySelector('#xpm')?.value || '0',
        l: modal.querySelector('#xpl')?.value || '0',
        p: modal.querySelector('#xpp')?.value || '0'
      }
    },
    
    // Painel Narrativa
    narrativa: {
      arquetipo: modal.querySelector('#arquetipo')?.value || '',
      motivacao: modal.querySelector('#motivacao')?.value || '',
      disposicao: modal.querySelector('#disposicao')?.value || '',
      historia: modal.querySelector('#historia')?.value || '',
      contatos: modal.querySelector('#contatos')?.value || ''
    },
    
    // Painel Itens
    itens: {
      fo: modal.querySelector('#fo')?.value || '0',
      dp: modal.querySelector('#dp')?.value || '0',
      tc: modal.querySelector('#tc')?.value || '0',
      pesoFx2: modal.querySelector('#peso-fx2')?.value || '0',
      pesoFx4: modal.querySelector('#peso-fx4')?.value || '0',
      pesoTotal: modal.querySelector('#peso-total')?.value || '0',
      lista: modal.querySelector('#itens-lista')?.value || ''
    }
  };
  
  localStorage.setItem('maeri-sheet', JSON.stringify(data));
}

function loadSheetData() {
  const modal = document.getElementById('sheet-modal');
  if (!modal) return;
  
  const saved = localStorage.getItem('maeri-sheet');
  if (!saved) return;
  
  try {
    const data = JSON.parse(saved);
    
    // Função auxiliar para preencher campos
    const setValue = (selector, value) => {
      const field = modal.querySelector(selector);
      if (field) field.value = value || '';
    };
    
    // Cabeçalho
    setValue('#char-name', data.name);
    setValue('#char-level', data.level);
    
    // Atributos
    if (data.attributes) {
      setValue('#attr-f', data.attributes.f);
      setValue('#attr-v', data.attributes.v);
      setValue('#attr-d', data.attributes.d);
      setValue('#attr-s', data.attributes.s);
      setValue('#attr-i', data.attributes.i);
      setValue('#attr-a', data.attributes.a);
    }
    
    // Status Vitais
    if (data.vit) {
      setValue('#vit-current', data.vit.current);
      setValue('#vit-total', data.vit.total);
    }
    if (data.con) {
      setValue('#con-current', data.con.current);
      setValue('#con-total', data.con.total);
    }
    
    // Notas
    setValue('#notas', data.notas);
    
    // Painel Complemento
    if (data.complemento) {
      setValue('#ser', data.complemento.ser);
      setValue('#estudos', data.complemento.estudos);
      setValue('#tecnicas', data.complemento.tecnicas);
      setValue('#magias', data.complemento.magias);
      if (data.complemento.xp) {
        setValue('#xpm', data.complemento.xp.m);
        setValue('#xpl', data.complemento.xp.l);
        setValue('#xpp', data.complemento.xp.p);
      }
    }
    
    // Painel Narrativa
    if (data.narrativa) {
      setValue('#arquetipo', data.narrativa.arquetipo);
      setValue('#motivacao', data.narrativa.motivacao);
      setValue('#disposicao', data.narrativa.disposicao);
      setValue('#historia', data.narrativa.historia);
      setValue('#contatos', data.narrativa.contatos);
    }
    
    // Painel Itens
    if (data.itens) {
      setValue('#fo', data.itens.fo);
      setValue('#dp', data.itens.dp);
      setValue('#tc', data.itens.tc);
      setValue('#peso-fx2', data.itens.pesoFx2);
      setValue('#peso-fx4', data.itens.pesoFx4);
      setValue('#peso-total', data.itens.pesoTotal);
      setValue('#itens-lista', data.itens.lista);
    }
    
  } catch (e) {
    console.error('Erro ao carregar dados:', e);
  }
}

function clearSheet() {
  const modal = document.getElementById('sheet-modal');
  if (!modal) return;
  
  // Limpar todos os campos
  const allInputs = modal.querySelectorAll('input, textarea');
  allInputs.forEach(input => {
    if (input.type === 'number') {
      if (input.id.startsWith('attr-')) {
        input.value = '2';
      }
      else if (input.id === 'char-level') {
        input.value = '1';
      }
      else if (input.id === 'vit-total' || input.id === 'con-total') {
        input.value = '0';
      }
      else {
        input.value = '0';
      }
    } else {
      input.value = '';
    }
  });
  
  // Remover do localStorage
  localStorage.removeItem('maeri-sheet');
  
  // Esconder confirmação
  const confirmBox = document.getElementById('clear-confirmation');
  if (confirmBox) confirmBox.hidden = true;
}

function initSheet() {
  const modal = document.getElementById('sheet-modal');
  const sheetBtn = document.getElementById('sheet-button');
  const sheetClose = document.getElementById('sheet-close');
  const sheetOverlay = document.getElementById('sheet-overlay');
  
  // Botões de abrir/fechar
  if (sheetBtn) sheetBtn.addEventListener('click', openSheet);
  if (sheetClose) sheetClose.addEventListener('click', closeSheet);
  if (sheetOverlay) sheetOverlay.addEventListener('click', closeSheet);
  
  // Botões das abas
  if (modal) {
    const tabComplemento = modal.querySelector('#tab-complemento');
    const tabNarrativa = modal.querySelector('#tab-narrativa');
    const tabItens = modal.querySelector('#tab-itens');
    
    if (tabComplemento) tabComplemento.addEventListener('click', () => switchPanel('complemento'));
    if (tabNarrativa) tabNarrativa.addEventListener('click', () => switchPanel('narrativa'));
    if (tabItens) tabItens.addEventListener('click', () => switchPanel('itens'));
  }
  
  // Auto-save ao digitar
  document.addEventListener('input', (e) => {
    if (e.target.closest('#sheet-modal.active')) {
      saveSheetData();
    }
  });
  
  // Fechar com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isSheetOpen) closeSheet();
  });
  
  // Sistema de limpar ficha
  const clearBtn = document.getElementById('clear-sheet-button');
  const confirmBtn = document.getElementById('confirm-clear-sheet');
  const cancelBtn = document.getElementById('cancel-clear-sheet');
  const confirmBox = document.getElementById('clear-confirmation');
  
  if (clearBtn && confirmBtn && cancelBtn && confirmBox) {
    clearBtn.addEventListener('click', () => confirmBox.hidden = false);
    cancelBtn.addEventListener('click', () => confirmBox.hidden = true);
    confirmBtn.addEventListener('click', clearSheet);
  }

  // Botões Exportar/Importar
  const exportBtn = document.getElementById('export-sheet');
  const importBtn = document.getElementById('import-sheet');
  const importFile = document.getElementById('import-file');

  if (exportBtn) {
    exportBtn.addEventListener('click', exportCharacterSheet);
  }

  if (importBtn) {
    importBtn.addEventListener('click', importCharacterSheet);
  }

  if (importFile) {
    importFile.addEventListener('change', handleFileSelect);
  }

  // Função para salvar na Área do Jogador
  function saveToPlayerArea() {
    const modal = document.getElementById('sheet-modal');
    if (!modal) return;
    
    // Primeiro, salva o auto-save normal
    saveSheetData();
    
    // Carregar personagens existentes
    const characters = JSON.parse(localStorage.getItem('maeri-characters') || '{}');
    const characterCount = Object.keys(characters).length;
    
    // Verificar se já tem 3 personagens
    if (characterCount >= 3) {
      showSaveFeedback('Área do Jogador cheia! Remova um personagem.', 'error');
      return;
    }
    
    // Coletar dados atuais da ficha
    const currentData = getCurrentSheetData();
    
    // Gerar ID único para o personagem
    const characterId = 'char_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    
    // Criar objeto do personagem
    const character = {
      id: characterId,
      name: currentData.name || 'Personagem sem nome',
      lastModified: new Date().toISOString(),
      data: currentData
    };
    
    // Salvar no localStorage
    characters[characterId] = character;
    localStorage.setItem('maeri-characters', JSON.stringify(characters));
    
    // Mostrar feedback de sucesso
    showSaveFeedback('✅ Ficha Salva na Área do Jogador');
    
    // Opcional: Atualizar contador se a página da área do jogador estiver aberta
    updatePlayerAreaCounter();
  }

  // ===== EXPORTAR FICHA =====
  function exportCharacterSheet() {
    try {
      // Pegar dados atuais da ficha
      const currentData = getCurrentSheetData();
      
      // Adicionar metadados
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        app: 'Maeri RPG',
        data: currentData
      };
      
      // Converter para JSON formatado
      const jsonString = JSON.stringify(exportData, null, 2);
      
      // Criar nome do arquivo baseado no nome do personagem
      const fileName = currentData.name?.trim() 
        ? `${currentData.name.replace(/[^a-zA-Z0-9]/g, '_')}_maeri.json`
        : 'personagem_maeri.json';
      
      // Criar e baixar arquivo
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Mostrar feedback
      showExportImportFeedback('Ficha exportada com sucesso!', 'success');
      
    } catch (error) {
      console.error('Erro ao exportar:', error);
      showExportImportFeedback('Erro ao exportar ficha', 'error');
    }
  }

  // ===== IMPORTAR FICHA =====
  function importCharacterSheet() {
    // Disparar clique no input file
    document.getElementById('import-file')?.click();
  }

  function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Verificar extensão
    if (!file.name.toLowerCase().endsWith('.json')) {
      showExportImportFeedback('Arquivo deve ser .json', 'error');
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const importedData = JSON.parse(content);
        
        // Validar estrutura do arquivo
        if (!validateImportedData(importedData)) {
          showExportImportFeedback('Arquivo inválido ou corrompido', 'error');
          return;
        }
        
        // Extrair dados (pode ser formato simples ou com metadados)
        const sheetData = importedData.data || importedData;
        
        // Perguntar ao usuário se quer substituir
        confirmImport(sheetData);
        
      } catch (error) {
        console.error('Erro ao importar:', error);
        showExportImportFeedback('Erro ao ler arquivo', 'error');
      }
      
      // Limpar input para permitir importar o mesmo arquivo novamente
      event.target.value = '';
    };
    
    reader.readAsText(file);
  }

  function validateImportedData(data) {
    // Verificar se é um objeto
    if (!data || typeof data !== 'object') return false;
    
    // Se tiver metadados, verificar se tem data
    if (data.data) {
      return data.data && typeof data.data === 'object';
    }
    
    // Validação básica dos campos essenciais
    const hasRequiredFields = (
      data.name !== undefined ||
      data.level !== undefined ||
      data.attributes !== undefined ||
      data.vit !== undefined ||
      data.con !== undefined
    );
    
    return hasRequiredFields;
  }

  function confirmImport(importedData) {
    // Criar overlay de confirmação
    const overlay = document.createElement('div');
    overlay.className = 'dialog-overlay';
    
    const dialog = document.createElement('div');
    dialog.className = 'dialog-box';
    dialog.innerHTML = `
      <h3 class="dialog-title">Importar Ficha</h3>
      <p class="dialog-message">
        Deseja substituir a ficha atual pelos dados importados?
        ${importedData.name ? `<br><br><strong>Personagem: ${escapeHtml(importedData.name)}</strong>` : ''}
      </p>
      <div class="dialog-actions">
        <button class="dialog-button dialog-button--save">Importar</button>
        <button class="dialog-button dialog-button--cancel">Cancelar</button>
      </div>
    `;
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    const importBtn = dialog.querySelector('.dialog-button--save');
    const cancelBtn = dialog.querySelector('.dialog-button--cancel');
    
    importBtn.addEventListener('click', () => {
      // Aplicar dados importados à ficha
      applyImportedData(importedData);
      document.body.removeChild(overlay);
      showExportImportFeedback('Ficha importada com sucesso!', 'success');
    });
    
    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
  }

  function applyImportedData(data) {
    const modal = document.getElementById('sheet-modal');
    if (!modal) return;
    
    // Função auxiliar para preencher campos
    const setValue = (selector, value) => {
      const field = modal.querySelector(selector);
      if (field) {
        if (value !== undefined && value !== null) {
          field.value = value;
        }
      }
    };
    
    // Cabeçalho
    setValue('#char-name', data.name);
    setValue('#char-level', data.level);
    
    // Atributos
    if (data.attributes) {
      setValue('#attr-f', data.attributes.f);
      setValue('#attr-v', data.attributes.v);
      setValue('#attr-d', data.attributes.d);
      setValue('#attr-s', data.attributes.s);
      setValue('#attr-i', data.attributes.i);
      setValue('#attr-a', data.attributes.a);
    }
    
    // Status Vitais
    if (data.vit) {
      setValue('#vit-current', data.vit.current);
      setValue('#vit-total', data.vit.total);
    }
    if (data.con) {
      setValue('#con-current', data.con.current);
      setValue('#con-total', data.con.total);
    }
    
    // Notas
    setValue('#notas', data.notas);
    
    // Painel Complemento
    if (data.complemento) {
      setValue('#ser', data.complemento.ser);
      setValue('#estudos', data.complemento.estudos);
      setValue('#tecnicas', data.complemento.tecnicas);
      setValue('#magias', data.complemento.magias);
      if (data.complemento.xp) {
        setValue('#xpm', data.complemento.xp.m);
        setValue('#xpl', data.complemento.xp.l);
        setValue('#xpp', data.complemento.xp.p);
      }
    }
  
    // Painel Narrativa
    if (data.narrativa) {
      setValue('#arquetipo', data.narrativa.arquetipo);
      setValue('#motivacao', data.narrativa.motivacao);
      setValue('#disposicao', data.narrativa.disposicao);
      setValue('#historia', data.narrativa.historia);
      setValue('#contatos', data.narrativa.contatos);
    }
    
    // Painel Itens
    if (data.itens) {
      setValue('#fo', data.itens.fo);
      setValue('#dp', data.itens.dp);
      setValue('#tc', data.itens.tc);
      setValue('#peso-fx2', data.itens.pesoFx2);
      setValue('#peso-fx4', data.itens.pesoFx4);
      setValue('#peso-total', data.itens.pesoTotal);
      setValue('#itens-lista', data.itens.lista);
    }
    
    // Salvar auto-save
    saveSheetData();
    
    // Se houver um personagem ativo, atualizar na área do jogador
    const activeCharId = localStorage.getItem('maeri-active-character');
    if (activeCharId) {
      const characters = JSON.parse(localStorage.getItem('maeri-characters') || '{}');
      if (characters[activeCharId]) {
        characters[activeCharId].data = getCurrentSheetData();
        characters[activeCharId].lastModified = new Date().toISOString();
        localStorage.setItem('maeri-characters', JSON.stringify(characters));
        window.dispatchEvent(new CustomEvent('characters-updated'));
      }
    }
  }

  function showExportImportFeedback(message, type = 'success') {
    const feedback = document.getElementById('import-feedback');
    if (!feedback) return;
    
    feedback.textContent = message;
    feedback.className = 'import-feedback';
    feedback.classList.add(type);
    feedback.hidden = false;
    
    setTimeout(() => {
      feedback.hidden = true;
    }, 3000);
  }

  // Função auxiliar escapeHtml (se não existir)
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Função auxiliar para pegar dados atuais da ficha (reaproveitando saveSheetData)
  function getCurrentSheetData() {
    const modal = document.getElementById('sheet-modal');
    if (!modal) return {};
    
    return {
      name: modal.querySelector('#char-name')?.value || '',
      level: modal.querySelector('#char-level')?.value || '1',
      attributes: {
        f: modal.querySelector('#attr-f')?.value || '',
        v: modal.querySelector('#attr-v')?.value || '',
        d: modal.querySelector('#attr-d')?.value || '',
        s: modal.querySelector('#attr-s')?.value || '',
        i: modal.querySelector('#attr-i')?.value || '',
        a: modal.querySelector('#attr-a')?.value || ''
      },
      vit: {
        current: modal.querySelector('#vit-current')?.value || '0',
        total: modal.querySelector('#vit-total')?.value || '0'
      },
      con: {
        current: modal.querySelector('#con-current')?.value || '0',
        total: modal.querySelector('#con-total')?.value || '0'
      },
      notas: modal.querySelector('#notas')?.value || '',
      complemento: {
        ser: modal.querySelector('#ser')?.value || '',
        estudos: modal.querySelector('#estudos')?.value || '',
        tecnicas: modal.querySelector('#tecnicas')?.value || '',
        magias: modal.querySelector('#magias')?.value || '',
        xp: {
          m: modal.querySelector('#xpm')?.value || '0',
          l: modal.querySelector('#xpl')?.value || '0',
          p: modal.querySelector('#xpp')?.value || '0'
        }
      },
      narrativa: {
        arquetipo: modal.querySelector('#arquetipo')?.value || '',
        motivacao: modal.querySelector('#motivacao')?.value || '',
        disposicao: modal.querySelector('#disposicao')?.value || '',
        historia: modal.querySelector('#historia')?.value || '',
        contatos: modal.querySelector('#contatos')?.value || ''
      },
      itens: {
        fo: modal.querySelector('#fo')?.value || '0',
        dp: modal.querySelector('#dp')?.value || '0',
        tc: modal.querySelector('#tc')?.value || '0',
        pesoFx2: modal.querySelector('#peso-fx2')?.value || '0',
        pesoFx4: modal.querySelector('#peso-fx4')?.value || '0',
        pesoTotal: modal.querySelector('#peso-total')?.value || '0',
        lista: modal.querySelector('#itens-lista')?.value || ''
      }
    };
  }

  // Função para mostrar feedback
  function showSaveFeedback(message, type = 'success') {
    const feedback = document.getElementById('save-feedback');
    if (!feedback) return;
    
    feedback.textContent = message;
    feedback.className = 'save-feedback';
    if (type === 'error') {
      feedback.classList.add('error');
    }
    feedback.hidden = false;
    
    // Esconder após 3 segundos
    setTimeout(() => {
      feedback.hidden = true;
    }, 3000);
  }

  // Função para atualizar contador (opcional - via localStorage event)
  function updatePlayerAreaCounter() {
    // Disparar evento para a área do jogador saber que algo mudou
    window.dispatchEvent(new CustomEvent('characters-updated'));
  }


  const saveToAreaBtn = document.getElementById('save-to-player-area');
  if (saveToAreaBtn) {
    saveToAreaBtn.addEventListener('click', saveToPlayerArea);
  }
}

// Inicializar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSheet);
} else {
  initSheet();
}

document.addEventListener('modals:loaded', initSheet);