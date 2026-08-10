/* Hardmango Bass Lab — service worker
   หน้าที่เดียว: เก็บไฟล์ไว้ในเครื่องเพื่อให้เปิดใช้ได้แม้ไม่มีเน็ต
   เปลี่ยนเลข CACHE ทุกครั้งที่อัปเวอร์ชันใหม่ เพื่อให้เบราว์เซอร์โหลดของใหม่ */
const CACHE = 'hardmango-v7.0';
const FILES = ['./', './index.html', './manifest.json'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES).catch(() => {})));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  /* เอาของใหม่ก่อน ถ้าเน็ตล่มค่อยใช้ของที่เก็บไว้ */
  e.respondWith(
    fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
