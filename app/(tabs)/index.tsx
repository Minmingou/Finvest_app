import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useProgress } from '../../src/services/progress';
import { lessons } from '../../src/data/lessons';
import { XPDisplay } from '../../src/components/XPDisplay';
import { ProgressBar } from '../../src/components/ProgressBar';

export default function HomeScreen() {
  const router = useRouter();
  const { streak, completedLessonIds } = useProgress();

  const todayLesson = lessons.find((lesson) => !completedLessonIds.includes(lesson.id));
  const completedCount = completedLessonIds.length;
  const totalCount = lessons.length;
  const progressRatio = totalCount > 0 ? completedCount / totalCount : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>Stock5</Text>

      <View style={styles.section}>
        <Text style={styles.label}>오늘의 학습</Text>
        {todayLesson ? (
          <View style={styles.todayCard}>
            <Text style={styles.todayTitle}>{todayLesson.title}</Text>
            <Text style={styles.todayMeta}>{todayLesson.estimatedMinutes}분</Text>
            <Pressable
              style={styles.button}
              onPress={() => router.push(`/lesson/${todayLesson.id}`)}
            >
              <Text style={styles.buttonText}>학습 시작</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.todayCard}>
            <Text style={styles.doneText}>모든 학습을 완료했습니다! 🎉</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <XPDisplay />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>학습 진행률</Text>
        <Text style={styles.value}>
          {completedCount} / {totalCount} Lessons completed
        </Text>
        <View style={styles.progressBarWrap}>
          <ProgressBar progress={progressRatio} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>연속 학습 일수 (Streak)</Text>
        <Text style={styles.value}>{streak}일</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>배운 개념을 실제 기업에 적용해보기</Text>
        <Pressable style={styles.secondaryButton} onPress={() => router.push('/stock/search')}>
          <Text style={styles.secondaryButtonText}>실제 기업 찾기</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  brand: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  section: { marginBottom: 20 },
  label: { fontSize: 14, color: '#666' },
  value: { fontSize: 18, fontWeight: '600', marginTop: 2 },
  todayCard: {
    marginTop: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  todayTitle: { fontSize: 18, fontWeight: '700' },
  todayMeta: { fontSize: 13, color: '#888', marginTop: 4 },
  doneText: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  button: {
    marginTop: 14,
    backgroundColor: '#222',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  progressBarWrap: { marginTop: 8 },
  secondaryButton: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#222',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: { color: '#222', fontSize: 16, fontWeight: '600' },
});
