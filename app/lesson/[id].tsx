import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { lessons } from '../../src/data/lessons';
import { useProgress } from '../../src/services/progress';

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { completeLesson } = useProgress();

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
    router.replace('/');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{lesson.title}</Text>

      <Text style={styles.sectionLabel}>핵심 설명</Text>
      <Text style={styles.sectionText}>{lesson.summary}</Text>

      <Text style={styles.sectionLabel}>쉬운 예시</Text>
      <Text style={styles.sectionText}>{lesson.example}</Text>

      <Pressable style={styles.button} onPress={handleComplete}>
        <Text style={styles.buttonText}>학습 완료</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  sectionLabel: { fontSize: 14, color: '#666', marginTop: 16 },
  sectionText: { fontSize: 16, marginTop: 4, lineHeight: 22 },
  button: {
    marginTop: 32,
    backgroundColor: '#222',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
