// components/EmptyState.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, useTheme, Icon } from 'react-native-paper';

const EmptyState = ({ title = 'Nema sadržaja', message = 'Još uvek nema postova.', actionLabel, onAction }) => {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <Icon source="folder-outline" size={60} color={theme.colors.primary} />
      <Text variant="titleMedium" style={styles.title}>{title}</Text>
      <Text variant="bodyMedium" style={[styles.message, { color: theme.colors.outline }]}>{message}</Text>
      {actionLabel && onAction && (
        <Button mode="contained-tonal" style={styles.button} onPress={onAction}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 50 },
  title: { marginTop: 14, fontWeight: '700' },
  message: { marginTop: 6, textAlign: 'center', paddingHorizontal: 32 },
  button: { marginTop: 20, borderRadius: 30, paddingHorizontal: 12 },
});

export default EmptyState;