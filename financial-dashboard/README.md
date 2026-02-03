# 금융 대시보드 (Financial Dashboard)

한국 주식, 미국 주식, 크립토를 통합한 Finviz 스타일의 금융 대시보드입니다.

## 기능

### 주요 기능
- **시장별 스크리너**: 한국주식 / 미국주식 / 크립토 탭 전환
- **실시간 시세**: 현재가, 등락률, 거래량, 시가총액 표시
- **상세 차트**: 종목 클릭 시 일/주/월 차트 보기
- **검색 & 정렬**: 종목명/심볼 검색, 등락률/가격 정렬
- **자동 새로고침**: 5분 주기 자동 업데이트 (토글 가능)
- **다크모드**: 라이트/다크 테마 전환
- **반응형 디자인**: 모바일/태블릿/데스크톱 지원

## 기술 스택

- **Frontend**: Vanilla JavaScript + HTML5 + CSS3
- **차트**: Chart.js 4.4.0
- **데이터 저장**: LocalStorage (5분 TTL 캐싱)
- **API**: Yahoo Finance, Alpha Vantage, CoinGecko (무료)

## 프로젝트 구조

```
financial-dashboard/
├── index.html              # 메인 진입점
├── css/
│   └── style.css          # 전역 스타일 (다크모드, 반응형)
├── js/
│   ├── app.js            # 메인 앱 로직
│   ├── data.js           # 데이터 관리 & 캐싱
│   ├── api-manager.js    # API 통합 (Yahoo, Alpha Vantage, CoinGecko)
│   ├── screener.js       # 스크리너 UI 렌더링
│   └── chart.js          # Chart.js 통합
├── data/
│   ├── korean-stocks.json  # 한국 주식 Mock 데이터
│   ├── us-stocks.json      # 미국 주식 Mock 데이터
│   └── crypto-list.json    # 크립토 Mock 데이터
├── python/
│   └── collect_korean_stocks.py  # 데이터 수집 스크립트
└── README.md
```

## 시작하기

### 로컬 개발

```bash
# 1. 프로젝트 디렉토리로 이동
cd financial-dashboard

# 2. 로컬 서버 시작
python3 -m http.server 8000
# 또는
npx http-server -p 8000

# 3. 브라우저에서 접속
http://localhost:8000
```

### 데이터 수집 (선택사항)

```bash
# Python 스크립트 실행
python3 python/collect_korean_stocks.py
```

## 사용 방법

### 기본 조작
1. **시장 선택**: 상단 탭에서 한국주식 / 미국주식 / 크립토 선택
2. **검색**: 검색박스에서 종목명 또는 심볼 입력
3. **상세 보기**: 종목 클릭 → 차트 모달 표시
4. **차트 기간**: 모달 내 1D/1W/1M 탭으로 기간 변경
5. **자동 새로고침**: 체크박스로 ON/OFF 토글
6. **다크모드**: 헤더의 토글 스위치로 테마 변경

### 데이터 캐싱
- 로컬 JSON 데이터는 LocalStorage에 5분간 캐싱됨
- 새로고침 버튼으로 즉시 업데이트 가능
- 자동 새로고침이 활성화되면 5분마다 자동 업데이트

## API 통합

### 현재 상태
- **한국 주식**: Mock 데이터 (JSON 파일)
- **미국 주식**: Mock 데이터 (JSON 파일)
- **크립토**: CoinGecko API (무료, 연동 가능)

### 실제 API 연동 방법

#### 1. Yahoo Finance (한국/미국 주식)
```javascript
// api-manager.js에서 구현
const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
// CORS 제한이 있으므로 백엔드 프록시 필요
```

#### 2. Alpha Vantage (미국 주식 상세)
```javascript
// API Key 획득: https://www.alphavantage.co/
// 무료: 5 requests/min
// data/js/api-manager.js에서 설정
```

#### 3. CoinGecko (크립토, 무료)
```javascript
// 인증 불필요, CORS 제한 없음
// 이미 연동 준비됨
const url = "https://api.coingecko.com/api/v3/simple/price";
```

## 개발 로드맵

### Phase 1: ✅ 완료
- [x] 프로젝트 구조 & HTML 레이아웃
- [x] CSS 스타일 (다크모드, 반응형)
- [x] Mock 데이터 생성

### Phase 2: 🔄 진행 중
- [ ] Python 크롤링 스크립트 (실제 한국 주식 데이터)
- [ ] KRX API 통합 (선택사항)

### Phase 3: ⏳ 예정
- [ ] API 통합 (Yahoo Finance, Alpha Vantage)
- [ ] 에러 처리 & 재시도 로직
- [ ] 성능 최적화

### Phase 4: ⏳ 예정
- [ ] 추가 기능
  - 즐겨찾기
  - CSV 내보내기
  - 알림 설정
- [ ] 테스트 & 최적화
- [ ] GitHub Pages 배포

## 주의사항

### CORS (Cross-Origin Resource Sharing)
- Yahoo Finance API는 CORS 제한이 있음
- 실제 환경에서는 백엔드 프록시 필요
- 현재는 Mock 데이터로 테스트

### API 레이트 제한
- Alpha Vantage: 5 requests/min (무료)
- CoinGecko: 10-50 requests/min (무료)
- 캐싱(5분 TTL)으로 요청 수 최소화

### 실시간성
- 현재: 로컬 데이터 5분 캐싱
- 향후: WebSocket 또는 Server-Sent Events (SSE) 고려

## 배포

### GitHub Pages 배포
```bash
# 1. GitHub 저장소 생성
# 2. 파일 푸시
git add .
git commit -m "Initial commit"
git push origin main

# 3. GitHub Pages 활성화
# Settings → Pages → Source: main branch
```

### Vercel 배포
```bash
# 1. Vercel CLI 설치
npm install -g vercel

# 2. 배포
vercel
```

### Netlify 배포
```bash
# 1. Netlify CLI 설치
npm install -g netlify-cli

# 2. 배포
netlify deploy --prod --dir .
```

## 트러블슈팅

### 데이터가 로드되지 않음
1. 브라우저 콘솔 확인 (F12 → Console)
2. 로컬 서버 실행 확인 (`python3 -m http.server 8000`)
3. JSON 파일 경로 확인 (`data/korean-stocks.json` 등)
4. LocalStorage 캐시 초기화: `localStorage.clear()`

### 차트가 표시되지 않음
1. Chart.js CDN 로드 확인
2. 브라우저 캐시 삭제 후 새로고침
3. Canvas 요소 존재 확인

### 다크모드가 작동하지 않음
1. CSS 변수 정의 확인 (`:root`, `[data-theme='dark']`)
2. 브라우저 개발자 도구에서 `data-theme` 속성 확인

## 라이선스

MIT License

## 기여

버그 리포트 및 기능 제안은 GitHub Issues에 등록해주세요.

## 참고 자료

- [Chart.js 문서](https://www.chartjs.org/)
- [Yahoo Finance API](https://finance.yahoo.com/)
- [Alpha Vantage API](https://www.alphavantage.co/)
- [CoinGecko API](https://www.coingecko.com/api)
- [LocalStorage 캐싱 패턴](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
