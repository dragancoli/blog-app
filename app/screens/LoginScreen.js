// screens/LoginScreen.js
import React, { useState, useContext } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText, useTheme, Snackbar } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const { login } = useContext(AuthContext);
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // kontrola prikaza lozinke
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, msg: '' });

  const emailInvalid = touched && (!email.includes('@') || email.trim().length < 5);
  const passwordInvalid = touched && password.length < 4;

  const handleLogin = async () => {
    setTouched(true);
    if (emailInvalid || passwordInvalid) return;
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch {
      setSnackbar({ visible: true, msg: 'Neuspešna prijava.' });
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
        <Text variant="headlineMedium" style={styles.title}>Dobrodosli nazad</Text>
        <Text style={[styles.subtitle, { color: theme.colors.outline }]}>Prijavite se da nastavite.</Text>

        <TextInput
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          mode="outlined"
          error={emailInvalid}
          onBlur={() => setTouched(true)}
        />
        <HelperText type={emailInvalid ? 'error' : 'info'} visible={true}>
          {emailInvalid ? 'Unesite ispravan email.' : ' '}
        </HelperText>

        <TextInput
          label="Lozinka"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          mode="outlined"
          error={passwordInvalid}
          onBlur={() => setTouched(true)}
          autoCapitalize="none"
          autoCorrect={false}
          right={
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword(s => !s)}
              forceTextInputFocus={false}
              accessibilityLabel={showPassword ? 'Sakrij lozinku' : 'Prikaži lozinku'}
            />
          }
        />
        <HelperText type={passwordInvalid ? 'error' : 'info'} visible={true}>
          {passwordInvalid ? 'Najmanje 4 karaktera.' : ' '}
        </HelperText>

        <Button
          mode="contained"
          onPress={handleLogin}
          disabled={submitting}
          style={styles.button}
        >
          {submitting ? 'Prijavljivanje...' : 'Prijavi se'}
        </Button>

        <View style={styles.switchRow}>
          <Text style={{ fontFamily: 'Poppins-SemiBold' }}>Nemate nalog? </Text>
          <Button mode="text" onPress={() => navigation.navigate('Register')}>
            Registrujte se
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
  title: { fontWeight: '100', textAlign: 'center' , fontFamily: 'Freedom-10eM', fontSize: 38},
  subtitle: { textAlign: 'center', marginBottom: 22, fontFamily: 'Freedom-10eM' },
  input: { marginBottom: 0 },
  button: { marginTop: 6, borderRadius: 14, paddingVertical: 6 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, alignItems: 'center' },
});

export default LoginScreen;