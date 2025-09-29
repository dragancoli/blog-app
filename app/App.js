// App.js (primer kako da uključiš temu ako već nemaš root)
// Ako već imaš NavigationContainer negde drugde, samo obmotaj PaperProvider.
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider, adaptNavigationTheme } from 'react-native-paper';
import { AuthProvider } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';
import { useAppTheme, baseLight, baseDark } from './theme';

const Main = () => {
  const theme = useAppTheme();
  const { LightTheme, DarkTheme } = adaptNavigationTheme({
    reactNavigationLight: { ...theme, colors: { ...theme.colors, background: theme.colors.background } },
    reactNavigationDark: { ...theme, colors: { ...theme.colors, background: theme.colors.background } },
  });

  const navTheme = theme.dark ? DarkTheme : LightTheme;

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer theme={navTheme}>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default Main;