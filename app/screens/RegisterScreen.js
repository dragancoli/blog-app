// screens/RegisterScreen.js
import React, { useState, useContext } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText, useTheme, Snackbar } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';

const RegisterScreen = ({ navigation }) => {
  const { register } = useContext(AuthContext);
  const theme = useTheme();
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, msg: '' });

  const usernameInvalid = touched && username.trim().length < 3;
  const emailInvalid = touched && (!email.includes('@') || email.length < 5);
  const passwordInvalid = touched && password.length < 4;

  const handleRegister = async () => {
    setTouched(true);
    if (usernameInvalid || emailInvalid || passwordInvalid) return;
    setSubmitting(true);
    try {
      await register(username.trim(), email.trim(), password);
    } catch (e) {
      setSnackbar({ visible: true, msg: 'Registracija neuspešna.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>Napravi nalog</Text>
        <Text style={[styles.subtitle, { color: theme.colors.outline }]}>Pridruzi se zajednici.</Text>

        <TextInput
          label="Korisničko ime"
          value={username}
          onChangeText={setUsername}
          mode="outlined"
          style={styles.input}
          error={usernameInvalid}
          onBlur={() => setTouched(true)}
        />
        <HelperText type={usernameInvalid ? 'error' : 'info'} visible={true}>
          {usernameInvalid ? 'Najmanje 3 karaktera.' : ' '}
        </HelperText>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          mode="outlined"
          style={styles.input}
          error={emailInvalid}
          onBlur={() => setTouched(true)}
        />
        <HelperText type={emailInvalid ? 'error' : 'info'} visible={true}>
          {emailInvalid ? 'Unesite ispravan email.' : ' '}
        </HelperText>

        <TextInput
          label="Lozinka"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          mode="outlined"
          style={styles.input}
          error={passwordInvalid}
          onBlur={() => setTouched(true)}
        />
        <HelperText type={passwordInvalid ? 'error' : 'info'} visible={true}>
          {passwordInvalid ? 'Najmanje 4 karaktera.' : ' '}
        </HelperText>

        <Button
          mode="contained"
          onPress={handleRegister}
          disabled={submitting}
          style={styles.button}
        >
          {submitting ? 'Slanje...' : 'Registruj se'}
        </Button>

        <View style={styles.switchRow}>
          <Text style={{ fontFamily: 'Poppins-SemiBold' }}>Već imate nalog? </Text>
          <Button mode="text" onPress={() => navigation.navigate('Login')}>
            Prijavi se
          </Button>
        </View>
      </View>
      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar(s => ({ ...s, visible: false }))}
        duration={2500}
      >
        {snackbar.msg}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', padding: 22 },
  title: { fontWeight: '100', textAlign: 'center', fontFamily: 'Freedom-10eM', fontSize: 38 },
  subtitle: { textAlign: 'center', marginBottom: 24, fontFamily: 'Freedom-10eM', fontSize: 16 },
  input: { marginBottom: 0 },
  button: { marginTop: 8, borderRadius: 14, paddingVertical: 6 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, alignItems: 'center'},
});

export default RegisterScreen;