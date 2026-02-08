import '../styles/main.scss';
import { SajuAnalyzer } from './modules/sajuAnalyzer';
import { UIManager } from './modules/uiManager';
import { StorageManager } from './modules/storageManager';

class App {
  constructor() {
    this.sajuAnalyzer = new SajuAnalyzer();
    this.uiManager = new UIManager();
    this.storageManager = new StorageManager();
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupNavigation();
  }

  setupEventListeners() {
    // 폼 제출
    const sajuForm = document.getElementById('sajuForm');
    if (sajuForm) {
      sajuForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    // 사주 보기 버튼
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.scrollToSaju());
    }

    // 돌아가기 버튼
    const backBtn = document.querySelector('.btn-back');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.resetForm());
    }

    // 새 사주 보기 버튼
    const newSajuBtn = document.getElementById('newSajuBtn');
    if (newSajuBtn) {
      newSajuBtn.addEventListener('click', () => this.resetForm());
    }

    // 공유하기 버튼
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => this.shareResult());
    }

    // 양력/음력 토글 → 윤달 체크박스 show/hide
    const calendarRadios = document.querySelectorAll('input[name="calendarType"]');
    calendarRadios.forEach(radio => {
      radio.addEventListener('change', () => this.toggleLeapMonth());
    });
  }

  setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });
  }

  toggleLeapMonth() {
    const calendarType = document.querySelector('input[name="calendarType"]:checked').value;
    const leapMonthWrap = document.getElementById('leapMonthWrap');
    if (calendarType === 'lunar') {
      leapMonthWrap.classList.remove('hidden');
    } else {
      leapMonthWrap.classList.add('hidden');
      document.getElementById('isLeapMonth').checked = false;
    }
  }

  async handleFormSubmit(e) {
    e.preventDefault();

    const genderEl = document.querySelector('input[name="gender"]:checked');
    if (!genderEl) {
      alert('성별을 선택해주세요');
      return;
    }

    const formData = {
      name: document.getElementById('userName').value.trim(),
      birthDate: document.getElementById('birthDate').value,
      calendarType: document.querySelector('input[name="calendarType"]:checked').value,
      isLeapMonth: document.getElementById('isLeapMonth').checked,
      birthSijin: document.getElementById('birthSijin').value,
      gender: genderEl.value
    };

    if (!this.validateFormData(formData)) {
      alert('이름과 생년월일을 입력해주세요');
      return;
    }

    this.uiManager.showLoading();

    try {
      const result = this.sajuAnalyzer.analyze(formData);
      this.storageManager.saveSaju(result);
      this.displayResult(result);
      document.getElementById('sajuForm').reset();
      // 양력 기본 선택 복원
      document.getElementById('solar').checked = true;
      this.toggleLeapMonth();
    } catch (error) {
      console.error('사주 분석 실패:', error);
      alert('사주 분석 중 오류가 발생했습니다: ' + error.message);
    } finally {
      this.uiManager.hideLoading();
    }
  }

  validateFormData(data) {
    return data.name && data.birthDate && data.gender;
  }

  displayResult(result) {
    const resultSection = document.getElementById('result');
    resultSection.classList.remove('hidden');

    // 헤더
    document.getElementById('resultName').textContent = `${result.name}님의 사주 분석`;
    document.getElementById('resultInfo').textContent = `${result.birthDate} (${result.gender === 'male' ? '남' : '여'}) | ${result.ganji}`;

    // 사주 명식 차트
    this.renderSajuChart(result);

    // 11개 분석 섹션 (innerHTML로 HTML 텍스트 지원)
    const sections = {
      'analysisBasic': result.analysis.basicAnalysis,
      'analysisElement': result.analysis.elementAnalysis,
      'analysisSipsin': result.analysis.sipsinAnalysis,
      'analysisDaewoon': result.analysis.daewoonAnalysis,
      'analysisPersonality': result.analysis.personality,
      'analysisRomance': result.analysis.romance,
      'analysisWealth': result.analysis.wealth,
      'analysisCareer': result.analysis.career,
      'analysisHealth': result.analysis.health,
      'analysisYearFortune': result.analysis.yearFortune,
      'analysisAdvice': result.analysis.advice
    };

    Object.entries(sections).forEach(([id, html]) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    });

    // 스크롤
    setTimeout(() => {
      resultSection.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  }

  renderSajuChart(result) {
    const chart = document.getElementById('sajuChart');
    const { pillars } = result;
    const pillarOrder = [
      { key: 'hour', label: '시주' },
      { key: 'day', label: '일주' },
      { key: 'month', label: '월주' },
      { key: 'year', label: '년주' }
    ];

    const elementColors = {
      '목': '#22c55e', '화': '#ef4444', '토': '#eab308',
      '금': '#a1a1aa', '수': '#3b82f6'
    };

    let html = '<div class="saju-chart-grid">';

    // 라벨 행
    html += '<div class="chart-row chart-labels">';
    pillarOrder.forEach(p => {
      html += `<div class="chart-cell">${p.label}</div>`;
    });
    html += '</div>';

    // 천간 행
    html += '<div class="chart-row chart-stems">';
    pillarOrder.forEach(p => {
      const pillar = pillars[p.key];
      if (pillar) {
        const color = elementColors[pillar.element] || '#666';
        html += `<div class="chart-cell" style="color: ${color}">
          <span class="chart-char">${pillar.stem}</span>
          <span class="chart-element">${pillar.element}</span>
        </div>`;
      } else {
        html += `<div class="chart-cell empty"><span class="chart-char">-</span></div>`;
      }
    });
    html += '</div>';

    // 지지 행
    html += '<div class="chart-row chart-branches">';
    pillarOrder.forEach(p => {
      const pillar = pillars[p.key];
      if (pillar) {
        const color = elementColors[pillar.branchElement] || '#666';
        html += `<div class="chart-cell" style="color: ${color}">
          <span class="chart-char">${pillar.branch}</span>
          <span class="chart-element">${pillar.branchElement}</span>
        </div>`;
      } else {
        html += `<div class="chart-cell empty"><span class="chart-char">-</span></div>`;
      }
    });
    html += '</div>';

    html += '</div>';

    chart.innerHTML = html;
  }

  resetForm() {
    document.getElementById('result').classList.add('hidden');
    document.getElementById('sajuForm').reset();
    document.getElementById('solar').checked = true;
    this.toggleLeapMonth();
    this.scrollToSaju();
  }

  scrollToSaju() {
    const sajuSection = document.getElementById('saju');
    sajuSection.scrollIntoView({ behavior: 'smooth' });
  }

  shareResult() {
    const resultTitle = document.getElementById('resultName').textContent;
    const shareText = `사주 MZ에서 분석한 내 사주: ${resultTitle} - 당신의 운명을 발견해보세요!`;

    if (navigator.share) {
      navigator.share({
        title: '사주 MZ',
        text: shareText,
        url: window.location.href
      }).catch(err => console.log('공유 실패:', err));
    } else {
      navigator.clipboard.writeText(shareText);
      alert('결과 텍스트가 복사되었습니다');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new App();
});
