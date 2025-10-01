// screens/ProfileScreen.js
import React, { useEffect, useState, useContext, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Platform } from 'react-native';
import { Text, useTheme, ActivityIndicator, Avatar, Button, TextInput, Divider } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';
import { getMe, updateMe, getUserPosts , getUserProfile} from '../api/users';
import { jwtDecode } from 'jwt-decode';
import { TouchableOpacity } from 'react-native-gesture-handler';

const ProfileScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { logout, userToken } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bioDraft, setBioDraft] = useState('');
  const [avatarDraft, setAvatarDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Ako prosledimo userId u route.params -> prikaz tuđeg profila
  const viewedUserId = route?.params?.userId || (userToken ? jwtDecode(userToken).id : null);
  const isOwn = userToken && viewedUserId === jwtDecode(userToken).id;

  const loadProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);
      if (isOwn) {
        const me = await getMe();
        setProfile(me);
        setBioDraft(me.bio || '');
        setAvatarDraft(me.avatar_url || '');
      } else {
        // javni prikaz
        const data = await getUserProfile(viewedUserId);
        setProfile(data);
      }
    } catch (e) {
      console.log('Profile load error', e);
    } finally {
      setLoadingProfile(false);
    }
  }, [isOwn, viewedUserId]);

  const loadPosts = useCallback(async () => {
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
      style={[styles.postItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceVariant }]}
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

  const listHeader = () => {
    if (loadingProfile) {
      return (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={{ marginTop: 10, color: theme.colors.outline }}>Učitavanje profila...</Text>
        </View>
      );
    }

    if (!profile) {
      return (
        <View style={styles.center}>
          <Text style={{ color: theme.colors.error }}>Profil nije pronađen.</Text>
        </View>
      );
    }

    const avatarUri = profile.avatar_url;

    return (
      <View style={styles.headerBlock}>
        <View style={styles.row}>
          {avatarUri ? (
            <Avatar.Image size={74} source={{ uri: avatarUri }} />
          ) : (
            <Avatar.Text
              size={74}
              label={profile.username ? profile.username.slice(0, 2).toUpperCase() : '?'}
            />
          )}
          <View style={{ marginLeft: 16, flex: 1 }}>
            <Text variant="titleMedium" style={{ fontWeight: '700' }}>
              {profile.username}
            </Text>
            {isOwn && (
              <Text style={{ fontSize: 12, color: theme.colors.outline }}>
                {profile.email}
              </Text>
            )}
            <Text style={{ fontSize: 12, marginTop: 4, color: theme.colors.outline }}>
              Registrovan: {new Date(profile.created_at).toLocaleDateString('sr-RS')}
            </Text>
          </View>
        </View>

        {/* Bio / Edit sekcija */}
        <View style={{ marginTop: 18 }}>
          {!editing ? (
            <>
              <Text style={{ color: theme.colors.onBackground }}>
                {profile.bio ? profile.bio : isOwn ? 'Nema biografije. Dodaj je.' : 'Nema biografije.'}
              </Text>
              {isOwn && (
                <Button
                  mode="text"
                  style={{ marginTop: 6 }}
                  onPress={() => setEditing(true)}
                >
                  Uredi profil
                </Button>
              )}
            </>
          ) : (
            <View style={{ marginTop: 4 }}>
              <TextInput
                mode="outlined"
                label="Bio"
                value={bioDraft}
                onChangeText={setBioDraft}
                multiline
                style={{ marginBottom: 8 }}
              />
              <TextInput
                mode="outlined"
                label="Avatar URL"
                value={avatarDraft}
                onChangeText={setAvatarDraft}
                style={{ marginBottom: 8 }}
              />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  disabled={submitting}
                >
                  {submitting ? 'Čuvam...' : 'Sačuvaj'}
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setEditing(false);
                    setBioDraft(profile.bio || '');
                    setAvatarDraft(profile.avatar_url || '');
                  }}
                >
                  Otkaži
                </Button>
              </View>
            </View>
          )}
        </View>

        <Divider style={{ marginVertical: 22 }} />
        <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: 8 }}>
            Postovi ({posts.length})
        </Text>
        {isOwn && (
          <Button
            mode="contained-tonal"
            style={{ alignSelf: 'flex-start', marginBottom: 12 }}
            onPress={() => navigation.navigate('CreatePost')}
          >
            Novi post
          </Button>
        )}
      </View>
    );
  };

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
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        contentContainerStyle={{ padding: 18 }}
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
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
  headerBlock: {},
  row: { flexDirection: 'row', alignItems: 'center' },
  postItem: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  loadingOverlay: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    padding: 8, alignItems: 'center'
  }
});

export default ProfileScreen;