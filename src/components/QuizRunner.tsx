import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Question, UserQuestionHistoryEntry } from '../types';

interface QuizRunnerProps {
  questions: Question[];
  onFinish: (score: number, total: number, history: UserQuestionHistoryEntry[]) => void;
}

export function QuizRunner({ questions, onFinish }: QuizRunnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<UserQuestionHistoryEntry[]>([]);
  const [questionStartedAt, setQuestionStartedAt] = useState(() => Date.now());

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleSelect = (optionIndex: number) => {
    if (selectedIndex !== null) return;
    setSelectedIndex(optionIndex);

    const isCorrect = optionIndex === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    setHistory((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        lessonId: currentQuestion.lessonId,
        isCorrect,
        answeredAt: Date.now(),
        selectedAnswer: optionIndex,
        timeSpent: Date.now() - questionStartedAt,
      },
    ]);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      onFinish(score, questions.length, history);
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setSelectedIndex(null);
    setQuestionStartedAt(Date.now());
  };

  return (
    <View>
      <Text style={styles.progress}>
        {currentIndex + 1} / {questions.length}
      </Text>
      <Text style={styles.question}>{currentQuestion.question}</Text>

      {currentQuestion.options.map((option, index) => {
        const isSelected = selectedIndex === index;
        const isCorrect = index === currentQuestion.correctAnswer;
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
        <View style={styles.explanationBox}>
          <Text style={styles.explanationLabel}>해설</Text>
          <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
        </View>
      )}

      {selectedIndex !== null && (
        <Pressable style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>{isLastQuestion ? '결과 보기' : '다음 문제'}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  explanationBox: {
    marginTop: 8,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  explanationLabel: { fontSize: 12, fontWeight: '600', color: '#666', marginBottom: 4 },
  explanationText: { fontSize: 14, lineHeight: 21 },
  button: {
    marginTop: 16,
    backgroundColor: '#222',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
