// navigation/AppNavigator.js
import React, { useContext } from 'react';
import { View, ActivityIndicator,  StyleSheet, Text  } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import { Button } from 'react-native-paper';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
import CreatePostScreen from '../screens/CreatePostScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isLoading, userToken } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#735DA5' } }}>
      {userToken ? (
        // Ekrani dostupni NAKON prijave
        <>
          <Stack.Screen name="Home" component={HomeScreen} options={({ navigation }) => ({
              title: 'Blogovi',
              headerRight: () => (
                <Button
                  style={styles.button}
                  title="Novi post"
                  onPress={() => navigation.navigate('CreatePost')}
                >
                  <Text style={styles.buttonText}> Novi post </Text>
                </Button>
              ),
            })} />
          <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ title: 'Detalji Posta' }}/> 
          <Stack.Screen name="CreatePost" component={CreatePostScreen} options={{ title: 'Kreiraj Post' }}/>
        </>
      ) : (
        // Ekrani dostupni PRE prijave
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#735DA5',
  },
  buttonText: {
    color: '#735DA5',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    height: 50,
    justifyContent: 'center',
    backgroundColor: '#D3C5E5',
    marginRight: 10,
  },
});

export default AppNavigator;