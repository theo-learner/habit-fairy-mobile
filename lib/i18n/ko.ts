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
  },

  // === 대시보드 ===
  dashboard: {
    title: '기록',
    weekDays: ['일', '월', '화', '수', '목', '금', '토'],
    all: '전체',
  },

  // === 미션 관리 ===
  manage: {
    addMission: '미션 추가',
    editMission: '미션 수정',
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
