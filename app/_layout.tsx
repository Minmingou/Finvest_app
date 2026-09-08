import { Stack } from 'expo-router';
import { ProgressProvider } from '../src/services/progress';

export default function RootLayout() {
  return (
    <ProgressProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="lesson/[id]" options={{ title: '학습' }} />
      </Stack>
    </ProgressProvider>
  );
}
