// Service worker de auto-remoção.
//
// Uma versão anterior deste arquivo importava código de terceiros
// (rede de anúncios Monetag / "5gvci.com"), que ficava registrado no
// navegador dos usuários mesmo após o deploy da correção. Um service
// worker persiste em segundo plano, então não basta apagar o arquivo:
// esta versão faz o próprio navegador desregistrar o worker malicioso e
// limpar os caches assim que buscar esta atualização.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
        await self.registration.unregister();

        const clients = await self.clients.matchAll();
        clients.forEach((client) => client.navigate(client.url));
      } catch (err) {
        // Ignora falhas: o objetivo é apenas se auto-remover.
      }
    })()
  );
});
