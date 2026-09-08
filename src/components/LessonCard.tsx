import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Lesson, DIFFICULTY_LABELS } from '../types';

interface LessonCardProps {
  lesson: Lesson;
  order: number;
  completed: boolean;
  onPress: () => void;
}

export function LessonCard({ lesson, order, completed, onPress }: LessonCardProps) {
  return (
    <Pressable style={[styles.card, completed && styles.cardCompleted]} onPress={onPress}>
      <View style={styles.headerRow}>
        <Text style={styles.order}>{order}</Text>
        <Text style={styles.title}>{lesson.title}</Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{lesson.category}</Text>
        <Text style={styles.metaText}>· {DIFFICULTY_LABELS[lesson.difficulty]}</Text>
        <Text style={styles.metaText}>· {lesson.estimatedMinutes}분</Text>
      </View>

      <View style={styles.statusRow}>
        <Text style={[styles.statusBadge, completed && styles.statusBadgeCompleted]}>
          {completed ? '완료' : '시작하기'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  cardCompleted: {
    borderColor: '#c8e6c9',
    backgroundColor: '#f4faf5',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  order: { fontSize: 13, color: '#aaa', fontWeight: '700', width: 18 },
  title: { fontSize: 16, fontWeight: '600', flexShrink: 1 },
  metaRow: { flexDirection: 'row', gap: 6, marginTop: 8, marginLeft: 26 },
  metaText: { fontSize: 12, color: '#888' },
  statusRow: { marginTop: 12, alignItems: 'flex-end' },
  statusBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#222',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  statusBadgeCompleted: {
    color: '#2e7d32',
    borderColor: '#2e7d32',
  },
});
