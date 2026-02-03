/**
 * UI 관리 모듈
 * DOM 조작 및 UI 상태 관리
 */

export class UIManager {
  constructor() {
    this.loadingIndicator = null;
    this.init();
  }

  init() {
    this.createLoadingIndicator();
  }

  /**
   * 로딩 인디케이터 생성
   */
  createLoadingIndicator() {
    const loadingHTML = `
      <div class="loading-overlay" id="loadingOverlay">
        <div class="loading-content">
          <div class="loading"></div>
          <p>사주를 분석하는 중...</p>
        </div>
      </div>
    `;

    const div = document.createElement('div');
    div.innerHTML = loadingHTML;
    this.loadingIndicator = div.firstElementChild;

    // CSS 추가
    this.addLoadingStyles();
  }

  /**
   * 로딩 스타일 추가
   */
  addLoadingStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        backdrop-filter: blur(4px);
      }

      .loading-content {
        text-align: center;
        background: white;
        padding: 40px;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      }

      .loading-content p {
        margin-top: 20px;
        color: #64748b;
        font-weight: 600;
      }

      .loading {
        display: inline-block;
        width: 40px;
        height: 40px;
        border: 4px solid rgba(124, 58, 237, 0.3);
        border-radius: 50%;
        border-top-color: #7c3aed;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * 로딩 표시
   */
  showLoading() {
    if (!this.loadingIndicator.parentElement) {
      document.body.appendChild(this.loadingIndicator);
    }
    this.loadingIndicator.style.display = 'flex';

    // 애니메이션 지연 (부드러운 효과)
    setTimeout(() => {
      this.loadingIndicator.style.opacity = '1';
    }, 10);
  }

  /**
   * 로딩 숨김
   */
  hideLoading() {
    this.loadingIndicator.style.display = 'none';
  }

  /**
   * 토스트 메시지 표시
   */
  showToast(message, type = 'info') {
    const toastHTML = `
      <div class="toast toast-${type}">
        <span>${message}</span>
      </div>
    `;

    const div = document.createElement('div');
    div.innerHTML = toastHTML;
    const toast = div.firstElementChild;

    document.body.appendChild(toast);

    // 애니메이션
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    // 자동 제거
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * 토스트 스타일 추가 (처음 한 번만)
   */
  static addToastStyles() {
    if (document.getElementById('toastStyles')) return;

    const style = document.createElement('style');
    style.id = 'toastStyles';
    style.textContent = `
      .toast {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 999;
        animation: slideIn 0.3s ease;
      }

      .toast.show {
        opacity: 1;
      }

      .toast-info {
        background: #3b82f6;
      }

      .toast-success {
        background: #10b981;
      }

      .toast-warning {
        background: #f59e0b;
      }

      .toast-error {
        background: #ef4444;
      }

      @keyframes slideIn {
        from {
          transform: translateX(400px);
        }
        to {
          transform: translateX(0);
        }
      }

      @media (max-width: 768px) {
        .toast {
          left: 20px;
          right: 20px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * 모달 열기
   */
  openModal(title, content, actions = []) {
    const modalHTML = `
      <div class="modal-overlay" id="modalOverlay">
        <div class="modal">
          <div class="modal-header">
            <h3>${title}</h3>
            <button class="modal-close">&times;</button>
          </div>
          <div class="modal-content">
            ${content}
          </div>
          <div class="modal-footer">
            ${actions.map(action => `
              <button class="btn ${action.type === 'primary' ? 'btn-primary' : 'btn-secondary'}"
                      data-action="${action.name}">
                ${action.label}
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    const div = document.createElement('div');
    div.innerHTML = modalHTML;
    document.body.appendChild(div);

    // 스타일 추가 (처음 한 번만)
    this.addModalStyles();

    // 이벤트 리스너
    const modal = document.getElementById('modalOverlay');
    const closeBtn = modal.querySelector('.modal-close');

    closeBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    // 액션 버튼 이벤트
    modal.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = actions.find(a => a.name === e.target.dataset.action);
        if (action && action.callback) {
          action.callback();
        }
        modal.remove();
      });
    });
  }

  /**
   * 모달 스타일 추가
   */
  static addModalStyles() {
    if (document.getElementById('modalStyles')) return;

    const style = document.createElement('style');
    style.id = 'modalStyles';
    style.textContent = `
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1001;
        animation: fadeIn 0.3s ease;
      }

      .modal {
        background: white;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        max-width: 500px;
        width: 90%;
        animation: slideUp 0.3s ease;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #e2e8f0;
      }

      .modal-header h3 {
        font-size: 20px;
        font-weight: 700;
      }

      .modal-close {
        background: none;
        border: none;
        font-size: 28px;
        cursor: pointer;
        color: #64748b;
        transition: color 0.3s ease;
      }

      .modal-close:hover {
        color: #1e293b;
      }

      .modal-content {
        padding: 20px;
      }

      .modal-footer {
        padding: 20px;
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        border-top: 1px solid #e2e8f0;
      }

      .modal-footer .btn {
        flex: 1;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes slideUp {
        from {
          transform: translateY(20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * 부드러운 스크롤
   */
  smoothScroll(target) {
    const element = typeof target === 'string'
      ? document.querySelector(target)
      : target;

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /**
   * 요소의 가시성 확인
   */
  isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /**
   * 요소 하이라이트
   */
  highlightElement(element, color = '#fbbf24') {
    const originalBg = element.style.backgroundColor;
    element.style.backgroundColor = color;
    element.style.transition = 'background-color 0.3s ease';

    setTimeout(() => {
      element.style.backgroundColor = originalBg || '';
    }, 1500);
  }

  /**
   * 반응형 헬퍼
   */
  isMobile() {
    return window.innerWidth <= 768;
  }

  isTablet() {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
  }

  isDesktop() {
    return window.innerWidth > 1024;
  }
}
