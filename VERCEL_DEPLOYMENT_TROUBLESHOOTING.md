# Vercel 배포 문제 해결 가이드

## "Set up and deploy? [Y/n]" 문제 해결

### 문제 원인
GitHub Actions에서 Vercel 배포가 멈추는 이유:
1. Vercel 프로젝트가 처음 설정되는 경우
2. 프로젝트 설정이 완료되지 않은 경우
3. 자동화 플래그가 누락된 경우

### 해결 방법

#### 1단계: 로컬에서 Vercel 프로젝트 완전 설정

```bash
# Vercel CLI 설치
npm install -g vercel

# Vercel 로그인
vercel login

# 프로젝트 링크 (이미 링크되어 있다면 생략)
vercel link

# 프로젝트 정보 확인
vercel project ls

# 프로젝트 설정 확인
vercel env ls
```

#### 2단계: GitHub Secrets 확인

GitHub 저장소의 Settings > Secrets and variables > Actions에서 다음 시크릿들이 올바르게 설정되어 있는지 확인:

**필수 시크릿:**
- `VERCEL_TOKEN`: Vercel 대시보드 > Settings > Tokens에서 생성
- `VERCEL_ORG_ID`: `vercel project ls` 명령어로 확인
- `VERCEL_PROJECT_ID`: `vercel project ls` 명령어로 확인

#### 3단계: Vercel 프로젝트 초기 설정 완료

```bash
# 프로젝트 디렉토리에서
vercel --yes --confirm

# 또는 대화형 설정
vercel
```

#### 4단계: 환경변수 설정

Vercel 대시보드에서 프로젝트 설정 > Environment Variables에서 필요한 환경변수들을 설정:

```bash
# 로컬에서 환경변수 설정
vercel env add VITE_APP_NAME
vercel env add VITE_FIREBASE_API_KEY
# ... 기타 필요한 환경변수들
```

### 워크플로우 개선사항

현재 워크플로우에서 적용된 개선사항:

1. **자동화 플래그 추가**: `--yes --confirm` 플래그로 사용자 입력 방지
2. **working-directory 명시**: 작업 디렉토리 명확히 지정
3. **에러 처리 개선**: 배포 실패 시 명확한 에러 메시지

### 추가 문제 해결

#### 빌드 실패
```bash
# 로컬에서 빌드 테스트
npm run build:production

# Vercel 빌드 로그 확인
vercel logs
```

#### 환경변수 문제
```bash
# 환경변수 목록 확인
vercel env ls

# 환경변수 추가
vercel env add VARIABLE_NAME
```

#### 프로젝트 설정 문제
```bash
# 프로젝트 설정 확인
vercel project ls

# 프로젝트 재링크
vercel link --confirm
```

### 모니터링 및 디버깅

#### 배포 상태 확인
1. GitHub Actions 탭에서 워크플로우 실행 상태 확인
2. Vercel 대시보드에서 배포 로그 확인
3. 배포 URL로 접속하여 애플리케이션 동작 확인

#### 로그 확인
```bash
# Vercel 배포 로그
vercel logs

# GitHub Actions 로그
# GitHub 저장소 > Actions > 워크플로우 > 실행 > 로그
```

### 예방 조치

1. **정기적인 설정 확인**: 매월 Vercel 토큰 유효성 확인
2. **환경변수 백업**: 중요한 환경변수는 문서화하여 보관
3. **테스트 배포**: 주요 변경사항 전에 테스트 배포 실행

### 연락처

문제가 지속되는 경우:
1. Vercel 지원팀: https://vercel.com/support
2. GitHub Actions 문서: https://docs.github.com/en/actions
3. 프로젝트 이슈: GitHub 저장소의 Issues 탭