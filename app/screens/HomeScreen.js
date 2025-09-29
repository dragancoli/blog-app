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

  const handleLogout = async () => {
    await logout();
  };

  const renderItem = ({ item }) => (
    <PostCard
      title={item.title}
      author={item.author}
      date={new Date(item.created_at).toLocaleDateString('sr-RS')}
      onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.topRow}>
        <Searchbar
          placeholder="Pretraži postove..."
          value={query}
          onChangeText={setQuery}
          style={styles.search}
          elevation={0}
        />
        <IconButton
          icon="logout"
            accessibilityLabel="Odjava"
          onPress={handleLogout}
          mode="contained-tonal"
          style={styles.logoutBtn}
        />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 16, color: theme.colors.outline }}>Učitavanje postova...</Text>
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
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  search: { flex: 1, borderRadius: 14 },
  logoutBtn: { margin: 0 },
  listContent: { paddingVertical: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 26,
    elevation: 6,
  },
});

export default HomeScreen;