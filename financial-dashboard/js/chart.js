/**
 * 차트 UI 모듈
 * Chart.js를 이용한 차트 렌더링
 */

const ChartUI = (() => {
    let chartInstance = null;
    let currentStock = null;
    let currentMarket = null;
    let currentPeriod = '1D';

    /**
     * Mock 차트 데이터 생성 (실제는 API에서 호출)
     */
    const generateMockChartData = (stock, period) => {
        const dataPoints = period === '1D' ? 24 : period === '1W' ? 7 : 30;
        const labels = [];
        const prices = [];
        const volumes = [];

        let basePrice = stock.price;
        const volatility = basePrice * 0.05;

        for (let i = dataPoints; i > 0; i--) {
            // 라벨
            if (period === '1D') {
                labels.push(`${24 - i}:00`);
            } else if (period === '1W') {
                const date = new Date();
                date.setDate(date.getDate() - i);
                labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
            } else {
                const date = new Date();
                date.setDate(date.getDate() - i);
                labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
            }

            // 가격 (랜덤 워크)
            const change = (Math.random() - 0.5) * volatility;
            basePrice += change;
            prices.push(Math.max(basePrice, stock.price * 0.8));

            // 거래량 (랜덤)
            volumes.push(Math.floor(Math.random() * (stock.volume || stock.volume24h || 1000000)));
        }

        return { labels, prices, volumes };
    };

    /**
     * 차트 초기화
     */
    const initChart = (stock, period) => {
        const canvas = document.getElementById('detail-chart');
        if (!canvas) return;

        const data = generateMockChartData(stock, period);

        // 기존 차트 제거
        if (chartInstance) {
            chartInstance.destroy();
        }

        // 새 차트 생성
        chartInstance = new Chart(canvas, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: `${stock.name} (${stock.symbol})`,
                        data: data.prices,
                        borderColor: stock.change >= 0
                            ? 'rgba(46, 204, 113, 0.8)'
                            : 'rgba(231, 76, 60, 0.8)',
                        backgroundColor: stock.change >= 0
                            ? 'rgba(46, 204, 113, 0.1)'
                            : 'rgba(231, 76, 60, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        pointBackgroundColor: stock.change >= 0
                            ? 'rgba(46, 204, 113, 1)'
                            : 'rgba(231, 76, 60, 1)',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim(),
                            font: {
                                size: 12,
                                weight: 500
                            },
                            padding: 15,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                            size: 13,
                            weight: 600
                        },
                        bodyFont: {
                            size: 12
                        },
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 1,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed.y;
                                const currency = currentMarket === 'korean' ? '₩' : '$';
                                const formatted = currentMarket === 'korean'
                                    ? value.toLocaleString('ko-KR')
                                    : value.toFixed(2);
                                return `가격: ${currency}${formatted}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim(),
                            drawBorder: true
                        },
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary').trim(),
                            font: {
                                size: 11
                            },
                            callback: function(value) {
                                if (currentMarket === 'korean') {
                                    return `₩${value.toLocaleString('ko-KR')}`;
                                } else {
                                    return `$${value.toFixed(0)}`;
                                }
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary').trim(),
                            font: {
                                size: 11
                            },
                            maxRotation: 45,
                            minRotation: 0
                        }
                    }
                }
            }
        });
    };

    /**
     * 정보 업데이트
     */
    const updateInfo = (stock) => {
        const currency = currentMarket === 'korean' ? '₩' : '$';
        const priceFormatted = currentMarket === 'korean'
            ? stock.price.toLocaleString('ko-KR')
            : stock.price.toFixed(2);

        document.getElementById('info-price').textContent = `${currency}${priceFormatted}`;
        document.getElementById('info-high').textContent = `${currency}${(currentMarket === 'korean'
            ? stock.high.toLocaleString('ko-KR')
            : stock.high.toFixed(2))}`;
        document.getElementById('info-low').textContent = `${currency}${(currentMarket === 'korean'
            ? stock.low.toLocaleString('ko-KR')
            : stock.low.toFixed(2))}`;

        const volume = DataManager.formatVolume(stock.volume || stock.volume24h || 0);
        const marketCap = DataManager.formatVolume(stock.marketCap || 0);

        document.getElementById('info-volume').textContent = volume;
        document.getElementById('info-market-cap').textContent = marketCap;
    };

    /**
     * 공개 API
     */
    return {
        /**
         * 초기화
         */
        init() {
            this.setupEventListeners();
        },

        /**
         * 이벤트 리스너 설정
         */
        setupEventListeners() {
            // 모달 닫기
            const closeBtn = document.querySelector('.modal-close');
            const overlay = document.getElementById('modal-overlay');

            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.hideModal());
            }

            if (overlay) {
                overlay.addEventListener('click', () => this.hideModal());
            }

            // 차트 기간 탭
            const chartTabs = document.querySelectorAll('.chart-tab-btn');
            chartTabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    // 활성 탭 변경
                    chartTabs.forEach(t => t.classList.remove('active'));
                    e.target.classList.add('active');

                    // 차트 업데이트
                    currentPeriod = e.target.dataset.period;
                    if (currentStock) {
                        initChart(currentStock, currentPeriod);
                    }
                });
            });
        },

        /**
         * 모달 표시
         */
        showModal(stock, market) {
            currentStock = stock;
            currentMarket = market;
            currentPeriod = '1D';

            // 제목 업데이트
            document.getElementById('chart-title').textContent = `${stock.name} (${stock.symbol})`;

            // 정보 업데이트
            updateInfo(stock);

            // 차트 렌더링
            initChart(stock, '1D');

            // 차트 탭 초기화
            const chartTabs = document.querySelectorAll('.chart-tab-btn');
            chartTabs.forEach(tab => {
                tab.classList.remove('active');
                if (tab.dataset.period === '1D') {
                    tab.classList.add('active');
                }
            });

            // 모달 표시
            const modal = document.getElementById('chart-modal');
            const overlay = document.getElementById('modal-overlay');

            if (modal) modal.classList.remove('hidden');
            if (overlay) overlay.classList.remove('hidden');

            // 스크롤 방지
            document.body.style.overflow = 'hidden';
        },

        /**
         * 모달 닫기
         */
        hideModal() {
            const modal = document.getElementById('chart-modal');
            const overlay = document.getElementById('modal-overlay');

            if (modal) modal.classList.add('hidden');
            if (overlay) overlay.classList.add('hidden');

            // 스크롤 활성화
            document.body.style.overflow = 'auto';

            // 차트 정리
            if (chartInstance) {
                chartInstance.destroy();
                chartInstance = null;
            }
        }
    };
})();
