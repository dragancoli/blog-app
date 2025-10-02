// components/CommentsSection.js
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, Alert, Platform } from 'react-native';
import { Text, useTheme, TextInput, Button, ActivityIndicator, IconButton, Divider } from 'react-native-paper';
import { getComments, createComment, updateComment, deleteComment } from '../api/comments';
import { jwtDecode } from 'jwt-decode';

const INDENT_PER_LEVEL = 14;

const CommentsSection = ({ postId, userToken }) => {
  const theme = useTheme();
  const currentUserId = userToken ? jwtDecode(userToken).id : null;

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reloadFlag, setReloadFlag] = useState(0);
  const [error, setError] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [mode, setMode] = useState('create'); // create | reply | edit
  const [targetComment, setTargetComment] = useState(null); // comment object for reply/edit
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getComments(postId, 'tree'); // depth field kad je tree
      setComments(data);
      setError('');
    } catch (e) {
      setError('Nije moguće učitati komentare.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [postId]);

  useEffect(() => {
    load();
  }, [load, reloadFlag]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const resetForm = () => {
    setMode('create');
    setTargetComment(null);
    setInputValue('');
  };

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;
    setSubmitting(true);
    try {
      if (mode === 'create') {
        await createComment(postId, inputValue.trim(), null);
      } else if (mode === 'reply' && targetComment) {
        await createComment(postId, inputValue.trim(), targetComment.id);
      } else if (mode === 'edit' && targetComment) {
        await updateComment(targetComment.id, inputValue.trim());
      }
      resetForm();
      setReloadFlag(f => f + 1);
    } catch (e) {
      const msg = e.response?.data?.message || 'Greška pri slanju.';
      const alertFn = Platform.OS === 'web' ? window.alert : Alert.alert;
      alertFn('Greška', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (comment) => {
    const perform = async () => {
      try {
        await deleteComment(comment.id);
        setReloadFlag(f => f + 1);
      } catch (e) {
        const alertFn = Platform.OS === 'web' ? window.alert : Alert.alert;
        alertFn('Greška', 'Brisanje neuspešno.');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Obrisati komentar?')) perform();
    } else {
      Alert.alert('Brisanje', 'Da li ste sigurni?', [
        { text: 'Otkaži', style: 'cancel' },
        { text: 'Obriši', style: 'destructive', onPress: perform }
      ]);
    }
  };

  const startReply = (comment) => {
    setMode('reply');
    setTargetComment(comment);
    setInputValue(``);
  };

  const startEdit = (comment) => {
    setMode('edit');
    setTargetComment(comment);
    setInputValue(comment.content);
  };

  const cancelEdit = () => {
    resetForm();
  };

  const renderItem = ({ item }) => {
    const isOwner = currentUserId && item.user_id === currentUserId;
    return (
      <View
        style={[
          styles.commentContainer,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.surfaceVariant,
            marginLeft: item.depth * INDENT_PER_LEVEL
          }
        ]}
      >
        <View style={styles.commentHeader}>
          <Text style={[styles.author, { color: theme.colors.primary }]}>
            {item.author || 'Korisnik'}
          </Text>
          <Text style={[styles.time, { color: theme.colors.outline }]}>
            {new Date(item.created_at).toLocaleDateString('sr-RS')}
          </Text>
        </View>
        <Text style={[styles.commentText, { color: theme.colors.onSurface }]}>
          {item.content}
        </Text>
        <View style={styles.actionsRow}>
          {currentUserId && (
            <Button
              mode="text"
              compact
              onPress={() => startReply(item)}
              style={styles.actionBtn}
            >
              Odgovori
            </Button>
          )}
          {isOwner && (
            <>
              <Button
                mode="text"
                compact
                onPress={() => startEdit(item)}
                style={styles.actionBtn}
              >
                Uredi
              </Button>
              <Button
                mode="text"
                compact
                onPress={() => handleDelete(item)}
                textColor={theme.colors.error}
                style={styles.actionBtn}
              >
                Obriši
              </Button>
            </>
          )}
        </View>
      </View>
    );
  };

  const keyExtractor = (item) => item.id.toString();

  const formTitle = useMemo(() => {
    if (mode === 'reply' && targetComment) return `Odgovor na @${targetComment.author || 'korisnik'}`;
    if (mode === 'edit') return 'Izmena komentara';
    return 'Dodaj komentar';
  }, [mode, targetComment]);

  return (
    <View style={styles.wrapper}>
      <Divider style={{ marginVertical: 22 }} />
      <Text variant="titleMedium" style={{ fontWeight: '300', marginBottom: 10, marginLeft: 10, fontFamily: 'BlackOpsOne-Regular' }}>
        Komentari
      </Text>

      {loading ? (
        <View style={[styles.center]}>
          <ActivityIndicator />
          <Text style={{ marginTop: 10, color: theme.colors.outline }}>Učitavanje...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={{ color: theme.colors.error }}>{error}</Text>
          <Button mode="contained-tonal" style={{ marginTop: 10 }} onPress={load}>
            Pokušaj ponovo
          </Button>
        </View>
      ) : comments.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ color: theme.colors.outline }}>Još uvek nema komentara.</Text>
        </View>
      ) : (
        <FlatList
          data={comments}
            keyExtractor={keyExtractor}
          renderItem={renderItem}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={{ paddingBottom: 12 }}
        />
      )}

      <View style={[styles.formContainer, { backgroundColor: theme.colors.surface }]}>
        <Text
          variant="bodyMedium"
          style={{ fontWeight: '600', marginBottom: 16, color: theme.colors.onSurface }}
        >
          {formTitle}
        </Text>
        {mode !== 'create' && (
          <View style={styles.inlineActions}>
            <Text style={{ color: theme.colors.outline, flex: 1 }}>
              {mode === 'reply'
                ? `Odgovaraš na: ${targetComment?.author || 'korisnik'}`
                : 'Menjaš komentar'}
            </Text>
            <IconButton
              icon="close"
              size={18}
              onPress={cancelEdit}
              accessibilityLabel="Otkaži"
            />
          </View>
        )}
        <TextInput
          mode="outlined"
          placeholder={
            mode === 'reply'
              ? 'Unesi odgovor...'
              : mode === 'edit'
              ? 'Izmeni komentar...'
              : 'Napiši komentar...'
          }
          value={inputValue}
          onChangeText={setInputValue}
          multiline
          dense
          style={styles.input}
          maxLength={2000}
        />
        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={submitting || !inputValue.trim()}
          style={styles.submitBtn}
        >
          {submitting
            ? 'Slanje...'
            : mode === 'edit'
            ? 'Sačuvaj'
            : mode === 'reply'
            ? 'Odgovori'
            : 'Objavi'}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginTop: 10 },
  center: { alignItems: 'center', paddingVertical: 20 },
  commentContainer: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
  },
  commentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 8 },
  author: { fontWeight: '600', fontSize: 13 },
  time: { fontSize: 11 },
  commentText: { fontSize: 14, lineHeight: 20 },
  actionsRow: { flexDirection: 'row', marginTop: 4, gap: 6 },
  actionBtn: { marginRight: -6 },
  formContainer: {
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    elevation: 1
  },
  input: { marginBottom: 8, maxHeight: 140 },
  submitBtn: { alignSelf: 'flex-end', borderRadius: 12 },
  inlineActions: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 }
});

export default CommentsSection;