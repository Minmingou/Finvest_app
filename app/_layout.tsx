import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { ProgressProvider } from '../src/services/progress';
import { initPersistentQuestionHistory } from '../src/services/questionHistoryStorage';

export default function RootLayout() {
  useEffect(() => {
    initPersistentQuestionHistory();
  }, []);

  return (
    <ProgressProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="lesson/[id]/index" options={{ title: '학습' }} />
        <Stack.Screen name="lesson/[id]/quiz" options={{ title: '퀴즈' }} />
        <Stack.Screen name="skill-test" options={{ title: '실력 진단', headerBackVisible: false }} />
        <Stack.Screen name="stock/search" options={{ title: '종목 검색' }} />
        <Stack.Screen name="stock/[code]" options={{ title: '종목 상세' }} />
      </Stack>
    </ProgressProvider>
  );
}
