// components/PostCard.js
import React from 'react';
import { StyleSheet } from 'react-native';
import { useTheme, Card, Text, Avatar } from 'react-native-paper';

const PostCard = ({ title, author, date, onPress, imageUrl }) => {
  const theme = useTheme();

  const authorInitials = author ? author.slice(0, 2).toUpperCase() : 'NN';

  return (
    <Card
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      elevation={2}
    >
      <Card.Cover source={{ uri: imageUrl || 'https://picsum.photos/700' }} />

      <Card.Title
        title={title}
        titleStyle={[styles.title, { color: theme.colors.onSurface }]}
        titleNumberOfLines={2}
        subtitle={date}
        // ISPRAVKA: Stil za datum sada koristi theme objekat direktno ovde
        subtitleStyle={[styles.date, { color: theme.colors.outline }]}
        left={(props) => (
          <Avatar.Text {...props} size={40} label={authorInitials} style={{ backgroundColor: theme.colors.primaryContainer }} color={theme.colors.onPrimaryContainer} />
        )}
      />
      <Card.Content>
        <Text variant="bodyMedium" style={{ color: theme.colors.primary, fontFamily: 'Poppins-SemiBold' }}>
          Autor: {author}
        </Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    lineHeight: 24,
  },
  date: {
    fontSize: 12,
    // ISPRAVKA: Uklonjena boja odavde jer 'theme' nije dostupan
  }
});

export default PostCard;