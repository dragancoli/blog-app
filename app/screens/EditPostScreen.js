// screens/EditPostScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator, useTheme, HelperText } from 'react-native-paper';
import { getPostById, updatePost } from '../api/posts';

const MAX_TITLE = 120;
const MAX_CONTENT = 5000;

const EditPostScreen = ({ route, navigation }) => {
  const { postId, initialTitle, initialContent } = route.params;
  const theme = useTheme();

  const [title, setTitle] = useState(initialTitle || '');
  const [content, setContent] = useState(initialContent || '');
  const [loadingPost, setLoadingPost] = useState(!initialTitle); // ako nije prosleđeno iz pretnog ekrana
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const titleError = touched && (!title.trim() || title.length > MAX_TITLE);
  const contentError = touched && (!content.trim() || content.length > MAX_CONTENT);

  const fetchPost = useCallback(async () => {
    if (initialTitle) return; // već imamo
    try {
      setLoadingPost(true);
      const data = await getPostById(postId);
      setTitle(data.title);
      setContent(data.content);
      setErrorMsg('');
    } catch (e) {
      setErrorMsg('Nije moguće učitati post.');
    } finally {
      setLoadingPost(false);
    }
  }, [postId, initialTitle]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleUpdatePost = async () => {
    setTouched(true);
    if (titleError || contentError) return;

    setIsSubmitting(true);
    try {
      await updatePost(postId, title.trim(), content.trim());
      navigation.goBack();
    } catch (error) {
      const msg = error.response?.data?.message || 'Nije moguće ažurirati post.';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        const { Alert } = require('react-native');
        Alert.alert('Greška', msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingPost) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12, color: theme.colors.outline }}>Učitavanje posta...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.error }}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Text variant="headlineSmall" style={[styles.heading, { color: theme.colors.onBackground }]}>
          Uredi post
        </Text>

        <TextInput
          label="Naslov"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          style={styles.input}
          error={!!titleError}
          maxLength={MAX_TITLE}
          onBlur={() => setTouched(true)}
        />
        <HelperText type={titleError ? 'error' : 'info'} visible={true}>
          {titleError ? 'Naslov je obavezan i kraći od 120 karaktera.' : `${title.length}/${MAX_TITLE}`}
        </HelperText>

        <TextInput
          label="Sadržaj"
          value={content}
          onChangeText={setContent}
          mode="outlined"
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={10}
          error={!!contentError}
          maxLength={MAX_CONTENT}
          onBlur={() => setTouched(true)}
        />
        <HelperText type={contentError ? 'error' : 'info'} visible={true}>
          {contentError ? 'Sadržaj je obavezan.' : `${content.length}/${MAX_CONTENT}`}
        </HelperText>

        <Button
          mode="contained"
          style={styles.button}
          onPress={handleUpdatePost}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Ažuriranje...' : 'Sačuvaj izmene'}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  container: { flex: 1, padding: 18 },
  heading: { fontWeight: '700', marginBottom: 12, fontFamily: 'Poppins-Bold' },
  input: { marginBottom: 4 },
  textArea: { minHeight: 160 },
  button: { marginTop: 12, borderRadius: 14, paddingVertical: 6 },
});

export default EditPostScreen;