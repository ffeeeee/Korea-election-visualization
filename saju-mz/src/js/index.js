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
    this.loadStoredData();
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

  loadStoredData() {
    const lastSaju = this.storageManager.getLastSaju();
    if (lastSaju) {
      this.displayResult(lastSaju);
    }
  }

  async handleFormSubmit(e) {
    e.preventDefault();

    const formData = {
      birthDate: document.getElementById('birthDate').value,
      birthTime: document.getElementById('birthTime').value,
      birthPlace: document.getElementById('birthPlace').value,
      gender: document.querySelector('input[name="gender"]:checked').value
    };

    // 데이터 유효성 검사
    if (!this.validateFormData(formData)) {
      alert('모든 필드를 입력해주세요');
      return;
    }

    // 로딩 상태 표시
    this.uiManager.showLoading();

    try {
      // 사주 분석
      const result = this.sajuAnalyzer.analyze(formData);

      // 결과 저장
      this.storageManager.saveSaju(result);

      // 결과 표시
      this.displayResult(result);

      // 폼 초기화
      document.getElementById('sajuForm').reset();
    } catch (error) {
      console.error('사주 분석 실패:', error);
      alert('사주 분석 중 오류가 발생했습니다');
    } finally {
      this.uiManager.hideLoading();
    }
  }

  validateFormData(data) {
    return data.birthDate && data.birthTime && data.birthPlace && data.gender;
  }

  displayResult(result) {
    // 결과 섹션 표시
    const resultSection = document.getElementById('result');
    resultSection.classList.remove('hidden');

    // 기본 정보 채우기
    document.getElementById('resultName').textContent = result.name || '당신의 사주';
    document.getElementById('resultInfo').textContent = result.birthDate;

    document.getElementById('basicBirthDate').textContent = result.birthDate;
    document.getElementById('basicGanji').textContent = result.ganji;
    document.getElementById('basicWuxing').textContent = result.wuxing;

    // 분석 결과 채우기
    document.getElementById('personalityAnalysis').textContent = result.analysis.personality;
    document.getElementById('romanticFortune').textContent = result.analysis.romantic;
    document.getElementById('wealthFortune').textContent = result.analysis.wealth;
    document.getElementById('careerFortune').textContent = result.analysis.career;
    document.getElementById('healthFortune').textContent = result.analysis.health;

    // 스크롤
    setTimeout(() => {
      resultSection.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  }

  resetForm() {
    document.getElementById('result').classList.add('hidden');
    document.getElementById('sajuForm').reset();
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
      // Fallback: 클립보드에 복사
      navigator.clipboard.writeText(shareText);
      alert('결과 텍스트가 복사되었습니다');
    }
  }
}

// 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
