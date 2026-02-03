#!/usr/bin/env python3
"""
한국 주식 데이터 수집 스크립트
네이버 금융, KRX 등에서 종목 정보를 수집하여 JSON으로 저장
"""

import json
import os
from datetime import datetime
from typing import List, Dict

# 현재는 Mock 데이터를 사용하고 있으며,
# 실제 크롤링이 필요한 경우 다음 라이브러리를 사용할 수 있습니다:
# pip install requests beautifulsoup4 selenium


def get_mock_korean_stocks() -> Dict:
    """
    Mock 한국 주식 데이터 반환
    실제 API/크롤링으로 교체 가능
    """
    return {
        "lastUpdate": datetime.now().isoformat() + "Z",
        "market": "korean",
        "currency": "KRW",
        "stocks": [
            {
                "id": "005930",
                "name": "삼성전자",
                "symbol": "005930",
                "price": 71500,
                "change": 2.15,
                "volume": 18500000,
                "marketCap": 430000000000000,
                "pe": 13.2,
                "high": 72000,
                "low": 70800
            },
            {
                "id": "000660",
                "name": "SK하이닉스",
                "symbol": "000660",
                "price": 162000,
                "change": 3.52,
                "volume": 5200000,
                "marketCap": 95000000000000,
                "pe": 11.8,
                "high": 163500,
                "low": 159800
            },
            # ... 추가 종목들
        ]
    }


def collect_korean_stocks() -> Dict:
    """
    한국 주식 데이터 수집
    """
    print("한국 주식 데이터 수집 중...")

    # 현재는 Mock 데이터 사용
    # 실제 구현 시 다음과 같이 수정:
    # 1. requests를 이용한 API 호출
    # 2. BeautifulSoup를 이용한 웹 스크래핑
    # 3. Selenium을 이용한 동적 콘텐츠 수집

    data = get_mock_korean_stocks()

    print(f"수집 완료: {len(data['stocks'])}개 종목")
    return data


def collect_us_stocks() -> Dict:
    """
    미국 주식 데이터 수집
    실제 구현 시 Yahoo Finance API 또는 Alpha Vantage 사용
    """
    print("미국 주식 데이터 수집 중...")

    data = {
        "lastUpdate": datetime.now().isoformat() + "Z",
        "market": "us",
        "currency": "USD",
        "stocks": [
            {
                "id": "AAPL",
                "name": "Apple",
                "symbol": "AAPL",
                "price": 245.82,
                "change": 1.25,
                "volume": 52100000,
                "marketCap": 3850000000000,
                "pe": 32.5,
                "high": 248.50,
                "low": 243.20
            },
            # ... 추가 종목들
        ]
    }

    print(f"수집 완료: {len(data['stocks'])}개 종목")
    return data


def collect_crypto() -> Dict:
    """
    크립토 데이터 수집
    CoinGecko API를 이용한 무료 수집
    """
    print("크립토 데이터 수집 중...")

    try:
        import requests

        # CoinGecko API 사용 (인증 불필요, 무료)
        url = "https://api.coingecko.com/api/v3/simple/price"
        params = {
            "ids": "bitcoin,ethereum,solana,ripple,cardano,polkadot,dogecoin,litecoin,polygon,uniswap,chainlink,bitcoin-cash,eos,monero,stellar",
            "vs_currencies": "usd",
            "include_market_cap": "true",
            "include_24hr_vol": "true",
            "include_24hr_change": "true"
        }

        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()

        print("크립토 데이터 수집 완료 (CoinGecko API)")
        return response.json()

    except ImportError:
        print("requests 라이브러리가 없습니다. Mock 데이터 사용")
        return {
            "lastUpdate": datetime.now().isoformat() + "Z",
            "market": "crypto",
            "currency": "USD",
            "cryptos": [
                {
                    "id": "bitcoin",
                    "name": "Bitcoin",
                    "symbol": "BTC",
                    "price": 98425.50,
                    "change": 2.45,
                    "volume24h": 45200000000,
                    "marketCap": 1950000000000,
                    "high": 99850.00,
                    "low": 96200.00
                },
                # ... 추가 종목들
            ]
        }
    except Exception as e:
        print(f"크립토 데이터 수집 실패: {e}")
        return {}


def save_json(data: Dict, filepath: str) -> bool:
    """
    JSON 파일로 저장
    """
    try:
        os.makedirs(os.path.dirname(filepath), exist_ok=True)

        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"저장 완료: {filepath}")
        return True
    except Exception as e:
        print(f"저장 실패: {e}")
        return False


def main():
    """
    메인 실행 함수
    """
    # 데이터 디렉토리 경로
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(script_dir, '..', 'data')

    print("=" * 50)
    print("금융 대시보드 데이터 수집 스크립트")
    print("=" * 50)
    print()

    # 한국 주식
    print("[1/3] 한국 주식 수집")
    korean_data = collect_korean_stocks()
    save_json(korean_data, os.path.join(data_dir, 'korean-stocks.json'))
    print()

    # 미국 주식
    print("[2/3] 미국 주식 수집")
    us_data = collect_us_stocks()
    save_json(us_data, os.path.join(data_dir, 'us-stocks.json'))
    print()

    # 크립토
    print("[3/3] 크립토 수집")
    crypto_data = collect_crypto()
    if crypto_data:
        save_json(crypto_data, os.path.join(data_dir, 'crypto-list.json'))
    print()

    print("=" * 50)
    print("데이터 수집 완료!")
    print("=" * 50)


if __name__ == '__main__':
    main()
