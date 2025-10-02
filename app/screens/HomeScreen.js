// screens/HomeScreen.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, ActivityIndicator, Searchbar, FAB, Snackbar, useTheme, IconButton } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';
import { getAllPosts } from '../api/posts';
import { useIsFocused } from '@react-navigation/native';
import PostCard from '../components/PostCard';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

const HomeScreen = ({ navigation }) => {
  const { logout } = useContext(AuthContext);
  const theme = useTheme();
  const isFocused = useIsFocused();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'BlogApp',
      headerTitleStyle: { color: theme.colors.onPrimary, fontFamily: 'Freedom-10eM', fontSize: 28 },
      headerRight: () => (
        <View style={{ flexDirection: 'row' , alignItems: 'center', marginRight: 8 }}>
          <IconButton
            icon="account-circle"
            size={28}
            iconColor={theme.colors.onPrimary}
            onPress={() => navigation.navigate('Profile')}
            accessibilityLabel="Profil"
          />
        </View>
      )
    });
  }, [navigation, theme]);

  const [posts, setPosts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [snackbar, setSnackbar] = useState({ visible: false, msg: '' });

  const loadPosts = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setIsLoading(true);
    try {
      const data = await getAllPosts();
      setPosts(data);
      setError('');
    } catch (e) {
      setError('Nije moguće učitati postove.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      loadPosts();
    }
  }, [isFocused, loadPosts]);

  useEffect(() => {
    if (!query.trim()) {
      setFiltered(posts);
    } else {
      const lower = query.toLowerCase();
      setFiltered(
        posts.filter(
          p =>
            p.title.toLowerCase().includes(lower) ||
            (p.author && p.author.toLowerCase().includes(lower))
        )
      );
    }
  }, [query, posts]);

  const onRefresh = () => {
    setRefreshing(true);
    loadPosts(true);
  };

  const renderItem = ({ item }) => (
    <PostCard
      title={item.title}
      author={item.author}
      date={new Date(item.created_at).toLocaleDateString('sr-RS')}
      onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
      imageUrl={item.image_url}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.topRow}>
        <Searchbar
          placeholder="Pretraži postove..."
          value={query}
          onChangeText={setQuery}
          style={[styles.search, { backgroundColor: theme.colors.surface }]}
          elevation={1}
          iconColor={theme.colors.primary}
        />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 16, color: theme.colors.outline, fontFamily: 'Poppins-SemiBold' }}>Učitavanje postova...</Text>
        </View>
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadPosts()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Nema rezultata"
          message={query ? 'Nema postova koji odgovaraju pretrazi.' : 'Još uvek nema postova.'}
          actionLabel={!query ? 'Napravi prvi' : undefined}
          onAction={!query ? () => navigation.navigate('CreatePost') : undefined}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
        onPress={() => navigation.navigate('CreatePost')}
        accessibilityLabel="Kreiraj novi post"
      />

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar(s => ({ ...s, visible: false }))}
        duration={2500}
      >
        {snackbar.msg}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  topRow: { padding: 16, paddingBottom: 8 },
  search: { borderRadius: 14 },
  listContent: { paddingHorizontal: 16, paddingVertical: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 26,
    elevation: 6,
  },
});

export default HomeScreen;