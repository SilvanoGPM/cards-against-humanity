import { extendTheme } from '@chakra-ui/react';

import { Button } from './components/button';
import { Input } from './components/input';
import { thinScrollbar } from './tokens';

export const theme = extendTheme({
  initialColorMode: 'light',
  useSystemColorMode: false,

  components: {
    Button,
    Input,
  },

  styles: {
    global: {
      '*': {
        ...thinScrollbar,
      },

      html: {
        scrollBehavior: 'smooth',
      },

      body: {
        color: 'black',
        overflowX: 'hidden',
      },

      '.chakra-alert': {
        bg: 'black !important',
        color: 'white',
      },
    },
  },
});
