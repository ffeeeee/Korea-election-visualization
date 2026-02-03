# 사주 MZ - MZ세대를 위한 사주 운세 웹사이트

## 프로젝트 소개

MZ세대를 위해 만들어진 현대적이고 세련된 사주 운세 웹사이트입니다. 전통적인 사주의 지혜를 현대적으로 해석하여 제공합니다.

## 기능

- 📱 반응형 디자인 (모바일, 태블릿, 데스크톱)
- 🔮 AI 기반의 사주 분석
- 💾 히스토리 및 즐겨찾기 기능
- 🎨 세련된 UI/UX 디자인
- 📊 다양한 운세 분석 (성격, 연애운, 재운, 직업운, 건강운)
- 🔐 로컬 스토리지를 통한 프라이빗 데이터 관리

## 프로젝트 구조

```
saju-mz/
├── src/
│   ├── index.html          # 메인 HTML
│   ├── styles/
│   │   └── main.scss       # 전체 스타일시트
│   └── js/
│       ├── index.js        # 메인 스크립트
│       └── modules/
│           ├── sajuAnalyzer.js    # 사주 분석 로직
│           ├── uiManager.js       # UI 관리
│           └── storageManager.js  # 데이터 저장/로드
├── dist/                   # 빌드 결과물
├── package.json
├── webpack.config.js
└── README.md
```

## 설치 및 실행

### 설치

```bash
cd saju-mz
npm install
```

### 개발 모드 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

### 프로덕션 빌드

```bash
npm run build
```

### 배포

```bash
npm start
```

## 기술 스택

- **Frontend**: HTML5, SCSS, Vanilla JavaScript
- **번들러**: Webpack 5
- **패키지 관리**: npm
- **데이터 저장**: LocalStorage

## 주요 모듈

### SajuAnalyzer
- 생년월일, 출생시간 기반 사주 계산
- 십간십이지 분석
- 오행(목, 화, 토, 금, 수) 분석
- 운세 분석 (성격, 연애, 재운 등)

### UIManager
- DOM 조작 및 관리
- 로딩 인디케이터
- 토스트 메시지
- 모달 창
- 반응형 헬퍼

### StorageManager
- 사주 결과 저장/로드
- 히스토리 관리
- 즐겨찾기 기능
- 사용자 설정 저장
- 캐시 관리

## 사용 방법

1. 생년월일 입력
2. 출생 시간 입력
3. 출생지 선택
4. 성별 선택
5. '사주 분석하기' 버튼 클릭
6. 결과 확인 및 공유

## 브라우저 지원

- Chrome (최신)
- Firefox (최신)
- Safari (최신)
- Edge (최신)

## 라이센스

MIT License

## 기여

Pull Request는 환영합니다!

## 문의

이슈가 있거나 제안이 있으시면 GitHub Issues에 등록해주세요.
