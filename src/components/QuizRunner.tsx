import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { QuizQuestion } from '../types';

interface QuizRunnerProps {
  questions: QuizQuestion[];
  onFinish: (score: number, total: number) => void;
}

export function QuizRunner({ questions, onFinish }: QuizRunnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleSelect = (optionIndex: number) => {
    if (selectedIndex !== null) return;
    setSelectedIndex(optionIndex);
    if (optionIndex === currentQuestion.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      onFinish(score, questions.length);
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setSelectedIndex(null);
  };

  return (
    <View>
      <Text style={styles.progress}>
        {currentIndex + 1} / {questions.length}
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
});
