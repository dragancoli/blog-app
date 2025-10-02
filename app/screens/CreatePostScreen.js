// screens/CreatePostScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText, useTheme, Snackbar } from 'react-native-paper';
import { createPost } from '../api/posts';

const MAX_TITLE = 120;
const MAX_CONTENT = 5000;

const CreatePostScreen = ({ navigation }) => {
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, msg: '' });

  const titleError = touched && (!title.trim() || title.length > MAX_TITLE);
  const contentError = touched && (!content.trim() || content.length > MAX_CONTENT);

  const handleSubmit = async () => {
    setTouched(true);
    if (titleError || contentError) return;
    setSubmitting(true);
    try {
      await createPost(title.trim(), content.trim());
      setSnackbar({ visible: true, msg: 'Post kreiran!' });
      setTimeout(() => navigation.goBack(), 650);
    } catch (e) {
      setSnackbar({ visible: true, msg: 'Greška pri kreiranju posta.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Text variant="headlineSmall" style={styles.heading}>Novi post</Text>
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
        <View style={styles.helperRow}>
          <HelperText type={titleError ? 'error' : 'info'} visible={true}>
            {titleError
              ? 'Naslov je obavezan i ne sme biti duži od ' + MAX_TITLE + ' karaktera.'
              : `${title.length}/${MAX_TITLE}`}
          </HelperText>
        </View>
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
        <View style={styles.helperRow}>
          <HelperText type={contentError ? 'error' : 'info'} visible={true} style={{ flex: 1 }}>
            {contentError
              ? 'Sadržaj je obavezan.'
              : `${content.length}/${MAX_CONTENT}`}
          </HelperText>
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={submitting}
          style={styles.button}
        >
          {submitting ? 'Kreiranje...' : 'Objavi'}
        </Button>
      </View>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar(s => ({ ...s, visible: false }))}
        duration={2400}
      >
        {snackbar.msg}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, padding: 18 },
  heading: { fontWeight: '700', marginBottom: 12, fontFamily: 'Poppins-Bold' },
  input: { marginBottom: 4 },
  textArea: { minHeight: 160 },
  helperRow: { marginBottom: 4 },
  button: { marginTop: 12, paddingVertical: 6, borderRadius: 14 },
});

export default CreatePostScreen;