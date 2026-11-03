import { Inter } from 'next/font/google';
import { createTheme } from '@mui/material/styles';

export const inter = Inter({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

// Minimalist monochrome palette with single accent
const colors = {
  light: {
    primary: '#000000',
    accent: '#3B82F6', // Clean blue accent
    background: '#FFFFFF',
    surface: '#F9FAFB',
    surfaceHover: '#F3F4F6',
    border: '#E5E7EB',
    borderHover: '#D1D5DB',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
  },
  dark: {
    primary: '#FFFFFF',
    accent: '#60A5FA', // Lighter blue for dark mode
    background: '#000000',
    surface: '#0A0A0A',
    surfaceHover: '#171717',
    border: '#262626',
    borderHover: '#404040',
    textPrimary: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textTertiary: '#9CA3AF',
    error: '#F87171',
    success: '#34D399',
    warning: '#FBBF24',
  },
};

const theme = createTheme({
  cssVariables: true,
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: colors.light.primary,
          light: colors.light.textSecondary,
          dark: colors.light.primary,
        },
        secondary: {
          main: colors.light.accent,
          light: '#DBEAFE',
          dark: '#2563EB',
        },
        error: {
          main: colors.light.error,
        },
        success: {
          main: colors.light.success,
        },
        warning: {
          main: colors.light.warning,
        },
        background: {
          default: colors.light.background,
          paper: colors.light.surface,
        },
        text: {
          primary: colors.light.textPrimary,
          secondary: colors.light.textSecondary,
          disabled: colors.light.textTertiary,
        },
        divider: colors.light.border,
      },
    },
    dark: {
      palette: {
        primary: {
          main: colors.dark.primary,
          light: colors.dark.textSecondary,
          dark: colors.dark.primary,
        },
        secondary: {
          main: colors.dark.accent,
          light: '#1E3A8A',
          dark: '#93C5FD',
        },
        error: {
          main: colors.dark.error,
        },
        success: {
          main: colors.dark.success,
        },
        warning: {
          main: colors.dark.warning,
        },
        background: {
          default: colors.dark.background,
          paper: colors.dark.surface,
        },
        text: {
          primary: colors.dark.textPrimary,
          secondary: colors.dark.textSecondary,
          disabled: colors.dark.textTertiary,
        },
        divider: colors.dark.border,
      },
    },
  },
  typography: {
    fontFamily: inter.style.fontFamily,
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.8125rem',
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: 6,
            height: 6,
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: colors.light.border,
            borderRadius: 3,
            '&:hover': {
              background: colors.light.borderHover,
            },
          },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 6,
          padding: '8px 16px',
          transition: 'all 0.15s ease-in-out',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        outlined: {
          borderWidth: 1,
          '&:hover': {
            borderWidth: 1,
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
        sizeSmall: {
          padding: '6px 12px',
          fontSize: '0.8125rem',
        },
        sizeLarge: {
          padding: '10px 20px',
          fontSize: '0.9375rem',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          transition: 'all 0.15s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
        sizeSmall: {
          padding: 6,
        },
        sizeMedium: {
          padding: 8,
        },
        sizeLarge: {
          padding: 12,
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: `1px solid ${colors.light.border}`,
          backgroundImage: 'none',
        },
        elevation0: {
          border: 'none',
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: `1px solid ${colors.light.border}`,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.125rem',
          fontWeight: 600,
          padding: '20px 24px',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '0 24px 20px',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'all 0.15s ease-in-out',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.light.borderHover,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: 1,
            },
          },
          '& .MuiInputBase-input': {
            fontSize: '0.875rem',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.light.border,
          },
        },
        input: {
          padding: '10px 14px',
        },
        multiline: {
          padding: 0,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
          marginTop: 4,
          minWidth: 180,
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        list: {
          padding: '4px',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          margin: '2px 0',
          fontSize: '0.875rem',
          padding: '8px 12px',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(0, 0, 0, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.12)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontSize: '0.8125rem',
          height: 28,
        },
        sizeSmall: {
          height: 24,
          fontSize: '0.75rem',
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${colors.light.border}`,
          backgroundColor: colors.light.background,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
          borderRight: `1px solid ${colors.light.border}`,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: colors.light.textPrimary,
          fontSize: '0.75rem',
          borderRadius: 6,
          padding: '6px 12px',
        },
        arrow: {
          color: colors.light.textPrimary,
        },
      },
    },
    MuiAccordion: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: `1px solid ${colors.light.border}`,
          '&:before': {
            display: 'none',
          },
          '&:not(:last-child)': {
            marginBottom: 8,
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          minHeight: 48,
          padding: '0 16px',
          '&.Mui-expanded': {
            minHeight: 48,
          },
        },
        content: {
          margin: '12px 0',
          '&.Mui-expanded': {
            margin: '12px 0',
          },
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: '0 16px 16px',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontSize: '0.875rem',
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '& .MuiPaper-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

export default theme;
