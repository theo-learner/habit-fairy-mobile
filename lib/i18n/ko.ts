// ============================================
// 한국어 문자열 리소스
// i18n 준비: 모든 UI 문자열을 여기서 관리
// ============================================

const ko = {
  // === 공통 ===
  common: {
    appName: '습관요정',
    loading: '습관요정 준비 중...',
    retry: '🔄 다시 시도하기',
    cancel: '취소',
    confirm: '확인',
    save: '저장',
    delete: '삭제',
    edit: '수정',
    close: '닫기',
  },

  // === 탭 ===
  tabs: {
    home: '홈',
    character: '친구',
    customize: '꾸미기',
    dashboard: '기록',
    settings: '설정',
  },

  // === 네비게이션 ===
  nav: {
    myFriend: '내 친구',
    missionManage: '미션 관리',
    missionPerform: '미션 수행',
  },

  // === 에러 ===
  error: {
    somethingWrong: '문제가 발생했어요',
    tryAgainLater: '잠시 후 다시 시도해주세요',
    missionNotFound: '미션을 찾을 수 없어요 😢',
    dataLoadFailed: '데이터를 불러오지 못했어요',
  },

  // === 홈 화면 ===
  home: {
    todayComplete: '오늘 달성',
    streak: '연속 달성',
    starsCollected: '모은 별',
    challenge: '도전!',
    freeTime: '자유 시간',
    keepGoing: '계속할래!',
    takeBreak: '잠깐 쉬어갈까?',
    tryTomorrow: '내일 다시 해보자!',
    todayHero: '오늘의 영웅! 🌟',
    addMissionPrompt: '미션을 추가해볼까? ✨',
    startAdventure: '첫 모험을 시작해볼까? ✨',
    weeklyRate: '주간 달성률',
    todayMission: '오늘의 미션',
    add: '추가',
    check: '체크 ✓',
    wellDone: '잘했어! 🎉',
    errorTitle: '홈 화면 오류',
  },

  // === 온보딩 ===
  onboarding: {
    greeting: '안녕! 나는 습관요정이야!',
    subtitle: '매일 함께 좋은 습관을 만들어 볼까?\n이름을 알려줘!',
    namePlaceholder: '이름을 입력해줘',
    startButton: '모험 시작하기! 🚀',
    greetingTemplate: (name: string) => `안녕, ${name}!`,
    goodStart: (remaining: number) => `좋은 시작이야! ${remaining}개 남았어!`,
    almostDone: '거의 다 했어! 조금만 더! 💪',
  },

  // === 대시보드 ===
  dashboard: {
    title: '기록',
    weekDays: ['일', '월', '화', '수', '목', '금', '토'],
    all: '전체',
  },

  // === 대시보드 상세 ===
  dashboardDetail: {
    weeklyRate: '주간 달성률',
    habitStatus: '주요 습관 현황',
  },

  // === 미션 관리 ===
  manage: {
    addMission: '미션 추가',
    editMission: '미션 수정',
    deleteAction: '삭제',
    instruction: '미션을 수정하거나 순서를 바꿔보세요!',
    deleteHint: '커스텀 미션은 왼쪽으로 스와이프해서 삭제할 수 있어요.',
    missionName: '미션 이름',
  },

  // === 미션 수행 ===
  mission: {
    goBack: '돌아가기',
    starReward: (stars: number) => `완료하면 ⭐ ×${stars} 획득!`,
    alreadyDone: '오늘 이미 완료한 미션이에요!',
    completePrompt: '미션을 완료하면 아래 버튼을 눌러주세요!',
    great: '대단해!',
    quitTitle: '잠깐 쉬어갈까?',
    quitMessage: '괜찮아! 나중에 다시 도전하면 돼 😊',
    quitContinue: '계속할래!',
    quitStop: '내일 다시 해보자!',
    complete: '미션 완료!',
    autoClose: '잠시 후 자동으로 닫힙니다',
    done: '완료 ✓',
    freeTime: '자유 시간',
  },

  // === 미션 카드 ===
  missionCard: {
    freeTime: '자유 시간',
    done: '완료 ✓',
    challenge: '도전!',
  },

  // === 타이머 ===
  timer: {
    fighting: '화이팅! 💪',
    start: '시작! 🌟',
  },

  // === 별 보상 ===
  starReward: {
    missionComplete: '미션 완료!',
    autoClose: '잠시 후 자동으로 닫힙니다',
    praises: [
      '정말 잘했어! 최고야! 🌈',
      '와, 대단해! 멋지다! ✨',
      '요정이 감동했어! 💫',
      '역시 네가 최고야! 🎉',
      '오늘도 빛나는 하루! ⭐',
    ],
  },

  // === 캐릭터 선택 ===
  characterSelect: {
    title: '캐릭터 선택',
    subtitle: '모험을 함께할 친구를 골라주세요!',
    selected: '선택됨',
    starRewardLabel: '별 보상',
  },

  // === 꾸미기 상점 ===
  shop: {
    equipped: '장착 중',
    owned: '보유',
    buy: '구매',
  },

  // === 보호자 게이트 ===
  parentsGate: {
    title: '보호자 확인',
    description: '설정 화면은 보호자만 들어갈 수 있어요.\n다음 문제를 풀어주세요.',
    inputPlaceholder: '정답 입력',
    wrongAnswer: '정답이 아닙니다. 다시 시도해주세요.',
  },

  // === 캐릭터 ===
  character: {
    fairy: '요정',
    dino: '다이노',
    robot: '로봇',
  },

  // === 꾸미기 카테고리 ===
  customize: {
    hat: '모자',
    wings: '날개',
    accessory: '소품',
    background: '배경',
    boyStyle: '남아용',
    girlStyle: '여아용',
  },

  // === 미션 카테고리 ===
  missionCategory: {
    morning: '🌅 아침 루틴',
    daytime: '☀️ 낮 활동',
    evening: '🌙 저녁 루틴',
    study: '📖 공부 시간',
    health: '💪 건강 지키기',
  },
} as const;

export type StringKeys = typeof ko;
export default ko;
