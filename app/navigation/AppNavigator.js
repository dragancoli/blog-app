// navigation/AppNavigator.js
import React, { useContext } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import { useTheme, IconButton, Text } from 'react-native-paper';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import EditPostScreen from '../screens/EditPostScreen'; 
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isLoading, userToken } = useContext(AuthContext);
  const theme = useTheme();

  if (isLoading) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTitleStyle: { color: theme.colors.onPrimary, fontWeight: '700' },
        headerTintColor: theme.colors.onPrimary,
      }}
    >
      {userToken ? (
        <>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={({ navigation, route }) => ({
              title: 'BlogApp',
              headerRight: () => (
                <View style={{ flexDirection: 'row' , alignItems: 'center' }}>
                  <IconButton
                    icon="account-circle"
                    size={20}
                    onPress={() => navigation.navigate('Profile')}
                    accessibilityLabel="Profil"
                    mode="contained-tonal"
                    style={{ marginRight: 4 }}
                  />
                </View>
                )
            })}
          />
          <Stack.Screen
            name="PostDetail"
            component={PostDetailScreen}
            options={{ title: 'Detalji posta' }}
          />
          <Stack.Screen
            name="CreatePost"
            component={CreatePostScreen}
            options={{ title: 'Novi post' }}
          />
          <Stack.Screen name="EditPost" component={EditPostScreen} options={{ title: 'Uredi Post' }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loaderWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default AppNavigator;