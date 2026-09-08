import { View, Text, StyleSheet } from 'react-native';
import { useProgress } from '../../src/services/progress';
import { lessons } from '../../src/data/lessons';
import { xpToNextLevel } from '../../src/utils/xp';
import { ProgressBar } from '../../src/components/ProgressBar';

export default function MyScreen() {
  const { level, xp, streak, completedLessonIds, quizResults } = useProgress();
  const latestQuiz = quizResults[quizResults.length - 1];

  const completedCount = completedLessonIds.length;
  const totalCount = lessons.length;
  const progressRatio = totalCount > 0 ? completedCount / totalCount : 0;

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Level</Text>
        <Text style={styles.value}>{level}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>현재 XP</Text>
        <Text style={styles.value}>{xp}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>다음 Level까지 남은 XP</Text>
        <Text style={styles.value}>{xpToNextLevel(xp)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>완료한 Lesson</Text>
        <Text style={styles.value}>
          {completedCount} / {totalCount}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>학습 진행률</Text>
        <Text style={styles.value}>{Math.round(progressRatio * 100)}%</Text>
        <View style={styles.progressBarWrap}>
          <ProgressBar progress={progressRatio} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Streak</Text>
        <Text style={styles.value}>{streak}일</Text>
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
  progressBarWrap: { marginTop: 8 },
});
