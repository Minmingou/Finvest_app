import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuestionHistoryStore, setQuestionHistoryStore } from '../utils/questionEngine';

const STORAGE_KEY = 'finvest:questionHistory:v1';
const MAX_RECENT_PER_KEY = 24;

/**
 * 앱 시작 시 한 번 호출해, 최근 출제 이력을 AsyncStorage에서 불러와
 * questionEngine의 히스토리 저장소를 메모리 기반에서 영속 저장 기반으로 교체한다.
 * 이렇게 해야 앱을 껐다 켜도 "최근에 나온 문제"를 계속 피할 수 있다.
 */
export async function initPersistentQuestionHistory(): Promise<void> {
  const cache = new Map<string, string[]>();

  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Record<string, string[]>;
      Object.entries(saved).forEach(([key, ids]) => cache.set(key, ids));
    }
  } catch {
    // 저장된 이력을 읽지 못하면 빈 상태로 시작한다.
  }

  const persist = () => {
    const obj = Object.fromEntries(cache.entries());
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(obj)).catch(() => {});
  };

  const store: QuestionHistoryStore = {
    getRecentlyUsed(key) {
      return cache.get(key) ?? [];
    },
    recordUsed(key, questionIds) {
      const prev = cache.get(key) ?? [];
      const next = [...prev, ...questionIds].slice(-MAX_RECENT_PER_KEY);
      cache.set(key, next);
      persist();
    },
  };

  setQuestionHistoryStore(store);
}
