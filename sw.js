// sw.js - Service Worker para Maeri RPG
const CACHE_NAME = 'maeri-rpg-v1.6';
const urlsToCache = [
  '/',
  '/index.html',
  '/data/manifest.json',
  '/css/base.css',
  '/css/floatingButtons.css',
  '/css/dice.css',
  '/css/toc.css',
  '/css/notpat.css',
  '/css/sheet.css',
  '/css/spells.css',
  '/js/notpad.js',
  '/js/modalLoader.js',
  '/icons/android-chrome-192x192.png',
  '/icons/android-chrome-512x512.png',  // ← VERIFIQUE SE EXISTE!
  '/icons/favicon-16x16.png',
  '/icons/favicon-32x32.png'
];

// Instalação
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ Cache aberto para Maeri RPG');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.log('⚠️ Erro ao cachear alguns arquivos:', error);
      })
  );
  self.skipWaiting();
});

// Ativação
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', event => {
  // Só cachear requisições GET
  if (event.request.method !== 'GET') return;
  
  // Ignorar requisições de API
  if (event.request.url.includes('/api/')) return;
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request)
          .then(response => {
            // Verifica se a resposta é válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clona a resposta para cache
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // Se offline e não tem cache, retorna página offline
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html');
            }
          });
      })
  );
});