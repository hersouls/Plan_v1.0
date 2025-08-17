# GitHub Actions를 통한 Vercel 배포 가이드

## 개요

이 프로젝트는 GitHub Actions를 통해 Vercel에 자동 배포되도록 설정되어 있습니다. `main` 브랜치에 푸시하거나 수동으로 워크플로우를 실행하면 자동으로 Vercel에 배포됩니다.

## 필수 GitHub Secrets 설정

GitHub 저장소의 Settings > Secrets and variables > Actions에서 다음 시크릿들을 설정해야 합니다:

### Vercel 설정 (필수)
```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id
```

### Firebase 설정 (필수)
```
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### 애플리케이션 설정 (필수)
```
VITE_APP_NAME=Moonwave Plan
VITE_APP_VERSION=1.0.0
VITE_APP_URL=https://your-vercel-app-url.vercel.app
VITE_API_BASE_URL=https://api.moonwave.kr
```

### 기능 플래그 (선택사항)
```
VITE_ENABLE_PWA=true
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_CLAUDE_AI=true
```

### Claude AI 설정 (선택사항)
```
VITE_CLAUDE_API_KEY=your-claude-api-key
CLAUDE_API_KEY=your-claude-api-key
VITE_CLAUDE_MODEL=claude-3-5-sonnet-20241022
VITE_CLAUDE_MAX_TOKENS=4096
VITE_CLAUDE_TASK_ASSISTANT=true
VITE_CLAUDE_SMART_SUGGESTIONS=true
VITE_CLAUDE_AUTO_CATEGORIZE=true
```

### 분석 및 모니터링 (선택사항)
```
VITE_GOOGLE_ANALYTICS_ID=your-ga-id
VITE_SENTRY_DSN=your-sentry-dsn
```

## Vercel 설정 가져오기

### 1. Vercel CLI 설치
```bash
npm i -g vercel
```

### 2. Vercel 로그인
```bash
vercel login
```

### 3. 프로젝트 링크
```bash
vercel link
```

### 4. 토큰 생성
Vercel 대시보드 > Settings > Tokens에서 새 토큰을 생성하세요.

### 5. 프로젝트 정보 확인
```bash
vercel project ls
```

## 배포 워크플로우

### 자동 배포
- `main` 브랜치에 푸시하면 자동으로 배포됩니다
- 빌드 성공 시 Vercel에 자동 배포됩니다

### 수동 배포
1. GitHub 저장소로 이동
2. Actions 탭 클릭
3. "Deploy Moonwave Travel to Vercel" 워크플로우 선택
4. "Run workflow" 버튼 클릭

## 배포 확인

### GitHub Actions에서 확인
1. Actions 탭에서 워크플로우 실행 상태 확인
2. 빌드 및 배포 로그 확인

### Vercel에서 확인
1. Vercel 대시보드에서 배포 상태 확인
2. 배포 URL로 접속하여 애플리케이션 동작 확인

## 문제 해결

### 빌드 실패
- GitHub Secrets 설정 확인
- 환경변수 값 확인
- TypeScript 오류 확인

### 배포 실패
- Vercel 토큰 유효성 확인
- Vercel 프로젝트 ID 확인
- Vercel 조직 ID 확인

### 런타임 오류
- Firebase 설정 확인
- 환경변수 값 확인
- 브라우저 콘솔 로그 확인

## 보안 고려사항

1. **토큰 보안**: Vercel 토큰은 절대 코드에 하드코딩하지 마세요
2. **환경변수**: 민감한 정보는 GitHub Secrets에만 저장하세요
3. **접근 권한**: 필요한 최소 권한만 부여하세요

## 성능 최적화

### 빌드 최적화
- Node.js 20 사용
- npm 캐싱 활성화
- 불필요한 단계 제거

### 배포 최적화
- 프로덕션 빌드만 배포
- 환경변수 최적화
- 빌드 아티팩트 정리

## 모니터링

### 배포 알림
- GitHub Actions 알림 설정
- Vercel 배포 알림 설정
- 실패 시 이메일 알림

### 성능 모니터링
- Vercel Analytics 사용
- Core Web Vitals 모니터링
- 에러 추적 설정