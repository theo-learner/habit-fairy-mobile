# 🧚‍♀️ 습관요정 2.0 (Habit Fairy) 재구축 기획서

> **작성일**: 2026-02-10
> **버전**: 2.0 (Draft)
> **목표**: 단순 MVP를 넘어선, 데이터 동기화 및 수익화가 가능한 상용 앱 구축

---

## 1. 프로젝트 개요 (Overview)

### 🎯 핵심 가치
**"아이 스스로 즐겁게 만드는 습관, 부모는 편하게 관리하는 루틴"**
- **게이미피케이션**: 습관 형성을 게임 퀘스트처럼 (RPG 요소 도입)
- **동기부여**: 캐릭터 성장 및 시각적 보상 강화
- **연결성**: 부모-아이 기기 간 실시간 데이터 동기화 (가장 큰 변화)

### 👥 타겟 유저
- **메인 타겟**: 4~8세 아동 (글자를 모르거나 배우는 단계)
- **서브 타겟**: 자녀 습관 형성에 관심이 많은 3040 부모

---

## 2. 기술 스택 및 아키텍처 (Tech Stack)

### 📱 클라이언트 (App)
- **Framework**: **React Native (Expo SDK 50+)**
  - *이유*: 빠른 개발, OTA 업데이트(EAS Update), 안정된 생태계
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind CSS) v4
- **State Management**: Zustand (클라이언트 상태) + TanStack Query (서버 상태)
- **Navigation**: Expo Router v3 (파일 기반 라우팅)

### ☁️ 백엔드 (Serverless)
- **Platform**: **Supabase** (PostgreSQL + Auth + Realtime)
  - *이유*: 실시간 데이터 동기화, 간편한 소셜 로그인, 관리자 대시보드 제공
- **Functions**: Supabase Edge Functions (알림 발송 등 로직)

### 🏗️ 아키텍처 패턴
- **FSD (Feature-Sliced Design)**
  - 기능 단위로 폴더 구조 분리 (예: `features/mission`, `features/reward`)
  - 유지보수성과 확장성 확보

---

## 3. 핵심 기능 명세 (Features)

### 👶 아이 모드 (Child Mode)
1. **인터랙티브 홈**:
   - 시간대(아침/오후/저녁)에 따른 배경 변화
   - 터치에 반응하는 3D/Lottie 캐릭터
2. **미션 수행 (퀘스트)**:
   - 사진 인증 기능 (AI가 사진 분석하여 자동 완료 처리 - *Future*)
   - 드래그 앤 드롭으로 미션 완료
3. **보상 시스템**:
   - **별(재화)**: 미션 완료 시 획득
   - **상점**: 별로 캐릭터 코스튬, 방 꾸미기 아이템 구매
   - **레벨업**: 경험치 누적에 따른 뱃지 및 칭호 부여

### 👨‍👩‍👧‍👦 부모 모드 (Parent Mode)
1. **대시보드**:
   - 실시간 미션 수행 현황 확인
   - 주간/월간 습관 리포트 (달성률, 루틴 패턴)
2. **미션 관리**:
   - 요일별 반복 설정, 난이도별 보상 설정
   - 프리셋 미션 라이브러리 제공
3. **보상 승인**:
   - 아이가 요청한 '실물 보상(예: 유튜브 30분)' 승인/거절

---

## 4. 데이터 모델 (Data Structure)

### Users (사용자)
- `id`: UUID
- `role`: 'parent' | 'child'
- `family_id`: 가족 그룹 ID

### Missions (미션)
- `id`: UUID
- `title`: 미션명
- `icon`: 이모지/이미지
- `time_of_day`: 'morning' | 'afternoon' | 'evening'
- `reward_stars`: 보상 별 개수
- `days_of_week`: 반복 요일 (Array)

### Mission_Logs (수행 기록)
- `id`: UUID
- `mission_id`: FK
- `user_id`: FK (아이)
- `status`: 'pending' | 'approved' | 'completed'
- `proof_image_url`: 인증 사진 URL
- `completed_at`: Timestamp

---

## 5. 수익화 모델 (Monetization)

### 💎 부분 유료화 (Freemium)
1. **Free (기본)**:
   - 아이 1명 등록
   - 기본 미션 무제한
   - 기본 캐릭터 1종
2. **Pro (구독 - 월 3,900원)**:
   - 아이 무제한 등록 (다자녀)
   - **프리미엄 캐릭터 & 코스튬** 제공
   - **AI 인증** (사진만 찍으면 자동 완료)
   - 월간 심층 리포트 (PDF)

### 🛍️ 인앱 결제 (IAP)
- **보석 구매**: 캐릭터 스킨이나 꾸미기 아이템을 즉시 구매할 수 있는 재화 판매

---

## 6. 디자인 시스템 (Theme 2.0)

### 🎨 테마: "Dreamy Pastel"
- **기조**: 기존 Theme 6(소프트 파스텔) 계승하되, 깊이감(Depth) 추가
- **Color Palette**:
  - Primary: `Peach Puff (#FFDAB9)`
  - Secondary: `Mint Cream (#F5FFFA)`
  - Accent: `Magic Purple (#9370DB)`
- **Typography**: `Quicksand` (Rounded, 친근함) + `Pretendard` (가독성)
- **UI 요소**:
  - **Glassmorphism**: 유리의 질감을 살린 투명한 카드
  - **Bento Grid**: 정보를 직관적으로 보여주는 그리드 레이아웃
  - **Micro-interaction**: 버튼 클릭 시 젤리처럼 튕기는 효과

---

## 7. 개발 로드맵 (Roadmap)

### Phase 1: MVP 재구축 (2주)
- Supabase 연동 및 인증 구현
- 데이터 모델링 및 마이그레이션
- 기본 미션 수행 및 동기화 기능

### Phase 2: 고도화 (2주)
- 상점 및 인벤토리 시스템 구현
- 부모 리포트 기능 추가
- IAP(인앱결제) 연동

### Phase 3: 출시 및 확장 (1주)
- 스토어 등록 이미지 및 메타데이터 준비
- 베타 테스트 진행
- 정식 런칭
