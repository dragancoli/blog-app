// components/ProfileHeader.js
import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, ActivityIndicator, Avatar, Button, TextInput, Divider, useTheme } from "react-native-paper";

const ProfileHeader = React.memo(
  ({
    loadingProfile,
    profile,
    isOwn,
    editing,
    setEditing,
    bioDraft,
    setBioDraft,
    avatarDraft,
    handleSave,
    submitting,
    postsLength,
    onCreatePost,
    onPickAvatar,
  }) => {
    const theme = useTheme();

    const styles = React.useMemo(
      () =>
        StyleSheet.create({
          container: {
            backgroundColor: theme.colors.surface,
            borderRadius: 24,
            elevation: 4,
            padding: 20,
            paddingTop: 110,
            alignItems: "center",
          },
          center: { alignItems: "center", justifyContent: "center", paddingVertical: 20 },
          avatar: {
            marginTop: -120,
            borderWidth: 5,
            borderColor: theme.colors.surface,
          },
          profileInfo: {
            alignItems: "center",
            marginTop: 16,
            marginBottom: 16,
          },
          username: { fontFamily: "Poppins-Bold" },
          email: { fontSize: 13, marginTop: 2, color: theme.colors.outline },
          statsRow: {
            flexDirection: "row",
            justifyContent: "space-around",
            marginBottom: 20,
            width: "100%",
          },
          statItem: { alignItems: "center" },
          statValue: { fontFamily: "Poppins-Bold", fontSize: 18, color: theme.colors.primary },
          statLabel: { fontSize: 12, color: theme.colors.outline },
          bioContainer: {
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 8,
            width: "100%",
          },
          editButton: { marginTop: 12 },
          actionsRow: { flexDirection: "row", gap: 8, justifyContent: "flex-end" },
          postsHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
            width: "100%",
          },
          fullWidth: {
            width: "100%",
          },
        }),
      [theme]
    );

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

    let displayAvatarUri = null;
    if (editing && avatarDraft && typeof avatarDraft === "object") {
      displayAvatarUri = avatarDraft.uri;
    } else if (profile.avatar_url) {
      displayAvatarUri = profile.avatar_url;
    }

    return (
      <View style={styles.container}>
        {displayAvatarUri ? (
          <Avatar.Image size={120} source={{ uri: displayAvatarUri }} style={styles.avatar} />
        ) : (
          <Avatar.Text
            size={120}
            label={profile.username ? profile.username.slice(0, 2).toUpperCase() : "?"}
            style={styles.avatar}
          />
        )}

        <View style={styles.profileInfo}>
          <Text variant="headlineSmall" style={styles.username}>
            {profile.username}
          </Text>
          {isOwn && profile.email && <Text style={styles.email}>{profile.email}</Text>}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{postsLength}</Text>
            <Text style={styles.statLabel}>Postova</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {new Date(profile.created_at).toLocaleDateString("sr-RS", { year: "numeric", month: "short" })}
            </Text>
            <Text style={styles.statLabel}>Član od</Text>
          </View>
        </View>

        <View style={styles.bioContainer}>
          {!editing ? (
            <>
              <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: "center" }}>
                {profile.bio || (isOwn ? "Dodajte kratku biografiju." : "Korisnik nema biografiju.")}
              </Text>
              {isOwn && (
                <Button mode="contained-tonal" style={styles.editButton} onPress={() => setEditing(true)}>
                  Uredi profil
                </Button>
              )}
            </>
          ) : (
            <View style={styles.fullWidth}>
              <TextInput
                mode="outlined"
                label="Bio"
                value={bioDraft}
                onChangeText={setBioDraft}
                multiline
                style={{ marginBottom: 8 }}
                autoFocus
              />
              <Button
                icon="camera"
                mode="outlined"
                onPress={onPickAvatar}
                style={{ marginBottom: 12, borderStyle: "dashed" }}
              >
                Promeni sliku profila
              </Button>
              <View style={styles.actionsRow}>
                <Button mode="contained" onPress={handleSave} disabled={submitting}>
                  {submitting ? "Čuvam..." : "Sačuvaj"}
                </Button>
                <Button mode="outlined" onPress={() => setEditing(false)}>
                  Otkaži
                </Button>
              </View>
            </View>
          )}
        </View>

        <Divider style={{ marginVertical: 22, width: "100%" }} />

        <View style={styles.postsHeader}>
          <Text variant="titleMedium" style={{ fontWeight: "700" }}>
            Postovi
          </Text>
          {isOwn && (
            <Button mode="contained" onPress={onCreatePost}>
              Novi post
            </Button>
          )}
        </View>
      </View>
    );
  }
);

export default ProfileHeader;
