// screens/ProfileScreen.js
import React, { useEffect, useState, useContext, useCallback, useMemo } from "react";
import { View, StyleSheet, FlatList, RefreshControl, Platform, Alert } from "react-native";
import { Text, useTheme, ActivityIndicator, List, Divider, Button } from "react-native-paper";
import { AuthContext } from "../context/AuthContext";
import { getMe, updateMe, getUserPosts, getUserProfile } from "../api/users";
import { jwtDecode } from "jwt-decode";
import ProfileHeader from "../components/ProfileHeader";
import * as ImagePicker from "expo-image-picker";

const ProfileScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { logout, userToken } = useContext(AuthContext);

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1 },
        listContainer: { padding: 16, paddingBottom: 30 },
        postItem: {
          backgroundColor: theme.colors.surface,
          marginTop: 8,
          borderRadius: 28,
        },
        footer: {
          paddingTop: 20,
        },
        logoutButton: {
          borderColor: theme.colors.error,
        },
      }),
    [theme]
  );

  const decoded = useMemo(() => (userToken ? jwtDecode(userToken) : null), [userToken]);
  const routeUserId = route?.params?.userId;
  const viewedUserId = routeUserId || decoded?.id || null;
  const isOwn = decoded && viewedUserId === decoded.id;

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  const [avatarDraft, setAvatarDraft] = useState(null); // Može biti string (URL) ili objekat (nova slika)
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!viewedUserId) {
      setLoadingProfile(false);
      return;
    }
    try {
      setLoadingProfile(true);
      const pub = await getUserProfile(viewedUserId);
      setProfile((prev) => ({ ...prev, ...pub }));
      setBioDraft(pub.bio || "");
      setAvatarDraft(pub.avatar_url || null); // Postavi početnu vrednost
      if (isOwn) {
        const me = await getMe();
        setProfile((prev) => ({ ...prev, email: me.email }));
      }
    } catch (e) {
      console.log("Profile load error", e);
      setProfile(null);
      if (e.response?.status === 401) logout();
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
      console.log("User posts error", e);
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
      const payload = {
        bio: bioDraft.trim(),
      };
      // Ako je avatarDraft objekat, to je nova slika koju treba poslati
      if (avatarDraft && typeof avatarDraft === "object") {
        payload.avatar = avatarDraft;
      }
      await updateMe(payload);
      await loadProfile(); // Ponovo učitaj profil da se prikažu izmene
      setEditing(false);
    } catch (e) {
      const msg = e.response?.data?.message || "Greška pri snimanju.";
      if (Platform.OS === "web") window.alert(msg);
      else {
        Alert.alert("Greška", msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const pickAvatar = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Potrebna je dozvola za pristup galeriji!");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setAvatarDraft(result.assets[0]);
    }
  };

  const renderPost = ({ item }) => (
    <List.Item
      title={item.title}
      titleStyle={{ fontFamily: "Poppins-SemiBold" }}
      titleNumberOfLines={2}
      description={`Objavljeno: ${new Date(item.created_at).toLocaleDateString("sr-RS")}`}
      descriptionStyle={{ fontSize: 12 }}
      left={(props) => <List.Icon {...props} icon="file-document-outline" />}
      onPress={() => navigation.navigate("PostDetail", { postId: item.id })}
      style={styles.postItem}
    />
  );

  const renderFooter = () => {
    if (!isOwn) return null;
    return (
      <View style={styles.footer}>
        <Button
          mode="outlined"
          textColor={theme.colors.error}
          icon="logout"
          style={styles.logoutButton}
          onPress={logout}
        >
          Odjavi se
        </Button>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPost}
        ItemSeparatorComponent={() => <Divider style={{ height: 1, backgroundColor: theme.colors.background }} />}
        ListHeaderComponent={
          <ProfileHeader
            loadingProfile={loadingProfile}
            profile={profile}
            isOwn={isOwn}
            editing={editing}
            setEditing={setEditing}
            bioDraft={bioDraft}
            setBioDraft={setBioDraft}
            avatarDraft={avatarDraft}
            handleSave={handleSave}
            submitting={submitting}
            postsLength={posts.length}
            onCreatePost={() => navigation.navigate("CreatePost")}
            onPickAvatar={pickAvatar}
          />
        }
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !loadingPosts &&
          profile && (
            <Text style={{ color: theme.colors.outline, textAlign: "center", padding: 20 }}>
              Korisnik još uvek nema postova.
            </Text>
          )
        }
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};

export default ProfileScreen;
