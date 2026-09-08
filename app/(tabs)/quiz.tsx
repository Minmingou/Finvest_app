import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { quizQuestions } from '../../src/data/quiz';
import { useProgress } from '../../src/services/progress';

export default function QuizScreen() {
  const { recordQuizResult } = useProgress();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);

  const currentQuestion = quizQuestions[currentIndex];
  const isLastQuestion = currentIndex === quizQuestions.length - 1;

  useEffect(() => {
    if (isFinished && !hasRecorded) {
      recordQuizResult(score, quizQuestions.length);
      setHasRecorded(true);
    }
  }, [isFinished, hasRecorded, score, recordQuizResult]);

  const handleSelect = (optionIndex: number) => {
    if (selectedIndex !== null) return;
    setSelectedIndex(optionIndex);
    if (optionIndex === currentQuestion.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setIsFinished(true);
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setSelectedIndex(null);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedIndex(null);
    setScore(0);
    setIsFinished(false);
    setHasRecorded(false);
  };

  if (isFinished) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>퀴즈 결과</Text>
        <Text style={styles.resultText}>
          {quizQuestions.length}문제 중 {score}문제 정답
        </Text>
        <Pressable style={styles.button} onPress={handleRestart}>
          <Text style={styles.buttonText}>다시 풀기</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>
        {currentIndex + 1} / {quizQuestions.length}
      </Text>
      <Text style={styles.question}>{currentQuestion.question}</Text>

      {currentQuestion.options.map((option, index) => {
        const isSelected = selectedIndex === index;
        const isCorrect = index === currentQuestion.correctIndex;
        const showState = selectedIndex !== null;

        return (
          <Pressable
            key={index}
            style={[
              styles.option,
              showState && isCorrect && styles.optionCorrect,
              showState && isSelected && !isCorrect && styles.optionWrong,
            ]}
            onPress={() => handleSelect(index)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </Pressable>
        );
      })}

      {selectedIndex !== null && (
        <Pressable style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>{isLastQuestion ? '결과 보기' : '다음 문제'}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  progress: { fontSize: 14, color: '#666', marginBottom: 8 },
  question: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  option: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
  },
  optionCorrect: { borderColor: '#2e7d32', backgroundColor: '#e8f5e9' },
  optionWrong: { borderColor: '#c62828', backgroundColor: '#ffebee' },
  optionText: { fontSize: 15 },
  button: {
    marginTop: 16,
    backgroundColor: '#222',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  resultText: { fontSize: 18, marginBottom: 24 },
});
