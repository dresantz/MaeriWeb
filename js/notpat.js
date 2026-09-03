/* =========================
   NotPat – Word Carousel
   Roleta Horizontal de Palavras
========================= */

document.addEventListener("DOMContentLoaded", () => {
  const notpatToggle = document.getElementById("notpat-toggle");
  const wordContainer = document.querySelector('.word-carousel-container');
  const notpatContent = document.getElementById("notpat-content");
  
  if (!notpatToggle || !wordContainer || !notpatContent) return;
  
  const wordItems = wordContainer.querySelectorAll('.word-item');
  const newsList = notpatContent.querySelector('.news-list');
  const patchList = notpatContent.querySelector('.patch-list');
  const aboutList = notpatContent.querySelector('.about-list');
  
  if (!newsList || !patchList || !aboutList || wordItems.length < 3) return;
  
  // Mapeamento das seções e palavras
  const sections = [
    { id: 'news', list: newsList, word: 'Notícias' },
    { id: 'patch', list: patchList, word: 'Patch Notes' },
    { id: 'about', list: aboutList, word: 'Sobre' }
  ];
  
  let currentIndex = 0;
  let isAnimating = false;
  
  function updateCarousel(animate = true) {
    if (isAnimating && animate) return;
    
    if (animate) {
      isAnimating = true;
      
      // FASE 1: Slide out para a esquerda
      wordContainer.style.opacity = '0';
      wordContainer.style.transform = 'translateX(-40px)';
      
      // FASE 2: Troca os textos
      setTimeout(() => {
        const leftIndex = (currentIndex - 1 + sections.length) % sections.length;
        const centerIndex = currentIndex;
        const rightIndex = (currentIndex + 1) % sections.length;
        
        wordItems.forEach(item => {
          const position = item.getAttribute('data-position');
          
          if (position === 'left') {
            item.textContent = sections[leftIndex].word;
          } else if (position === 'center') {
            item.textContent = sections[centerIndex].word;
          } else if (position === 'right') {
            item.textContent = sections[rightIndex].word;
          }
        });
        
        // Atualiza estado do botão
        notpatToggle.setAttribute("aria-pressed", currentIndex !== 0);
        
        // Esconde todas as seções
        sections.forEach(section => {
          section.list.style.display = 'none';
        });
        
        // Mostra a seção atual
        sections[currentIndex].list.style.display = 'block';
        
        // Prepara para entrada vindo da direita
        wordContainer.style.transition = 'none';
        wordContainer.style.transform = 'translateX(40px)';
        
        // FASE 3: Slide in da direita
        setTimeout(() => {
          wordContainer.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          wordContainer.style.opacity = '1';
          wordContainer.style.transform = 'translateX(0)';
          
          setTimeout(() => {
            isAnimating = false;
          }, 300);
          
        }, 50);
        
      }, 300);
      
    } else {
      // Inicialização sem animação
      const leftIndex = (currentIndex - 1 + sections.length) % sections.length;
      const centerIndex = currentIndex;
      const rightIndex = (currentIndex + 1) % sections.length;
      
      wordItems.forEach(item => {
        const position = item.getAttribute('data-position');
        
        if (position === 'left') {
          item.textContent = sections[leftIndex].word;
        } else if (position === 'center') {
          item.textContent = sections[centerIndex].word;
        } else if (position === 'right') {
          item.textContent = sections[rightIndex].word;
        }
      });
      
      sections.forEach(section => {
        section.list.style.display = 'none';
      });
      sections[currentIndex].list.style.display = 'block';
      
      // Garante que o container está visível
      wordContainer.style.opacity = '1';
      wordContainer.style.transform = 'translateX(0)';
    }
  }
  
  function nextWord() {
    if (isAnimating) return;
    currentIndex = (currentIndex + 1) % sections.length;
    updateCarousel();
  }
  
  // Evento de clique
  notpatToggle.addEventListener("click", nextWord);
  
  // Inicializa
  updateCarousel(false);
});