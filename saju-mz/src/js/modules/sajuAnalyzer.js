/**
 * sajuAnalyzer.js - 사주 분석 오케스트레이터
 * 4개 모듈을 조합하여 전체 분석 결과를 생성하는 thin orchestrator
 */
import { SajuCalculator } from './sajuCalculator';
import { SipsinAnalyzer } from './sipsinAnalyzer';
import { DaewoonCalculator } from './daewoonCalculator';
import { FortuneTextGenerator } from './fortuneTextGenerator';

export class SajuAnalyzer {
  constructor() {
    this.calculator = new SajuCalculator();
    this.sipsinAnalyzer = new SipsinAnalyzer();
    this.daewoonCalculator = new DaewoonCalculator();
    this.textGenerator = new FortuneTextGenerator();
  }

  /**
   * 사주 분석 메인 함수
   * @param {Object} formData - { name, birthDate, calendarType, isLeapMonth, birthSijin, gender }
   * @returns {Object} 전체 분석 결과
   */
  analyze(formData) {
    // 1. 사주팔자 계산
    const sajuResult = this.calculator.calculate({
      birthDate: formData.birthDate,
      calendarType: formData.calendarType || 'solar',
      isLeapMonth: formData.isLeapMonth || false,
      birthSijin: formData.birthSijin,
      gender: formData.gender,
      name: formData.name
    });

    // 2. 십신 분석
    const sipsinResult = this.sipsinAnalyzer.analyze(sajuResult);

    // 3. 대운 계산
    const daewoonResult = this.daewoonCalculator.calculate(sajuResult);

    // 4. 상세 텍스트 생성
    const analysisTexts = this.textGenerator.generate(sajuResult, sipsinResult, daewoonResult);

    // 결과 조합
    return {
      // 기본 정보
      name: formData.name,
      gender: formData.gender,
      birthDate: sajuResult.solarDate,
      lunarInfo: sajuResult.lunarInfo,
      birthSijin: formData.birthSijin,

      // 사주 명식
      pillars: sajuResult.pillars,
      dayMaster: sajuResult.dayMaster,
      dayMasterElement: sajuResult.dayMasterElement,
      dayMasterYinYang: sajuResult.dayMasterYinYang,

      // 오행
      elements: sajuResult.elements,

      // 십신
      sipsin: sipsinResult,

      // 대운
      daewoon: daewoonResult,

      // 분석 텍스트 (11개 섹션)
      analysis: analysisTexts,

      // 간지 표시
      ganji: `${sajuResult.pillars.year.display} ${sajuResult.pillars.month.display} ${sajuResult.pillars.day.display} ${sajuResult.pillars.hour ? sajuResult.pillars.hour.display : '(미상)'}`,

      // 메타
      timestamp: Date.now()
    };
  }
}
