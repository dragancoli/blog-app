// App.js (primer kako da uključiš temu ako već nemaš root)

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider, adaptNavigationTheme } from 'react-native-paper';
import { AuthProvider } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';
import { useAppTheme, baseLight, baseDark } from './theme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {useFonts} from 'expo-font';

const Main = () => {
  const theme = useAppTheme();
  const { LightTheme, DarkTheme } = adaptNavigationTheme({
    reactNavigationLight: { ...theme, colors: { ...theme.colors, background: theme.colors.background } },
    reactNavigationDark: { ...theme, colors: { ...theme.colors, background: theme.colors.background } },
  });

  const [fontsLoaded] = useFonts({
    'Freedom-10eM': require('./assets/fonts/Freedom-10eM.ttf'),
    'BitcountPropSingleInk': require('./assets/fonts/BitcountPropSingleInk.ttf'),
    'BlackOpsOne-Regular': require('./assets/fonts/BlackOpsOne-Regular.ttf'), 
    'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('./assets/fonts/Poppins-SemiBold.ttf'),
  });

  const navTheme = theme.dark ? DarkTheme : LightTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <NavigationContainer theme={navTheme}>
          <AuthProvider>
            <AppNavigator />
          </AuthProvider>
        </NavigationContainer>
      </PaperProvider>
    </GestureHandlerRootView>
  );
};

export default Main;