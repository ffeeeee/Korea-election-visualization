/**
 * 로컬 스토리지 관리 모듈
 * 사주 결과와 사용자 데이터 저장/로드
 */

export class StorageManager {
  constructor() {
    this.storagePrefix = 'saju_mz_';
    this.maxStoredResults = 10;
  }

  /**
   * 최근 사주 저장
   */
  saveSaju(sajuResult) {
    const key = `${this.storagePrefix}last_saju`;
    localStorage.setItem(key, JSON.stringify(sajuResult));

    // 히스토리에도 저장
    this.addToHistory(sajuResult);
  }

  /**
   * 최근 사주 가져오기
   */
  getLastSaju() {
    const key = `${this.storagePrefix}last_saju`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  /**
   * 사주 히스토리에 추가
   */
  addToHistory(sajuResult) {
    const historyKey = `${this.storagePrefix}history`;
    let history = this.getHistory();

    // 중복 확인 (같은 생년월일이면 제거)
    history = history.filter(item => item.birthDate !== sajuResult.birthDate);

    // 새 항목 추가
    history.unshift({
      ...sajuResult,
      savedAt: new Date().toISOString()
    });

    // 최대 개수 유지
    if (history.length > this.maxStoredResults) {
      history = history.slice(0, this.maxStoredResults);
    }

    localStorage.setItem(historyKey, JSON.stringify(history));
  }

  /**
   * 사주 히스토리 가져오기
   */
  getHistory() {
    const historyKey = `${this.storagePrefix}history`;
    const data = localStorage.getItem(historyKey);
    return data ? JSON.parse(data) : [];
  }

  /**
   * 특정 사주 결과 가져오기
   */
  getSajuByDate(birthDate) {
    const history = this.getHistory();
    return history.find(item => item.birthDate === birthDate) || null;
  }

  /**
   * 사주 결과 삭제
   */
  deleteSaju(birthDate) {
    const historyKey = `${this.storagePrefix}history`;
    let history = this.getHistory();

    history = history.filter(item => item.birthDate !== birthDate);

    localStorage.setItem(historyKey, JSON.stringify(history));
  }

  /**
   * 사용자 설정 저장
   */
  saveSettings(settings) {
    const key = `${this.storagePrefix}settings`;
    localStorage.setItem(key, JSON.stringify(settings));
  }

  /**
   * 사용자 설정 가져오기
   */
  getSettings() {
    const key = `${this.storagePrefix}settings`;
    const data = localStorage.getItem(key);

    const defaults = {
      theme: 'light',
      notifications: true,
      language: 'ko'
    };

    return data ? { ...defaults, ...JSON.parse(data) } : defaults;
  }

  /**
   * 특정 설정 업데이트
   */
  updateSetting(key, value) {
    const settings = this.getSettings();
    settings[key] = value;
    this.saveSettings(settings);
  }

  /**
   * 즐겨찾기 추가
   */
  addFavorite(sajuResult) {
    const favKey = `${this.storagePrefix}favorites`;
    let favorites = this.getFavorites();

    // 중복 확인
    if (favorites.some(item => item.birthDate === sajuResult.birthDate)) {
      return false; // 이미 즐겨찾기 됨
    }

    favorites.push({
      ...sajuResult,
      favoritedAt: new Date().toISOString()
    });

    localStorage.setItem(favKey, JSON.stringify(favorites));
    return true;
  }

  /**
   * 즐겨찾기 제거
   */
  removeFavorite(birthDate) {
    const favKey = `${this.storagePrefix}favorites`;
    let favorites = this.getFavorites();

    favorites = favorites.filter(item => item.birthDate !== birthDate);

    localStorage.setItem(favKey, JSON.stringify(favorites));
  }

  /**
   * 즐겨찾기 목록 가져오기
   */
  getFavorites() {
    const favKey = `${this.storagePrefix}favorites`;
    const data = localStorage.getItem(favKey);
    return data ? JSON.parse(data) : [];
  }

  /**
   * 즐겨찾기 확인
   */
  isFavorite(birthDate) {
    return this.getFavorites().some(item => item.birthDate === birthDate);
  }

  /**
   * 캐시 데이터 저장 (API 응답 등)
   */
  setCache(key, value, expiryMinutes = 60) {
    const cacheKey = `${this.storagePrefix}cache_${key}`;
    const cacheData = {
      value,
      expiryTime: Date.now() + expiryMinutes * 60 * 1000
    };

    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  }

  /**
   * 캐시 데이터 가져오기
   */
  getCache(key) {
    const cacheKey = `${this.storagePrefix}cache_${key}`;
    const data = localStorage.getItem(cacheKey);

    if (!data) return null;

    const cacheData = JSON.parse(data);

    // 만료 확인
    if (cacheData.expiryTime < Date.now()) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return cacheData.value;
  }

  /**
   * 캐시 삭제
   */
  clearCache(key) {
    const cacheKey = `${this.storagePrefix}cache_${key}`;
    localStorage.removeItem(cacheKey);
  }

  /**
   * 모든 캐시 삭제
   */
  clearAllCache() {
    Object.keys(localStorage)
      .filter(key => key.includes(`${this.storagePrefix}cache_`))
      .forEach(key => localStorage.removeItem(key));
  }

  /**
   * 전체 데이터 초기화
   */
  clearAll() {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.storagePrefix))
      .forEach(key => localStorage.removeItem(key));
  }

  /**
   * 사용자 데이터 내보내기 (JSON)
   */
  exportData() {
    const exportData = {
      history: this.getHistory(),
      favorites: this.getFavorites(),
      settings: this.getSettings(),
      exportedAt: new Date().toISOString()
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * 사용자 데이터 가져오기 (JSON)
   */
  importData(jsonString) {
    try {
      const importData = JSON.parse(jsonString);

      if (importData.history) {
        localStorage.setItem(
          `${this.storagePrefix}history`,
          JSON.stringify(importData.history)
        );
      }

      if (importData.favorites) {
        localStorage.setItem(
          `${this.storagePrefix}favorites`,
          JSON.stringify(importData.favorites)
        );
      }

      if (importData.settings) {
        this.saveSettings(importData.settings);
      }

      return true;
    } catch (error) {
      console.error('데이터 가져오기 실패:', error);
      return false;
    }
  }

  /**
   * 스토리지 사용량 확인
   */
  getStorageSize() {
    let size = 0;

    Object.keys(localStorage)
      .filter(key => key.startsWith(this.storagePrefix))
      .forEach(key => {
        size += localStorage[key].length + key.length;
      });

    return (size / 1024).toFixed(2) + ' KB';
  }
}
