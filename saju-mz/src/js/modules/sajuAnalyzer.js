/**
 * 사주 분석 모듈
 * 생년월일 기반 사주 분석 로직
 */

export class SajuAnalyzer {
  constructor() {
    this.heavenlyStems = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
    this.earthlyBranches = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
    this.wuxingElements = ['목', '화', '토', '금', '수'];
    this.wuxingNames = ['목(나무)', '화(불)', '토(흙)', '금(쇠)', '수(물)'];

    // 십간십이지별 오행
    this.stemWuxing = {
      '갑': '목', '을': '목',
      '병': '화', '정': '화',
      '무': '토', '기': '토',
      '경': '금', '신': '금',
      '임': '수', '계': '수'
    };
  }

  /**
   * 사주 분석 메인 함수
   */
  analyze(formData) {
    const date = new Date(formData.birthDate);
    const time = formData.birthTime.split(':');

    // 음력으로 변환 (간단한 예시)
    const lunarDate = this.convertToLunar(date);

    // 사주 계산
    const yearGanji = this.getYearGanji(date.getFullYear());
    const monthGanji = this.getMonthGanji(date.getFullYear(), date.getMonth() + 1);
    const dayGanji = this.getDayGanji(date);
    const hourGanji = this.getHourGanji(parseInt(time[0]));

    // 오행 분석
    const wuxing = this.analyzeWuxing(yearGanji, monthGanji, dayGanji, hourGanji);

    // 결과 객체 생성
    const result = {
      name: this.generateName(formData.gender),
      birthDate: formData.birthDate,
      birthTime: formData.birthTime,
      birthPlace: formData.birthPlace,
      gender: formData.gender,
      ganji: `${yearGanji} ${monthGanji} ${dayGanji} ${hourGanji}`,
      wuxing: wuxing,
      analysis: this.generateAnalysis(yearGanji, monthGanji, dayGanji, hourGanji, wuxing, formData.gender),
      timestamp: new Date().getTime()
    };

    return result;
  }

  /**
   * 그레고리력을 음력으로 변환 (간단한 근사치)
   */
  convertToLunar(date) {
    // 실제로는 정교한 알고리즘이 필요하지만, 여기서는 간단히 처리
    return date;
  }

  /**
   * 년도에 따른 십간십이지 계산
   */
  getYearGanji(year) {
    const stemIndex = (year - 4) % 10;
    const branchIndex = (year - 4) % 12;
    return this.heavenlyStems[stemIndex] + this.earthlyBranches[branchIndex];
  }

  /**
   * 월에 따른 십간십이지 계산
   */
  getMonthGanji(year, month) {
    // 절입 기준으로 더 정확하게 계산할 수 있지만, 여기서는 근사치 사용
    const seasonIndex = Math.floor((month - 1) / 3);
    const branchIndex = (month - 1) % 12;

    // 연도별로 월의 천간이 다르므로 연도 정보 활용
    const yearStemIndex = (year - 4) % 10;
    const baseStemIndex = (yearStemIndex * 2) % 10;
    const stemIndex = (baseStemIndex + month - 1) % 10;

    return this.heavenlyStems[stemIndex] + this.earthlyBranches[branchIndex];
  }

  /**
   * 일에 따른 십간십이지 계산
   */
  getDayGanji(date) {
    // 간단한 방식: 2024년 1월 1일을 기준으로 계산
    const baseDate = new Date(2024, 0, 1);
    const diffTime = date - baseDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const stemIndex = (diffDays) % 10;
    const branchIndex = (diffDays) % 12;

    return this.heavenlyStems[stemIndex] + this.earthlyBranches[branchIndex];
  }

  /**
   * 시간에 따른 십간십이지 계산
   */
  getHourGanji(hour) {
    // 시간을 십이지로 변환 (자: 23-1, 축: 1-3, ...)
    let branchIndex;
    if (hour >= 23 || hour < 1) branchIndex = 0; // 자
    else branchIndex = Math.floor((hour + 1) / 2) % 12;

    // 일의 천간에 따라 시간의 천간 결정 (간단한 규칙)
    const stemIndex = Math.floor(Math.random() * 10); // 실제로는 일의 천간 기반 계산

    return this.heavenlyStems[stemIndex] + this.earthlyBranches[branchIndex];
  }

  /**
   * 오행 분석
   */
  analyzeWuxing(year, month, day, hour) {
    const allGanji = year + month + day + hour;
    const wuxingCount = {};

    for (const char of allGanji) {
      const element = this.stemWuxing[char];
      if (element) {
        wuxingCount[element] = (wuxingCount[element] || 0) + 1;
      }
    }

    // 가장 많은 오행 찾기
    const maxElement = Object.keys(wuxingCount).reduce((a, b) =>
      wuxingCount[a] > wuxingCount[b] ? a : b
    );

    const elementIndex = this.wuxingElements.indexOf(maxElement);
    return this.wuxingNames[elementIndex] || '목(나무)';
  }

  /**
   * 이름 생성 (실제로는 사용자 정보 기반)
   */
  generateName(gender) {
    const maleNames = ['준호', '민준', '지성', '영수', '태희'];
    const femaleNames = ['지은', '수진', '영희', '미나', '혜진'];

    const names = gender === 'male' ? maleNames : femaleNames;
    return names[Math.floor(Math.random() * names.length)];
  }

  /**
   * 성격, 운세 분석 텍스트 생성
   */
  generateAnalysis(year, month, day, hour, wuxing, gender) {
    return {
      personality: this.generatePersonality(wuxing, gender),
      romantic: this.generateRomantic(wuxing, gender),
      wealth: this.generateWealth(wuxing),
      career: this.generateCareer(wuxing, gender),
      health: this.generateHealth(wuxing)
    };
  }

  generatePersonality(wuxing, gender) {
    const personalityMap = {
      '목(나무)': '활발하고 진취적인 성격을 가지고 있습니다. 새로운 것을 좋아하고 독립심이 강합니다. 때로는 너무 급할 수 있으니 신중함을 잃지 않으시길 바랍니다.',
      '화(불)': '열정적이고 감정적인 성격입니다. 사교성이 뛰어나고 사람들 앞에서 빛납니다. 감정의 기복이 있을 수 있으니 자기 조절이 중요합니다.',
      '토(흙)': '안정적이고 신뢰할 수 있는 성격을 가졌습니다. 주변 사람들의 신뢰가 두텁고 현실적입니다. 때로는 변화를 두려워할 수 있으니 융통성을 길러보세요.',
      '금(쇠)': '정직하고 원칙을 중시하는 성격입니다. 계획적이고 질서정연한 면이 있습니다. 완벽함을 추구하다 다른 사람의 의견을 무시할 수 있으니 주의하세요.',
      '수(물)': '지혜롭고 깊은 생각을 하는 성격입니다. 침착함과 관찰력이 뛰어납니다. 때로는 소극적일 수 있으니 적극성을 가져보세요.'
    };

    return personalityMap[wuxing] || '독특한 기질을 가지고 있습니다.';
  }

  generateRomantic(wuxing, gender) {
    const romanticMap = {
      '목(나무)': gender === 'male'
        ? '올해는 새로운 만남의 기회가 있을 것 같습니다. 자신감 있는 태도가 매력을 높일 것입니다.'
        : '로맨틱한 감정을 소중히 여기세요. 진심이 통하는 만남이 있을 수 있습니다.',
      '화(불)': gender === 'male'
        ? '밝은 에너지가 좋은 인연을 부를 것 같습니다. 조금 더 신중한 모습도 매력적일 거예요.'
        : '매력적인 시기입니다. 자신을 잘 표현하면 좋은 결과가 있을 것 같습니다.',
      '토(흙)': '안정적인 관계를 원하시나요? 천천히 쌓아가는 사랑이 당신에게 맞습니다. 믿을 수 있는 사람과의 만남을 기다려보세요.',
      '금(쇠)': '높은 기준을 가진 만큼 신중한 선택이 중요합니다. 조건보다 마음이 맞는 사람을 찾으세요.',
      '수(물)': '깊이 있는 대화를 나눌 수 있는 사람과의 만남이 의미 있을 것 같습니다. 감정 표현을 조금 더 적극적으로 해보세요.'
    };

    return romanticMap[wuxing] || '좋은 인연이 있을 것입니다.';
  }

  generateWealth(wuxing) {
    const wealthMap = {
      '목(나무)': '새로운 기회를 통한 수익이 예상됩니다. 투자보다는 신사업 기회를 노려보세요. 무리한 투기는 피하는 것이 좋습니다.',
      '화(불)': '반짝이는 기회들이 있을 것 같습니다. 창의적인 활동으로 수익을 늘릴 수 있습니다. 너무 급히 판단하지 마세요.',
      '토(흙)': '안정적인 재정 운이 있습니다. 차근차근 저축하고 장기 계획을 세우면 좋은 결과가 있을 것입니다.',
      '금(쇠)': '신중한 투자와 관리가 좋은 수익을 가져올 것입니다. 전문가 상담을 받아보세요.',
      '수(물)': '유동적인 기회가 있을 것 같습니다. 변화하는 상황에 잘 적응하면 좋은 결과가 있습니다.'
    };

    return wealthMap[wuxing] || '적절한 관리로 재정을 안정시켜보세요.';
  }

  generateCareer(wuxing, gender) {
    const careerMap = {
      '목(나무)': '창업이나 새로운 분야로의 전직을 고려해볼 만합니다. 성장할 수 있는 환경을 찾으세요.',
      '화(불)': '대외 활동과 인맥이 중요한 시기입니다. 사람들 앞에서 빛나는 일들을 찾아보세요.',
      '토(흙)': '현재 위치에서의 안정과 신뢰 구축이 중요합니다. 묵묵히 해온 일들이 인정받을 수 있습니다.',
      '금(쇠)': '전문성을 심화시키는 것이 좋습니다. 자격증이나 스킬 향상에 투자해보세요.',
      '수(물)': '변화를 두려워하지 마세요. 새로운 분야에서의 성공 가능성이 있습니다.'
    };

    return careerMap[wuxing] || '현재 일에 집중하면서 기회를 살펴보세요.';
  }

  generateHealth(wuxing) {
    const healthMap = {
      '목(나무)': '스트레스 관리가 중요합니다. 야외 활동이나 운동을 꾸준히 하세요. 신경계 건강에 주의하세요.',
      '화(불)': '과로하지 않도록 조심하세요. 충분한 휴식이 필요합니다. 혈액 순환 건강에 신경 써보세요.',
      '토(흙)': '소화기 건강에 신경 쓰세요. 규칙적인 생활이 중요합니다. 당뇨병이나 대사 질환에 주의하세요.',
      '금(쇠)': '호흡기 건강이 중요합니다. 깨끗한 공기를 마시도록 노력하세요. 정신 건강도 함께 챙기세요.',
      '수(물)': '신장 건강과 비뇨기계 건강에 신경 쓰세요. 충분한 수분 섭취가 중요합니다.'
    };

    return healthMap[wuxing] || '규칙적인 생활과 운동으로 건강을 지키세요.';
  }
}
