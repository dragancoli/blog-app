// screens/CreatePostScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Image, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText, useTheme, Snackbar } from 'react-native-paper';
import { createPost } from '../api/posts';
import * as ImagePicker from 'expo-image-picker';

const MAX_TITLE = 120;
const MAX_CONTENT = 5000;

const CreatePostScreen = ({ navigation }) => {
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, msg: '' });

  const titleError = touched && (!title.trim() || title.length > MAX_TITLE);
  const contentError = touched && (!content.trim() || content.length > MAX_CONTENT);

  const pickImage = async () => {
    // Traženje dozvole za pristup galeriji
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Potrebna je dozvola za pristup galeriji!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    setTouched(true);
    if (titleError || contentError) return;
    setSubmitting(true);
    try {
      await createPost(title.trim(), content.trim(), image);
      navigation.goBack(); 
    } catch (e) {
      setSnackbar({ visible: true, msg: 'Greška pri kreiranju posta.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="headlineSmall" style={styles.heading}>Novi post</Text>

        <Button
          icon="camera"
          mode="outlined"
          onPress={pickImage}
          style={styles.imagePickerButton}
        >
          {image ? 'Promeni sliku' : 'Dodaj naslovnu sliku'}
        </Button>

        {image && <Image source={{ uri: image.uri }} style={styles.imagePreview} />}
        
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
      </ScrollView>

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
  container: { flexGrow: 1, padding: 18 },
  heading: { fontWeight: '700', marginBottom: 16, fontFamily: 'Poppins-Bold' },
  imagePickerButton: {
    marginBottom: 16,
    borderStyle: 'dashed',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#eee',
  },
  input: { marginBottom: 4 },
  textArea: { minHeight: 160 },
  helperRow: { marginBottom: 4 },
  button: { marginTop: 12, paddingVertical: 6, borderRadius: 14 },
});

export default CreatePostScreen;