import strings from '../lib/i18n';
import ko from '../lib/i18n/ko';

describe('i18n strings', () => {
  it('exports ko as default', () => {
    expect(strings).toBe(ko);
  });

  it('common section has all required keys', () => {
    expect(strings.common.appName).toBeTruthy();
    expect(strings.common.loading).toBeTruthy();
    expect(strings.common.retry).toBeTruthy();
    expect(strings.common.cancel).toBeTruthy();
    expect(strings.common.confirm).toBeTruthy();
    expect(strings.common.save).toBeTruthy();
    expect(strings.common.delete).toBeTruthy();
  });

  it('tabs section has all tab labels', () => {
    expect(strings.tabs.home).toBeTruthy();
    expect(strings.tabs.character).toBeTruthy();
    expect(strings.tabs.customize).toBeTruthy();
    expect(strings.tabs.dashboard).toBeTruthy();
    expect(strings.tabs.settings).toBeTruthy();
  });

  it('error section has all messages', () => {
    expect(strings.error.somethingWrong).toBeTruthy();
    expect(strings.error.tryAgainLater).toBeTruthy();
    expect(strings.error.missionNotFound).toBeTruthy();
  });

  it('onboarding template functions work', () => {
    expect(strings.onboarding.greetingTemplate('테스트')).toBe('안녕, 테스트!');
    expect(strings.onboarding.goodStart(3)).toBe('좋은 시작이야! 3개 남았어!');
  });

  it('mission template functions work', () => {
    expect(strings.mission.starReward(5)).toBe('완료하면 ⭐ ×5 획득!');
  });

  it('dashboard weekDays has 7 days', () => {
    expect(strings.dashboard.weekDays).toHaveLength(7);
  });

  it('starReward praises has entries', () => {
    expect(strings.starReward.praises.length).toBeGreaterThan(0);
    strings.starReward.praises.forEach((p: string) => {
      expect(typeof p).toBe('string');
      expect(p.length).toBeGreaterThan(0);
    });
  });

  it('missionCategory covers all categories', () => {
    expect(strings.missionCategory.morning).toBeTruthy();
    expect(strings.missionCategory.daytime).toBeTruthy();
    expect(strings.missionCategory.evening).toBeTruthy();
    expect(strings.missionCategory.study).toBeTruthy();
    expect(strings.missionCategory.health).toBeTruthy();
  });
});
