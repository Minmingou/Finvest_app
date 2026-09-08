import { View, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { lessons } from '../../src/data/lessons';
import { useProgress } from '../../src/services/progress';
import { Lesson } from '../../src/types';
import { LessonCard } from '../../src/components/LessonCard';

export default function LearnScreen() {
  const router = useRouter();
  const { completedLessonIds } = useProgress();

  const renderItem = ({ item, index }: { item: Lesson; index: number }) => (
    <LessonCard
      lesson={item}
      order={index + 1}
      completed={completedLessonIds.includes(item.id)}
      onPress={() => router.push(`/lesson/${item.id}`)}
    />
  );

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
});
