import { extendTheme, type ThemeConfig } from '@chakra-ui/react'
import { maleTheme, femaleTheme } from './theme/genderThemes'

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: true,
}

const baseTheme = {
  config,
  components: {
    Button: {
      baseStyle: {
        borderRadius: 'xl',
      },
      variants: {
        solid: (props: Record<string, unknown>) => ({
          bg: `${props.colorScheme}.500`,
          color: 'white',
          _hover: {
            bg: `${props.colorScheme}.600`,
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          },
          _active: {
            transform: 'translateY(0)',
          },
          transition: 'all 0.2s',
        }),
        ghost: {
          _hover: {
            transform: 'translateY(-2px)',
          },
        },
      }
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: '2xl',
          overflow: 'hidden',
          boxShadow: 'lg',
          transition: 'all 0.2s',
          _hover: {
            transform: 'translateY(-4px)',
            boxShadow: 'xl',
          },
        },
      },
    },
  },
  styles: {
    global: (props: Record<string, unknown>) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
        backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(83, 31, 255, 0.1), transparent 70%)',
        backgroundAttachment: 'fixed',
      },
    }),
  }
}

export const createTheme = (gender: string = 'male') => {
  const colors = gender === 'female' ? femaleTheme.colors : maleTheme.colors
  return extendTheme({
    ...baseTheme,
    colors,
  })
} 