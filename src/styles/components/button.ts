import { ComponentStyleConfig } from '@chakra-ui/react';

export const Button: ComponentStyleConfig = {
  baseStyle: {
    textTransform: 'uppercase',
  },

  defaultProps: {
    variant: 'default',
  },

  variants: {
    default: {
      bg: 'black',
      color: 'white',
      filter: 'auto',
      brightness: '1',
      boxShadow: '0 .2em #ddd !important',
      position: 'relative',
      overflow: 'hidden',

      _after: {
        background: '#fff',
        content: '""',
        height: '155px',
        left: '-75px',
        opacity: '.2',
        position: 'absolute',
        top: '-50px',
        transform: 'rotate(35deg)',
        transition: 'all 2s cubic-bezier(0.19, 1, 0.22, 1)',
        width: '50px',
        zIndex: '-10',
      },

      _hover: {
        _after: {
          left: '120%',
          transition: 'all 2s cubic-bezier(0.19, 1, 0.22, 1)',
        },
      },

      _active: {
        boxShadow: 'none !important',
        pos: 'relative',
        top: '.2em',
      },
    },

    defaultOutlined: {
      bg: 'transparent',
      borderColor: 'black',
      border: '1px',
      color: 'black',
      filter: 'auto',
      brightness: '1',
      boxShadow: '0 .2em black !important',
      position: 'relative',
      overflow: 'hidden',

      _after: {
        background: '#aaa',
        content: '""',
        height: '155px',
        left: '-75px',
        opacity: '.2',
        position: 'absolute',
        top: '-50px',
        transform: 'rotate(35deg)',
        transition: 'all 2s cubic-bezier(0.19, 1, 0.22, 1)',
        width: '50px',
        zIndex: '-10',
      },

      _hover: {
        _after: {
          left: '120%',
          transition: 'all 2s cubic-bezier(0.19, 1, 0.22, 1)',
        },
      },

      _active: {
        boxShadow: 'none !important',
        pos: 'relative',
        top: '.2em',
      },
    },
  },
};
