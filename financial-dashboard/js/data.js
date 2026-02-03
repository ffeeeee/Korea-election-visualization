/**
 * 데이터 관리 모듈
 * 로컬 JSON 파일 및 API에서 데이터를 페칭하고 캐싱
 */

const DataManager = (() => {
    const CACHE_TTL = 5 * 60 * 1000; // 5분
    const DATA_PATHS = {
        korean: 'data/korean-stocks.json',
        us: 'data/us-stocks.json',
        crypto: 'data/crypto-list.json'
    };

    /**
     * 캐시 키 생성
     */
    const getCacheKey = (market) => `stocks_${market}_cache`;

    /**
     * 캐시에서 데이터 가져오기
     */
    const getFromCache = (market) => {
        const cacheKey = getCacheKey(market);
        const cached = localStorage.getItem(cacheKey);

        if (!cached) return null;

        try {
            const data = JSON.parse(cached);
            const now = Date.now();

            // TTL 확인
            if (now - data.timestamp < CACHE_TTL) {
                return data.content;
            }

            // 만료된 캐시 제거
            localStorage.removeItem(cacheKey);
            return null;
        } catch (error) {
            console.error(`캐시 파싱 실패: ${market}`, error);
            localStorage.removeItem(cacheKey);
            return null;
        }
    };

    /**
     * 데이터를 캐시에 저장
     */
    const saveToCache = (market, data) => {
        const cacheKey = getCacheKey(market);
        try {
            localStorage.setItem(cacheKey, JSON.stringify({
                timestamp: Date.now(),
                content: data
            }));
        } catch (error) {
            console.error(`캐시 저장 실패: ${market}`, error);
        }
    };

    /**
     * 시장별 데이터 구조 정규화
     */
    const normalizeData = (market, rawData) => {
        if (market === 'korean') {
            return rawData.stocks || [];
        } else if (market === 'us') {
            return rawData.stocks || [];
        } else if (market === 'crypto') {
            return rawData.cryptos || [];
        }
        return [];
    };

    /**
     * JSON 파일에서 데이터 로드
     */
    const loadFromJSON = async (market) => {
        const path = DATA_PATHS[market];
        if (!path) {
            throw new Error(`알 수 없는 시장: ${market}`);
        }

        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const rawData = await response.json();
            return normalizeData(market, rawData);
        } catch (error) {
            console.error(`JSON 로드 실패 (${market}):`, error);
            throw error;
        }
    };

    /**
     * 공개 API
     */
    return {
        /**
         * 시장 데이터 로드 (캐시 우선)
         */
        async loadMarketData(market) {
            // 캐시 확인
            const cached = getFromCache(market);
            if (cached) {
                console.log(`캐시에서 로드: ${market}`);
                return cached;
            }

            // JSON에서 로드
            console.log(`JSON에서 로드: ${market}`);
            const data = await loadFromJSON(market);

            // 캐시에 저장
            saveToCache(market, data);

            return data;
        },

        /**
         * 캐시 무효화 (새로고침)
         */
        invalidateCache(market) {
            const cacheKey = getCacheKey(market);
            localStorage.removeItem(cacheKey);
            console.log(`캐시 무효화: ${market}`);
        },

        /**
         * 모든 캐시 무효화
         */
        invalidateAllCaches() {
            Object.keys(DATA_PATHS).forEach(market => {
                this.invalidateCache(market);
            });
        },

        /**
         * 검색 필터링
         */
        searchStocks(stocks, query) {
            if (!query || query.trim() === '') {
                return stocks;
            }

            const lowerQuery = query.toLowerCase();
            return stocks.filter(stock => {
                const name = stock.name || '';
                const symbol = stock.symbol || '';
                return name.toLowerCase().includes(lowerQuery) ||
                       symbol.toLowerCase().includes(lowerQuery);
            });
        },

        /**
         * 정렬
         */
        sortStocks(stocks, sortBy, ascending = true) {
            const sorted = [...stocks];

            sorted.sort((a, b) => {
                let aVal = a[sortBy];
                let bVal = b[sortBy];

                // null/undefined 처리
                if (aVal === undefined || aVal === null) aVal = 0;
                if (bVal === undefined || bVal === null) bVal = 0;

                // 비교
                if (typeof aVal === 'string') {
                    return ascending
                        ? aVal.localeCompare(bVal)
                        : bVal.localeCompare(aVal);
                }

                return ascending ? aVal - bVal : bVal - aVal;
            });

            return sorted;
        },

        /**
         * 수치 포맷팅
         */
        formatPrice(price, market) {
            if (market === 'korean') {
                return `₩${price.toLocaleString('ko-KR')}`;
            } else {
                return `$${price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
            }
        },

        /**
         * 변화율 포맷팅
         */
        formatChange(change) {
            const sign = change > 0 ? '+' : '';
            return `${sign}${change.toFixed(2)}%`;
        },

        /**
         * 거래량/시가총액 포맷팅 (약식)
         */
        formatVolume(volume) {
            if (volume >= 1000000000) {
                return `${(volume / 1000000000).toFixed(2)}B`;
            } else if (volume >= 1000000) {
                return `${(volume / 1000000).toFixed(2)}M`;
            } else if (volume >= 1000) {
                return `${(volume / 1000).toFixed(2)}K`;
            }
            return volume.toString();
        }
    };
})();
