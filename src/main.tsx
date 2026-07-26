import { ChakraProvider } from '@chakra-ui/react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { App } from './App';
import { theme } from './styles/theme';

// Limpeza defensiva: remove qualquer service worker de terceiros (ex.: a
// antiga integração de anúncios Monetag) e os caches que ele possa ter
// criado, para usuários que ainda o tenham registrado no navegador.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) =>
      registrations.forEach((registration) => registration.unregister())
    )
    .catch(() => undefined);

  if (typeof caches !== 'undefined') {
    caches
      .keys()
      .then((keys) => keys.forEach((key) => caches.delete(key)))
      .catch(() => undefined);
  }
}

const root = createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <BrowserRouter>
    <ChakraProvider
      theme={theme}
      toastOptions={{
        defaultOptions: {
          position: 'top-right',
          isClosable: true,
          duration: 3000,
        },
      }}
    >
      <App />
    </ChakraProvider>
  </BrowserRouter>
);
