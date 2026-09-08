import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { searchStocks } from '../../src/services/api';
import { StockSummary } from '../../src/types/stock';

export default function StockSearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StockSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await searchStocks(query.trim());
      setResults(data);
      setSearched(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : '검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: StockSummary }) => (
    <Pressable style={styles.card} onPress={() => router.push(`/stock/${item.code}`)}>
      <Text style={styles.cardName}>{item.name}</Text>
      <Text style={styles.cardMeta}>
        {item.code} · {item.market}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>종목 검색</Text>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="종목명 또는 코드 입력 (예: 삼성전자)"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <Pressable style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>검색</Text>
        </Pressable>
      </View>

      {loading && <ActivityIndicator style={styles.spinner} />}
      {error && <Text style={styles.errorText}>{error}</Text>}
      {!loading && !error && searched && results.length === 0 && (
        <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item.code}
        contentContainerStyle={styles.list}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  searchRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  searchButton: {
    backgroundColor: '#222',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  searchButtonText: { color: '#fff', fontWeight: '600' },
  spinner: { marginTop: 20 },
  errorText: { marginTop: 16, color: '#c62828', fontSize: 14 },
  emptyText: { marginTop: 16, color: '#888', fontSize: 14 },
  list: { gap: 12, marginTop: 16 },
  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  cardName: { fontSize: 16, fontWeight: '600' },
  cardMeta: { fontSize: 12, color: '#888', marginTop: 4 },
});
