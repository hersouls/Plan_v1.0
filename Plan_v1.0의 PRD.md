## Plan_v1.0 PRD

### 문서 정보
- 버전: 1.0.0
- 상태: 확정
- 문서 ID: plan_v1_0_prd
- 소유 조직: Product Team
- 책임자: Product Manager, Engineering Lead, Design Lead, QA Lead
- 검토자: Security, Data, Legal, Support
- 문서 범위: Plan_v1.0 제품 범위 전체

### TL;DR
Plan_v1.0은 팀이 프로젝트와 업무를 계획·추적·협업할 수 있도록 하는 기본 기능 중심의 협업 도구입니다. 본 PRD는 기능/비기능 요구사항, UX, 데이터/API/보안/운영 기준을 완전하고 결정적으로 정의합니다. 본 문서는 다른 저장소에서도 100% 동일하게 복제될 수 있도록 고정적이고 독립적인 표현만을 사용합니다.

### 목차
- 목적 및 배경
- 제품 비전과 목표
- 성공 지표(KPI)와 가드레일
- 범위 정의(In/Out)
- 사용자 및 페르소나
- 사용자 시나리오(스텝 바이 스텝)
- 기능 요구사항(--all)
- 비기능 요구사항(--ultrathink)
- 권한 및 보안
- 데이터 설계(스키마/수명주기)
- API 설계(엔드포인트/페이로드/오류)
- 시스템/프로세스 흐름(--seq)
- UX 요구사항(IA/와이어프레임 지침/접근성)
- 분석/관측/로깅
- 테스트 전략 및 수용 기준
- 배포/마이그레이션/롤백 계획
- 운영/알림/대시보드/SLO
- 리스크 및 완화 전략
- 일정 및 마일스톤(스텝 바이 스텝)
- 비용/용량/캐패시티 가이드
- 법무/규제/개인정보 보호
- 현지화(i18n)/접근성(a11y)
- 변경 관리 및 히스토리
- 용어집 및 부록

## 1) 목적 및 배경
- 팀 협업 도구의 핵심은 업무를 명확히 정의하고, 실행 상태를 실시간으로 공유하며, 필요한 의사결정을 빠르게 내릴 수 있도록 지원하는 것입니다.
- Plan_v1.0은 최소하지만 실용적인 기능 세트를 제공하여 빠른 도입과 낮은 학습 비용을 지향합니다.

## 2) 제품 비전과 목표
- 비전: “모든 팀이 부담 없이 계획하고, 명확하게 실행하며, 자신 있게 전달한다.”
- 목표
  - 명확성: 업무 및 책임을 한눈에 파악 가능
  - 속도: 작업 생성/변경/검색의 저지연
  - 신뢰성: 고가용성 및 데이터 일관성
  - 확장성: 사용자·작업 수 증가에도 일관된 경험 유지

## 3) 성공 지표(KPI)와 가드레일
- 핵심 지표(NSM)
  - 활성 프로젝트당 주간 완료 작업 수
- 1차 지표
  - 신규 프로젝트 생성률, 주간 활성 사용자(WAU), 작업 생성→완료 전환율
- 2차 지표
  - 작업당 협업 이벤트(댓글/첨부/멘션) 수, 검색→진입 클릭률, 알림 열람률
- 가드레일
  - p99 주요 API 응답 시간, 오류율, 알림 오탐률, 비정상 롤백 빈도, 접근성 준수율

## 4) 범위 정의
- In-Scope (v1.0)
  - 워크스페이스, 프로젝트, 작업, 댓글, 첨부, 라벨, 멘션, 알림(앱/이메일 옵트인), 검색, 기본 리포트
  - RBAC(소유자/관리자/구성원/뷰어), 감사 로그, 기본 활동 피드
- Out-of-Scope (v1.0)
  - 게스트 외부 공유 링크, 서드파티 통합(Slack/Calendar 등), 오프라인 모드, 맞춤 자동화, 고급 대시보드

## 5) 사용자 및 페르소나
- 소유자(Owner): 과금/보안/조직 단위 관리, 모든 권한
- 관리자(Admin): 구성원/프로젝트 설정 관리, 대부분 권한
- 구성원(Member): 프로젝트/작업 생성·편집, 협업 수행
- 뷰어(Viewer): 읽기 전용 접근, 코멘트는 불가(옵션)

## 6) 사용자 시나리오(스텝 바이 스텝)
- 가입/온보딩
  1. 사용자 계정 생성 → 워크스페이스 자동 생성 또는 기존 초대 수락
  2. 기본 프로젝트 템플릿 선택(칸반/리스트)
  3. 첫 작업 생성, 멤버 초대, 알림 설정 완료
- 프로젝트 계획/실행
  1. 프로젝트 생성 → 설명/가시성/멤버 지정
  2. 라벨·우선순위 정의 → 작업 일괄 생성
  3. 담당자/기한/상태 설정 → 진행 중 업데이트
- 협업/의사소통
  1. 댓글 작성, 파일 첨부, @멘션
  2. 상태 변경/보드 이동 시 알림 발송
- 모니터링/보고
  1. 프로젝트 진행률/지연 작업/완료 작업 리포트 확인
  2. 검색으로 특정 업무·사람·라벨 기반 탐색

## 7) 기능 요구사항(--all)
### 7.1 인증/계정
- 이메일+비밀번호 가입/로그인/로그아웃
- 비밀번호 재설정(토큰 메일)
- 세션/토큰 관리: Bearer 토큰, 만료/갱신

### 7.2 워크스페이스/멤버십
- 워크스페이스 생성/편집
- 멤버 초대/제거, 역할 지정(Owner/Admin/Member/Viewer)

### 7.3 프로젝트
- CRUD: 생성/읽기/수정/아카이브/삭제(소프트 삭제)
- 보드 보기(칸반) 및 리스트 보기 전환
- 프로젝트 멤버/가시성(워크스페이스 내 공개/비공개)

### 7.4 작업(Task)
- 필드: 제목, 설명, 상태(Todo/Doing/Done), 우선순위(L/M/H/U), 담당자, 기한, 라벨, 추정, 체크리스트, 서브태스크(1단)
- 작업 정렬/필터/검색(제목/설명/라벨/담당자/상태/기한)
- 칸반 컬럼 이동으로 상태 변경

### 7.5 댓글/첨부/멘션
- 댓글 CRUD(편집 이력 기록)
- 파일 첨부(바이러스 스캔 가정, 미리보기 메타)
- @username 멘션, 알림 트리거

### 7.6 알림
- 인앱 알림: 실시간(폴링 또는 SSE), 읽음 처리
- 이메일 알림: 옵트인, 배치 발송(요약)
- 트리거: 멘션, 배정, 상태 변경, 마감 임박

### 7.7 검색
- 프로젝트/작업/댓글 텍스트 검색
- 고급 필터: 라벨, 담당자, 상태, 기간

### 7.8 리포트(기본)
- 프로젝트 진행률(완료/전체), 지연 작업 수, 주간 완료량 트렌드

### 7.9 감사 로그
- 주요 변경(권한/프로젝트/작업/설정) 기록, 불변 저장

## 8) 비기능 요구사항(--ultrathink)
- 성능(서버 p99)
  - 로그인/토큰 갱신: 300ms 이하
  - 작업 생성/상태변경: 300ms 이하
  - 작업 목록(최대 100건): 500ms 이하
- 가용성
  - 월간 99.9% 이상(계획 점검 제외)
- 확장성/용량 목표(초기)
  - 워크스페이스 10만, 사용자 100만, 작업 1천만
- 일관성
  - 쓰기 후 읽기 일관성, 알림/검색은 최종 일관성 허용(수초 내)
- 보안
  - 전송구간 TLS, 저장시 암호화(민감 필드), RBAC, 감사 로그, 강력한 해시(Argon2/BCrypt)
- 개인정보/규제
  - 최소 수집, 목적 제한, 보존/파기 정책, GDPR/CCPA 호환 원칙
- 접근성
  - WCAG 2.1 AA
- i18n
  - ko-KR, en-US 우선 지원, 문자열 키 기반 번역
- 관측가능성
  - 표준 로그, 지표, 트레이스, 경보 기준 수립(하단 참조)

## 9) 권한 및 보안
- 역할: Owner > Admin > Member > Viewer
- 권한 매트릭스(요약)
  - 워크스페이스 설정: Owner/Admin
  - 프로젝트 생성/편집: Admin/Member(가시성 정책따름)
  - 작업 CRUD: Member(프로젝트 구성원), Viewer 읽기
  - 멤버 관리: Owner/Admin
  - 감사 로그 열람: Owner/Admin

## 10) 데이터 설계
### 10.1 핵심 엔터티
- User(id, email, name, role, locale, status, created_at, updated_at)
- Workspace(id, name, owner_user_id, created_at, updated_at)
- Membership(workspace_id, user_id, role, created_at)
- Project(id, workspace_id, name, description, visibility, status, created_at, updated_at, archived_at)
- Task(id, project_id, title, description, status, priority, assignee_user_id, due_date, estimate, created_at, updated_at, deleted_at)
- TaskLabel(task_id, label_id)
- Label(id, workspace_id, name, color)
- Comment(id, task_id, author_user_id, body, created_at, updated_at)
- Attachment(id, task_id, uploader_user_id, file_name, file_type, file_size, storage_url, created_at)
- Notification(id, user_id, type, entity, entity_id, payload_json, read_at, created_at)
- AuditLog(id, actor_user_id, action, entity, entity_id, before_json, after_json, created_at)

### 10.2 스키마 스니펫(SQL)
```sql
CREATE TABLE user (
  id BIGINT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(120) NOT NULL,
  role VARCHAR(32) NOT NULL,
  locale VARCHAR(16) NOT NULL,
  status VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE workspace (
  id BIGINT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner_user_id BIGINT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE membership (
  workspace_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  role VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  PRIMARY KEY(workspace_id, user_id)
);

CREATE TABLE project (
  id BIGINT PRIMARY KEY,
  workspace_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  visibility VARCHAR(16) NOT NULL,
  status VARCHAR(32) NOT NULL,
  archived_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE task (
  id BIGINT PRIMARY KEY,
  project_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(16) NOT NULL,
  priority VARCHAR(16) NOT NULL,
  assignee_user_id BIGINT NULL,
  due_date DATE NULL,
  estimate INTEGER NULL,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE label (
  id BIGINT PRIMARY KEY,
  workspace_id BIGINT NOT NULL,
  name VARCHAR(64) NOT NULL,
  color VARCHAR(16) NOT NULL
);

CREATE TABLE task_label (
  task_id BIGINT NOT NULL,
  label_id BIGINT NOT NULL,
  PRIMARY KEY(task_id, label_id)
);

CREATE TABLE comment (
  id BIGINT PRIMARY KEY,
  task_id BIGINT NOT NULL,
  author_user_id BIGINT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE attachment (
  id BIGINT PRIMARY KEY,
  task_id BIGINT NOT NULL,
  uploader_user_id BIGINT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(64) NOT NULL,
  file_size BIGINT NOT NULL,
  storage_url TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE notification (
  id BIGINT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  type VARCHAR(64) NOT NULL,
  entity VARCHAR(64) NOT NULL,
  entity_id BIGINT NOT NULL,
  payload_json JSON NOT NULL,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE audit_log (
  id BIGINT PRIMARY KEY,
  actor_user_id BIGINT NOT NULL,
  action VARCHAR(64) NOT NULL,
  entity VARCHAR(64) NOT NULL,
  entity_id BIGINT NOT NULL,
  before_json JSON NULL,
  after_json JSON NULL,
  created_at TIMESTAMP NOT NULL
);
```

### 10.3 데이터 수명주기
- 소프트 삭제: 프로젝트/작업은 `deleted_at/archived_at` 으로 표시 후 30일 보관 → 영구 삭제 배치
- 첨부 파일: 참조 끊김 후 30일 내 영구 삭제
- 감사 로그/알림: 365일 보관(기본), 규제 준수에 따라 조정 가능

## 11) API 설계
- 공통
  - Base Path: `/api/v1`
  - 인증: `Authorization: Bearer <token>`
  - 표준 응답: `{ "success": true|false, "data": ..., "error": { "code": "...", "message": "..." } }`

### 11.1 인증
- POST `/auth/signup`
```json
{
  "email": "user@example.com",
  "password": "<min-12-chars>",
  "name": "홍길동",
  "locale": "ko-KR"
}
```
응답(201):
```json
{ "success": true, "data": { "userId": 123, "workspaceId": 10 } }
```

- POST `/auth/login`
```json
{ "email": "user@example.com", "password": "..." }
```
응답(200):
```json
{ "success": true, "data": { "accessToken": "<jwt>", "expiresInSec": 3600 } }
```

### 11.2 프로젝트
- POST `/projects`
```json
{ "name": "신제품 런치", "description": "...", "visibility": "private" }
```
- GET `/projects?workspaceId=10`
- PATCH `/projects/{projectId}`
- DELETE `/projects/{projectId}` (소프트 삭제)

### 11.3 작업
- POST `/projects/{projectId}/tasks`
```json
{ "title": "브랜드 가이드 정리", "description": "...", "priority": "H", "assigneeUserId": 123, "dueDate": "2025-12-31" }
```
- GET `/projects/{projectId}/tasks?status=Todo&assigneeUserId=123&label=design`
- PATCH `/tasks/{taskId}`
- POST `/tasks/{taskId}:move` (칸반 이동)
```json
{ "toStatus": "Doing" }
```

### 11.4 댓글/첨부
- POST `/tasks/{taskId}/comments`
```json
{ "body": "@user 디자인 확인 부탁!" }
```
- GET `/tasks/{taskId}/comments`
- POST `/tasks/{taskId}/attachments` (멀티파트)

### 11.5 검색
- GET `/search?q=키워드&type=task,project&assignee=123&label=design&status=Todo&from=2025-01-01&to=2025-01-07`

### 11.6 알림
- GET `/me/notifications?onlyUnread=true`
- POST `/me/notifications/{id}:read`

### 11.7 오류 코드 예시
- `AUTH_INVALID_CREDENTIALS` (401)
- `PERMISSION_DENIED` (403)
- `ENTITY_NOT_FOUND` (404)
- `RATE_LIMITED` (429)
- `INTERNAL_ERROR` (500)

## 12) 시스템/프로세스 흐름(--seq)
### 12.1 가입/온보딩 시퀀스
1) 사용자 `POST /auth/signup`
2) 워크스페이스/멤버십 자동 생성
3) 액세스 토큰 발급 → 클라이언트 저장
4) 기본 프로젝트 템플릿 제안

### 12.2 작업 생성/협업 시퀀스
1) 작업 생성 → 감사 로그 기록
2) 멘션 포함 댓글 작성 → 알림 생성/발송
3) 칸반 이동/상태 변경 → 구독자 알림
4) 완료 처리 → 리포트 카운트 업데이트(비차단 비동기)

### 12.3 검색 인덱싱
1) 작업/댓글 변경 이벤트 발생
2) 비동기 인덱서가 색인 업데이트
3) 질의 시 필터/랭킹 적용

## 13) UX 요구사항
- 정보 구조(IA): 워크스페이스 > 프로젝트 > 작업 > 댓글/첨부
- 화면(최소)
  - 로그인/가입, 워크스페이스 홈, 프로젝트 리스트/보드, 작업 상세 패널, 검색 결과, 알림 센터, 설정
- 상호작용
  - 드래그·드롭 칸반 이동, 인라인 편집, 키보드 단축키(신규 작업 N, 검색 /, 저장 Cmd/Ctrl+S)
- 검증
  - 제목 필수, 기한 유효 범위, 파일 크기/형식 제한
- 접근성
  - 포커스 순서 논리적, 콘트라스트, 스크린리더 레이블, 키보드 전용 탐색

## 14) 분석/관측/로깅
- 로그 필드: timestamp, level, request_id, user_id, workspace_id, route, latency_ms, error_code
- 메트릭: 요청 수/오류율/지연(p50/p95/p99), 작업 생성률, 알림 열람률
- 트레이스: 주요 경로(인증/작업 CRUD/검색) 스팬 및 태그
- 알림: SLO 위반, 오류율 급증, 큐 적체, 이메일 바운스율 급등

## 15) 테스트 전략 및 수용 기준
- 단위 테스트: 핵심 도메인(권한, 상태 전이, 검증)
- 통합 테스트: API 계약, DB/검색 인덱서 연동
- E2E: 가입→프로젝트→작업→댓글→알림→검색 흐름
- 수용 기준(예시)
  - 작업 생성: 제목 최소 1자, 255자 이하, 성공 시 201과 리소스 ID 반환
  - 칸반 이동: 상태 전이 규칙 준수, 알림 발생, UI 즉시 반영
  - 검색: 인덱싱 지연 내(≤5초) 결과 반영, 필터 조합 동작

## 16) 배포/마이그레이션/롤백 계획
- 환경: dev/staging/prod 분리
- 배포: 블루-그린 또는 롤링, 헬스체크 게이트
- DB 마이그레이션: 순방향/역방향 스크립트 쌍 관리
- 롤백: 기능 플래그 비활성화 → 이전 버전 복귀 → 데이터 역마이그레이션(필요시)

## 17) 운영/대시보드/SLO
- SLO: 가용성 99.9%, 주요 API p99 ≤ 500ms, 오류율 ≤ 0.5%
- 대시보드: 지연/오류율/트래픽, 알림 전송 성공률, 큐 대기시간
- 런북: 알림 장애, 검색 지연, 마이그레이션 실패 대응 절차 정의

## 18) 리스크 및 완화
- 급격한 데이터 증가 → 파티셔닝/인덱싱/배치 백필 계획
- 이메일 스팸 필터 → 도메인 인증, 발송 속도 제어, 바운스 대응
- 권한 오구현 → 테스트 매트릭스/정책 정적 분석/감사 로그 상시 점검

## 19) 일정 및 마일스톤(스텝 바이 스텝)
- M1(설계 2주): 요구사항 동결, 스키마/API 계약, UX 와이어프레임 고정
- M2(구현 6주): 인증/프로젝트/작업/댓글/알림/검색 순 구현, 병행 테스트
- M3(경량 성능/보안 2주): 부하 테스트, 하드닝, 접근성 점검
- M4(출시 2주): 스테이징 베이크, 리그레션, 생산 배포, 가드레일 모니터링

## 20) 비용/용량 가이드
- 저장소: 작업 1천만 건, 댓글 평균 2건/작업 가정
- 객체 스토리지: 첨부 파일 월 1TB 가정(버전닝 비활성)
- 이메일: 일 최대 100k 알림 메일 가정(요약 배치 권장)

## 21) 법무/규제/개인정보 보호
- 비밀번호 평문 저장 금지, 강한 해시/솔트
- 삭제 요청 처리: 합리적 기간 내 영구 삭제, 백업에서의 자연 소멸 주기 명시
- 데이터 처리 위치/서브프로세서 투명성

## 22) 현지화(i18n)/접근성(a11y)
- 문자열 키/플레이스홀더 분리, 날짜/숫자 로케일 형식화
- 키보드 내비게이션 완전 지원, 라이브 영역 알림 접근성 고려

## 23) 변경 관리
- 버전화: 본 문서는 `1.0.0` 고정, 변경 시 Semantic Versioning
- 변경 절차: 제안 → 검토 → 승인 → 배포 → 공지

## 24) 용어집
- 워크스페이스: 조직/팀 단위 컨테이너
- 프로젝트: 목표·작업 묶음
- 작업(Task): 실행 단위
- 라벨: 태깅 메타데이터
- 감사 로그: 보안/컴플라이언스 추적 기록

## 25) 부록
### 25.1 체크리스트(출시 전)
- 요구사항 대비 기능 누락 없음(스펙 트레이스 매트릭스)
- 성능 기준 충족(p99 지연)
- 권한 매트릭스 테스트 통과
- 접근성 최소 AA 충족
- 데이터 보존/파기 정책 적용
- 로그/알림/대시보드 구성 완료

### 25.2 오픈 이슈(해결 필요)
- 고급 대시보드/자동화 범위 정의(v1.x)
- 외부 통합 우선순위 슬라이싱(Slack/Calendar)

---
본 PRD는 저장소 간 동일 복제를 전제로 작성되었으며, 환경/시간/조직 특이값을 포함하지 않습니다. 모든 수치는 초기 목표치이며, 변경 시 문서 버전을 상향합니다.