/**
 * 메인 애플리케이션 로직
 * 지도와 차트의 상호작용을 관리합니다.
 */

let selectedRegion = null;

/**
 * 초기화
 */
async function init() {
  try {
    console.log('애플리케이션 초기화 중...');

    // 데이터 로드
    await loadData();

    // 차트 초기화
    initChart();

    // 이벤트 리스너 등록
    setupEventListeners();

    // UI 업데이트
    updateLastUpdateTime();
    updateRegionList();

    console.log('✅ 애플리케이션 초기화 완료');
  } catch (error) {
    console.error('초기화 오류:', error);
    showError('데이터 로드에 실패했습니다. 페이지를 새로고침해주세요.');
  }
}

/**
 * 이벤트 리스너 등록
 */
function setupEventListeners() {
  // 기간 필터 변경
  const daysFilter = document.getElementById('daysFilter');
  if (daysFilter) {
    daysFilter.addEventListener('change', (e) => {
      const days = parseInt(e.target.value);
      if (selectedRegion) {
        drawChart(selectedRegion, days);
      }
    });
  }

  // 지역 선택 드롭다운
  const regionSelect = document.getElementById('regionSelect');
  if (regionSelect) {
    regionSelect.addEventListener('change', (e) => {
      selectRegion(e.target.value);
    });
  }

  // 초기화 버튼
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      resetView();
    });
  }
}

/**
 * 지역 선택
 * @param {string} regionCode - 지역 코드
 */
function selectRegion(regionCode) {
  if (!regionCode) {
    showEmptyChart();
    selectedRegion = null;
    return;
  }

  selectedRegion = regionCode;
  const regionName = getRegionNameByCode(regionCode);

  // 차트 렌더링
  const days = parseInt(document.getElementById('daysFilter')?.value || '30');
  drawChart(regionCode, days);

  // UI 업데이트
  const selectedText = document.getElementById('selectedRegionText');
  if (selectedText) {
    selectedText.textContent = regionName;
  }

  console.log(`선택된 지역: ${regionName}`);
}

/**
 * 지역 목록 업데이트
 */
function updateRegionList() {
  const regionSelect = document.getElementById('regionSelect');
  if (!regionSelect || !regionsData || !regionsData.provinces) {
    return;
  }

  // 옵션 생성
  regionSelect.innerHTML = '<option value="">지역을 선택하세요...</option>';

  regionsData.provinces.forEach(province => {
    const option = document.createElement('option');
    option.value = province.code;
    option.textContent = province.name;
    regionSelect.appendChild(option);
  });
}

/**
 * 마지막 업데이트 시간 표시
 */
function updateLastUpdateTime() {
  const lastUpdate = document.getElementById('lastUpdate');
  if (lastUpdate) {
    lastUpdate.textContent = getLastUpdateTime();
  }
}

/**
 * 뷰 리셋
 */
function resetView() {
  selectedRegion = null;
  const regionSelect = document.getElementById('regionSelect');
  if (regionSelect) {
    regionSelect.value = '';
  }
  showEmptyChart();
  const selectedText = document.getElementById('selectedRegionText');
  if (selectedText) {
    selectedText.textContent = '선택 없음';
  }
}

/**
 * 에러 메시지 표시
 * @param {string} message - 에러 메시지
 */
function showError(message) {
  const errorDiv = document.getElementById('error');
  if (errorDiv) {
    errorDiv.innerHTML = `<div class="error-message">${message}</div>`;
    errorDiv.style.display = 'block';
  }
}

/**
 * 전체 지역 통계 가져오기
 * @returns {Object} 지역별 최신 여론조사 데이터
 */
function getRegionStats() {
  return getLatestPollsByAllRegions();
}

/**
 * 여론조사 데이터 내보내기 (JSON)
 */
function exportDataAsJSON() {
  if (!pollsData) {
    alert('내보낼 데이터가 없습니다.');
    return;
  }

  const dataStr = JSON.stringify(pollsData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `polls_2026_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * 여론조사 데이터 내보내기 (CSV)
 */
function exportDataAsCSV() {
  if (!pollsData || !pollsData.timeline) {
    alert('내보낼 데이터가 없습니다.');
    return;
  }

  let csv = '날짜,지역,후보자,정당,지지도(%)\n';

  pollsData.timeline.forEach(entry => {
    entry.surveys.forEach(survey => {
      const regionName = getRegionNameByCode(survey.regionCode);
      survey.candidates.forEach(cand => {
        csv += `"${entry.date}","${regionName}","${cand.name}","${cand.party}",${cand.rate}\n`;
      });
    });
  });

  const csvBlob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(csvBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `polls_2026_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * 현재 지역의 통계 출력
 */
function printRegionStats() {
  if (!selectedRegion) {
    alert('먼저 지역을 선택하세요.');
    return;
  }

  const timeline = getPollTimelineByRegion(selectedRegion);
  const regionName = getRegionNameByCode(selectedRegion);
  const averages = calculateAverageSupport(timeline);

  console.group(`${regionName} 여론조사 통계`);
  console.log('시계열 데이터:', timeline);
  console.log('평균 지지도:', averages);
  console.groupEnd();

  alert(`${regionName}의 통계를 콘솔에서 확인하세요. (F12 > 콘솔)`);
}

/**
 * 다크모드 토글
 */
function toggleDarkMode() {
  const root = document.documentElement;
  const isDark = root.getAttribute('data-theme') === 'dark';

  if (isDark) {
    root.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
  } else {
    root.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  }
}

/**
 * 저장된 테마 로드
 */
function loadTheme() {
  const theme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', theme);
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  init();
});
