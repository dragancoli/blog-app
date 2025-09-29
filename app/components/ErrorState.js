// components/ErrorState.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, useTheme, Icon } from 'react-native-paper';

const ErrorState = ({ message = 'Došlo je do greške.', onRetry }) => {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <Icon source="alert-circle-outline" size={58} color={theme.colors.error} />
      <Text variant="titleMedium" style={styles.title}>Greška</Text>
      <Text variant="bodyMedium" style={[styles.msg, { color: theme.colors.error }]}>{message}</Text>
      {onRetry && (
        <Button mode="contained" style={styles.button} onPress={onRetry}>
          Pokušaj ponovo
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 80 },
  title: { marginTop: 12, fontWeight: '700' },
  msg: { marginTop: 8, textAlign: 'center', paddingHorizontal: 24 },
  button: { marginTop: 22, borderRadius: 28, paddingHorizontal: 24 },
});

export default ErrorState;