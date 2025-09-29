import React, { useState, useEffect, useLayoutEffect, useContext } from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView, Alert, Platform } from 'react-native';
import { getPostById, deletePost } from '../api/posts';
import { AuthContext } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import { Button, Text } from 'react-native-paper';

const PostDetailScreen = ({ route, navigation }) => {
  // Dobijamo ID posta koji je prosleđen iz HomeScreen-a
  const { postId } = route.params;

  // Uzimamo token iz našeg globalnog AuthContext-a
  const { userToken } = useContext(AuthContext);

  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dekodiramo token da dobijemo ID trenutno prijavljenog korisnika
  const currentUserId = userToken ? jwtDecode(userToken).id : null;

  useLayoutEffect(() => {
    // 👇 AŽURIRANA handleDelete FUNKCIJA 👇
    const handleDelete = () => {
      const performDelete = () => {
        deletePost(postId)
          .then(() => {
            const successAlert = Platform.OS === 'web' ? window.alert : Alert.alert;
            successAlert('Uspeh', 'Post je uspešno obrisan.');
            navigation.goBack();
          })
          .catch((err) => {
            console.error("Greška pri brisanju:", err);
            const errorAlert = Platform.OS === 'web' ? window.alert : Alert.alert;
            errorAlert('Greška', 'Nije moguće obrisati post.');
          });
      };

      // Proveravamo platformu
      if (Platform.OS === 'web') {
        // Koristimo window.confirm za web
        if (window.confirm('Da li ste sigurni da želite da obrišete ovaj post?')) {
          performDelete();
        }
      } else {
        // Koristimo Alert.alert za mobilne platforme
        Alert.alert(
          'Potvrda brisanja',
          'Da li ste sigurni da želite da obrišete ovaj post?',
          [
            { text: 'Otkaži', style: 'cancel' },
            { text: 'Obriši', onPress: performDelete, style: 'destructive' },
          ]
        );
      }
    };

    if (post && currentUserId === post.author_id) {
      navigation.setOptions({
        headerRight: () => (
          <Button onPress={handleDelete} style={styles.deleteBtn}>
            <Text style={styles.deleteBtnTxt}> Obriši </Text>
          </Button>
        ),
      });
    } else {
      navigation.setOptions({
        headerRight: () => null,
      });
    }
  }, [navigation, post, currentUserId, postId]);

  // useEffect za dohvatanje podataka o postu sa servera
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await getPostById(postId);
        setPost(data);
      } catch (err) {
        setError('Nije moguće učitati post.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId]); // Izvršava se samo jednom kada se komponenta učita (ili ako se postId promeni)

  // Prikazujemo indikator učitavanja dok se podaci ne dobiju
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Prikazujemo poruku o grešci ako je došlo do problema
  if (error || !post) {
    return (
      <View style={styles.centered}>
        <Text>{error || 'Post nije pronađen.'}</Text>
      </View>
    );
  }

  // Glavni prikaz sa detaljima posta
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.date}>
        Objavljeno: {new Date(post.created_at).toLocaleDateString('sr-RS')}
      </Text>
      <View style={styles.separator} />
      <Text style={styles.content}>{post.content}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#D3C5E5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black'
  },
  date: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 15,
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginBottom: 15,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: 'black'
  },
  deleteBtn: {
    marginRight: 10,
    backgroundColor: '#fb2424a1',
  },
  deleteBtnTxt: {
    color: 'black',
    fontWeight: 'bold',
  }
});

export default PostDetailScreen;