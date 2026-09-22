# Finvest (Stock5)

주식을 하나도 모르는 사람이 앱만 켜서 진단 테스트 → 레벨별 레슨 → 퀴즈를 거치며 조금씩 배우고,
실전 감각은 실제 종목 검색/시세 화면에서 익히도록 만든 투자 학습 앱입니다. Expo(React Native)
프론트엔드 + FastAPI 백엔드 구조입니다.

## 화면 구성

- **진단 테스트**: 최초 실행 시 난이도가 섞인 8문항으로 실력을 가늠해 beginner/intermediate/advanced 중 하나로 배정. 문항은 매번 랜덤이 아니라 고정 세트라서 "진단" 결과가 매번 달라지지 않습니다.
- **홈**: 오늘의 학습 카드, 진행률, 스트릭/XP
- **배우기**: 레슨 목록 (기초 개념부터 순서대로)
- **퀴즈**: 완료한 레슨 기반으로 문제를 섞어서 출제, 맞히면 XP 획득
- **종목 검색/상세**: 실제 종목 검색 → 시세·기업정보 조회 (KIS/DART 연동, 키 없으면 mock 데이터로 자동 대체)
- **마이**: 진행 상황 관리

## 실행

### 프론트엔드 (Expo)

```bash
npm install
cp .env.example .env
# .env의 EXPO_PUBLIC_API_BASE_URL — 시뮬레이터는 localhost, 실기기(Expo Go)는 PC의 로컬 IP로
npm start
```

### 백엔드 (FastAPI)

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# USE_MOCK_API=true면 KIS/DART 키 없이도 그대로 동작합니다
uvicorn main:app --reload --port 8001
```

## 폴더 구조

```
app/                   # Expo Router 화면 (tabs/lesson/skill-test/stock)
src/
  components/          # LessonCard, QuizRunner, XPDisplay 등
  data/                # 레슨/문제 콘텐츠 (lessons.ts, questionBank.ts)
  services/            # 진행 상황(progress) 로컬 저장 로직
  types/, utils/
backend/
  routers/             # /api/stocks, /api/companies
  services/            # KIS/DART 클라이언트 + mock 데이터 폴백
  models/
```

## 참고

- Expo 57 기준으로 작성돼 있어서, 이후 버전에서 브레이킹 체인지가 있었다면 [Expo 버전별 문서](https://docs.expo.dev/versions/)를 먼저 확인하는 게 좋습니다.
- 백엔드는 `USE_MOCK_API` 하나로 실데이터/mock을 전환합니다. KIS/DART 키를 아직 안 받았어도 mock으로 프론트 개발이 그대로 가능합니다.
