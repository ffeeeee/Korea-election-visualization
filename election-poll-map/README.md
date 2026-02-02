# 2026 지방선거 여론조사 시각화

전국 지방선거 여론조사 데이터를 인터랙티브 지도와 시계열 차트로 시각화하는 웹 애플리케이션입니다.

## 🎯 기능

### 📍 지도 시각화
- **원형 마커**: 지역별 최고 지지율 크기에 따라 마커 크기 조절
- **정당 색상**: 민주당(파랑), 국민의힘(빨강), 기타(회색)
- **팝업 정보**: 마커 클릭 시 해당 지역 상세 여론조사 정보 표시
- **레이어 토글**: 시도별로 데이터 표시/숨김 가능

### 📈 시계열 차트
- **라인 차트**: 선택된 지역의 여론 추이를 시간별로 표시
- **기간 필터**: 7일, 30일, 90일, 180일, 전체 기간 선택 가능
- **평균값 오버레이**: 점선으로 전국 평균값 표시
- **상호작용**: 마우스 호버 시 정확한 수치 표시

### 🛠️ 추가 기능
- **데이터 내보내기**: JSON, CSV 형식으로 데이터 다운로드
- **통계 보기**: 선택된 지역의 상세 통계 콘솔에 출력
- **다크모드**: 야간 사용을 위한 다크모드 지원
- **반응형 디자인**: 데스크톱, 태블릿, 모바일 모두 지원

## 📁 프로젝트 구조

```
election-poll-map/
├── index.html                    # 메인 페이지
├── map.html                      # Folium 생성 지도 (자동 생성)
├── python/
│   └── generate_map.py          # Folium 지도 생성 스크립트
├── js/
│   ├── data.js                  # 데이터 관리 모듈
│   ├── chart.js                 # Chart.js 차트 로직
│   └── app.js                   # 메인 인터랙션 로직
├── css/
│   └── style.css                # 스타일시트
├── data/
│   ├── polls_2026.json          # 여론조사 데이터
│   └── regions.json             # 시도/시군구 좌표 데이터
└── README.md                     # 이 파일
```

## 🚀 사용 방법

### 1. 파일 구조 확인
프로젝트의 모든 파일이 다음 경로에 있는지 확인하세요:
```
/Users/isawufo/Desktop/practice-junho/election-poll-map/
```

### 2. 웹 브라우저로 열기
`index.html` 파일을 웹 브라우저로 엽니다.

```bash
# macOS에서
open index.html

# 또는 Python 간단한 서버 사용 (권장)
python3 -m http.server 8000
# 그 후 http://localhost:8000 접속
```

### 3. 지역 선택
좌측 사이드바의 "광역지자체" 드롭다운에서 지역을 선택합니다.

### 4. 기간 설정
"조사 기간" 드롭다운에서 원하는 시간 범위를 선택합니다.

### 5. 결과 확인
- 지도: 선택된 지역의 마커가 강조되고 상세 정보가 팝업으로 표시
- 차트: 오른쪽 차트 영역에 선택된 지역의 여론 추이 표시

## 📊 데이터 구조

### polls_2026.json
```json
{
  "meta": {
    "lastUpdate": "2026-02-02",
    "pollster": "NESDC 통합",
    "sampleSize": 1000,
    "marginOfError": 3.1
  },
  "timeline": [
    {
      "date": "2026-01-05",
      "surveys": [
        {
          "region": "서울",
          "regionCode": "11",
          "candidates": [
            {"name": "김민수", "party": "민주당", "rate": 42.5},
            {"name": "이준호", "party": "국민의힘", "rate": 38.2},
            {"name": "박영희", "party": "기타", "rate": 19.3}
          ]
        },
        ...
      ]
    },
    ...
  ]
}
```

### regions.json
```json
{
  "provinces": [
    {
      "name": "서울",
      "code": "11",
      "lat": 37.5665,
      "lng": 126.9780
    },
    ...
  ],
  "cities": [
    {
      "name": "강남구",
      "parent": "서울",
      "lat": 37.4979,
      "lng": 127.0276
    },
    ...
  ]
}
```

## 🔧 개발자 정보

### 사용된 라이브러리
- **Chart.js 4.4.0**: 시계열 차트 렌더링
- **Leaflet 1.9.4**: 인터랙티브 지도 기본 라이브러리
- **Folium**: Python 기반 지도 생성 (백엔드)

### 브라우저 호환성
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- 모바일 Chrome/Safari

### 로컬 개발 서버 실행
```bash
# Python 3.6+
python3 -m http.server 8000

# Node.js + http-server
npm install -g http-server
http-server -p 8000
```

## 📈 데이터 업데이트

### 수동 업데이트
1. `data/polls_2026.json` 파일 편집
2. 새 조사 데이터 추가
3. 브라우저 새로고침 (또는 캐시 클리어)

### 자동 업데이트 (Python 스크립트 사용)
```bash
# map.html 재생성
python3 python/generate_map.py
```

## 🎨 커스터마이징

### 색상 변경
`css/style.css`의 CSS 변수 수정:
```css
:root {
  --color-primary: #3b82f6;      /* 민주당 */
  --color-danger: #ef4444;       /* 국민의힘 */
  --color-neutral: #8b949e;      /* 기타 */
}
```

### 정당 색상 변경
`js/data.js`의 `PARTY_COLORS` 객체 수정:
```javascript
const PARTY_COLORS = {
  '민주당': '#3b82f6',
  '국민의힘': '#ef4444',
  '기타': '#8b949e'
};
```

## 🔐 데이터 프라이버시

이 애플리케이션은:
- 모든 데이터를 로컬에서 처리합니다
- 외부 서버로 데이터를 전송하지 않습니다
- LocalStorage를 사용하여 캐싱만 수행합니다
- 개인정보를 수집하지 않습니다

## 📝 라이센스

이 프로젝트는 교육 및 분석 목적으로 제작되었습니다.

## 🔗 참고 자료

- [NESDC 공식 웹사이트](https://www.nesdc.go.kr)
- [Chart.js 문서](https://www.chartjs.org/)
- [Leaflet 문서](https://leafletjs.com/)
- [Folium 문서](https://python-visualization.github.io/folium/)

## 💡 향후 개선 사항

- [ ] NESDC API 자동 크롤링
- [ ] 시군구 단위 상세 데이터 추가
- [ ] 예측 모델 (추이선) 추가
- [ ] 실시간 업데이트 (WebSocket)
- [ ] 소셜 미디어 공유 기능
- [ ] 데이터 비교 분석 기능
- [ ] 모바일 앱 (React Native)

## 🤝 기여

버그 리포트나 기능 제안은 이 프로젝트의 이슈 페이지를 통해 제출해주세요.

---

**마지막 업데이트**: 2026년 2월 2일
