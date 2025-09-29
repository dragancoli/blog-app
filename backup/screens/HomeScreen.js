// screens/HomeScreen.js
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';
import { getAllPosts } from '../api/posts';
import { useIsFocused } from '@react-navigation/native';

const HomeScreen = ({ navigation }) => {
  const { logout } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const isFocused = useIsFocused();

  // useEffect se izvršava čim se komponenta učita
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const data = await getAllPosts();
        setPosts(data);
        setError(null);
      } catch (err) {
        setError('Nije moguće učitati postove.');
      } finally {
        setIsLoading(false);
      }
    };

    if (isFocused) { 
      fetchPosts();
    }
  }, [isFocused]); 

  // Prikazujemo indikator učitavanja dok se podaci ne dobiju
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Prikazujemo poruku o grešci ako je došlo do problema
  if (error) {
    return (
      <View style={styles.centered}>
        <Text>{error}</Text>
        <Button title="Pokušaj ponovo" onPress={() => { /* logika za ponovno učitavanje */ }} />
      </View>
    );
  }
  
  // Glavni prikaz sa listom postova
  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.postContainer} 
            onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
          >
            <Text style={styles.postTitle}>{item.title}</Text>
            <Text style={styles.postAuthor}>Autor: {item.author}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.centered}>Trenutno nema postova.</Text>}
      />
      <Button style={styles.button} title="Odjavi se" onPress={logout} >
        <Text style={styles.logout}>Odjavi se</Text>
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#735DA5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postContainer: {
    backgroundColor: '#D3C5E5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  postAuthor: {
    fontSize: 14,
    color: 'gray',
    marginTop: 5,
    fontWeight: 'bold'
  },
  button: {
    height: 50,
    justifyContent: 'center',
    backgroundColor: '#D3C5E5',
  },
  logout: {
    color: '#735DA5',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  }
});

export default HomeScreen;