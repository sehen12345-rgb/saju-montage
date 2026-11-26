# 내님은누구 — AI 사주 몽타주

사주팔자 기반 AI 운명 분석 서비스. 운명의 배우자·귀인·악연 인물을 AI가 몽타주로 그려주는 유료 서비스입니다.

---

## 개발 환경

### 요구사항

| 항목 | 버전 |
|------|------|
| Node.js | 20 LTS 이상 |
| npm | 10 이상 |
| OS | Windows / macOS / Linux |

### 기술 스택

| 레이어 | 라이브러리 / 도구 |
|--------|-----------------|
| 프레임워크 | Next.js 16.2.2 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| 인증 | next-auth v5 (카카오 / 네이버 / 구글 / 이메일) |
| AI 분석 | Anthropic SDK (`claude-sonnet-4-6`) |
| AI 이미지 | OpenAI SDK (DALL·E) + Pollinations.ai (fallback) |
| 결제 | TossPayments Widget SDK |
| 린트 | ESLint 9 (next config) |
| 타입 | TypeScript 5 |

### 로컬 실행

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정 (.env.local 생성)
cp .env.example .env.local   # 예시 파일이 없으면 아래 목록 참고

# 3. 개발 서버 시작
npm run dev
# → http://localhost:3000
```

### 필수 환경변수

```env
# Anthropic
ANTHROPIC_API_KEY=

# OpenAI (이미지 생성)
OPENAI_API_KEY=

# TossPayments
NEXT_PUBLIC_TOSS_CLIENT_KEY=
TOSS_SECRET_KEY=

# next-auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# 소셜 로그인
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

---

## 아키텍처

### 디렉토리 구조

```
saju-montage/
├── app/
│   ├── layout.tsx            # 루트 레이아웃 (AuthProvider, Header, 캐시버스팅)
│   ├── page.tsx              # 홈 — 상품 선택 (3가지)
│   ├── input/page.tsx        # 사주 입력 폼 (3-스텝 위저드)
│   ├── result/page.tsx       # 결과 페이지 (유료/무료 분기)
│   ├── login/page.tsx        # 로그인 (소셜 + 이메일)
│   ├── mypage/page.tsx       # 마이페이지
│   ├── payment/
│   │   ├── success/page.tsx  # 결제 성공 처리
│   │   └── fail/page.tsx     # 결제 실패 처리
│   ├── api/
│   │   ├── analyze-saju/     # Claude API — 배우자 분석
│   │   ├── analyze-guardian/ # Claude API — 귀인 분석
│   │   ├── analyze-enemy/    # Claude API — 웬수 분석
│   │   ├── generate-image/   # OpenAI DALL·E 이미지 생성
│   │   ├── proxy-image/      # 이미지 프록시 (CORS 우회)
│   │   ├── payment/confirm/  # TossPayments 결제 승인
│   │   ├── portrait/         # 인물 묘사 생성
│   │   └── auth/             # next-auth 핸들러
│   ├── sitemap.ts
│   └── opengraph-image.tsx
├── components/
│   ├── ResultCard.tsx         # 배우자 결과 카드
│   ├── GuardianResultCard.tsx # 귀인 결과 카드
│   ├── EnemyResultCard.tsx    # 웬수 결과 카드
│   ├── SajuInputForm.tsx      # 입력 폼
│   ├── Header.tsx             # 공통 헤더
│   ├── LoadingScreen.tsx      # 로딩 UI
│   └── AuthProvider.tsx       # next-auth 세션 프로바이더
├── lib/
│   ├── saju.ts                # 만세력 기반 사주 계산 (태양 황경)
│   ├── prompts.ts             # Claude 프롬프트 모음
│   ├── types.ts               # 공용 타입 정의
│   ├── paymentStorage.ts      # localStorage 결제 상태 관리
│   ├── portrait.ts            # 인물 묘사 유틸
│   ├── deterministic.ts       # 결정론적 데이터 생성
│   └── demo.ts                # 데모 데이터
├── auth.ts                    # next-auth 설정 (providers, callbacks)
├── next.config.ts
├── vercel.json                # Vercel 함수 타임아웃 설정
└── tsconfig.json
```

### 데이터 흐름

```
사용자 입력 (생년월일시 + 성별)
        ↓
lib/saju.ts — 사주팔자·오행·천간지지 계산
        ↓
app/input/page.tsx — 상품 선택 + TossPayments 결제 위젯
        ↓
결제 성공 (payment/success) — /api/payment/confirm 로 승인
        ↓
result/page.tsx
  ├── /api/analyze-saju    → Claude (배우자 성격·특징 분석)
  ├── /api/analyze-guardian → Claude (귀인 분석)
  ├── /api/analyze-enemy   → Claude (웬수 분석)
  └── /api/generate-image  → OpenAI DALL·E (몽타주 이미지)
        ↓
ResultCard / GuardianResultCard / EnemyResultCard — 결과 표시
```

### 결제 & 접근 제어

- 결제 상태는 `lib/paymentStorage.ts`가 `localStorage`에 저장
- 결과 페이지는 결제 완료 여부에 따라 유료(전체) / 무료(미리보기) 분기
- 상품별 가격: 각 **990원**

### 인증

- JWT 세션 전략 (`next-auth` v5)
- 소셜: 카카오·네이버·구글
- 이메일: 이메일 주소 자체가 사용자 ID (passwordless)
- 보호 경로: `/mypage`, 결제 후 결과

---

## 배포 환경

### 플랫폼: Vercel

- 브랜치 `main` 푸시 시 자동 배포
- 프로덕션 URL: `https://saju-montage.vercel.app`

### Vercel 함수 타임아웃 (`vercel.json`)

| 라우트 | maxDuration |
|--------|-------------|
| `/api/analyze-saju` | 60s |
| `/api/analyze-guardian` | 60s |
| `/api/analyze-enemy` | 60s |
| `/api/generate-image` | 60s |
| `/api/proxy-image` | 60s |
| `/api/payment/confirm` | 30s |

### 빌드 & 배포 명령

```bash
npm run build   # 프로덕션 빌드 검증
npm run start   # 로컬에서 프로덕션 모드 실행
```

### 환경변수 설정 위치

Vercel 대시보드 → 프로젝트 Settings → Environment Variables에 위 `.env.local` 항목 전부 등록

---

## 디자인 가이드

### 테마: 다크 프리미엄

미스테리하고 고급스러운 분위기를 일관되게 유지합니다.

### 배경색

| 용도 | 클래스 / 값 |
|------|------------|
| 페이지 배경 | `bg-[#0d0d12]` |
| 카드 배경 | `bg-[#13131a]` |
| 카드 테두리 | `border border-white/10` |

> 새 페이지·컴포넌트를 추가할 때 반드시 `bg-[#0d0d12]`를 최상위 배경으로 사용합니다.

### 텍스트

| 용도 | 클래스 |
|------|--------|
| 기본 텍스트 | `text-white` |
| 보조 텍스트 | `text-gray-400` |
| 디스크립션 | `text-gray-500` |

### 강조 (Accent) 색상

| 상품 | 색상 | 클래스 예시 |
|------|------|------------|
| 내님은누구 (배우자) | 로즈 | `text-rose-400`, `border-rose-500/30` |
| 내귀인은누구 (귀인) | 앰버 | `text-amber-400`, `border-amber-500/30` |
| 내웬수는누구 (웬수) | 레드 | `text-red-400`, `border-red-500/30` |
| 공통 강조 | 옐로 | `text-yellow-400` |

### 카드 컴포넌트 기본 패턴

```tsx
<div className="bg-[#13131a] border border-white/10 rounded-2xl p-6">
  {/* 내용 */}
</div>
```

### 그라데이션 & 글로우

- 강조 요소에 `bg-gradient-to-r from-rose-500 to-pink-500` 형태 사용
- 버튼 호버: `hover:shadow-[0_0_20px_rgba(244,63,94,0.4)]`
- 섹션 구분 divider: `border-t border-white/5`

### 타이포그래피

- 한글 위주 컨텐츠 → 폰트 별도 지정 없이 시스템 폰트 fallback 사용
- 제목: `text-2xl font-bold text-white`
- 소제목: `text-lg font-semibold text-gray-200`
- 강조 수치/결과: `text-3xl font-bold text-yellow-400`

### 반응형

- 모바일 우선 (`sm:` 이상에서 확장)
- 기본 패딩: `px-4 py-6` (모바일), `sm:px-8` (태블릿+)
- 최대 너비: `max-w-2xl mx-auto`

---

## 할 일 (Todo)

### 기능

- [ ] 사용자 결과 히스토리 저장 (DB 연동 또는 서버 세션)
- [ ] 마이페이지에서 과거 분석 결과 재조회
- [ ] 결과 카드 SNS 공유 (이미지 다운로드 + 카카오 공유)
- [ ] 상품 번들 할인 (3종 세트 구매 시 할인)
- [ ] 이메일 로그인에 OTP/매직링크 추가
- [ ] 관리자 대시보드 (결제 내역, 사용 통계)

### 기술 / 품질

- [ ] `.env.example` 파일 생성 (환경변수 목록 문서화)
- [ ] 결제 상태를 localStorage 대신 서버 세션으로 이관 (보안 강화)
- [ ] API 라우트 에러 응답 표준화 (공통 에러 핸들러)
- [ ] Claude API 응답 캐싱 (동일 사주 재요청 비용 절감)
- [ ] OpenAI 이미지 생성 실패 시 Pollinations.ai fallback 안정화
- [ ] E2E 테스트 추가 (Playwright — 입력 → 결제 → 결과 전체 플로우)
- [ ] Lighthouse 성능 점수 90점 이상 달성

### UX / 디자인

- [ ] 로딩 애니메이션 개선 (점괘 뽑는 분위기의 인터랙션)
- [ ] 결과 페이지 인쇄/PDF 저장 레이아웃 추가
- [ ] 다크 모드 외 라이트 모드 옵션 검토 (현재 다크 전용)
- [ ] 접근성(a11y) 개선 — ARIA 레이블, 키보드 네비게이션

### 운영

- [ ] Vercel Analytics / Sentry 에러 모니터링 연동
- [ ] TossPayments 웹훅 수신 엔드포인트 구현 (결제 이벤트 서버 기록)
- [ ] 개인정보처리방침 · 서비스 이용약관 페이지 작성
- [ ] 사업자 등록 및 통신판매업 신고 확인
