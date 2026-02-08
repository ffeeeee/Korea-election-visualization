/**
 * sipsinAnalyzer.js - 십신(十神) 분석 모듈
 * 일간(Day Master) 기준으로 다른 천간/지지와의 관계를 분석
 */
import { STEMS, STEM_ELEMENT, STEM_YINYANG, BRANCH_HIDDEN_STEMS } from './sajuCalculator';

// 십신 이름
const SIPSIN_NAMES = {
  '비견': '비견(比肩)',
  '겁재': '겁재(劫財)',
  '식신': '식신(食神)',
  '상관': '상관(傷官)',
  '편재': '편재(偏財)',
  '정재': '정재(正財)',
  '편관': '편관(偏官)',
  '정관': '정관(正官)',
  '편인': '편인(偏印)',
  '정인': '정인(正印)'
};

// 오행 상생상극 관계 (나→상대)
// 비겁: 같은 오행, 식상: 내가 생, 재성: 내가 극, 관성: 나를 극, 인성: 나를 생
const ELEMENT_CYCLE = ['목', '화', '토', '금', '수'];

export class SipsinAnalyzer {
  /**
   * 십신 분석 수행
   * @param {Object} sajuResult - SajuCalculator 결과
   * @returns {Object} 십신 프로파일
   */
  analyze(sajuResult) {
    const { dayMaster, pillars } = sajuResult;
    const dayElement = STEM_ELEMENT[dayMaster];
    const dayYinYang = STEM_YINYANG[dayMaster];

    // 각 기둥의 천간 십신
    const stemSipsin = {};
    const pillarNames = ['year', 'month', 'day', 'hour'];

    pillarNames.forEach(name => {
      const pillar = pillars[name];
      if (!pillar) return;

      stemSipsin[name] = {
        stem: this.getSipsin(dayMaster, pillar.stem),
        hiddenStems: pillar.hiddenStems.map(hs => ({
          stem: hs,
          sipsin: this.getSipsin(dayMaster, hs)
        }))
      };
    });

    // 일간 자체는 '일간' (본인)
    if (stemSipsin.day) {
      stemSipsin.day.stem = '일간';
    }

    // 십신 카운트 (전체 프로파일)
    const sipsinCount = {};
    Object.values(SIPSIN_NAMES).forEach(name => { sipsinCount[name] = 0; });

    pillarNames.forEach(name => {
      const info = stemSipsin[name];
      if (!info) return;

      // 천간 (일간 제외)
      if (name !== 'day' && info.stem) {
        const fullName = SIPSIN_NAMES[info.stem] || info.stem;
        sipsinCount[fullName] = (sipsinCount[fullName] || 0) + 1;
      }

      // 지지 장간
      info.hiddenStems.forEach(hs => {
        const fullName = SIPSIN_NAMES[hs.sipsin] || hs.sipsin;
        sipsinCount[fullName] = (sipsinCount[fullName] || 0) + 1;
      });
    });

    // 주요 십신 특성 분석
    const dominant = this.getDominantSipsin(sipsinCount);
    const profile = this.buildProfile(sipsinCount, dayMaster);

    return {
      dayMaster,
      dayElement,
      dayYinYang,
      stemSipsin,
      sipsinCount,
      dominant,
      profile
    };
  }

  /**
   * 두 천간 사이의 십신 관계 산출
   */
  getSipsin(dayMaster, targetStem) {
    if (dayMaster === targetStem) return '비견';

    const dayEl = STEM_ELEMENT[dayMaster];
    const dayYY = STEM_YINYANG[dayMaster];
    const targetEl = STEM_ELEMENT[targetStem];
    const targetYY = STEM_YINYANG[targetStem];

    const sameYinYang = dayYY === targetYY;

    // 관계 판별
    const relation = this.getElementRelation(dayEl, targetEl);

    switch (relation) {
      case 'same':     // 비겁
        return sameYinYang ? '비견' : '겁재';
      case 'iGenerate': // 식상 (내가 생하는)
        return sameYinYang ? '식신' : '상관';
      case 'iControl':  // 재성 (내가 극하는)
        return sameYinYang ? '편재' : '정재';
      case 'controlMe': // 관성 (나를 극하는)
        return sameYinYang ? '편관' : '정관';
      case 'generateMe': // 인성 (나를 생하는)
        return sameYinYang ? '편인' : '정인';
      default:
        return '비견';
    }
  }

  /**
   * 오행 관계 판별
   */
  getElementRelation(myElement, targetElement) {
    if (myElement === targetElement) return 'same';

    const myIdx = ELEMENT_CYCLE.indexOf(myElement);
    const targetIdx = ELEMENT_CYCLE.indexOf(targetElement);

    // 상생: 목→화→토→금→수→목
    const generateIdx = (myIdx + 1) % 5;
    if (targetIdx === generateIdx) return 'iGenerate';

    // 상극: 목→토→수→화→금→목
    const controlIdx = (myIdx + 2) % 5;
    if (targetIdx === controlIdx) return 'iControl';

    // 나를 생하는: 수→목 (targetIdx + 1 = myIdx)
    const generatedByIdx = (myIdx + 4) % 5; // (myIdx - 1 + 5) % 5
    if (targetIdx === generatedByIdx) return 'generateMe';

    // 나를 극하는: 금→목 (targetIdx + 2 = myIdx)
    return 'controlMe';
  }

  /**
   * 가장 강한 십신 그룹 결정
   */
  getDominantSipsin(sipsinCount) {
    // 그룹별 합산: 비겁(비견+겁재), 식상(식신+상관), 재성(편재+정재), 관성(편관+정관), 인성(편인+정인)
    const groups = {
      '비겁': (sipsinCount['비견(比肩)'] || 0) + (sipsinCount['겁재(劫財)'] || 0),
      '식상': (sipsinCount['식신(食神)'] || 0) + (sipsinCount['상관(傷官)'] || 0),
      '재성': (sipsinCount['편재(偏財)'] || 0) + (sipsinCount['정재(正財)'] || 0),
      '관성': (sipsinCount['편관(偏官)'] || 0) + (sipsinCount['정관(正官)'] || 0),
      '인성': (sipsinCount['편인(偏印)'] || 0) + (sipsinCount['정인(正印)'] || 0)
    };

    const sorted = Object.entries(groups).sort((a, b) => b[1] - a[1]);
    return {
      groups,
      strongest: sorted[0],
      weakest: sorted[sorted.length - 1],
      sorted
    };
  }

  /**
   * 십신 기반 성격/성향 프로파일
   */
  buildProfile(sipsinCount, dayMaster) {
    const element = STEM_ELEMENT[dayMaster];
    const yinyang = STEM_YINYANG[dayMaster];

    return {
      dayMasterDescription: this.getDayMasterDescription(dayMaster),
      elementDescription: this.getElementDescription(element, yinyang),
      sipsinTraits: this.getSipsinTraits(sipsinCount)
    };
  }

  /**
   * 일간별 기본 성격 설명
   */
  getDayMasterDescription(stem) {
    const descriptions = {
      '갑': '갑목(甲木)은 큰 나무와 같습니다. 곧고 바르며 위로 향하는 성장의 기운을 가졌습니다. 리더십이 강하고 정의감이 있으며 새로운 것을 개척하는 선구자적 기질이 있습니다.',
      '을': '을목(乙木)은 풀이나 덩굴과 같습니다. 유연하고 부드러우며 적응력이 뛰어납니다. 예술적 감각이 있고 섬세하며 사교성이 좋습니다.',
      '병': '병화(丙火)는 태양과 같습니다. 밝고 따뜻하며 에너지가 넘칩니다. 열정적이고 긍정적이며 주변을 밝히는 카리스마가 있습니다.',
      '정': '정화(丁火)는 촛불이나 달빛과 같습니다. 은은하고 따뜻하며 깊은 내면의 빛을 가졌습니다. 섬세하고 예민하며 지적 호기심이 강합니다.',
      '무': '무토(戊土)는 큰 산과 같습니다. 묵직하고 안정적이며 듬직합니다. 신뢰감이 있고 포용력이 크며 중재자 역할을 잘합니다.',
      '기': '기토(己土)는 논밭의 흙과 같습니다. 비옥하고 모든 것을 품어줍니다. 세심하고 실용적이며 어머니같은 따뜻함이 있습니다.',
      '경': '경금(庚金)은 바위나 원석과 같습니다. 강하고 결단력이 있으며 의리가 있습니다. 원칙을 중시하고 불의를 참지 못하며 행동력이 강합니다.',
      '신': '신금(辛金)은 보석이나 장신구와 같습니다. 세련되고 예리하며 미적 감각이 뛰어납니다. 완벽주의적 성향이 있고 자존심이 강합니다.',
      '임': '임수(壬水)는 큰 바다나 강과 같습니다. 넓고 깊으며 포용력이 있습니다. 지혜롭고 유연하며 큰 뜻을 품고 있습니다.',
      '계': '계수(癸水)는 이슬이나 빗물과 같습니다. 맑고 순수하며 지적입니다. 직관력이 뛰어나고 감수성이 풍부하며 내면이 깊습니다.'
    };
    return descriptions[stem] || '';
  }

  /**
   * 오행별 특성 설명
   */
  getElementDescription(element, yinyang) {
    const desc = {
      '목': { '양': '진취적이고 도전적인 기운', '음': '유연하고 포용적인 기운' },
      '화': { '양': '밝고 열정적인 기운', '음': '따뜻하고 섬세한 기운' },
      '토': { '양': '안정적이고 묵직한 기운', '음': '세심하고 배려하는 기운' },
      '금': { '양': '강하고 결단력 있는 기운', '음': '세련되고 예리한 기운' },
      '수': { '양': '넓고 포용적인 기운', '음': '맑고 지적인 기운' }
    };
    return desc[element]?.[yinyang] || '';
  }

  /**
   * 십신 기반 성향 키워드
   */
  getSipsinTraits(sipsinCount) {
    const traits = [];

    if ((sipsinCount['비견(比肩)'] || 0) + (sipsinCount['겁재(劫財)'] || 0) >= 3) {
      traits.push('자아가 강하고 독립심이 강함');
    }
    if ((sipsinCount['식신(食神)'] || 0) + (sipsinCount['상관(傷官)'] || 0) >= 3) {
      traits.push('창의적이고 표현력이 뛰어남');
    }
    if ((sipsinCount['편재(偏財)'] || 0) + (sipsinCount['정재(正財)'] || 0) >= 3) {
      traits.push('재물 복이 있고 현실 감각이 뛰어남');
    }
    if ((sipsinCount['편관(偏官)'] || 0) + (sipsinCount['정관(正官)'] || 0) >= 3) {
      traits.push('책임감이 강하고 조직력이 뛰어남');
    }
    if ((sipsinCount['편인(偏印)'] || 0) + (sipsinCount['정인(正印)'] || 0) >= 3) {
      traits.push('학문적이고 깊은 사고력을 지님');
    }

    return traits;
  }
}
