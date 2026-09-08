import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useProgress } from '../../src/services/progress';
import { QuizRunner } from '../../src/components/QuizRunner';
import { XPDisplay } from '../../src/components/XPDisplay';
import { createMixedQuizSession, QUIZ_CONFIG } from '../../src/utils/questionEngine';
import { UserQuestionHistoryEntry } from '../../src/types';

interface QuizOutcome {
  score: number;
  total: number;
  xpEarned: number;
}

export default function QuizScreen() {
  const { recordQuizResult, skillLevel } = useProgress();
  const [attempt, setAttempt] = useState(0);
  const [session, setSession] = useState(() =>
    createMixedQuizSession({ count: QUIZ_CONFIG.defaultQuestionCount, skillLevel: skillLevel ?? 'beginner' })
  );
  const [outcome, setOutcome] = useState<QuizOutcome | null>(null);

  const handleFinish = (score: number, total: number, _history: UserQuestionHistoryEntry[]) => {
    const xpEarned = recordQuizResult(score, total);
    setOutcome({ score, total, xpEarned });
  };

  const handleRestart = () => {
    setOutcome(null);
    // Question Selection Engine이 최근 출제 이력을 피해 가능한 다른 문제 조합을 골라준다.
    setSession(
      createMixedQuizSession({ count: QUIZ_CONFIG.defaultQuestionCount, skillLevel: skillLevel ?? 'beginner' })
    );
    setAttempt((prev) => prev + 1);
  };

  if (outcome) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>퀴즈 결과</Text>
        <Text style={styles.resultText}>
          {outcome.total}문제 중 {outcome.score}문제 정답
        </Text>
        {outcome.xpEarned > 0 && (
          <Text style={styles.xpText}>+{outcome.xpEarned} XP 획득</Text>
        )}

        <View style={styles.progressBox}>
          <XPDisplay />
        </View>

        <Pressable style={styles.button} onPress={handleRestart}>
          <Text style={styles.buttonText}>다시 풀기</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <QuizRunner key={attempt} questions={session.questions} onFinish={handleFinish} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
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
