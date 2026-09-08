import { View, Text, StyleSheet } from 'react-native';
import { useProgress } from '../services/progress';
import { xpIntoCurrentLevel, xpToNextLevel, levelProgressRatio, XP_PER_LEVEL } from '../utils/xp';
import { ProgressBar } from './ProgressBar';

export function XPDisplay() {
  const { level, xp } = useProgress();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.levelText}>Level {level}</Text>
        <Text style={styles.xpText}>
          {xpIntoCurrentLevel(xp)} / {XP_PER_LEVEL} XP
        </Text>
      </View>
      <ProgressBar progress={levelProgressRatio(xp)} />
      <Text style={styles.nextLevelText}>다음 레벨까지 {xpToNextLevel(xp)} XP</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  levelText: { fontSize: 16, fontWeight: '700' },
  xpText: { fontSize: 12, color: '#888' },
  nextLevelText: { fontSize: 12, color: '#888', marginTop: 6 },
});
