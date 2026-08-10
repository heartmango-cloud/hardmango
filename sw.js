/* Hardmango Bass Lab — service worker
   หน้าที่: เก็บไฟล์ไว้ในเครื่องเพื่อให้เปิดใช้ได้แม้ไม่มีเน็ต
   เปลี่ยนเลข CACHE ทุกครั้งที่อัปเวอร์ชันใหม่ เพื่อให้เบราว์เซอร์โหลดของใหม่ */
const CACHE = 'hardmango-v7.1';
const FILES = ['./', './index.html', './manifest.json'];

/* ไฟล์เครื่องดนตรีจากภายนอก — ก้อนใหญ่และไม่มีวันเปลี่ยน
   จึงต้องใช้กติกา "เอาของที่เก็บไว้ก่อน" ไม่ใช่ "เอาของใหม่ก่อน"
   ไม่งั้นทุกครั้งที่เปิดแอปจะดาวน์โหลดใหม่หลายเมกะไบต์ */
const SAMPLE_HOSTS = ['gleitz.github.io', 'cdn.jsdelivr.net'];
const isSample = url => SAMPLE_HOSTS.some(h => url.hostname === h);

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
  let url;
  try{ url = new URL(e.request.url); }catch(err){ return; }

  /* ---- เครื่องดนตรี: เก็บไว้แล้วใช้เลย ไม่ต้องถามเน็ตอีก ---- */
  if(isSample(url)){
    e.respondWith(
      caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return r;
      }))
    );
    return;
  }

  /* ---- ตัวโปรแกรม: เอาของใหม่ก่อน ถ้าเน็ตล่มค่อยใช้ของที่เก็บไว้ ---- */
  e.respondWith(
    fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
