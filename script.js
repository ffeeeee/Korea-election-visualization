// 운세 계산 함수
function calculateFortune(birthDate) {
    // 입력받은 생년월일에서 숫자만 추출
    const dateStr = birthDate.replace(/-/g, '');
    
    // 생년월일의 각 자리 숫자 합산
    let sum = 0;
    for (let digit of dateStr) {
        sum += parseInt(digit);
    }
    
    // 올해 2026년을 더함
    sum += 2 + 0 + 2 + 6;
    
    // 한 자리 숫자가 될 때까지 반복 합산
    while (sum >= 10) {
        let tempSum = 0;
        while (sum > 0) {
            tempSum += sum % 10;
            sum = Math.floor(sum / 10);
        }
        sum = tempSum;
    }
    
    return sum;
}

// 운세 메시지
const fortuneMessages = {
    1: { emoji: '🌟', text: '새로운 시작과 도전의 해', detail: '새로운 기회가 많이 찾아올 해입니다. 용감하게 나아가세요!' },
    2: { emoji: '🤝', text: '협력과 인연의 해', detail: '주변 사람들과의 관계가 중요해지는 시기입니다. 소통을 소중히 하세요.' },
    3: { emoji: '🎨', text: '창의성과 표현의 해', detail: '창의적인 활동이 좋은 결과를 가져올 것입니다. 당신의 능력을 드러내세요.' },
    4: { emoji: '💪', text: '안정과 기초의 해', detail: '기반을 다지는 것이 중요합니다. 차근차근 성과를 쌓아가세요.' },
    5: { emoji: '🚀', text: '변화와 자유의 해', detail: '새로운 변화가 찾아옵니다. 유연하고 긍정적으로 대응하세요.' },
    6: { emoji: '💝', text: '조화와 사랑의 해', detail: '주변 사람들과의 관계가 따뜻해집니다. 가족과 친구를 소중히 여기세요.' },
    7: { emoji: '🧘', text: '성찰과 지혜의 해', detail: '내면 성장의 시기입니다. 자기 발전에 집중하세요.' },
    8: { emoji: '💰', text: '번영과 성취의 해', detail: '물질적 풍요와 성공이 예상됩니다. 계획적으로 진행하세요.' },
    9: { emoji: '🌈', text: '완성과 갱신의 해', detail: '한 주기가 완성되고 새로운 시작을 준비하는 시간입니다. 정리와 감사하세요.' }
};

// 생년월일 기반 추운번호 생성
function generateLuckNumbers(birthDate) {
    const dateStr = birthDate.replace(/-/g, '');
    const seed = parseInt(dateStr) % 45;
    
    const luckNumbers = new Set();
    let current = seed;
    
    while (luckNumbers.size < 6) {
        current = (current * 7 + 13) % 45 + 1;
        luckNumbers.add(current);
    }
    
    return Array.from(luckNumbers).sort((a, b) => a - b);
}

// 로또 번호 생성 함수
function generateLottoNumbers() {
    const numbers = new Set();
    
    while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
    }
    
    const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);
    
    let bonusNumber;
    do {
        bonusNumber = Math.floor(Math.random() * 45) + 1;
    } while (sortedNumbers.includes(bonusNumber));
    
    return {
        numbers: sortedNumbers,
        bonus: bonusNumber
    };
}

// 무지개색 배열
const rainbowColors = [
    '#FF4444', // 빨강
    '#FF8833', // 주황
    '#FFDD33', // 노랑
    '#44DD44', // 초록
    '#4488FF', // 파랑
    '#3333DD', // 남색
    '#BB44FF'  // 보라
];

// 랜덤 색상 선택 함수
function getRandomColor() {
    return rainbowColors[Math.floor(Math.random() * rainbowColors.length)];
}

// DOM 요소들
const generateBtn = document.getElementById('generateBtn');
const lotteryBoxes = document.getElementById('lotteryBoxes');
const darkModeBtn = document.getElementById('darkModeBtn');
const fortuneBtn = document.getElementById('fortuneBtn');
const birthdayInput = document.getElementById('birthdayInput');
const fortuneResult = document.getElementById('fortuneResult');

// 운수 확인 버튼 클릭 이벤트
fortuneBtn.addEventListener('click', function() {
    const birthDate = birthdayInput.value;
    
    if (!birthDate) {
        alert('생년월일을 입력해주세요.');
        return;
    }
    
    const fortuneNumber = calculateFortune(birthDate);
    const fortune = fortuneMessages[fortuneNumber];
    const luckNumbers = generateLuckNumbers(birthDate);
    
    let luckNumbersHTML = '';
    luckNumbers.forEach(num => {
        luckNumbersHTML += `<div class="luck-number">${num}</div>`;
    });
    
    fortuneResult.innerHTML = `
        <h3>${fortune.emoji} ${fortune.text}</h3>
        <div class="fortune-info">
            <p><strong>2026년 운세:</strong> ${fortune.detail}</p>
            <p><strong>운수 번호:</strong> ${fortuneNumber}</p>
        </div>
        <p style="font-size: 14px; margin-top: 10px;">🍀 추천 로또 번호:</p>
        <div class="luck-numbers">${luckNumbersHTML}</div>
    `;
    
    fortuneResult.classList.add('show');
});

// 엔터키 입력 시도 운수 확인
birthdayInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        fortuneBtn.click();
    }
});

// 생성 버튼 클릭 이벤트
generateBtn.addEventListener('click', function() {
    lotteryBoxes.innerHTML = '';
    
    for (let i = 1; i <= 5; i++) {
        const lottoSet = generateLottoNumbers();
        
        const box = document.createElement('div');
        box.className = 'lottery-box';
        
        let numbersHTML = '';
        lottoSet.numbers.forEach(num => {
            const color = getRandomColor();
            numbersHTML += `<div class="number-ball" style="background: linear-gradient(135deg, ${color}, ${color}dd);">${num}</div>`;
        });
        
        const bonusColor = getRandomColor();
        box.innerHTML = `
            <div class="lottery-numbers">
                ${numbersHTML}
                <div class="bonus-separator">+</div>
                <div class="bonus-number" style="background: linear-gradient(135deg, ${bonusColor}, ${bonusColor}dd);">${lottoSet.bonus}</div>
            </div>
            <div class="set-number">${i}번째 세트</div>
        `;
        
        lotteryBoxes.appendChild(box);
    }
});

// 다크모드 토글
darkModeBtn.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    
    darkModeBtn.textContent = isDarkMode ? '☀️ 라이트모드' : '🌙 다크모드';
});

// 페이지 로드 시 저장된 다크모드 설정 적용
window.addEventListener('DOMContentLoaded', function() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        darkModeBtn.textContent = '☀️ 라이트모드';
    }
    
    // 초기 로드 시 번호 생성
    generateBtn.click();
});
