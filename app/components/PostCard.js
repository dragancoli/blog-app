// components/PostCard.js
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, useTheme, Icon } from 'react-native-paper';

const PostCard = ({ title, author, date, onPress }) => {
  const theme = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceVariant }]}
    >
      <View style={styles.headerRow}>
        <Text variant="titleMedium" style={styles.title} numberOfLines={2}>
          {title}
        </Text>
      </View>
      <View style={styles.metaRow}>
        <Icon source="account" size={16} color={theme.colors.primary} />
        <Text style={[styles.meta, { color: theme.colors.primary }]} numberOfLines={1}>
          {author}
        </Text>
        <Text style={[styles.dot, { color: theme.colors.outline }]}>•</Text>
        <Text style={[styles.meta, { color: theme.colors.outline }]} numberOfLines={1}>
          {date}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowRadius: 4,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  title: {
    fontWeight: '700',
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  meta: {
    fontSize: 12,
    fontWeight: '600',
  },
  dot: {
    fontSize: 14,
    marginHorizontal: 2,
  },
});

export default PostCard;