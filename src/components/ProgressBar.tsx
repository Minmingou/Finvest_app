import { View, StyleSheet } from 'react-native';

interface ProgressBarProps {
  /** 0 ~ 1 사이의 진행률 */
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, progress));

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${clamped * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 10, borderRadius: 5, backgroundColor: '#eee', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#222', borderRadius: 5 },
});
