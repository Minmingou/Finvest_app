import { View, Text, StyleSheet } from 'react-native';
import { useProgress, XP_PER_LEVEL } from '../services/progress';

export function LevelProgress() {
  const { level, xp } = useProgress();
  const xpIntoLevel = xp % XP_PER_LEVEL;
  const progressRatio = xpIntoLevel / XP_PER_LEVEL;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.levelText}>Level {level}</Text>
        <Text style={styles.xpText}>
          {xpIntoLevel} / {XP_PER_LEVEL} XP
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progressRatio * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  levelText: { fontSize: 16, fontWeight: '700' },
  xpText: { fontSize: 12, color: '#888' },
  track: { height: 10, borderRadius: 5, backgroundColor: '#eee', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#222', borderRadius: 5 },
});
