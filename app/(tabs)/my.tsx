import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useProgress } from '../../src/services/progress';
import { lessons } from '../../src/data/lessons';
import { xpToNextLevel } from '../../src/utils/xp';
import { ProgressBar } from '../../src/components/ProgressBar';
import { DIFFICULTY_LABELS, USER_SKILL_LEVELS, UserSkillLevel } from '../../src/types';

export default function MyScreen() {
  const router = useRouter();
  const { level, xp, streak, completedLessonIds, quizResults, skillLevel, setSkillLevel } = useProgress();
  const latestQuiz = quizResults[quizResults.length - 1];
  const currentSkillLevel = skillLevel ?? 'beginner';

  const completedCount = completedLessonIds.length;
  const totalCount = lessons.length;
  const progressRatio = totalCount > 0 ? completedCount / totalCount : 0;

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Level</Text>
        <Text style={styles.value}>{level}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>현재 XP</Text>
        <Text style={styles.value}>{xp}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>다음 Level까지 남은 XP</Text>
        <Text style={styles.value}>{xpToNextLevel(xp)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>완료한 Lesson</Text>
        <Text style={styles.value}>
          {completedCount} / {totalCount}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>학습 진행률</Text>
        <Text style={styles.value}>{Math.round(progressRatio * 100)}%</Text>
        <View style={styles.progressBarWrap}>
          <ProgressBar progress={progressRatio} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Streak</Text>
        <Text style={styles.value}>{streak}일</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>퀴즈 점수</Text>
        <Text style={styles.value}>
          {latestQuiz ? `${latestQuiz.score} / ${latestQuiz.total}` : '아직 응시하지 않음'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>실력 레벨</Text>
        <View style={styles.skillLevelRow}>
          {USER_SKILL_LEVELS.map((skillLevelOption) => (
            <Pressable
              key={skillLevelOption}
              style={[
                styles.skillLevelPill,
                skillLevelOption === currentSkillLevel && styles.skillLevelPillActive,
              ]}
              onPress={() => setSkillLevel(skillLevelOption as UserSkillLevel)}
            >
              <Text
                style={[
                  styles.skillLevelPillText,
                  skillLevelOption === currentSkillLevel && styles.skillLevelPillTextActive,
                ]}
              >
                {DIFFICULTY_LABELS[skillLevelOption]}
              </Text>
            </Pressable>
          ))}
        </View>
        <Pressable style={styles.retestLink} onPress={() => router.push('/skill-test')}>
          <Text style={styles.retestLinkText}>실력 다시 진단하기</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  section: { marginBottom: 16 },
  label: { fontSize: 14, color: '#666' },
  value: { fontSize: 20, fontWeight: '600', marginTop: 2 },
  progressBarWrap: { marginTop: 8 },
  skillLevelRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  skillLevelPill: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skillLevelPillActive: { borderColor: '#222', backgroundColor: '#222' },
  skillLevelPillText: { fontSize: 14, color: '#666', fontWeight: '600' },
  skillLevelPillTextActive: { color: '#fff' },
  retestLink: { marginTop: 10 },
  retestLinkText: { fontSize: 13, color: '#888', textDecorationLine: 'underline' },
});
