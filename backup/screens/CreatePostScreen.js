// screens/CreatePostScreen.js
import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Platform } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { createPost } from '../api/posts';

const CreatePostScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreatePost = async () => {
    if (!title || !content) {
      const alert = Platform.OS === 'web' ? window.alert : require('react-native').Alert.alert;
      alert('Greška', 'Molimo popunite naslov i sadržaj.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createPost(title, content);
      // Ako je post uspešno kreiran, vraćamo se na HomeScreen
      navigation.goBack();
    } catch (error) {
      const alert = Platform.OS === 'web' ? window.alert : require('react-native').Alert.alert;
      alert('Greška', 'Nije moguće kreirati post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Naslov"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Sadržaj..."
        value={content}
        onChangeText={setContent}
        multiline={true} // Omogućava unos u više redova
        numberOfLines={10}
      />
      <Button
        style={styles.button}
        onPress={handleCreatePost}
        disabled={isSubmitting} // Onemogućava duplo slanje
      >
        <Text style={styles.buttonText}>{isSubmitting ? 'Kreiranje...' : 'Kreiraj post'}</Text>
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#D3C5E5',
  },
  input: {
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 200, // Veća visina za sadržaj
    textAlignVertical: 'top', // Poravnava tekst na vrh na Androidu
  },
  button: {
    height: 50,
    justifyContent: 'center',
    backgroundColor: '#735DA5',
    marginRight: 10,
  },
  buttonText: {
    color: '#D3C5E5',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default CreatePostScreen;