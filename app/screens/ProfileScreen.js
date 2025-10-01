import React, { useEffect, useState, useContext, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Platform } from 'react-native';
import { Text, useTheme, ActivityIndicator, Button } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';
import { getMe, updateMe, getUserPosts, getUserProfile } from '../api/users';
import { jwtDecode } from 'jwt-decode';
import ProfileHeader from '../components/ProfileHeader';
import { TouchableOpacity } from 'react-native'; // običan RN, ne gesture-handler

const ProfileScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { logout, userToken } = useContext(AuthContext);

  // Dekoduj token jednom
  const decoded = useMemo(() => {
    try {
      return userToken ? jwtDecode(userToken) : null;
    } catch {
      return null;
    }
  }, [userToken]);

  const routeUserId = route?.params?.userId;
  const viewedUserId = routeUserId || decoded?.id || null;
  const isOwn = decoded && viewedUserId === decoded.id;

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bioDraft, setBioDraft] = useState('');
  const [avatarDraft, setAvatarDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!viewedUserId) {
      setLoadingProfile(false);
      return;
    }
    try {
      setLoadingProfile(true);
      // Javne info
      const pub = await getUserProfile(viewedUserId);
      setProfile(prev => ({ ...prev, ...pub }));
      setBioDraft(pub.bio || '');
      setAvatarDraft(pub.avatar_url || '');

      // Ako je moj profil – dopuni privatnim
      if (isOwn) {
        try {
          const me = await getMe();
            setProfile(prev => ({ ...prev, email: me.email })); // nemoj pregaziti ostalo
        } catch (e) {
          if (e.response?.status === 401) {
            logout();
          }
        }
      }
    } catch (e) {
      console.log('Profile load error', e);
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  }, [viewedUserId, isOwn, logout]);

  const loadPosts = useCallback(async () => {
    if (!viewedUserId) {
      setLoadingPosts(false);
      return;
    }
    try {
      setLoadingPosts(true);
      const data = await getUserPosts(viewedUserId);
      setPosts(data);
    } catch (e) {
      console.log('User posts error', e);
    } finally {
      setLoadingPosts(false);
    }
  }, [viewedUserId]);

  useEffect(() => {
    loadProfile();
    loadPosts();
  }, [loadProfile, loadPosts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadProfile(), loadPosts()]);
    setRefreshing(false);
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      await updateMe({
        bio: bioDraft.trim(),
        avatar_url: avatarDraft.trim() || null
      });
      await loadProfile();
      setEditing(false);
    } catch (e) {
      const msg = e.response?.data?.message || 'Greška pri snimanju.';
      if (Platform.OS === 'web') window.alert(msg);
      else {
        const { Alert } = require('react-native');
        Alert.alert('Greška', msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderPost = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.postItem,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.surfaceVariant
        }
      ]}
      onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
    >
      <Text style={{ fontWeight: '600', color: theme.colors.onSurface }} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={{ fontSize: 12, marginTop: 6, color: theme.colors.outline }}>
        {new Date(item.created_at).toLocaleDateString('sr-RS')}
      </Text>
    </TouchableOpacity>
  );

  const listFooter = () => (
    <View style={{ paddingBottom: 40 }}>
      {isOwn && (
        <Button
          mode="contained"
          buttonColor={theme.colors.error}
          textColor={theme.colors.onPrimary}
          style={{ marginTop: 10 }}
          onPress={logout}
        >
          Odjavi se
        </Button>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={loadingPosts ? [] : posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPost}
        ListHeaderComponent={
          <View style={{ padding: 18 }}>
            <ProfileHeader
              loadingProfile={loadingProfile}
              profile={profile}
              isOwn={isOwn}
              editing={editing}
              setEditing={setEditing}
              bioDraft={bioDraft}
              setBioDraft={setBioDraft}
              avatarDraft={avatarDraft}
              setAvatarDraft={setAvatarDraft}
              handleSave={handleSave}
              submitting={submitting}
              postsLength={posts.length}
              onCreatePost={() => navigation.navigate('CreatePost')}
            />
          </View>
        }
        ListFooterComponent={listFooter}
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 30 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !loadingPosts && (
            <Text style={{ color: theme.colors.outline }}>
              {loadingPosts ? '' : 'Nema postova.'}
            </Text>
          )
        }
        keyboardShouldPersistTaps="handled"
      />
      {loadingPosts && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  postItem: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 8,
    alignItems: 'center'
  }
});

export default ProfileScreen;