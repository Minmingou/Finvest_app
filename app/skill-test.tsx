import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { questionBank } from '../src/data/questionBank';
import { useProgress } from '../src/services/progress';
import { QuizRunner } from '../src/components/QuizRunner';
import { DIFFICULTY_LABELS, Question, UserQuestionHistoryEntry, UserSkillLevel } from '../src/types';

// 주제가 겹치지 않도록 고른 고정 진단 세트: easy 3 / medium 3 / hard 2.
// 매번 랜덤이 아니라 고정 세트를 써야 "진단"으로서 결과가 일관된다.
const DIAGNOSTIC_QUESTION_IDS = [
  'l1-q1',
  'l3-q1',
  'l5-q1',
  'l2-q6',
  'l6-q3',
  'l7-q3',
  'l9-q9',
  'l10-q9',
];

const diagnosticQuestions: Question[] = DIAGNOSTIC_QUESTION_IDS.map(
  (id) => questionBank.find((q) => q.id === id)!
).filter(Boolean);

function skillLevelFromScore(score: number, total: number): UserSkillLevel {
  const ratio = score / total;
  if (ratio <= 0.375) return 'beginner'; // 0~3 / 8
  if (ratio <= 0.75) return 'intermediate'; // 4~6 / 8
  return 'advanced'; // 7~8 / 8
}

type Stage = 'intro' | 'quiz' | 'done';

export default function SkillTestScreen() {
  const router = useRouter();
  const { setSkillLevel } = useProgress();
  const [stage, setStage] = useState<Stage>('intro');
  const [result, setResult] = useState<{ score: number; total: number; level: UserSkillLevel } | null>(
    null
  );

  const finishWithLevel = (level: UserSkillLevel) => {
    setSkillLevel(level);
  };

  const handleSkip = () => {
    finishWithLevel('beginner');
    router.replace('/');
  };

  const handleFinish = (score: number, total: number, _history: UserQuestionHistoryEntry[]) => {
    const level = skillLevelFromScore(score, total);
    finishWithLevel(level);
    setResult({ score, total, level });
    setStage('done');
  };

  if (stage === 'quiz') {
    return (
      <View style={styles.container}>
        <QuizRunner questions={diagnosticQuestions} onFinish={handleFinish} />
      </View>
    );
  }

  if (stage === 'done' && result) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>진단 완료! 🎯</Text>
        <Text style={styles.resultText}>
          {result.total}문제 중 {result.score}문제 정답
        </Text>
        <Text style={styles.levelText}>
          추천 실력 레벨: {DIFFICULTY_LABELS[result.level]}
        </Text>
        <Text style={styles.hint}>실력 레벨은 마이페이지에서 언제든 다시 조정할 수 있어요.</Text>
        <Pressable style={styles.button} onPress={() => router.replace('/')}>
          <Text style={styles.buttonText}>학습 시작하기</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>투자 실력을 확인해볼까요?</Text>
      <Text style={styles.description}>
        8개의 간단한 문제로 지금 실력을 진단하고, 그에 맞는 난이도의 문제를 추천해드려요.
      </Text>
      <Pressable style={styles.button} onPress={() => setStage('quiz')}>
        <Text style={styles.buttonText}>진단 시작하기</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={handleSkip}>
        <Text style={styles.secondaryButtonText}>건너뛰기 (입문으로 시작)</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  description: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
  },
  resultText: { fontSize: 18, textAlign: 'center', marginTop: 16 },
  levelText: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginTop: 8 },
  hint: { fontSize: 13, color: '#888', textAlign: 'center', marginTop: 12 },
  button: {
    marginTop: 32,
    backgroundColor: '#222',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: { color: '#888', fontSize: 15 },
});
