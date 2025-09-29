// theme.js
import { useColorScheme } from 'react-native';
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const baseLight = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#735DA5',
    primaryContainer: '#D3C5E5',
    secondary: '#B8A2D9',
    background: '#F6F3FA',
    surface: '#FFFFFF',
    surfaceVariant: '#E6DEF2',
    outline: '#B6A8CC',
    error: '#B3261E',
    success: '#2E7D32',
    onPrimary: '#FFFFFF',
    onSurface: '#2A2140',
  },
  roundness: 12,
};

export const baseDark = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#C6B3F0',
    primaryContainer: '#4D3A72',
    secondary: '#8F7BC0',
    background: '#181320',
    surface: '#221A30',
    surfaceVariant: '#3A2C52',
    outline: '#6D5A85',
    error: '#F2B8B5',
    success: '#6BBF73',
    onPrimary: '#221A30',
  },
  roundness: 12,
};

export const useAppTheme = () => {
  const scheme = useColorScheme();
  return scheme === 'dark' ? baseDark : baseLight;
};