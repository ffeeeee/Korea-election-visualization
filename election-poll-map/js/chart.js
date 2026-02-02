/**
 * Chart.js 시계열 차트 모듈
 * 여론조사 추이를 라인 차트로 표시합니다.
 */

let chart = null;

/**
 * 차트 초기화
 */
function initChart() {
  const ctx = document.getElementById('pollChart');
  if (!ctx) {
    console.error('pollChart 엘리먼트를 찾을 수 없습니다');
    return;
  }

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: []
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: { size: 12, family: "'Malgun Gothic', sans-serif" },
            padding: 15,
            usePointStyle: true
          }
        },
        title: {
          display: true,
          text: '지역 선택 후 여론 추이를 확인하세요',
          font: { size: 14, weight: 'bold', family: "'Malgun Gothic', sans-serif" }
        },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.8)',
          titleFont: { family: "'Malgun Gothic', sans-serif" },
          bodyFont: { family: "'Malgun Gothic', sans-serif" },
          padding: 10,
          displayColors: true,
          callbacks: {
            label: function(context) {
              return context.dataset.label + ': ' + context.parsed.y.toFixed(1) + '%';
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: '지지도 (%)',
            font: { family: "'Malgun Gothic', sans-serif" }
          },
          ticks: {
            callback: function(value) {
              return value + '%';
            },
            font: { family: "'Malgun Gothic', sans-serif" }
          }
        },
        x: {
          title: {
            display: true,
            text: '조사 날짜',
            font: { family: "'Malgun Gothic', sans-serif" }
          },
          ticks: {
            font: { family: "'Malgun Gothic', sans-serif" }
          }
        }
      }
    }
  });
}

/**
 * 특정 지역의 여론 추이 차트 렌더링
 * @param {string} regionCode - 지역 코드
 * @param {number} days - 필터링할 일 수 (0이면 모든 데이터)
 */
function drawChart(regionCode, days = 30) {
  if (!chart || !pollsData) {
    console.error('차트 초기화 필요');
    return;
  }

  // 해당 지역의 시계열 데이터 가져오기
  let timeline = getPollTimelineByRegion(regionCode);

  if (timeline.length === 0) {
    // 데이터 없음
    chart.data.labels = [];
    chart.data.datasets = [];
    const regionName = getRegionNameByCode(regionCode);
    chart.options.plugins.title.text = `${regionName} - 여론조사 데이터 없음`;
    chart.update();
    return;
  }

  // 기간 필터링
  if (days > 0) {
    timeline = filterTimelineByDays(timeline, days);
  }

  // 날짜 레이블
  const labels = timeline.map(t => t.date);

  // 후보자별 데이터셋 생성
  const datasets = [];
  const candidateIndex = {};

  timeline.forEach(entry => {
    entry.candidates.forEach(cand => {
      if (!candidateIndex[cand.name]) {
        candidateIndex[cand.name] = {
          party: cand.party,
          data: []
        };
      }
    });
  });

  // 각 후보자의 데이터 수집
  timeline.forEach(entry => {
    entry.candidates.forEach(cand => {
      // candidateIndex 초기화 확인
      if (!candidateIndex[cand.name].data) {
        candidateIndex[cand.name].data = [];
      }
      candidateIndex[cand.name].data.push(cand.rate);
    });
  });

  // 데이터셋 생성
  Object.entries(candidateIndex).forEach(([name, info]) => {
    // 모든 날짜에 대한 데이터 보장 (없으면 null)
    const completeData = [];
    timeline.forEach((entry, idx) => {
      const candData = entry.candidates.find(c => c.name === name);
      completeData.push(candData ? candData.rate : null);
    });

    datasets.push({
      label: `${name} (${info.party})`,
      data: completeData,
      borderColor: getPartyColor(info.party),
      backgroundColor: getPartyColor(info.party) + '15', // 투명도 추가
      borderWidth: 2,
      fill: false,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: getPartyColor(info.party),
      pointBorderColor: '#fff',
      pointBorderWidth: 2
    });
  });

  // 평균값 추가 (점선)
  if (datasets.length > 0) {
    const avgData = timeline.map(entry => {
      const avg = entry.candidates.reduce((sum, cand) => sum + cand.rate, 0) / entry.candidates.length;
      return parseFloat(avg.toFixed(1));
    });

    datasets.push({
      label: '전국 평균',
      data: avgData,
      borderColor: '#8b949e',
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderDash: [5, 5],
      fill: false,
      tension: 0.4,
      pointRadius: 2,
      pointHoverRadius: 4,
      pointBackgroundColor: '#8b949e'
    });
  }

  // 차트 업데이트
  chart.data.labels = labels;
  chart.data.datasets = datasets;

  // 제목 업데이트
  const regionName = getRegionNameByCode(regionCode);
  const periodText = days > 0 ? `(최근 ${days}일)` : '(전체 기간)';
  chart.options.plugins.title.text = `${regionName} 여론 추이 ${periodText}`;

  chart.update();
}

/**
 * 차트 초기 메시지 표시
 */
function showEmptyChart() {
  if (!chart) {
    return;
  }

  chart.data.labels = [];
  chart.data.datasets = [];
  chart.options.plugins.title.text = '지역을 선택하여 여론 추이를 확인하세요';
  chart.update();
}

/**
 * 차트 리셋
 */
function resetChart() {
  if (chart) {
    chart.destroy();
    chart = null;
  }
  initChart();
  showEmptyChart();
}
