import { Roboto, Roboto_Mono } from 'next/font/google';
import { createTheme } from '@mui/material/styles';

export const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const robotoMono = Roboto_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
});

// Material Design 3 colors
const md3Colors = {
  light: {
    primary: '#6750A4',
    secondary: '#625B71',
    tertiary: '#7D5260',
    error: '#B3261E',
    surface: '#FEF7FF',
    surfaceContainer: '#F3EDF7',
    outline: '#79747E',
  },
  dark: {
    primary: '#D0BCFF',
    secondary: '#CCC2DC',
    tertiary: '#EFB8C8',
    error: '#F2B8B5',
    surface: '#141218',
    surfaceContainer: '#211F26',
    outline: '#938F99',
  },
};

const theme = createTheme({
  cssVariables: true,
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: md3Colors.light.primary,
        },
        secondary: {
          main: md3Colors.light.secondary,
        },
        error: {
          main: md3Colors.light.error,
        },
        background: {
          default: md3Colors.light.surface,
          paper: md3Colors.light.surfaceContainer,
        },
        divider: md3Colors.light.outline,
      },
    },
    dark: {
      palette: {
        primary: {
          main: md3Colors.dark.primary,
        },
        secondary: {
          main: md3Colors.dark.secondary,
        },
        error: {
          main: md3Colors.dark.error,
        },
        background: {
          default: md3Colors.dark.surface,
          paper: md3Colors.dark.surfaceContainer,
        },
        divider: md3Colors.dark.outline,
      },
    },
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
    fontSize: 16,
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 28,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 28,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 28,
          },
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
    },
  },
});

export default theme;
