import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useProgress } from '../../src/services/progress';
import { lessons } from '../../src/data/lessons';

export default function HomeScreen() {
  const router = useRouter();
  const { level, xp, streak, completedLessonIds } = useProgress();

  const todayLesson =
    lessons.find((lesson) => !completedLessonIds.includes(lesson.id)) ?? lessons[0];

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>Stock5</Text>

      <View style={styles.section}>
        <Text style={styles.label}>오늘의 추천 학습</Text>
        <Text style={styles.value}>{todayLesson.title}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>현재 Level</Text>
        <Text style={styles.value}>{level}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>현재 XP</Text>
        <Text style={styles.value}>{xp}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>연속 학습 일수 (Streak)</Text>
        <Text style={styles.value}>{streak}일</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>완료한 학습 수</Text>
        <Text style={styles.value}>
          {completedLessonIds.length} / {lessons.length}
        </Text>
      </View>

      <Pressable
        style={styles.button}
        onPress={() => router.push(`/lesson/${todayLesson.id}`)}
      >
        <Text style={styles.buttonText}>오늘의 학습 시작</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  brand: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  section: { marginBottom: 16 },
  label: { fontSize: 14, color: '#666' },
  value: { fontSize: 18, fontWeight: '600', marginTop: 2 },
  button: {
    marginTop: 20,
    backgroundColor: '#222',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
