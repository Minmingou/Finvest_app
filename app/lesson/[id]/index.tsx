import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { lessons } from '../../../src/data/lessons';
import { useProgress } from '../../../src/services/progress';

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { completeLesson } = useProgress();
  const [showQuizPrompt, setShowQuizPrompt] = useState(false);

  const lesson = lessons.find((item) => item.id === id);

  if (!lesson) {
    return (
      <View style={styles.container}>
        <Text>학습 콘텐츠를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  const handleComplete = () => {
    completeLesson(lesson.id);
    setShowQuizPrompt(true);
  };

  if (showQuizPrompt) {
    return (
      <View style={styles.promptContainer}>
        <Text style={styles.promptTitle}>학습 완료! 🎉</Text>
        <Text style={styles.promptXp}>+20 XP를 획득했어요.</Text>
        <Text style={styles.promptQuestion}>배운 내용을 퀴즈로 테스트해볼까요?</Text>

        <Pressable
          style={styles.button}
          onPress={() => router.replace(`/lesson/${lesson.id}/quiz`)}
        >
          <Text style={styles.buttonText}>퀴즈 풀어보기</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={() => router.replace('/')}>
          <Text style={styles.secondaryButtonText}>다음에 할게요</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{lesson.title}</Text>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{lesson.category}</Text>
        <Text style={styles.metaDivider}>·</Text>
        <Text style={styles.metaText}>예상 학습시간 {lesson.estimatedMinutes}분</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>핵심 개념</Text>
        <Text style={styles.sectionText}>{lesson.summary}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>쉬운 설명</Text>
        <Text style={styles.sectionText}>{lesson.content}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>실제 투자 예시</Text>
        <Text style={styles.sectionText}>{lesson.example}</Text>
      </View>

      <View style={[styles.section, styles.recapBox]}>
        <Text style={styles.sectionLabel}>핵심 정리</Text>
        <Text style={styles.sectionText}>{lesson.summary}</Text>
      </View>

      <Pressable style={styles.button} onPress={handleComplete}>
        <Text style={styles.buttonText}>학습 완료</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  metaText: { fontSize: 13, color: '#888' },
  metaDivider: { fontSize: 13, color: '#ccc' },
  section: { marginTop: 24 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 6 },
  sectionText: { fontSize: 16, lineHeight: 24 },
  recapBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 14,
  },
  button: {
    marginTop: 32,
    backgroundColor: '#222',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  promptContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  promptTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  promptXp: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 12 },
  promptQuestion: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: { color: '#888', fontSize: 15 },
});
