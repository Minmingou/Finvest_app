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
      <Pressable style={styles.item} onPress={() => router.push(`/lesson/${item.id}`)}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemStatus}>{isCompleted ? '완료' : '미완료'}</Text>
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
  item: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  itemTitle: { fontSize: 16, fontWeight: '600' },
  itemStatus: { fontSize: 12, color: '#888', marginTop: 4 },
});
