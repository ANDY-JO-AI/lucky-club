# Lucky Club Master — PWA Casino Club Entertainment App

## 🎰 프로젝트 개요
- **앱 이름**: Lucky Club Master
- **형식**: PWA (Progressive Web App) — QR 코드로 접속, 앱스토어 불필요
- **목표**: 클럽/노래방/바 환경에서 게임화된 팁 & 음주 엔터테인먼트
- **오프라인**: 첫 로드 후 인터넷 없이 완전 동작

---

## 🌐 현재 실행 URL
- **샌드박스**: https://3000-i5xse9jq3kb9i53xynmoj-d0b9e1e2.sandbox.novita.ai
- **관리자**: https://3000-i5xse9jq3kb9i53xynmoj-d0b9e1e2.sandbox.novita.ai/admin

---

## ✅ 구현된 기능

### 게임 모드
- 🍺 **Beer Club** — 컴퍼스/미션 없음, 솔로 최적화
- 🎤 **Karaoke** — 컴퍼스 + 미션 카드 + 플레이어 수 설정
- 🔞 **Adult** — 4자리 PIN 보호, 관리자 미션 직접 입력

### 슬롯 시스템
- **TIP 슬롯** (10단계): 꽝/1K/2K/5K/10K/20K/50K/100K/200K/500K₫(잭팟)
- **DRINK 슬롯** (5단계): 25%/50%/70%/100%/한번더
- 두 슬롯 동시 스핀, 하나의 화면에 결과 표시
- **잭팟 강제 원샷**: 500K₫ 시 항상 원샷

### 카지노 중독 엔진 (7가지 메커닉)
1. **Near-Miss Engine** — 결과 직전 인접 셀에 멈췄다 이동
2. **Variable Reward** — 가중 랜덤 알고리즘 (플레이어 미공개)
3. **Streak Counter** — 연속 소액/고액 카운터 표시
4. **Escalating Tension** — 연속 스핀 시 BPM/볼륨 상승
5. **Celebration Delay** — 200K: 0.6s, 잭팟: 0.8s "???" 지연
6. **Social Proof** — "오늘 N번째 잭팟!" 메시지
7. **Dark Flow** — 4-6초 스핀 사이클, 즉시 SPIN 재표시

### 결과 연출 (티어별)
- 💀 **저주 티어** (1K/2K/5K): 빨간 화면 3회 플래시 + 해골 파티클 50개 + 슬픈 트럼본
- 😐 **저가 티어** (10K/20K): 흰 플래시 + 코인 1개
- 😊 **중가 티어** (50K): 실버 스파클 + 코인 3개 낙하
- 😄 **중고가 티어** (100K): 골드 스파클 + 코인 20개 낙하
- 🤩 **고가 티어** (200K): 전체 화면 골드 네온 + 코인 50개 + 팡파레
- 💥 **잭팟** (500K): 10회 플래시 + 코인 100개 + 폭죽 + 플래시라이트 스트로브 + 광고 슬롯

### 컴퍼스 시스템
- Karaoke/Adult 전용
- 2-20명 지원, 각도별 방향 레이블 자동 계산
- 니어미스 2구간 통과 후 최종 정지
- 방향: 맞은편/왼쪽/오른쪽/N번째 자리 등

### 미션 카드
- 레벨 1/2/3 (라운드 1-5 / 6-10 / 11+)
- 스핀당 15% 확률 발생
- 노래방: 기본 미션 15개 내장 (3언어)
- 성인: 관리자 직접 입력

### 사운드 시스템 (Howler.js)
- 14개 사운드 파일 (WAV 형식 .mp3)
- Web Audio API 합성 폴백
- 드럼롤 BPM 가변 조절
- 진동(햅틱) 피드백 5단계

### 관리자 대시보드 (/admin)
- Firebase Auth 이메일/패스워드 보호
- **통계**: 오늘 스핀/팁 합계/잭팟 횟수
- **확률 설정**: 슬라이더로 TIP/DRINK 각 가중치 조절 (합계 100% 강제)
- **미션 관리**: 노래방/성인 × 레벨1/2/3 CRUD
- **게임 설정**: 6가지 ON/OFF 토글 + PIN 변경

### PWA / 오프라인
- `manifest.webmanifest` — standalone 디스플레이
- Service Worker — Workbox precache (38개 파일)
- 홈화면 추가 배너 자동 표시
- Google Fonts 캐시 (오프라인 지원)

### 다국어 (react-i18next)
- 🇰🇷 한국어 / 🇺🇸 English / 🇻🇳 Tiếng Việt
- 첫 실행 시 언어 선택 화면
- localStorage 저장, 설정에서 변경 가능
- 전체 UI 번역 (결과 텍스트, 방향 레이블, 미션 등)

### 광고 슬롯 (Phase 2 준비)
- AdSlot 컴포넌트: 잭팟 결과 시 + 10스핀마다 표시
- `// PHASE 2: Replace with AdMob unit ID` 주석 처리
- 320×50 배너 / 전체화면 인터스티셜 두 종류

---

## 🔧 기술 스택
| 항목 | 기술 |
|------|------|
| 프레임워크 | React 18 + TypeScript |
| 빌드 | Vite 5 |
| 애니메이션 | Framer Motion 11 |
| 사운드 | Howler.js 2 + Web Audio API |
| 상태 관리 | Zustand 4 |
| 다국어 | react-i18next 14 |
| DB | Firebase Firestore 10 |
| 인증 | Firebase Auth |
| 스타일 | Tailwind CSS 3 |
| PWA | vite-plugin-pwa + Workbox |

---

## 🗄️ Firebase 데이터 구조
```
/clubs/{clubId}/
  config/main        — 확률 설정, PIN, 게임 옵션
  missions/all       — karaoke/adult × level1/2/3
  sessions/{date}/   — 오늘 스핀/팁/잭팟 통계
```

---

## ⚙️ Firebase 설정 방법
1. Firebase Console에서 새 프로젝트 생성
2. Firestore Database 활성화 (production mode)
3. Authentication → 이메일/패스워드 로그인 활성화
4. 관리자 계정 생성 (Authentication → Users)
5. `.env.local` 파일 생성:
```
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
```
6. `npm run build` 후 배포

---

## 🚀 배포 방법
```bash
# Firebase Hosting 배포 (권장)
npm install -g firebase-tools
firebase login
firebase init hosting  # dist 폴더 선택, SPA 설정
npm run build
firebase deploy

# Vercel / Netlify
npm run build → dist 폴더 업로드
```

---

## 📱 QR 코드 접속
배포 URL을 아래 도구로 QR 생성:
- https://qr.io
- https://goqr.me

---

## 🔐 초기 설정
- 성인 모드 기본 PIN: `1234` (관리자 대시보드에서 변경)
- 관리자 로그인: Firebase Authentication에 등록한 이메일/패스워드

---

## 📦 미구현 / 개선 예정
- 실제 상용 사운드 파일 교체 (현재 WAV 합성음)
- Firebase Hosting 실제 배포
- 클럽별 독립 설정 (clubId 분리)
- 시간대별 스핀 빈도 차트
- AdMob Phase 2 통합

---

**Platform**: Vite PWA | **Status**: ✅ Active  
**Last Updated**: 2026-05-06
