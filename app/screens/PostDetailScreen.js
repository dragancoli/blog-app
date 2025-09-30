// screens/PostDetailScreen.js
import React, { useState, useEffect, useLayoutEffect, useContext, useCallback } from 'react';
import { View, StyleSheet, Alert, Platform, FlatList } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { getPostById, deletePost } from '../api/posts';
import { AuthContext } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import { Button, Text, ActivityIndicator, useTheme } from 'react-native-paper';
import CommentsSection from '../components/CommentsSection';

const PostDetailScreen = ({ route, navigation }) => {
  const { postId } = route.params;
  const { userToken } = useContext(AuthContext);
  const theme = useTheme();
  const isFocused = useIsFocused();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState('');

  const currentUserId = userToken ? jwtDecode(userToken).id : null;

  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPostById(postId);
      setPost(data);
      setErrMsg('');
    } catch (e) {
      setErrMsg('Nije moguće učitati post.');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  useEffect(() => {
    if (isFocused) fetchPost();
  }, [isFocused, fetchPost]);

  const confirmDelete = () => {
    const doDelete = async () => {
      try {
        await deletePost(postId);
        const alertFn = Platform.OS === 'web' ? window.alert : Alert.alert;
        alertFn('Uspeh', 'Post je uspešno obrisan.');
        navigation.goBack();
      } catch (e) {
        const alertFn = Platform.OS === 'web' ? window.alert : Alert.alert;
        alertFn('Greška', 'Brisanje nije uspelo.');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Da li ste sigurni da želite da obrišete post?')) doDelete();
    } else {
      Alert.alert('Brisanje', 'Da li ste sigurni?', [
        { text: 'Otkaži', style: 'cancel' },
        { text: 'Obriši', style: 'destructive', onPress: doDelete }
      ]);
    }
  };

  const goEdit = () => {
    navigation.navigate('EditPost', {
      postId,
      initialTitle: post?.title,
      initialContent: post?.content
    });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: theme.colors.primary },
      headerTintColor: theme.colors.onPrimary,
      headerTitleStyle: { color: theme.colors.onPrimary },
      headerRight: () =>
        post && currentUserId === post.author_id ? (
          <View style={{ flexDirection: 'row' }}>
            <Button
              mode="contained-tonal"
              onPress={goEdit}
              style={{ marginRight: 8 }}
            >
              Uredi
            </Button>
            <Button
              mode="contained"
              onPress={confirmDelete}
              buttonColor={theme.colors.error}
              textColor={theme.colors.onPrimary}
            >
              Obriši
            </Button>
          </View>
        ) : null
    });
  }, [navigation, post, currentUserId, theme]);

  const renderHeader = () => {
    if (errMsg || !post) return null;

    const authorName = post.author || 'Nepoznato';

    return (
      <View style={styles.contentContainer}>
        <Text
          variant="headlineSmall"
          style={[styles.title, { color: theme.colors.onBackground }]}
        >
          {post.title}
        </Text>
        <Text style={{ color: theme.colors.primary, fontWeight: '600', marginBottom: 4 }}>
          Autor: {authorName}
        </Text>
        <Text style={{ color: theme.colors.outline, fontSize: 12, marginBottom: 14 }}>
          Objavljeno: {new Date(post.created_at).toLocaleDateString('sr-RS')}
          {post.updated_at ? ' (ažurirano)' : ''}
        </Text>
        <View
          style={{
            height: 1,
            backgroundColor: theme.colors.surfaceVariant,
            marginBottom: 18,
            borderRadius: 1
          }}
        />
        <Text style={{ color: theme.colors.onBackground, fontSize: 16, lineHeight: 24 }}>
          {post.content}
        </Text>
      </View>
    );
  };

  const renderComments = () => {
    return <CommentsSection postId={postId} userToken={userToken} />;
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator />
        <Text style={{ marginTop: 12, color: theme.colors.outline }}>Učitavanje...</Text>
      </View>
    );
  }

  if (errMsg || !post) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.error }}>{errMsg || 'Post nije pronađen.'}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={[1]} // Jedan item - celu stranu
      renderItem={null}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderComments}
      keyExtractor={() => 'post-detail'}
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  contentContainer: { padding: 18 },
  title: { fontWeight: '700', marginBottom: 6 }
});

export default PostDetailScreen;