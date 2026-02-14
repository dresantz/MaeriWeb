// js/shield/gmnotes-loader.js
// Carrega o HTML do modal GM Notes

export async function loadGMNotesModal() {
  try {
    // Verifica se o modal já existe
    if (document.getElementById('gmnotes-modal')) {
      return;
    }

    // Carrega o arquivo HTML
    const response = await fetch('../pages/gmnotes-modal.html');
    const html = await response.text();
    
    // Cria um container temporário
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Adiciona o modal ao body
    const modal = temp.firstElementChild;
    document.body.appendChild(modal);
    
    console.log('GM Notes modal carregado com sucesso');
  } catch (error) {
    console.error('Erro ao carregar GM Notes modal:', error);
  }
}