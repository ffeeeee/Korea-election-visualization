#!/usr/bin/env python3
"""
2026 지방선거 여론조사 지도 생성 스크립트
Folium을 사용하여 전국 지도에 여론조사 데이터를 시각화합니다.
"""

import folium
from folium import plugins
import json
import os

# 데이터 파일 경로
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
REGIONS_FILE = os.path.join(DATA_DIR, 'regions.json')
POLLS_FILE = os.path.join(DATA_DIR, 'polls_2026.json')
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), '..', 'map.html')

# 정당별 색상 정의
PARTY_COLORS = {
    '민주당': '#3b82f6',      # 파란색
    '국민의힘': '#ef4444',     # 빨간색
    '기타': '#8b949e'         # 회색
}

def load_data():
    """데이터 파일 로드"""
    with open(REGIONS_FILE, 'r', encoding='utf-8') as f:
        regions = json.load(f)

    with open(POLLS_FILE, 'r', encoding='utf-8') as f:
        polls = json.load(f)

    return regions, polls

def get_leading_candidate(candidates):
    """후보자 중 가장 높은 지지율을 가진 후보 반환"""
    if not candidates:
        return None, 0
    return max(candidates, key=lambda x: x['rate']), max(c['rate'] for c in candidates)

def create_popup_html(region_name, candidates, survey_date):
    """팝업 HTML 생성"""
    html = f"""
    <div style="font-family:'Malgun Gothic',sans-serif;width:280px;">
        <h3 style="margin:5px 0;color:#333;">{region_name}</h3>
        <hr style="margin:5px 0;">
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
            <tr style="background:#f5f5f5;">
                <td style="padding:3px;"><strong>조사일</strong></td>
                <td style="padding:3px;text-align:right;">{survey_date}</td>
            </tr>
    """

    for cand in sorted(candidates, key=lambda x: x['rate'], reverse=True):
        color = PARTY_COLORS.get(cand['party'], '#999')
        html += f"""
            <tr>
                <td style="padding:3px;">{cand['name']} ({cand['party']})</td>
                <td style="padding:3px;text-align:right;"><strong style="color:{color};">{cand['rate']}%</strong></td>
            </tr>
        """

    html += """
        </table>
    </div>
    """
    return html

def create_map(regions, polls):
    """Folium 지도 생성"""
    # 기본 지도 설정 (대한민국 중심)
    m = folium.Map(
        location=[36.3, 127.8],
        zoom_start=7,
        tiles='cartodbpositron'
    )

    # 최신 여론조사 데이터 가져오기 (가장 최근 데이터)
    latest_surveys = {}
    for entry in polls['timeline']:
        for survey in entry['surveys']:
            region_code = survey['regionCode']
            if region_code not in latest_surveys or entry['date'] > latest_surveys[region_code]['date']:
                latest_surveys[region_code] = {
                    'date': entry['date'],
                    'candidates': survey['candidates']
                }

    # 각 광역자치단체에 마커 추가
    feature_groups = {}
    for region in regions['provinces']:
        region_code = region['code']
        region_name = region['name']

        # 이 지역의 최신 여론조사 데이터
        survey_data = latest_surveys.get(region_code)
        if not survey_data:
            continue

        candidates = survey_data['candidates']
        leading_cand, leading_rate = get_leading_candidate(candidates)

        if not leading_cand:
            continue

        # 지역별 레이어 생성
        if region_name not in feature_groups:
            feature_groups[region_name] = folium.FeatureGroup(
                name=f"📍 {region_name}",
                show=True
            )

        # 원형 마커 (지지율 기반 크기)
        # 반지름: 지지율의 절반 (20-30 정도)
        marker_radius = max(10, leading_rate / 2)

        popup_html = create_popup_html(
            region_name,
            candidates,
            survey_data['date']
        )

        circle = folium.CircleMarker(
            location=[region['lat'], region['lng']],
            radius=marker_radius,
            popup=folium.Popup(popup_html, max_width=300),
            color=PARTY_COLORS.get(leading_cand['party'], '#999'),
            fill=True,
            fillColor=PARTY_COLORS.get(leading_cand['party'], '#999'),
            fillOpacity=0.7,
            weight=2,
            opacity=1.0
        )

        circle.add_to(feature_groups[region_name])

    # 레이어를 지도에 추가
    for fg in feature_groups.values():
        fg.add_to(m)

    # 레이어 컨트롤 추가
    folium.LayerControl(
        position='topright',
        collapsed=False
    ).add_to(m)

    # 범례 HTML 추가
    legend_html = """
    <div style="position: fixed;
                bottom: 50px; right: 10px; width: 280px; height: auto;
                background-color: white; border:2px solid grey; z-index:9999;
                font-size:14px; padding: 10px; border-radius: 5px;
                font-family: 'Malgun Gothic', sans-serif;">
        <h4 style="margin: 0 0 10px 0; padding-bottom: 5px; border-bottom: 1px solid #ddd;">
            ⚡ 범례
        </h4>
        <div style="margin-bottom: 8px;">
            <span style="display:inline-block; width:12px; height:12px;
                         background-color:#3b82f6; border-radius:50%; margin-right:5px;"></span>
            <strong>민주당 우위 지역</strong>
        </div>
        <div style="margin-bottom: 8px;">
            <span style="display:inline-block; width:12px; height:12px;
                         background-color:#ef4444; border-radius:50%; margin-right:5px;"></span>
            <strong>국민의힘 우위 지역</strong>
        </div>
        <div style="margin-bottom: 8px;">
            <span style="display:inline-block; width:12px; height:12px;
                         background-color:#8b949e; border-radius:50%; margin-right:5px;"></span>
            <strong>기타 후보 우위</strong>
        </div>
        <hr style="margin: 8px 0; border: none; border-top: 1px solid #ddd;">
        <div style="font-size: 12px; color: #666;">
            <strong>마커 크기:</strong> 최고 지지율에 비례<br>
            <strong>마지막 업데이트:</strong> """ + polls['meta']['lastUpdate'] + """
        </div>
    </div>
    """

    m.get_root().html.add_child(folium.Element(legend_html))

    # 타이틀 추가
    title_html = """
    <div style="position: fixed;
                top: 10px; left: 50px;
                background-color: white; border:2px solid grey; z-index:9999;
                font-size:18px; padding: 15px; border-radius: 5px;
                font-family: 'Malgun Gothic', sans-serif; font-weight: bold;">
        📊 2026 지방선거 여론조사 시각화
    </div>
    """

    m.get_root().html.add_child(folium.Element(title_html))

    # 정보 패널 추가
    info_html = """
    <div style="position: fixed;
                top: 70px; right: 10px; width: 280px;
                background-color: white; border:1px solid #ddd; z-index:9999;
                font-size:12px; padding: 10px; border-radius: 5px;
                font-family: 'Malgun Gothic', sans-serif;">
        <strong>사용 방법:</strong><br>
        1. 왼쪽 목록에서 지역을 선택합니다<br>
        2. 지도의 마커를 클릭하면 상세 정보를 봅니다<br>
        3. 차트 섹션에서 시계열 데이터를 확인합니다
    </div>
    """

    m.get_root().html.add_child(folium.Element(info_html))

    return m

def main():
    print("데이터 로드 중...")
    regions, polls = load_data()

    print("지도 생성 중...")
    m = create_map(regions, polls)

    print(f"지도 저장 중 ({OUTPUT_FILE})...")
    m.save(OUTPUT_FILE)

    print("✅ 완료! 지도가 생성되었습니다.")
    print(f"📁 파일: {OUTPUT_FILE}")

if __name__ == '__main__':
    main()
