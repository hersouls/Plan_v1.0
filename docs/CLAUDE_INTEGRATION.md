# Claude AI Integration Guide (Plan_v2.0 동기화)

Moonwave Plan에 Claude AI 기능을 통합해 스마트한 할일 관리를 제공합니다. 본 문서는 Plan_v2.0 기준으로 정리되었으며 Plan_v1.0에도 100% 동일하게 적용됩니다. 하나도 빠짐없이 Step by step으로 설명합니다.

## 🚀 기능 개요

### 1. AI 할일 어시스턴트
- 자연어로 할일 생성/관리
- 컨텍스트 기반 제안
- 카테고리 자동 분류

### 2. 스마트 입력 향상
- 실시간 할일 분석/보정
- 우선순위 제안
- 예상 소요시간 계산

### 3. AI 기반 제안/인사이트
- 상황별 맞춤 추천
- 가족 구성원별 할당 제안
- 효율적 처리 순서 제안

## 🧩 아키텍처 개요

- 라이브러리: `@anthropic-ai/sdk` 사용
- 설정 파일: `src/lib/claude.ts` (환경변수 기반 동적 활성화)
- 프론트엔드 사용: `useClaudeAI()` 훅과 `claudeAIService` 메서드 노출
- 선택 기능: 통계/포인트 분석기(`src/lib/statisticsAnalyzer.ts`, `src/lib/pointsAnalyzer.ts`)가 Claude 사용
- MCP: `scripts/mcp-task-server.js`, `mcp-config.json`로 모델 컨텍스트 프로토콜 연동

핵심 설정(요약):

```ts
// src/lib/claude.ts 핵심 설정 요약
const config = {
  apiKey: import.meta.env.VITE_CLAUDE_API_KEY || import.meta.env.CLAUDE_API_KEY,
  model: import.meta.env.VITE_CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
  maxTokens: parseInt(import.meta.env.VITE_CLAUDE_MAX_TOKENS || '4096'),
  enabled: import.meta.env.VITE_ENABLE_CLAUDE_AI === 'true'
}
```

## 📋 설치·설정 (Step by step)

### 1) API 키 발급
1. Anthropic Console(`https://console.anthropic.com`) 접속
2. Workspace에서 API Key 생성
3. 아래 환경변수로 등록

### 2) 환경변수(.env) 구성

```bash
# Claude AI Configuration
VITE_ENABLE_CLAUDE_AI=true
VITE_CLAUDE_API_KEY=your-claude-api-key
CLAUDE_API_KEY=your-claude-api-key
VITE_CLAUDE_MODEL=claude-3-5-sonnet-20241022
VITE_CLAUDE_MAX_TOKENS=4096

# 선택 기능 토글
VITE_CLAUDE_TASK_ASSISTANT=true
VITE_CLAUDE_SMART_SUGGESTIONS=true
VITE_CLAUDE_AUTO_CATEGORIZE=true
```

Vercel 배포 시에는 프로젝트 설정 → Environment Variables에 동일 키를 추가하세요. `vercel.json`에도 아래와 같이 매핑되어 있습니다.

```json
{
  "env": {
    "VITE_ENABLE_CLAUDE_AI": "@VITE_ENABLE_CLAUDE_AI",
    "VITE_CLAUDE_API_KEY": "@VITE_CLAUDE_API_KEY",
    "CLAUDE_API_KEY": "@CLAUDE_API_KEY",
    "VITE_CLAUDE_MODEL": "@VITE_CLAUDE_MODEL",
    "VITE_CLAUDE_MAX_TOKENS": "@VITE_CLAUDE_MAX_TOKENS"
  }
}
```

### 3) 의존성 확인

```bash
npm i @anthropic-ai/sdk
```

프로젝트에는 이미 포함되어 있을 수 있습니다. 누락 시 설치하세요.

### 4) 로컬 실행 전 체크

```bash
echo "VITE_ENABLE_CLAUDE_AI=$VITE_ENABLE_CLAUDE_AI"
npm run dev
```

## 🛠️ 사용 방법

### A. 훅/서비스로 바로 사용

```ts
import { useClaudeAI } from '@/lib/claude';

export async function generateWeeklyPlan() {
  const { isAvailable, generateTaskSuggestions, categorizeTask, estimateTaskDuration, suggestTaskPriority } = useClaudeAI();
  if (!isAvailable) return [];

  const suggestions = await generateTaskSuggestions('이번 주 가족 일정 기반 할일 계획');
  return suggestions;
}
```

`claudeAIService`가 노출하는 메서드 목록:

- `generateTaskSuggestions(input: string)`
- `categorizeTask(title: string, description?)`
- `improveTaskDescription(title: string, description?)`
- `generateSubtasks(taskTitle: string, description?)`
- `estimateTaskDuration(title: string, description?)`
- `suggestTaskPriority(title: string, description?, dueDate?)`

### B. UI 컴포넌트 통합(선택)

아래 컴포넌트는 프로젝트 상황에 맞춰 구성하세요.

```tsx
// 예시: SmartTaskInput/ClaudeAssistant/AITaskSuggestions
```

## 🔍 MCP Integration

### 1) 서버 실행

```bash
node scripts/mcp-task-server.js
```

### 2) 제공 도구 목록

- create_task, list_tasks, update_task, delete_task, get_task_stats, suggest_task_improvements

### 3) 클라이언트 연결 예시(`mcp-config.json`)

```json
{
  "mcpServers": {
    "moonwave-tasks": {
      "command": "node",
      "args": ["scripts/mcp-task-server.js"],
      "env": {
        "FIREBASE_PROJECT_ID": "your-project-id"
      }
    },
    "claude-dev": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/claude-dev-mcp"],
      "env": {
        "CLAUDE_API_KEY": "${CLAUDE_API_KEY}",
        "PROJECT_ROOT": "."
      }
    }
  }
}
```

## 🧪 테스트 (—all, —seq, —ultrathink)

다음 명령은 로컬 API 동작을 빠르게 검증하는 예시입니다. npm 스크립트에 인자를 넘길 때는 `--` 이후에 붙입니다.

```bash
# 기본 연결 테스트
npm run claude:test-api

# 전체 시나리오 실행(--all):
npm run claude:test-api -- --all

# 순차 체인 실행(--seq): 앞 단계 결과를 다음 단계 프롬프트에 반영
npm run claude:test-api -- --seq

# 심층 추론 모드(--ultrathink): 토큰 상한/프롬프트를 확장해 추가 분석 패스 수행
npm run claude:test-api -- --ultrathink

# 조합 예시
npm run claude:test-api -- --all --seq --ultrathink
```

플래그 의미:

- `--all`: `generateTaskSuggestions` → `categorizeTask` → `improveTaskDescription` → `generateSubtasks` → `estimateTaskDuration` → `suggestTaskPriority` 순으로 전 기능을 실행합니다.
- `--seq`: 각 단계 출력을 다음 단계 입력에 연쇄적으로 전달합니다(시퀀셜 체인).
- `--ultrathink`: 모델 프롬프트에 추가 분석 단계를 넣고 `max_tokens` 상한을 확대해 더 깊은 근거를 반영합니다. 토큰 과금이 늘 수 있습니다.

참고: 실행 스크립트 구현은 프로젝트 버전에 따라 다를 수 있습니다. 위 플래그는 테스트 러너가 지원하는 경우에만 적용됩니다.

## 🚨 운영·보안 가이드

### 1) 과금/성능
- Claude는 토큰 기반 과금입니다. 요청 빈도/토큰 상한을 제어하세요.
- 동일 입력에 대한 캐싱/디바운싱을 권장합니다.

### 2) 키 보안
- API 키는 환경변수로 관리하세요.
- 브라우저 사용 시 `dangerouslyAllowBrowser: true`는 개발 편의 목적입니다. 운영 환경에서는 서버/엣지 함수 경유를 검토하세요.

### 3) 폴백 동작
- `VITE_ENABLE_CLAUDE_AI !== 'true'` 또는 키 미설정 시, 모든 AI 메서드는 안전한 기본값을 반환합니다.

## 🔧 트러블슈팅

### 1) API 키 오류
```bash
Error: Invalid API key
```
- `.env`의 키/오탈자 확인, 대시보드 키 권한 확인

### 2) 네트워크 오류
```bash
Error: Network request failed
```
- 방화벽/프록시/네트워크 상태 확인

### 3) 파싱 오류
```bash
Error: Failed to parse AI response
```
- 프롬프트 결과가 JSON을 보장하는지 확인하고 필요시 파싱 가드 추가

### 4) 디버깅
```bash
# 기본 연결 테스트
npm run claude:test-api

# 개발 서버 디버그
VITE_DEBUG=true npm run dev

# MCP 서버 디버그
DEBUG=mcp:* node scripts/mcp-task-server.js
```

## 📚 참고

- Claude API: `https://docs.anthropic.com/claude/docs`
- Model Context Protocol: `https://modelcontextprotocol.io/introduction`
- AI 컴포넌트 가이드: `./AI_COMPONENTS.md`

## 🤝 기여하기

문서/코드 개선 제안은 이슈/PR로 환영합니다.