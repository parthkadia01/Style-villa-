const CACHE='ff-alteration-v4';
const ASSETS=['./','./index.html','./styles.css','./config.js','./app.js','./dashboard-ui.css','./dashboard-ui.js','./dashboard-runtime.js','./ux-patch.js','./print-fix.js','./reprint.js','./manifest.webmanifest'];

self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));

self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);

  // Always prefer the network for HTML and versioned application files so
  // GitHub Pages never serves an older deployment after a refresh.
  const networkFirst=url.pathname.endsWith('/') || /\.(html|js|css|webmanifest)$/.test(url.pathname);
  if(networkFirst){
    event.respondWith(
      fetch(event.request,{cache:'no-store'})
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE).then(c=>c.put(event.request,copy));
          return response;
        })
        .catch(()=>caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cached=>cached||fetch(event.request).then(response=>{
        const copy=response.clone();
        caches.open(CACHE).then(c=>c.put(event.request,copy));
        return response;
      }).catch(()=>cached))
  );
});
