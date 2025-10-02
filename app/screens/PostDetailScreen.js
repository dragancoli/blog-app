// screens/PostDetailScreen.js
import React, { useState, useEffect, useLayoutEffect, useContext, useCallback } from 'react';
import { View, StyleSheet, Alert, Platform, FlatList } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { getPostById, deletePost } from '../api/posts';
import { AuthContext } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import { Button, Text, ActivityIndicator, useTheme, Card, Avatar, Divider } from 'react-native-paper';
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
    if (isFocused) fetchPost();
  }, [isFocused, fetchPost]);

  // ISPRAVKA: Definicije funkcija su dodate ovde
  const confirmDelete = () => {
    const doDelete = async () => {
      try {
        await deletePost(postId);
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
      headerTitle: '',
      headerRight: () =>
        post && currentUserId === post.author_id ? (
          <View style={{ flexDirection: 'row', marginRight: 8 }}>
            <Button
              mode="text"
              onPress={goEdit} // Sada je ova funkcija definisana
              textColor={theme.colors.onPrimary}
              icon="pencil"
            >
              Uredi
            </Button>
            <Button
              mode="text"
              onPress={confirmDelete} // I ova funkcija je definisana
              textColor={theme.colors.onPrimary}
              icon="delete"
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
    const authorInitials = authorName.slice(0, 2).toUpperCase();

    return (
      <View>
        <Card.Cover source={{ uri: `https://picsum.photos/700?random=${post.id}` }} style={styles.coverImage} />
        <View style={styles.contentContainer}>
          <Text
            variant="headlineMedium"
            style={[styles.title, { color: theme.colors.onBackground, fontFamily: 'Poppins-Bold' }]}
          >
            {post.title}
          </Text>
          <View style={styles.authorRow}>
            <Avatar.Text size={42} label={authorInitials} style={{ backgroundColor: theme.colors.primaryContainer }} color={theme.colors.onPrimaryContainer}/>
            <View style={styles.authorInfo}>
              <Text
                style={{ color: theme.colors.primary, fontFamily: 'Poppins-SemiBold', fontSize: 16 }}
                onPress={() => {
                  if (post.author_id === currentUserId) navigation.navigate('Profile');
                  else navigation.navigate('Profile', { userId: post.author_id });
                }}
              >
                {authorName}
              </Text>
              <Text style={{ color: theme.colors.outline, fontSize: 12 }}>
                Objavljeno: {new Date(post.created_at).toLocaleDateString('sr-RS')}
              </Text>
            </View>
          </View>
          <Divider style={styles.divider} />
          <Text style={[styles.contentText, { color: theme.colors.onBackground }]}>
            {post.content}
          </Text>
        </View>
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
      data={[1]}
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
  coverImage: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  contentContainer: { padding: 20 },
  title: {
    marginBottom: 16,
    lineHeight: 36,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  authorInfo: {
    marginLeft: 12,
  },
  divider: {
    marginVertical: 20,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 28,
    fontFamily: 'Poppins-Regular',
  }
});

export default PostDetailScreen;