/* Bighome escalas — service worker
   Guarda o app no celular. A escala em si NAO e cacheada aqui: ela vem do
   Apps Script e o proprio index guarda a ultima copia no localStorage. */

const CACHE = 'bighome-escalas-v7-2026-08-08';

const LOCAIS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './jspdf.umd.min.js',
  './icon-192.png',
  './icon-512.png',
  './topo-culto.jpg',
  './topo-manha.jpg',
  './rodape.jpg',
  './logo-branco.png',
  './CreatoDisplay-Regular.otf',
  './CreatoDisplay-Medium.otf',
  './CreatoDisplay-Black.otf'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(LOCAIS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  // as chamadas ao Apps Script nunca entram no cache: escala velha engana
  if(e.request.url.indexOf('script.google.com') >= 0) return;

  e.respondWith(
    fetch(e.request)
      .then(resp => {
        if(resp && resp.status === 200 && (resp.type === 'basic' || resp.type === 'cors')){
          const copia = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, copia)).catch(()=>{});
        }
        return resp;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
