/**
 * 여론조사 데이터 모듈
 * 전국 여론조사 데이터를 관리합니다.
 */

let pollsData = null;
let regionsData = null;

// 캐싱 설정
const CACHE_TTL = 300000; // 5분

/**
 * 데이터 로드
 */
async function loadData() {
  try {
    // 캐시 확인
    const cached = JSON.parse(localStorage.getItem('pollCache') || '{}');
    const now = Date.now();

    if (cached.timestamp && now - cached.timestamp < CACHE_TTL && cached.polls && cached.regions) {
      console.log('캐시된 데이터 사용');
      pollsData = cached.polls;
      regionsData = cached.regions;
      return;
    }

    // 새 데이터 로드
    console.log('새 데이터 로드 중...');

    const [pollsResp, regionsResp] = await Promise.all([
      fetch('data/polls_2026.json'),
      fetch('data/regions.json')
    ]);

    if (!pollsResp.ok || !regionsResp.ok) {
      throw new Error('데이터 로드 실패');
    }

    pollsData = await pollsResp.json();
    regionsData = await regionsResp.json();

    // 캐시 저장
    localStorage.setItem('pollCache', JSON.stringify({
      timestamp: now,
      polls: pollsData,
      regions: regionsData
    }));

    console.log('✅ 데이터 로드 완료');
  } catch (error) {
    console.error('데이터 로드 오류:', error);
    throw error;
  }
}

/**
 * 특정 지역의 여론조사 시계열 데이터 가져오기
 * @param {string} regionCode - 지역 코드 (예: "11" = 서울)
 * @returns {Array} 시계열 데이터 배열
 */
function getPollTimelineByRegion(regionCode) {
  if (!pollsData || !pollsData.timeline) {
    return [];
  }

  const timeline = [];

  pollsData.timeline.forEach(entry => {
    const survey = entry.surveys.find(s => s.regionCode === regionCode);
    if (survey) {
      timeline.push({
        date: entry.date,
        candidates: survey.candidates
      });
    }
  });

  return timeline;
}

/**
 * 특정 지역의 가장 최신 여론조사 데이터 가져오기
 * @param {string} regionCode - 지역 코드
 * @returns {Object} 최신 여론조사 데이터
 */
function getLatestPollByRegion(regionCode) {
  const timeline = getPollTimelineByRegion(regionCode);
  return timeline.length > 0 ? timeline[timeline.length - 1] : null;
}

/**
 * 모든 지역의 최신 여론조사 데이터 가져오기
 * @returns {Object} regionCode -> 최신 데이터 매핑
 */
function getLatestPollsByAllRegions() {
  const result = {};

  if (!regionsData || !regionsData.provinces) {
    return result;
  }

  regionsData.provinces.forEach(province => {
    const latest = getLatestPollByRegion(province.code);
    if (latest) {
      result[province.code] = {
        name: province.name,
        ...latest
      };
    }
  });

  return result;
}

/**
 * 후보자별 색상 가져오기
 * @param {string} partyName - 정당명
 * @returns {string} 16진법 색상 코드
 */
function getPartyColor(partyName) {
  const colors = {
    '민주당': '#3b82f6',
    '국민의힘': '#ef4444',
    '기타': '#8b949e'
  };
  return colors[partyName] || '#999999';
}

/**
 * 최고 지지율 후보자 찾기
 * @param {Array} candidates - 후보자 배열
 * @returns {Object} 최고 지지율 후보자 객체
 */
function getLeadingCandidate(candidates) {
  if (!candidates || candidates.length === 0) {
    return null;
  }
  return candidates.reduce((max, curr) => curr.rate > max.rate ? curr : max);
}

/**
 * 시간 필터로 데이터 필터링
 * @param {Array} timeline - 시계열 데이터
 * @param {number} days - 최근 일 수
 * @returns {Array} 필터링된 데이터
 */
function filterTimelineByDays(timeline, days = 30) {
  if (days <= 0) return timeline;

  // 가장 최근 날짜부터 days만큼 역산
  const allDates = timeline.map(t => new Date(t.date));
  if (allDates.length === 0) return timeline;

  const maxDate = new Date(Math.max(...allDates));
  const minDate = new Date(maxDate.getTime() - days * 24 * 60 * 60 * 1000);

  return timeline.filter(t => new Date(t.date) >= minDate);
}

/**
 * 후보자별 평균 지지도 계산
 * @param {Array} timeline - 시계열 데이터
 * @returns {Object} 후보자별 평균 지지도
 */
function calculateAverageSupport(timeline) {
  const averages = {};

  if (!timeline || timeline.length === 0) {
    return averages;
  }

  timeline.forEach(entry => {
    entry.candidates.forEach(cand => {
      if (!averages[cand.name]) {
        averages[cand.name] = { sum: 0, count: 0, party: cand.party };
      }
      averages[cand.name].sum += cand.rate;
      averages[cand.name].count += 1;
    });
  });

  // 평균 계산
  const result = {};
  Object.entries(averages).forEach(([name, data]) => {
    result[name] = {
      rate: (data.sum / data.count).toFixed(1),
      party: data.party
    };
  });

  return result;
}

/**
 * 지역명으로 지역 코드 찾기
 * @param {string} regionName - 지역명 (예: "서울")
 * @returns {string} 지역 코드
 */
function getRegionCodeByName(regionName) {
  if (!regionsData || !regionsData.provinces) {
    return null;
  }

  const province = regionsData.provinces.find(p => p.name === regionName);
  return province ? province.code : null;
}

/**
 * 지역 코드로 지역명 찾기
 * @param {string} regionCode - 지역 코드
 * @returns {string} 지역명
 */
function getRegionNameByCode(regionCode) {
  if (!regionsData || !regionsData.provinces) {
    return null;
  }

  const province = regionsData.provinces.find(p => p.code === regionCode);
  return province ? province.name : null;
}

/**
 * 마지막 업데이트 시간 가져오기
 * @returns {string} 업데이트 시간
 */
function getLastUpdateTime() {
  return pollsData?.meta?.lastUpdate || '정보 없음';
}
