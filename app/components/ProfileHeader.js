// components/ProfileHeader.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ActivityIndicator, Avatar, Button, TextInput, Divider, useTheme } from 'react-native-paper';

const ProfileHeader = React.memo(({
  loadingProfile,
  profile,
  isOwn,
  editing,
  setEditing,
  bioDraft,
  setBioDraft,
  avatarDraft,
  setAvatarDraft,
  handleSave,
  submitting,
  postsLength,
  onCreatePost
}) => {
  const theme = useTheme();

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
    <View>
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
          {isOwn && profile.email && (
            <Text style={{ fontSize: 12, color: theme.colors.outline }}>
              {profile.email}
            </Text>
          )}
          {profile.created_at && (
            <Text style={{ fontSize: 12, marginTop: 4, color: theme.colors.outline }}>
              Registrovan: {new Date(profile.created_at).toLocaleDateString('sr-RS')}
            </Text>
          )}
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
              autoFocus
            />
            <TextInput
              mode="outlined"
              label="Avatar URL"
              value={avatarDraft}
              onChangeText={setAvatarDraft}
              style={{ marginBottom: 8 }}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.actionsRow}>
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
        Postovi ({postsLength})
      </Text>
      {isOwn && (
        <Button
          mode="contained-tonal"
          style={{ alignSelf: 'flex-start', marginBottom: 12 }}
          onPress={onCreatePost}
        >
          Novi post
        </Button>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
  row: { flexDirection: 'row', alignItems: 'center' },
  actionsRow: { flexDirection: 'row', gap: 8 }
});

export default ProfileHeader;