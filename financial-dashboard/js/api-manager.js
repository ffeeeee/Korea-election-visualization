/**
 * API 관리 모듈
 * Yahoo Finance, Alpha Vantage, CoinGecko 등 외부 API 통합
 */

const APIManager = (() => {
    // API 설정
    const CONFIG = {
        // Alpha Vantage (미국 주식 & 크립토)
        alphaVantage: {
            baseUrl: 'https://www.alphavantage.co/query',
            apiKey: 'demo' // 프로덕션에서는 실제 키 필요
        },
        // CoinGecko (크립토, 인증 불필요)
        coinGecko: {
            baseUrl: 'https://api.coingecko.com/api/v3'
        }
    };

    /**
     * 에러 핸들링
     */
    const handleError = (error, context) => {
        console.error(`[${context}] 에러:`, error);
        return {
            error: true,
            message: error.message || '데이터 로드 실패'
        };
    };

    /**
     * 재시도 로직
     */
    const retryFetch = async (url, options = {}, retries = 2) => {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url, options);
                if (!response.ok && response.status !== 429) {
                    throw new Error(`HTTP ${response.status}`);
                }
                return response;
            } catch (error) {
                if (i === retries - 1) throw error;
                // 지수백오프: 1초, 2초
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
            }
        }
    };

    /**
     * 공개 API
     */
    return {
        /**
         * Yahoo Finance에서 주식 정보 가져오기
         * (현재는 Mock 데이터 사용, API 연동은 백엔드 필요)
         */
        async getYahooFinanceData(symbol) {
            try {
                // 실제 API는 CORS 제한이 있어서 백엔드 프록시 필요
                // 현재는 Mock 데이터로 반환
                console.log(`Yahoo Finance API 호출 (시뮬레이션): ${symbol}`);

                // 백엔드가 준비되면 아래와 같이 수정
                // const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
                // const response = await retryFetch(url);
                // return await response.json();

                return null; // null이면 Mock 데이터 사용
            } catch (error) {
                return handleError(error, 'Yahoo Finance');
            }
        },

        /**
         * Alpha Vantage에서 시계열 데이터 가져오기
         */
        async getAlphaVantageData(symbol, interval = 'daily') {
            try {
                const { baseUrl, apiKey } = CONFIG.alphaVantage;
                const url = `${baseUrl}?function=TIME_SERIES_${interval.toUpperCase()}&symbol=${symbol}&apikey=${apiKey}`;

                const response = await retryFetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();

                // API 에러 확인
                if (data.Note || data['Error Message']) {
                    console.warn('Alpha Vantage API 제한:', data.Note || data['Error Message']);
                    return null;
                }

                return data;
            } catch (error) {
                return handleError(error, 'Alpha Vantage');
            }
        },

        /**
         * CoinGecko에서 크립토 정보 가져오기
         */
        async getCoinGeckoData(coinIds, vsCurrency = 'usd') {
            try {
                const { baseUrl } = CONFIG.coinGecko;
                const ids = Array.isArray(coinIds) ? coinIds.join(',') : coinIds;
                const url = `${baseUrl}/simple/price?ids=${ids}&vs_currencies=${vsCurrency}&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`;

                const response = await retryFetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                return handleError(error, 'CoinGecko');
            }
        },

        /**
         * 특정 암호화폐의 시계열 데이터
         */
        async getCoinGeckoHistory(coinId, days = 30) {
            try {
                const { baseUrl } = CONFIG.coinGecko;
                const url = `${baseUrl}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`;

                const response = await retryFetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                return handleError(error, 'CoinGecko History');
            }
        },

        /**
         * 배치 요청 (여러 심볼 동시)
         */
        async batchFetch(symbols, fetchFn) {
            const results = {};

            // 동시 요청 수 제한 (API 레이트 제한 대응)
            const CONCURRENT_LIMIT = 3;
            const queue = [...symbols];
            const inProgress = [];

            while (queue.length > 0 || inProgress.length > 0) {
                // 새 요청 추가
                while (inProgress.length < CONCURRENT_LIMIT && queue.length > 0) {
                    const symbol = queue.shift();
                    const promise = fetchFn(symbol)
                        .then(data => {
                            results[symbol] = data;
                        })
                        .catch(error => {
                            console.error(`배치 페칭 실패: ${symbol}`, error);
                            results[symbol] = null;
                        });
                    inProgress.push(promise);
                }

                // 하나 완료 대기
                if (inProgress.length > 0) {
                    await Promise.race(inProgress);
                    inProgress = inProgress.filter(p => p.status !== 'fulfilled');
                }
            }

            return results;
        },

        /**
         * API 연결 테스트
         */
        async testConnection() {
            try {
                // CoinGecko: 인증 없이 테스트 가능
                const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
                return response.ok;
            } catch (error) {
                console.error('API 연결 테스트 실패:', error);
                return false;
            }
        }
    };
})();
