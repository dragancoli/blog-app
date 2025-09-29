import React, { useState, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useContext(AuthContext);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      const alert = Platform.OS === 'web' ? window.alert : require('react-native').Alert.alert;
      alert('Greška', 'Molimo popunite sva polja.');
      return;
    }
    try {
      await register(username, email, password);
    } catch (error) {
      const alert = Platform.OS === 'web' ? window.alert : require('react-native').Alert.alert;
      alert('Neuspešna registracija', 'Korisnik sa tim email-om ili korisničkim imenom možda već postoji.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registracija</Text>
      <TextInput
        style={styles.input}
        label="Korisničko ime"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        label="Lozinka"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <Button
        mode="contained" // 'contained' daje dugmetu lepu pozadinu
        onPress={handleRegister}
        style={styles.button}
        labelStyle={{ fontSize: 16 }}
        >
        Prijavi se
      </Button>

      <View style={styles.switchScreenLink}>
        <Text>Već imate nalog? </Text>
        <Button
          mode="text" 
          onPress={() => navigation.navigate('Login')}
        >
          Prijavite se
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
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    marginBottom: 15,
  },
  switchScreenLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  button: {
    marginTop: 10,
    paddingVertical: 5,
    borderRadius: 5,
    justifyContent: 'center',
    color: '#D3C5E5',
  }
});

export default RegisterScreen;