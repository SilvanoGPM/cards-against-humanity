import { ChakraProvider } from '@chakra-ui/react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { theme } from './styles/theme';
import { App } from './App';

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
