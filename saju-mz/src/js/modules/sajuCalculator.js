/**
 * sajuCalculator.js - 정확한 만세력 엔진
 * korean-lunar-calendar를 활용한 음양력 변환 및 사주팔자 계산
 */
import KoreanLunarCalendar from 'korean-lunar-calendar';

// 천간 (十天干)
const STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
// 지지 (十二地支)
const BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

// 천간 오행
const STEM_ELEMENT = {
  '갑': '목', '을': '목', '병': '화', '정': '화', '무': '토',
  '기': '토', '경': '금', '신': '금', '임': '수', '계': '수'
};

// 천간 음양
const STEM_YINYANG = {
  '갑': '양', '을': '음', '병': '양', '정': '음', '무': '양',
  '기': '음', '경': '양', '신': '음', '임': '양', '계': '음'
};

// 지지 오행
const BRANCH_ELEMENT = {
  '자': '수', '축': '토', '인': '목', '묘': '목', '진': '토', '사': '화',
  '오': '화', '미': '토', '신': '금', '유': '금', '술': '토', '해': '수'
};

// 지지 장간 (지지 안에 숨은 천간들)
const BRANCH_HIDDEN_STEMS = {
  '자': ['계'],
  '축': ['기', '계', '신'],
  '인': ['갑', '병', '무'],
  '묘': ['을'],
  '진': ['무', '을', '계'],
  '사': ['병', '경', '무'],
  '오': ['정', '기'],
  '미': ['기', '정', '을'],
  '신': ['경', '임', '무'],
  '유': ['신'],
  '술': ['무', '신', '정'],
  '해': ['임', '갑']
};

// 입춘일 테이블 (양력 기준, 1940-2060)
// 형식: [월, 일] - 대부분 2월 3~5일
const IPCHUN_TABLE = {};
(function initIpchun() {
  // 입춘은 대부분 2/4 전후. 정확한 테이블 제공
  const ipchunDays = {
    1940: [2,5], 1941: [2,4], 1942: [2,4], 1943: [2,5], 1944: [2,5],
    1945: [2,4], 1946: [2,4], 1947: [2,4], 1948: [2,5], 1949: [2,4],
    1950: [2,4], 1951: [2,4], 1952: [2,5], 1953: [2,4], 1954: [2,4],
    1955: [2,4], 1956: [2,5], 1957: [2,4], 1958: [2,4], 1959: [2,4],
    1960: [2,5], 1961: [2,4], 1962: [2,4], 1963: [2,4], 1964: [2,5],
    1965: [2,4], 1966: [2,4], 1967: [2,4], 1968: [2,5], 1969: [2,4],
    1970: [2,4], 1971: [2,4], 1972: [2,5], 1973: [2,4], 1974: [2,4],
    1975: [2,4], 1976: [2,5], 1977: [2,4], 1978: [2,4], 1979: [2,4],
    1980: [2,5], 1981: [2,4], 1982: [2,4], 1983: [2,4], 1984: [2,4],
    1985: [2,4], 1986: [2,4], 1987: [2,4], 1988: [2,4], 1989: [2,4],
    1990: [2,4], 1991: [2,4], 1992: [2,4], 1993: [2,4], 1994: [2,4],
    1995: [2,4], 1996: [2,4], 1997: [2,4], 1998: [2,4], 1999: [2,4],
    2000: [2,4], 2001: [2,4], 2002: [2,4], 2003: [2,4], 2004: [2,4],
    2005: [2,4], 2006: [2,4], 2007: [2,4], 2008: [2,4], 2009: [2,4],
    2010: [2,4], 2011: [2,4], 2012: [2,4], 2013: [2,4], 2014: [2,4],
    2015: [2,4], 2016: [2,4], 2017: [2,3], 2018: [2,4], 2019: [2,4],
    2020: [2,4], 2021: [2,3], 2022: [2,4], 2023: [2,4], 2024: [2,4],
    2025: [2,3], 2026: [2,4], 2027: [2,4], 2028: [2,4], 2029: [2,3],
    2030: [2,4], 2031: [2,4], 2032: [2,4], 2033: [2,3], 2034: [2,4],
    2035: [2,4], 2036: [2,4], 2037: [2,3], 2038: [2,4], 2039: [2,4],
    2040: [2,4], 2041: [2,3], 2042: [2,4], 2043: [2,4], 2044: [2,4],
    2045: [2,3], 2046: [2,4], 2047: [2,4], 2048: [2,4], 2049: [2,3],
    2050: [2,4], 2051: [2,4], 2052: [2,4], 2053: [2,3], 2054: [2,4],
    2055: [2,4], 2056: [2,4], 2057: [2,3], 2058: [2,4], 2059: [2,4],
    2060: [2,4]
  };
  Object.assign(IPCHUN_TABLE, ipchunDays);
})();

// 절기 테이블 (각 월의 절입일, 양력 기준 근사값)
// 인월(1월)=입춘~, 묘월(2월)=경칩~, 진월(3월)=청명~, ...
const JEOLGI_DATES = [
  { month: 1, name: '입춘', approxDay: 4, solarMonth: 2 },   // 인월
  { month: 2, name: '경칩', approxDay: 6, solarMonth: 3 },   // 묘월
  { month: 3, name: '청명', approxDay: 5, solarMonth: 4 },   // 진월
  { month: 4, name: '입하', approxDay: 6, solarMonth: 5 },   // 사월
  { month: 5, name: '망종', approxDay: 6, solarMonth: 6 },   // 오월
  { month: 6, name: '소서', approxDay: 7, solarMonth: 7 },   // 미월
  { month: 7, name: '입추', approxDay: 7, solarMonth: 8 },   // 신월
  { month: 8, name: '백로', approxDay: 8, solarMonth: 9 },   // 유월
  { month: 9, name: '한로', approxDay: 8, solarMonth: 10 },  // 술월
  { month: 10, name: '입동', approxDay: 7, solarMonth: 11 }, // 해월
  { month: 11, name: '대설', approxDay: 7, solarMonth: 12 }, // 자월
  { month: 12, name: '소한', approxDay: 6, solarMonth: 1 }   // 축월
];

export class SajuCalculator {
  constructor() {
    this.calendar = new KoreanLunarCalendar();
  }

  /**
   * 메인 계산 함수
   * @param {Object} params - { birthDate, calendarType, isLeapMonth, birthSijin, gender, name }
   * @returns {Object} 사주팔자 결과
   */
  calculate(params) {
    const { birthDate, calendarType, isLeapMonth, birthSijin, gender, name } = params;

    // 양력 날짜 확정
    let solarDate;
    if (calendarType === 'lunar') {
      solarDate = this.lunarToSolar(birthDate, isLeapMonth);
    } else {
      solarDate = new Date(birthDate);
    }

    const year = solarDate.getFullYear();
    const month = solarDate.getMonth() + 1;
    const day = solarDate.getDate();

    // 음력 날짜 (표시용)
    let lunarInfo;
    if (calendarType === 'lunar') {
      lunarInfo = { date: birthDate, isLeapMonth };
    } else {
      lunarInfo = this.solarToLunar(year, month, day);
    }

    // 사주 네 기둥 계산
    const yearPillar = this.getYearPillar(year, month, day);
    const monthPillar = this.getMonthPillar(year, month, day, yearPillar.stem);
    const dayPillar = this.getDayPillar(year, month, day);

    let hourPillar = null;
    if (birthSijin && birthSijin !== 'unknown') {
      hourPillar = this.getHourPillar(birthSijin, dayPillar.stem);
    }

    // 오행 분석
    const elements = this.analyzeElements(yearPillar, monthPillar, dayPillar, hourPillar);

    // 일간 (일주 천간 = 나를 대표하는 글자)
    const dayMaster = dayPillar.stem;

    return {
      name,
      gender,
      solarDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      lunarInfo,
      birthSijin: birthSijin || 'unknown',
      pillars: {
        year: yearPillar,
        month: monthPillar,
        day: dayPillar,
        hour: hourPillar
      },
      dayMaster,
      dayMasterElement: STEM_ELEMENT[dayMaster],
      dayMasterYinYang: STEM_YINYANG[dayMaster],
      elements,
      stems: STEMS,
      branches: BRANCHES
    };
  }

  /**
   * 음력 → 양력 변환
   */
  lunarToSolar(dateStr, isLeapMonth) {
    const [y, m, d] = dateStr.split('-').map(Number);
    this.calendar.setLunarDate(y, m, d, isLeapMonth);
    const sol = this.calendar.getSolarCalendar();
    return new Date(sol.year, sol.month - 1, sol.day);
  }

  /**
   * 양력 → 음력 변환
   */
  solarToLunar(year, month, day) {
    this.calendar.setSolarDate(year, month, day);
    const lunar = this.calendar.getLunarCalendar();
    return {
      date: `${lunar.year}-${String(lunar.month).padStart(2, '0')}-${String(lunar.day).padStart(2, '0')}`,
      isLeapMonth: lunar.intercalation
    };
  }

  /**
   * 년주 계산 - 입춘 기준
   */
  getYearPillar(year, month, day) {
    let sajuYear = year;

    // 입춘 이전이면 전년도 간지 사용
    const ipchun = IPCHUN_TABLE[year] || [2, 4];
    const birthDate = new Date(year, month - 1, day);
    const ipchunDate = new Date(year, ipchun[0] - 1, ipchun[1]);

    if (birthDate < ipchunDate) {
      sajuYear = year - 1;
    }

    const stemIdx = ((sajuYear - 4) % 10 + 10) % 10;
    const branchIdx = ((sajuYear - 4) % 12 + 12) % 12;

    return {
      stem: STEMS[stemIdx],
      branch: BRANCHES[branchIdx],
      display: STEMS[stemIdx] + BRANCHES[branchIdx],
      element: STEM_ELEMENT[STEMS[stemIdx]],
      branchElement: BRANCH_ELEMENT[BRANCHES[branchIdx]],
      hiddenStems: BRANCH_HIDDEN_STEMS[BRANCHES[branchIdx]]
    };
  }

  /**
   * 월주 계산 - 절기 기준 + 연상기월법(年上起月法)
   */
  getMonthPillar(year, month, day, yearStem) {
    // 절기 기준 월 결정
    let sajuMonth = this.getJeolgiMonth(year, month, day);

    // 연상기월법: 년간에 따라 인월(1월) 천간 결정
    // 갑/기 → 병인, 을/경 → 무인, 병/신 → 경인, 정/임 → 임인, 무/계 → 갑인
    const yearStemIdx = STEMS.indexOf(yearStem);
    const baseMonthStemMap = { 0: 2, 1: 4, 2: 6, 3: 8, 4: 0, 5: 2, 6: 4, 7: 6, 8: 8, 9: 0 };
    const baseMonthStem = baseMonthStemMap[yearStemIdx];

    // 인월(1월)부터 시작, sajuMonth는 1~12 (1=인월)
    const stemIdx = (baseMonthStem + sajuMonth - 1) % 10;
    // 지지: 인월=인(2), 묘월=묘(3), ... 축월=축(1)
    const branchIdx = (sajuMonth + 1) % 12; // 인=2

    return {
      stem: STEMS[stemIdx],
      branch: BRANCHES[branchIdx],
      display: STEMS[stemIdx] + BRANCHES[branchIdx],
      element: STEM_ELEMENT[STEMS[stemIdx]],
      branchElement: BRANCH_ELEMENT[BRANCHES[branchIdx]],
      hiddenStems: BRANCH_HIDDEN_STEMS[BRANCHES[branchIdx]],
      sajuMonth
    };
  }

  /**
   * 절기 기준 사주 월(1=인월~12=축월) 결정
   */
  getJeolgiMonth(year, month, day) {
    // 절기 순서대로 확인
    // 소한(1월 6일경) → 축월(12), 입춘(2월 4일경) → 인월(1), ...
    for (let i = JEOLGI_DATES.length - 1; i >= 0; i--) {
      const jeolgi = JEOLGI_DATES[i];
      let jeolgiYear = year;

      // 소한(양력 1월)은 전년도 사주 기준
      if (jeolgi.solarMonth === 1 && month === 1 && day >= jeolgi.approxDay) {
        return jeolgi.month; // 축월(12)
      }

      if (jeolgi.solarMonth <= month) {
        if (jeolgi.solarMonth === month) {
          if (day >= jeolgi.approxDay) {
            return jeolgi.month;
          }
        } else {
          // 현재 월이 절기 월보다 크면 이 절기를 지남
          return jeolgi.month;
        }
      }
    }

    // 1월 소한 이전 = 전년도 자월(11)에 해당하지만,
    // 보통 12월 대설 이후이므로 자월(11)
    return 12; // 축월
  }

  /**
   * 일주 계산 - 기준일 기반
   * 기준일: 2000-01-01 = 갑진일 (stem=0, branch=4 → 갑진)
   */
  getDayPillar(year, month, day) {
    const baseDate = new Date(2000, 0, 1); // 2000-01-01
    const targetDate = new Date(year, month - 1, day);
    const diffDays = Math.round((targetDate - baseDate) / (1000 * 60 * 60 * 24));

    // 2000-01-01 = 갑진 (천간 0번, 지지 4번)  -> 간지 순서상 40번째
    const baseStemIdx = 0;   // 갑
    const baseBranchIdx = 4; // 진

    const stemIdx = ((baseStemIdx + diffDays) % 10 + 10) % 10;
    const branchIdx = ((baseBranchIdx + diffDays) % 12 + 12) % 12;

    return {
      stem: STEMS[stemIdx],
      branch: BRANCHES[branchIdx],
      display: STEMS[stemIdx] + BRANCHES[branchIdx],
      element: STEM_ELEMENT[STEMS[stemIdx]],
      branchElement: BRANCH_ELEMENT[BRANCHES[branchIdx]],
      hiddenStems: BRANCH_HIDDEN_STEMS[BRANCHES[branchIdx]]
    };
  }

  /**
   * 시주 계산 - 오호기일법(五虎起日法)
   * 일간에 따라 자시(23:00-01:00)의 천간이 결정됨
   */
  getHourPillar(sijin, dayStem) {
    // 시진 → 지지 인덱스 매핑
    const sijinMap = {
      'ja': 0, 'chuk': 1, 'in': 2, 'myo': 3, 'jin': 4, 'sa': 5,
      'oh': 6, 'mi': 7, 'shin': 8, 'yu': 9, 'sul': 10, 'hae': 11
    };

    const branchIdx = sijinMap[sijin];
    if (branchIdx === undefined) return null;

    // 오호기일법: 일간에 따라 자시 천간 결정
    // 갑/기일 → 갑자시, 을/경일 → 병자시, 병/신일 → 무자시,
    // 정/임일 → 경자시, 무/계일 → 임자시
    const dayStemIdx = STEMS.indexOf(dayStem);
    const baseHourStemMap = { 0: 0, 1: 2, 2: 4, 3: 6, 4: 8, 5: 0, 6: 2, 7: 4, 8: 6, 9: 8 };
    const baseHourStem = baseHourStemMap[dayStemIdx];

    const stemIdx = (baseHourStem + branchIdx) % 10;

    return {
      stem: STEMS[stemIdx],
      branch: BRANCHES[branchIdx],
      display: STEMS[stemIdx] + BRANCHES[branchIdx],
      element: STEM_ELEMENT[STEMS[stemIdx]],
      branchElement: BRANCH_ELEMENT[BRANCHES[branchIdx]],
      hiddenStems: BRANCH_HIDDEN_STEMS[BRANCHES[branchIdx]]
    };
  }

  /**
   * 오행 분석 (목/화/토/금/수 카운트)
   */
  analyzeElements(yearP, monthP, dayP, hourP) {
    const count = { '목': 0, '화': 0, '토': 0, '금': 0, '수': 0 };
    const pillars = [yearP, monthP, dayP];
    if (hourP) pillars.push(hourP);

    pillars.forEach(p => {
      count[STEM_ELEMENT[p.stem]]++;
      count[BRANCH_ELEMENT[p.branch]]++;
    });

    // 가장 강한/약한 오행
    const sorted = Object.entries(count).sort((a, b) => b[1] - a[1]);
    const strongest = sorted[0];
    const weakest = sorted[sorted.length - 1];
    const missing = sorted.filter(([, v]) => v === 0).map(([k]) => k);

    return {
      count,
      strongest: { element: strongest[0], count: strongest[1] },
      weakest: { element: weakest[0], count: weakest[1] },
      missing,
      total: pillars.length * 2
    };
  }
}

// 상수 내보내기
export {
  STEMS, BRANCHES, STEM_ELEMENT, STEM_YINYANG,
  BRANCH_ELEMENT, BRANCH_HIDDEN_STEMS
};
