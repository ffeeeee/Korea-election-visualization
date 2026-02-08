/**
 * daewoonCalculator.js - 대운(大運) 계산 모듈
 * 성별 + 년간 음양에 따라 순행/역행 결정, 월주 기준 대운 산출
 */
import { STEMS, BRANCHES, STEM_ELEMENT, STEM_YINYANG, BRANCH_ELEMENT, BRANCH_HIDDEN_STEMS } from './sajuCalculator';

export class DaewoonCalculator {
  /**
   * 대운 계산
   * @param {Object} sajuResult - SajuCalculator 결과
   * @returns {Object} 대운 정보
   */
  calculate(sajuResult) {
    const { gender, pillars } = sajuResult;
    const yearStem = pillars.year.stem;
    const monthStem = pillars.month.stem;
    const monthBranch = pillars.month.branch;

    // 순행/역행 결정
    // 남자 양년생 또는 여자 음년생 → 순행
    // 남자 음년생 또는 여자 양년생 → 역행
    const yearYinYang = STEM_YINYANG[yearStem];
    const isMale = gender === 'male';
    const isForward = (isMale && yearYinYang === '양') || (!isMale && yearYinYang === '음');

    // 대운 시작 나이 (간략히 3~4세 기준, 실제로는 절입일 차이로 계산)
    const startAge = this.calculateStartAge(sajuResult, isForward);

    // 대운 기둥 산출 (10개)
    const daewoons = this.generateDaewoons(monthStem, monthBranch, isForward, startAge, 10);

    // 현재 대운 (2026년 기준)
    const birthYear = parseInt(sajuResult.solarDate.split('-')[0]);
    const currentAge = 2026 - birthYear + 1; // 만 나이 + 1 (한국식)
    const currentDaewoon = this.getCurrentDaewoon(daewoons, currentAge);

    // 2026 세운 (병오년)
    const yearFortune = this.getYearFortune(2026, sajuResult);

    return {
      isForward,
      startAge,
      daewoons,
      currentDaewoon,
      currentAge,
      yearFortune
    };
  }

  /**
   * 대운 시작 나이 계산 (간소화)
   */
  calculateStartAge(sajuResult, isForward) {
    // 절입일까지의 일수를 3으로 나누어 대운 시작 나이 결정
    // 간소화: 일반적으로 3~8세 사이
    const month = parseInt(sajuResult.solarDate.split('-')[1]);
    const day = parseInt(sajuResult.solarDate.split('-')[2]);

    // 해당 월 절기 근사일과의 차이
    const jeolgiApprox = [6, 4, 6, 5, 6, 6, 7, 7, 8, 8, 7, 7]; // 월별 절입 근사일
    const monthIdx = month - 1;
    let daysToJeolgi;

    if (isForward) {
      // 순행: 다음 절기까지 일수
      const nextMonth = (monthIdx + 1) % 12;
      const nextJeolgiDay = jeolgiApprox[nextMonth];
      const daysInMonth = new Date(2000, month, 0).getDate();
      daysToJeolgi = (daysInMonth - day) + nextJeolgiDay;
    } else {
      // 역행: 이전 절기까지 일수
      const currentJeolgiDay = jeolgiApprox[monthIdx];
      daysToJeolgi = Math.abs(day - currentJeolgiDay);
    }

    // 3일 = 1년, 나머지 반올림
    const startAge = Math.max(1, Math.round(daysToJeolgi / 3));
    return Math.min(startAge, 10); // 최대 10세
  }

  /**
   * 대운 기둥 생성
   */
  generateDaewoons(monthStem, monthBranch, isForward, startAge, count) {
    const stemIdx = STEMS.indexOf(monthStem);
    const branchIdx = BRANCHES.indexOf(monthBranch);
    const direction = isForward ? 1 : -1;
    const daewoons = [];

    for (let i = 1; i <= count; i++) {
      const newStemIdx = ((stemIdx + i * direction) % 10 + 10) % 10;
      const newBranchIdx = ((branchIdx + i * direction) % 12 + 12) % 12;
      const age = startAge + (i - 1) * 10;

      daewoons.push({
        index: i,
        stem: STEMS[newStemIdx],
        branch: BRANCHES[newBranchIdx],
        display: STEMS[newStemIdx] + BRANCHES[newBranchIdx],
        element: STEM_ELEMENT[STEMS[newStemIdx]],
        branchElement: BRANCH_ELEMENT[BRANCHES[newBranchIdx]],
        hiddenStems: BRANCH_HIDDEN_STEMS[BRANCHES[newBranchIdx]],
        startAge: age,
        endAge: age + 9,
        ageRange: `${age}~${age + 9}세`
      });
    }

    return daewoons;
  }

  /**
   * 현재 대운 찾기
   */
  getCurrentDaewoon(daewoons, currentAge) {
    for (const dw of daewoons) {
      if (currentAge >= dw.startAge && currentAge <= dw.endAge) {
        return dw;
      }
    }
    // 대운 범위 밖이면 가장 가까운 것
    return daewoons[0];
  }

  /**
   * 세운(년운) 분석 - 2026 병오년
   */
  getYearFortune(year, sajuResult) {
    const stemIdx = ((year - 4) % 10 + 10) % 10;
    const branchIdx = ((year - 4) % 12 + 12) % 12;

    return {
      year,
      stem: STEMS[stemIdx],
      branch: BRANCHES[branchIdx],
      display: STEMS[stemIdx] + BRANCHES[branchIdx],
      element: STEM_ELEMENT[STEMS[stemIdx]],
      branchElement: BRANCH_ELEMENT[BRANCHES[branchIdx]],
      hiddenStems: BRANCH_HIDDEN_STEMS[BRANCHES[branchIdx]],
      description: this.getYearDescription(STEMS[stemIdx], BRANCHES[branchIdx], sajuResult)
    };
  }

  /**
   * 세운 설명 생성
   */
  getYearDescription(yearStem, yearBranch, sajuResult) {
    const dayMaster = sajuResult.dayMaster;
    const dayElement = STEM_ELEMENT[dayMaster];
    const yearElement = STEM_ELEMENT[yearStem];
    const yearBranchElement = BRANCH_ELEMENT[yearBranch];

    // 세운과 일간의 관계 분석
    const interactions = [];

    if (yearElement === dayElement) {
      interactions.push('세운의 기운이 일간과 같아 자아가 강해지는 해입니다.');
    }

    // 상생 관계
    const elementCycle = ['목', '화', '토', '금', '수'];
    const dayIdx = elementCycle.indexOf(dayElement);
    const yearIdx = elementCycle.indexOf(yearElement);

    if ((dayIdx + 1) % 5 === yearIdx) {
      interactions.push('일간이 세운을 생해주므로 에너지 소모가 있을 수 있습니다.');
    } else if ((yearIdx + 1) % 5 === dayIdx) {
      interactions.push('세운이 일간을 생해주므로 도움과 지원을 받는 해입니다.');
    } else if ((dayIdx + 2) % 5 === yearIdx) {
      interactions.push('일간이 세운을 극하므로 재물이나 성취를 얻을 기회가 있습니다.');
    } else if ((yearIdx + 2) % 5 === dayIdx) {
      interactions.push('세운이 일간을 극하므로 외부 압력이나 도전이 있을 수 있습니다.');
    }

    return interactions.join(' ');
  }
}
