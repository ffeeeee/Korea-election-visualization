/**
 * 메인 앱 로직
 * 모든 모듈을 통합하고 전역 상태 관리
 */

const App = (() => {
    let autoRefreshInterval = null;
    const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5분

    /**
     * 테마 전환
     */
    const setupTheme = () => {
        const themeToggle = document.getElementById('theme-toggle');
        const savedTheme = localStorage.getItem('theme') || 'light';

        // 저장된 테마 적용
        document.documentElement.setAttribute('data-theme', savedTheme);
        if (themeToggle) {
            themeToggle.checked = savedTheme === 'dark';
        }

        // 토글 이벤트
        if (themeToggle) {
            themeToggle.addEventListener('change', (e) => {
                const theme = e.target.checked ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', theme);
                localStorage.setItem('theme', theme);
            });
        }
    };

    /**
     * 시장 탭 설정
     */
    const setupMarketTabs = () => {
        const tabs = document.querySelectorAll('.tab-btn');

        tabs.forEach(tab => {
            tab.addEventListener('click', async (e) => {
                // 활성 탭 변경
                tabs.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');

                // 시장 데이터 로드
                const market = e.target.dataset.market;
                await ScreenerUI.displayMarket(market);
            });
        });
    };

    /**
     * 자동 새로고침 설정
     */
    const setupAutoRefresh = () => {
        const checkbox = document.getElementById('auto-refresh');

        if (checkbox) {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    startAutoRefresh();
                } else {
                    stopAutoRefresh();
                }
            });

            // 기본값: 자동 새로고침 활성화
            if (checkbox.checked) {
                startAutoRefresh();
            }
        }
    };

    /**
     * 자동 새로고침 시작
     */
    const startAutoRefresh = () => {
        stopAutoRefresh(); // 기존 타이머 정리

        autoRefreshInterval = setInterval(async () => {
            const market = ScreenerUI.getCurrentMarket();
            console.log(`자동 새로고침: ${market}`);
            await ScreenerUI.refresh();
        }, AUTO_REFRESH_INTERVAL);

        console.log('자동 새로고침 시작 (5분 주기)');
    };

    /**
     * 자동 새로고침 중지
     */
    const stopAutoRefresh = () => {
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
            autoRefreshInterval = null;
            console.log('자동 새로고침 중지');
        }
    };

    /**
     * 공개 API
     */
    return {
        /**
         * 앱 초기화
         */
        async init() {
            console.log('앱 초기화 중...');

            try {
                // 1. 테마 설정
                setupTheme();

                // 2. UI 모듈 초기화
                ScreenerUI.init();
                ChartUI.init();

                // 3. 탭 설정
                setupMarketTabs();

                // 4. 자동 새로고침 설정
                setupAutoRefresh();

                // 5. 초기 데이터 로드 (한국 주식)
                await ScreenerUI.displayMarket('korean');

                console.log('앱 초기화 완료');
            } catch (error) {
                console.error('앱 초기화 실패:', error);
                ScreenerUI.showError(true, '앱 초기화에 실패했습니다. 페이지를 새로고침해주세요.');
            }
        },

        /**
         * 자동 새로고침 시작
         */
        startAutoRefresh,

        /**
         * 자동 새로고침 중지
         */
        stopAutoRefresh,

        /**
         * 앱 정리 (언로드)
         */
        destroy() {
            stopAutoRefresh();
            console.log('앱 정리 완료');
        }
    };
})();

/**
 * DOM 로드 완료 후 앱 초기화
 */
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

/**
 * 페이지 언로드 시 정리
 */
window.addEventListener('beforeunload', () => {
    App.destroy();
});
