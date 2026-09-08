import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { lessons } from '../../../src/data/lessons';
import { useProgress } from '../../../src/services/progress';
import { QuizRunner } from '../../../src/components/QuizRunner';
import { XPDisplay } from '../../../src/components/XPDisplay';
import { createQuizSession, QUIZ_CONFIG } from '../../../src/utils/questionEngine';
import { UserQuestionHistoryEntry } from '../../../src/types';

interface QuizOutcome {
  score: number;
  total: number;
  xpEarned: number;
}

export default function LessonQuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { recordQuizResult } = useProgress();
  const [outcome, setOutcome] = useState<QuizOutcome | null>(null);

  // Question Selection Engine이 이 화면이 열릴 때 한 번만 문제를 선택하도록
  // useState 초기화 함수 안에서 세션을 생성한다 (재렌더링 시 문제가 바뀌지 않도록).
  const [session] = useState(() => createQuizSession(id ?? '', { count: QUIZ_CONFIG.defaultQuestionCount }));

  const lesson = lessons.find((item) => item.id === id);

  if (!lesson || session.questions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>퀴즈를 찾을 수 없습니다.</Text>
        <Pressable style={styles.button} onPress={() => router.replace('/')}>
          <Text style={styles.buttonText}>Home으로</Text>
        </Pressable>
      </View>
    );
  }

  const handleFinish = (score: number, total: number, _history: UserQuestionHistoryEntry[]) => {
    const xpEarned = recordQuizResult(score, total);
    setOutcome({ score, total, xpEarned });
  };

  if (outcome) {
    const isPerfect = outcome.score === outcome.total;
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{isPerfect ? '정답입니다! 🎯' : '아쉬워요!'}</Text>
        <Text style={styles.resultText}>
          {outcome.total}문제 중 {outcome.score}문제 정답
        </Text>
        {outcome.xpEarned > 0 && (
          <Text style={styles.xpText}>+{outcome.xpEarned} XP 획득</Text>
        )}

        <View style={styles.progressBox}>
          <XPDisplay />
        </View>

        <Pressable style={styles.button} onPress={() => router.replace('/')}>
          <Text style={styles.buttonText}>Home으로</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.lessonTitle}>{lesson.title} 퀴즈</Text>
      <QuizRunner questions={session.questions} onFinish={handleFinish} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  lessonTitle: { fontSize: 14, color: '#888', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  resultText: { fontSize: 18, marginBottom: 8 },
  xpText: { fontSize: 16, color: '#2e7d32', fontWeight: '600', marginBottom: 24 },
  progressBox: { marginBottom: 24, marginTop: 8 },
  button: {
    marginTop: 16,
    backgroundColor: '#222',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
