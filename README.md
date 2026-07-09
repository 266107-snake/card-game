# 숫자 카드 콤보

카드 3장을 뽑아 조합 점수를 만들고, 별/함정/조커 특수 카드로 기록에 도전하는 웹 게임입니다. Vite 기반 HTML, CSS, JavaScript 프로젝트이며 Firebase Authentication과 Firestore를 연결할 수 있습니다.

## 폴더 구조

```text
index.html
vite.config.js
.env.example
src/
  styles/main.css
  js/
    main.js
    ui.js
    cards.js
    score.js
    gameState.js
    firebase.js
    auth.js
    storage.js
    ranking.js
```

## 설치와 실행

```bash
npm install
npm run dev
```

빌드:

```bash
npm run build
```

## Firebase 설정

`.env.example`을 참고해 `.env` 파일을 만들고 Firebase 웹 앱 설정값을 입력합니다.

```text
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

환경 변수가 비어 있으면 Firebase는 초기화되지 않고 localStorage 저장만 사용합니다.

## Firestore 구조

```text
users/{uid}
  displayName
  records[]
  bestScore
  worstScore
  playCount
  neonUnlocked
  selectedSkin

users/{uid}/records/{recordId}
  selectedRounds
  endedRound
  finalScore
  endType
  skin
  playedAt

rankings/{uid}
  displayName
  bestScore
  worstScore
  playCount
```

## Vercel 배포

1. GitHub에 프로젝트를 업로드합니다.
2. Vercel에서 해당 저장소를 Import합니다.
3. Build Command는 `npm run build`, Output Directory는 `dist`를 사용합니다.
4. Vercel Project Settings의 Environment Variables에 `.env`와 같은 Firebase 값을 등록합니다.

## 게임 규칙 요약

- 매 라운드 카드 3장을 뽑습니다.
- 같은 숫자 3장 80점, 연속 숫자 3장 50점, 같은 숫자 2장 30점, 그 외 10점입니다.
- 별 1장은 x2, 별 2장은 x3, 별 3장은 100점 보너스입니다.
- 함정 1장은 -30점, 2장은 -60점, 3장은 -100점입니다.
- 조커는 1부터 9까지 원하는 숫자로 바꿀 수 있습니다.
- 최근 기록 20개, 최고점, 최저점, 총 도전 횟수를 저장합니다.
- 5회 이상 도전하면 네온 카드 디자인이 해제됩니다.
