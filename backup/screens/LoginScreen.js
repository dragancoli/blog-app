// screens/LoginScreen.js
import React, { useState, useContext } from 'react';
//import { View, TextInput, Button, StyleSheet, Text, Platform } from 'react-native';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';


const LoginScreen = ({ navigation }) => { 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Greška', 'Molimo unesite email i lozinku.');
      return;
    }
    try {
      await login(email, password);
    } catch (error) {
      alert('Neuspešna prijava', 'Pogrešan email ili lozinka.');
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Dobrodošli nazad!
      </Text>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        label="Lozinka"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button
        mode="contained" // 'contained' daje dugmetu lepu pozadinu
        onPress={handleLogin}
        style={styles.button}
        labelStyle={{ fontSize: 16 }}
      >
        Prijavi se
      </Button>

      <View style={styles.switchScreenLink}>
        <Text>Nemate nalog? </Text>
        <Button
          mode="text" 
          onPress={() => navigation.navigate('Register')}
        >
          Registrujte se
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#735DA5',
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
    color: '#D3C5E5',
  },
  input: {
    marginBottom: 15,
 
  },
  button: {
    marginTop: 10,
    paddingVertical: 5,
    borderRadius: 5,
    justifyContent: 'center',
    color: '#D3C5E5',
  },
  switchScreenLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
});

export default LoginScreen;