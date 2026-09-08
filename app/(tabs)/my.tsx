import { View, Text, StyleSheet } from 'react-native';
import { useProgress } from '../../src/services/progress';
import { lessons } from '../../src/data/lessons';

export default function MyScreen() {
  const { level, xp, streak, completedLessonIds, quizResults } = useProgress();
  const latestQuiz = quizResults[quizResults.length - 1];

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Level</Text>
        <Text style={styles.value}>{level}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>XP</Text>
        <Text style={styles.value}>{xp}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Streak</Text>
        <Text style={styles.value}>{streak}일</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>학습 완료 수</Text>
        <Text style={styles.value}>
          {completedLessonIds.length} / {lessons.length}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>퀴즈 점수</Text>
        <Text style={styles.value}>
          {latestQuiz ? `${latestQuiz.score} / ${latestQuiz.total}` : '아직 응시하지 않음'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  section: { marginBottom: 16 },
  label: { fontSize: 14, color: '#666' },
  value: { fontSize: 20, fontWeight: '600', marginTop: 2 },
});
