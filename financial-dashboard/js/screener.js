/**
 * 스크리너 UI 모듈
 * 종목 테이블 렌더링, 필터링, 정렬
 */

const ScreenerUI = (() => {
    let currentMarket = 'korean';
    let currentStocks = [];
    let filteredStocks = [];
    let sortConfig = { field: 'change', ascending: false };

    /**
     * 행 HTML 생성
     */
    const createStockRow = (stock) => {
        const changeClass = stock.change >= 0 ? 'positive' : 'negative';
        const changeSign = stock.change >= 0 ? '+' : '';

        // 시장별 통화 결정
        const currency = currentMarket === 'korean' ? '₩' : '$';
        const priceFormatted = currentMarket === 'korean'
            ? stock.price.toLocaleString('ko-KR')
            : stock.price.toFixed(2);

        // 거래량/시가총액 포맷팅
        const volume = DataManager.formatVolume(stock.volume || stock.volume24h || 0);
        const marketCap = DataManager.formatVolume(stock.marketCap || 0);

        return `
            <tr class="stock-row" data-symbol="${stock.symbol}" data-market="${currentMarket}">
                <td class="col-name">
                    <span class="stock-name">${stock.name}</span>
                </td>
                <td class="col-symbol">
                    <span class="stock-symbol">${stock.symbol}</span>
                </td>
                <td class="col-price">
                    <span class="cell-price">${currency}${priceFormatted}</span>
                </td>
                <td class="col-change">
                    <span class="cell-change ${changeClass}">
                        ${changeSign}${stock.change.toFixed(2)}%
                    </span>
                </td>
                <td class="col-volume">
                    <span>${volume}</span>
                </td>
                <td class="col-market-cap">
                    <span>${marketCap}</span>
                </td>
            </tr>
        `;
    };

    /**
     * 테이블 렌더링
     */
    const renderTable = () => {
        const tbody = document.getElementById('stocks-tbody');

        if (filteredStocks.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px 20px; color: var(--color-text-secondary);">
                        검색 결과가 없습니다.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filteredStocks
            .map(stock => createStockRow(stock))
            .join('');

        // 행 클릭 이벤트
        tbody.querySelectorAll('.stock-row').forEach(row => {
            row.addEventListener('click', () => {
                const symbol = row.dataset.symbol;
                const market = row.dataset.market;
                const stock = currentStocks.find(s => s.symbol === symbol);
                if (stock) {
                    ChartUI.showModal(stock, market);
                }
            });
        });
    };

    /**
     * 공개 API
     */
    return {
        /**
         * 스크리너 초기화
         */
        init() {
            this.setupEventListeners();
        },

        /**
         * 이벤트 리스너 설정
         */
        setupEventListeners() {
            // 검색 입력
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.applyFilters(e.target.value);
                });
            }

            // 새로고침 버튼
            const refreshBtn = document.getElementById('refresh-btn');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', () => {
                    this.refresh();
                });
            }
        },

        /**
         * 시장 데이터 표시
         */
        async displayMarket(market) {
            currentMarket = market;

            // 로딩 상태
            this.showLoading(true);

            try {
                currentStocks = await DataManager.loadMarketData(market);

                // 기본 정렬 적용
                filteredStocks = DataManager.sortStocks(currentStocks, sortConfig.field, sortConfig.ascending);

                // 테이블 렌더링
                this.renderTable();
                this.clearSearch();
                this.showError(false);
            } catch (error) {
                console.error(`시장 로드 실패: ${market}`, error);
                this.showError(true, `${market} 데이터 로드에 실패했습니다.`);
            } finally {
                this.showLoading(false);
            }
        },

        /**
         * 필터 적용
         */
        applyFilters(query = '') {
            let result = currentStocks;

            // 검색 필터
            if (query) {
                result = DataManager.searchStocks(result, query);
            }

            // 정렬
            result = DataManager.sortStocks(result, sortConfig.field, sortConfig.ascending);

            filteredStocks = result;
            this.renderTable();
        },

        /**
         * 테이블 렌더링
         */
        renderTable() {
            renderTable();
        },

        /**
         * 새로고침
         */
        async refresh() {
            DataManager.invalidateCache(currentMarket);
            await this.displayMarket(currentMarket);
        },

        /**
         * 정렬 변경
         */
        setSortOrder(field, ascending) {
            sortConfig = { field, ascending };
            this.applyFilters(document.getElementById('search-input')?.value || '');
        },

        /**
         * 검색 입력 초기화
         */
        clearSearch() {
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.value = '';
            }
        },

        /**
         * 로딩 상태 표시
         */
        showLoading(isLoading) {
            const spinner = document.getElementById('loading-spinner');
            if (spinner) {
                if (isLoading) {
                    spinner.classList.remove('hidden');
                } else {
                    spinner.classList.add('hidden');
                }
            }
        },

        /**
         * 에러 메시지 표시
         */
        showError(isError, message = '') {
            const errorElement = document.getElementById('error-message');
            if (errorElement) {
                if (isError) {
                    errorElement.textContent = message || '오류가 발생했습니다.';
                    errorElement.classList.remove('hidden');
                } else {
                    errorElement.classList.add('hidden');
                }
            }
        },

        /**
         * 현재 시장 반환
         */
        getCurrentMarket() {
            return currentMarket;
        },

        /**
         * 현재 주식 목록 반환
         */
        getCurrentStocks() {
            return currentStocks;
        }
    };
})();
