import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { lessons } from '../../src/data/lessons';
import { useProgress } from '../../src/services/progress';
import { Lesson } from '../../src/types';

export default function LearnScreen() {
  const router = useRouter();
  const { completedLessonIds } = useProgress();

  const renderItem = ({ item }: { item: Lesson }) => {
    const isCompleted = completedLessonIds.includes(item.id);
    return (
      <Pressable style={styles.card} onPress={() => router.push(`/lesson/${item.id}`)}>
        <Text style={styles.cardTitle}>{item.title}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>난이도 {item.difficulty}</Text>
          <Text style={styles.metaText}>{item.estimatedMinutes}분</Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={[styles.statusBadge, isCompleted && styles.statusBadgeCompleted]}>
            {isCompleted ? '완료' : '시작하기'}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={lessons}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  list: { gap: 12 },
  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  metaRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  metaText: { fontSize: 12, color: '#888' },
  statusRow: { marginTop: 12, alignItems: 'flex-end' },
  statusBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#222',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  statusBadgeCompleted: {
    color: '#2e7d32',
    borderColor: '#2e7d32',
  },
});
