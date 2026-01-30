"""
대한민국 전력 송전망 개념도
- folium 기반 인터랙티브 지도
- 가상 데이터 (실제 송전망 위치가 아님)
"""

import folium
from folium import plugins
import json

# ============================================================
# 데이터 정의
# ============================================================

# 전압 등급별 스타일 설정
VOLTAGE_STYLES = {
    765: {
        "color": "#DC2626",
        "weight": 5,
        "dash_array": "15 8",
        "label": "765kV (초고압)",
        "opacity": 0.9,
    },
    345: {
        "color": "#EA580C",
        "weight": 3.5,
        "dash_array": "10 6",
        "label": "345kV (고압)",
        "opacity": 0.85,
    },
    154: {
        "color": "#CA8A04",
        "weight": 2.5,
        "dash_array": "6 4",
        "label": "154kV (중압)",
        "opacity": 0.75,
    },
    "HVDC": {
        "color": "#7C3AED",
        "weight": 4,
        "dash_array": "12 4 4 4",
        "label": "HVDC (직류송전)",
        "opacity": 0.9,
    },
}

# 시설 유형별 마커 스타일
FACILITY_ICONS = {
    "nuclear": {"color": "red", "icon": "bolt", "prefix": "fa", "label": "원자력발전소"},
    "coal": {"color": "darkred", "icon": "industry", "prefix": "fa", "label": "석탄화력발전소"},
    "lng": {"color": "orange", "icon": "fire", "prefix": "fa", "label": "LNG발전소"},
    "hydro": {"color": "blue", "icon": "tint", "prefix": "fa", "label": "수력발전소"},
    "renewable": {"color": "green", "icon": "leaf", "prefix": "fa", "label": "신재생에너지"},
    "substation_765": {"color": "red", "icon": "circle", "prefix": "fa", "label": "765kV 변전소"},
    "substation_345": {"color": "orange", "icon": "circle", "prefix": "fa", "label": "345kV 변전소"},
    "city": {"color": "cadetblue", "icon": "building", "prefix": "fa", "label": "주요 소비지"},
}

# 발전소 데이터
POWER_PLANTS = [
    {"name": "고리/신고리 원자력", "type": "nuclear", "lat": 35.316, "lng": 129.290,
     "capacity": "10,720MW", "units": 10, "operator": "한국수력원자력"},
    {"name": "한빛(영광) 원자력", "type": "nuclear", "lat": 35.413, "lng": 126.416,
     "capacity": "5,900MW", "units": 6, "operator": "한국수력원자력"},
    {"name": "한울(울진) 원자력", "type": "nuclear", "lat": 37.093, "lng": 129.383,
     "capacity": "5,900MW", "units": 6, "operator": "한국수력원자력"},
    {"name": "월성 원자력", "type": "nuclear", "lat": 35.714, "lng": 129.476,
     "capacity": "4,796MW", "units": 5, "operator": "한국수력원자력"},
    {"name": "새울(신한울) 원자력", "type": "nuclear", "lat": 37.098, "lng": 129.380,
     "capacity": "2,800MW", "units": 2, "operator": "한국수력원자력"},
    {"name": "당진 화력", "type": "coal", "lat": 36.975, "lng": 126.598,
     "capacity": "6,040MW", "units": 10, "operator": "한국동서발전"},
    {"name": "태안 화력", "type": "coal", "lat": 36.770, "lng": 126.260,
     "capacity": "6,100MW", "units": 10, "operator": "한국서부발전"},
    {"name": "보령 화력", "type": "coal", "lat": 36.380, "lng": 126.490,
     "capacity": "4,000MW", "units": 8, "operator": "한국중부발전"},
    {"name": "하동 화력", "type": "coal", "lat": 34.960, "lng": 127.880,
     "capacity": "4,000MW", "units": 8, "operator": "한국남부발전"},
    {"name": "삼천포 화력", "type": "coal", "lat": 34.913, "lng": 128.068,
     "capacity": "3,240MW", "units": 6, "operator": "한국남동발전"},
    {"name": "영흥 화력", "type": "coal", "lat": 37.240, "lng": 126.430,
     "capacity": "5,080MW", "units": 6, "operator": "한국남동발전"},
    {"name": "인천 LNG복합", "type": "lng", "lat": 37.455, "lng": 126.590,
     "capacity": "3,413MW", "units": 8, "operator": "한국중부발전"},
    {"name": "평택 LNG복합", "type": "lng", "lat": 36.970, "lng": 126.870,
     "capacity": "1,972MW", "units": 6, "operator": "한국중부발전"},
    {"name": "서인천 LNG복합", "type": "lng", "lat": 37.460, "lng": 126.580,
     "capacity": "1,800MW", "units": 5, "operator": "한국서부발전"},
    {"name": "양양 양수발전", "type": "hydro", "lat": 38.050, "lng": 128.640,
     "capacity": "1,000MW", "units": 4, "operator": "한국수력원자력"},
    {"name": "청평 수력발전", "type": "hydro", "lat": 37.730, "lng": 127.440,
     "capacity": "139MW", "units": 4, "operator": "한국수력원자력"},
    {"name": "제주 한림풍력", "type": "renewable", "lat": 33.380, "lng": 126.270,
     "capacity": "100MW", "units": 20, "operator": "제주에너지공사"},
]

# 주요 변전소 데이터
SUBSTATIONS = [
    {"name": "신안성 변전소", "type": "substation_765", "lat": 37.005, "lng": 127.183,
     "voltage": 765, "capacity": "6,000MVA"},
    {"name": "신가평 변전소", "type": "substation_765", "lat": 37.798, "lng": 127.505,
     "voltage": 765, "capacity": "8,000MVA"},
    {"name": "신태백 변전소", "type": "substation_765", "lat": 37.120, "lng": 128.900,
     "voltage": 765, "capacity": "4,000MVA"},
    {"name": "북경남 변전소", "type": "substation_765", "lat": 35.620, "lng": 128.850,
     "voltage": 765, "capacity": "6,000MVA"},
    {"name": "신서산 변전소", "type": "substation_765", "lat": 36.700, "lng": 126.580,
     "voltage": 765, "capacity": "4,000MVA"},
    {"name": "동서울 변전소", "type": "substation_345", "lat": 37.540, "lng": 127.080,
     "voltage": 345, "capacity": "3,000MVA"},
    {"name": "서서울 변전소", "type": "substation_345", "lat": 37.550, "lng": 126.870,
     "voltage": 345, "capacity": "2,500MVA"},
    {"name": "신인천 변전소", "type": "substation_345", "lat": 37.430, "lng": 126.650,
     "voltage": 345, "capacity": "2,000MVA"},
    {"name": "신용인 변전소", "type": "substation_345", "lat": 37.200, "lng": 127.100,
     "voltage": 345, "capacity": "2,500MVA"},
    {"name": "대전 변전소", "type": "substation_345", "lat": 36.350, "lng": 127.400,
     "voltage": 345, "capacity": "2,000MVA"},
    {"name": "대구 변전소", "type": "substation_345", "lat": 35.880, "lng": 128.610,
     "voltage": 345, "capacity": "2,000MVA"},
    {"name": "광주 변전소", "type": "substation_345", "lat": 35.170, "lng": 126.910,
     "voltage": 345, "capacity": "1,500MVA"},
    {"name": "부산 변전소", "type": "substation_345", "lat": 35.180, "lng": 129.050,
     "voltage": 345, "capacity": "2,000MVA"},
]

# 주요 소비 도시
MAJOR_CITIES = [
    {"name": "서울/수도권", "lat": 37.560, "lng": 126.970, "population": "2,600만"},
    {"name": "부산", "lat": 35.170, "lng": 129.070, "population": "340만"},
    {"name": "대구", "lat": 35.870, "lng": 128.600, "population": "240만"},
    {"name": "대전/세종", "lat": 36.350, "lng": 127.380, "population": "200만"},
    {"name": "광주", "lat": 35.160, "lng": 126.850, "population": "150만"},
]

# 송전선로 데이터 (가상 경로)
TRANSMISSION_LINES = [
    # 765kV 간선
    {"name": "서해안 765kV (당진→신서산→신안성)",
     "voltage": 765, "from": "당진화력", "to": "신안성변전소", "length": 176,
     "coords": [[36.975, 126.598], [36.850, 126.570], [36.700, 126.580],
                 [36.800, 126.750], [36.900, 126.950], [37.005, 127.183]]},
    {"name": "중부 765kV (신안성→신가평)",
     "voltage": 765, "from": "신안성변전소", "to": "신가평변전소", "length": 78,
     "coords": [[37.005, 127.183], [37.150, 127.250], [37.350, 127.350],
                 [37.550, 127.420], [37.798, 127.505]]},
    {"name": "동해안 765kV (한울→신태백)",
     "voltage": 765, "from": "한울원전", "to": "신태백변전소", "length": 47,
     "coords": [[37.093, 129.383], [37.100, 129.200], [37.110, 129.050],
                 [37.120, 128.900]]},
    {"name": "영동 765kV (신태백→신가평)",
     "voltage": 765, "from": "신태백변전소", "to": "신가평변전소", "length": 155,
     "coords": [[37.120, 128.900], [37.200, 128.600], [37.350, 128.300],
                 [37.500, 128.000], [37.650, 127.750], [37.798, 127.505]]},
    {"name": "동남 765kV (고리→북경남)",
     "voltage": 765, "from": "고리원전", "to": "북경남변전소", "length": 91,
     "coords": [[35.316, 129.290], [35.400, 129.150], [35.500, 129.000],
                 [35.620, 128.850]]},

    # 345kV 주요 간선
    {"name": "수도권 345kV 환상망 (서서울→동서울)",
     "voltage": 345, "from": "서서울변전소", "to": "동서울변전소", "length": 35,
     "coords": [[37.550, 126.870], [37.570, 126.950], [37.560, 127.000],
                 [37.540, 127.080]]},
    {"name": "수도권 345kV (신인천→서서울)",
     "voltage": 345, "from": "신인천변전소", "to": "서서울변전소", "length": 30,
     "coords": [[37.430, 126.650], [37.460, 126.720], [37.500, 126.800],
                 [37.550, 126.870]]},
    {"name": "경부 345kV (신안성→대전)",
     "voltage": 345, "from": "신안성변전소", "to": "대전변전소", "length": 110,
     "coords": [[37.005, 127.183], [36.850, 127.200], [36.700, 127.250],
                 [36.550, 127.300], [36.350, 127.400]]},
    {"name": "호남 345kV (대전→광주)",
     "voltage": 345, "from": "대전변전소", "to": "광주변전소", "length": 170,
     "coords": [[36.350, 127.400], [36.100, 127.250], [35.850, 127.050],
                 [35.600, 126.950], [35.170, 126.910]]},
    {"name": "경부 345kV (대전→대구)",
     "voltage": 345, "from": "대전변전소", "to": "대구변전소", "length": 130,
     "coords": [[36.350, 127.400], [36.200, 127.600], [36.050, 127.850],
                 [35.950, 128.150], [35.880, 128.610]]},
    {"name": "경남 345kV (대구→부산)",
     "voltage": 345, "from": "대구변전소", "to": "부산변전소", "length": 90,
     "coords": [[35.880, 128.610], [35.750, 128.700], [35.600, 128.800],
                 [35.400, 128.950], [35.180, 129.050]]},
    {"name": "영광-광주 345kV",
     "voltage": 345, "from": "한빛원전", "to": "광주변전소", "length": 85,
     "coords": [[35.413, 126.416], [35.350, 126.550], [35.280, 126.680],
                 [35.200, 126.800], [35.170, 126.910]]},
    {"name": "보령-대전 345kV",
     "voltage": 345, "from": "보령화력", "to": "대전변전소", "length": 95,
     "coords": [[36.380, 126.490], [36.380, 126.650], [36.370, 126.850],
                 [36.360, 127.100], [36.350, 127.400]]},
    {"name": "신안성-신용인 345kV",
     "voltage": 345, "from": "신안성변전소", "to": "신용인변전소", "length": 20,
     "coords": [[37.005, 127.183], [37.100, 127.150], [37.200, 127.100]]},
    {"name": "영흥-신인천 345kV",
     "voltage": 345, "from": "영흥화력", "to": "신인천변전소", "length": 40,
     "coords": [[37.240, 126.430], [37.300, 126.500], [37.370, 126.580],
                 [37.430, 126.650]]},

    # 154kV 대표 구간
    {"name": "하동-삼천포 154kV",
     "voltage": 154, "from": "하동화력", "to": "삼천포화력", "length": 25,
     "coords": [[34.960, 127.880], [34.940, 127.960], [34.913, 128.068]]},
    {"name": "월성-부산 154kV",
     "voltage": 154, "from": "월성원전", "to": "부산변전소", "length": 60,
     "coords": [[35.714, 129.476], [35.600, 129.400], [35.450, 129.300],
                 [35.300, 129.150], [35.180, 129.050]]},

    # HVDC (제주 연계)
    {"name": "해남-제주 HVDC",
     "voltage": "HVDC", "from": "해남", "to": "제주", "length": 101,
     "coords": [[34.570, 126.570], [34.400, 126.520], [34.100, 126.450],
                 [33.800, 126.400], [33.510, 126.530]]},
    {"name": "진도-제주 HVDC #2",
     "voltage": "HVDC", "from": "진도", "to": "제주", "length": 122,
     "coords": [[34.490, 126.260], [34.300, 126.280], [34.050, 126.300],
                 [33.750, 126.310], [33.510, 126.530]]},
]


# ============================================================
# 지도 생성 함수
# ============================================================

def create_popup_html(title, fields):
    """팝업 HTML 생성"""
    rows = "".join(
        f'<tr><td style="font-weight:600;color:#555;padding:3px 10px 3px 0;">{k}</td>'
        f'<td style="padding:3px 0;">{v}</td></tr>'
        for k, v in fields.items()
    )
    return f"""
    <div style="font-family:'Malgun Gothic',sans-serif;min-width:180px;">
        <div style="background:#1e3a5f;color:#fff;padding:6px 10px;border-radius:4px 4px 0 0;
                     font-size:13px;font-weight:700;">{title}</div>
        <table style="font-size:12px;padding:6px 10px;">{rows}</table>
    </div>"""


def add_power_plants(m, feature_group):
    """발전소 마커 추가"""
    for plant in POWER_PLANTS:
        style = FACILITY_ICONS[plant["type"]]
        popup_html = create_popup_html(plant["name"], {
            "유형": style["label"],
            "설비용량": plant["capacity"],
            "호기수": f'{plant["units"]}기',
            "운영사": plant["operator"],
        })
        folium.Marker(
            location=[plant["lat"], plant["lng"]],
            popup=folium.Popup(popup_html, max_width=280),
            tooltip=plant["name"],
            icon=folium.Icon(color=style["color"], icon=style["icon"], prefix=style["prefix"]),
        ).add_to(feature_group)


def add_substations(m, feature_group):
    """변전소 마커 추가"""
    for ss in SUBSTATIONS:
        style = FACILITY_ICONS[ss["type"]]
        size = 12 if ss["voltage"] == 765 else 8
        popup_html = create_popup_html(ss["name"], {
            "전압": f'{ss["voltage"]}kV',
            "용량": ss["capacity"],
        })
        folium.CircleMarker(
            location=[ss["lat"], ss["lng"]],
            radius=size,
            popup=folium.Popup(popup_html, max_width=250),
            tooltip=ss["name"],
            color=style["color"],
            fill=True,
            fill_color=style["color"],
            fill_opacity=0.7,
            weight=2,
        ).add_to(feature_group)


def add_cities(m, feature_group):
    """주요 소비 도시 마커 추가"""
    for city in MAJOR_CITIES:
        style = FACILITY_ICONS["city"]
        popup_html = create_popup_html(city["name"], {
            "인구": city["population"],
            "역할": "주요 전력 소비지",
        })
        folium.Marker(
            location=[city["lat"], city["lng"]],
            popup=folium.Popup(popup_html, max_width=250),
            tooltip=city["name"],
            icon=folium.Icon(color=style["color"], icon=style["icon"], prefix=style["prefix"]),
        ).add_to(feature_group)


def add_transmission_lines(m, feature_groups):
    """송전선로 그리기 (전압별 점선 스타일)"""
    for line in TRANSMISSION_LINES:
        voltage = line["voltage"]
        style = VOLTAGE_STYLES[voltage]

        popup_html = create_popup_html(line["name"], {
            "전압": style["label"],
            "구간": f'{line["from"]} → {line["to"]}',
            "연장": f'{line["length"]}km',
        })

        polyline = folium.PolyLine(
            locations=line["coords"],
            weight=style["weight"],
            color=style["color"],
            opacity=style["opacity"],
            dash_array=style["dash_array"],
            tooltip=f'{line["name"]} ({style["label"]})',
            popup=folium.Popup(popup_html, max_width=280),
        )

        # 전압별 피처 그룹에 추가
        group_key = f"v{voltage}" if isinstance(voltage, int) else voltage
        polyline.add_to(feature_groups[group_key])

        # 송전탑 아이콘 표시 (선 위 일정 간격)
        _add_tower_icons(line["coords"], style["color"], feature_groups[group_key])


def _add_tower_icons(coords, color, feature_group):
    """송전선로 위에 송전탑 아이콘을 일정 간격으로 배치"""
    tower_svg = f"""
    <svg width="16" height="20" viewBox="0 0 16 20" xmlns="http://www.w3.org/2000/svg">
        <line x1="8" y1="0" x2="8" y2="20" stroke="{color}" stroke-width="1.5"/>
        <line x1="2" y1="4" x2="14" y2="4" stroke="{color}" stroke-width="1.5"/>
        <line x1="3" y1="8" x2="13" y2="8" stroke="{color}" stroke-width="1.2"/>
        <line x1="4" y1="4" x2="2" y2="8" stroke="{color}" stroke-width="0.8"/>
        <line x1="12" y1="4" x2="14" y2="8" stroke="{color}" stroke-width="0.8"/>
        <line x1="5" y1="8" x2="3" y2="20" stroke="{color}" stroke-width="0.8"/>
        <line x1="11" y1="8" x2="13" y2="20" stroke="{color}" stroke-width="0.8"/>
    </svg>"""

    icon = folium.DivIcon(
        html=f'<div style="opacity:0.8;">{tower_svg}</div>',
        icon_size=(16, 20),
        icon_anchor=(8, 10),
    )

    # 좌표 포인트 중 중간 지점들에 탑 아이콘 배치 (양 끝 제외)
    for i in range(1, len(coords) - 1):
        folium.Marker(
            location=coords[i],
            icon=icon,
            tooltip="송전탑",
        ).add_to(feature_group)


def add_legend(m):
    """범례 HTML 추가"""
    legend_items = ""
    for voltage, style in VOLTAGE_STYLES.items():
        label = style["label"]
        color = style["color"]
        legend_items += f"""
        <div style="display:flex;align-items:center;margin:4px 0;">
            <svg width="40" height="4" style="margin-right:8px;">
                <line x1="0" y1="2" x2="40" y2="2" stroke="{color}"
                      stroke-width="3" stroke-dasharray="{style['dash_array']}"/>
            </svg>
            <span>{label}</span>
        </div>"""

    facility_items = ""
    for key, style in FACILITY_ICONS.items():
        if key.startswith("substation"):
            facility_items += f"""
            <div style="display:flex;align-items:center;margin:3px 0;">
                <span style="color:{style['color']};font-size:14px;margin-right:8px;">&#9679;</span>
                <span>{style['label']}</span>
            </div>"""
        elif key == "city":
            facility_items += f"""
            <div style="display:flex;align-items:center;margin:3px 0;">
                <span style="color:steelblue;font-size:14px;margin-right:8px;">&#9632;</span>
                <span>{style['label']}</span>
            </div>"""

    legend_html = f"""
    <div style="
        position:fixed; bottom:30px; left:10px; z-index:1000;
        background:white; border:2px solid #888; border-radius:8px;
        padding:12px 16px; font-family:'Malgun Gothic',sans-serif;
        font-size:12px; box-shadow:0 2px 8px rgba(0,0,0,0.2);
        max-height:60vh; overflow-y:auto;">
        <div style="font-weight:700;font-size:14px;margin-bottom:8px;
                     border-bottom:1px solid #ddd;padding-bottom:6px;">
            &#9889; 범례
        </div>
        <div style="font-weight:600;margin:6px 0 4px;">송전선로</div>
        {legend_items}
        <div style="font-weight:600;margin:10px 0 4px;">시설물</div>
        <div style="display:flex;align-items:center;margin:3px 0;">
            <span style="color:red;font-size:14px;margin-right:8px;">&#9889;</span>
            <span>발전소</span>
        </div>
        {facility_items}
        <div style="margin-top:10px;padding-top:6px;border-top:1px solid #ddd;
                     color:#888;font-size:10px;">
            * 교육/참고용 가상 데이터입니다
        </div>
    </div>"""

    m.get_root().html.add_child(folium.Element(legend_html))


def add_title(m):
    """지도 제목 추가"""
    title_html = """
    <div style="
        position:fixed; top:10px; left:50%; transform:translateX(-50%);
        z-index:1000; background:rgba(30,58,95,0.9); color:white;
        padding:10px 24px; border-radius:8px; font-family:'Malgun Gothic',sans-serif;
        box-shadow:0 2px 8px rgba(0,0,0,0.3); text-align:center;">
        <div style="font-size:18px;font-weight:700;">&#9889; 대한민국 전력 송전망 개념도</div>
        <div style="font-size:11px;opacity:0.8;margin-top:4px;">
            교육/참고 목적 | 실제 송전망 위치와 다를 수 있음
        </div>
    </div>"""
    m.get_root().html.add_child(folium.Element(title_html))


# ============================================================
# 메인 실행
# ============================================================

def build_map():
    """지도 생성 및 모든 레이어 추가"""
    m = folium.Map(
        location=[36.3, 127.8],
        zoom_start=7,
        tiles="cartodbpositron",
    )

    # 레이어 그룹 생성 (체크박스로 ON/OFF 가능)
    fg_plants = folium.FeatureGroup(name="발전소", show=True)
    fg_substations = folium.FeatureGroup(name="변전소", show=True)
    fg_cities = folium.FeatureGroup(name="주요 도시", show=True)

    line_groups = {
        "v765": folium.FeatureGroup(name="765kV 송전선로", show=True),
        "v345": folium.FeatureGroup(name="345kV 송전선로", show=True),
        "v154": folium.FeatureGroup(name="154kV 송전선로", show=True),
        "HVDC": folium.FeatureGroup(name="HVDC 직류송전", show=True),
    }

    # 데이터 추가
    add_power_plants(m, fg_plants)
    add_substations(m, fg_substations)
    add_cities(m, fg_cities)
    add_transmission_lines(m, line_groups)

    # 피처 그룹을 지도에 추가
    for fg in line_groups.values():
        fg.add_to(m)
    fg_plants.add_to(m)
    fg_substations.add_to(m)
    fg_cities.add_to(m)

    # 레이어 컨트롤 추가 (체크박스)
    folium.LayerControl(collapsed=False).add_to(m)

    # 범례 및 제목
    add_legend(m)
    add_title(m)

    # 미니맵 추가
    plugins.MiniMap(toggle_display=True, position="bottomright").add_to(m)

    return m


if __name__ == "__main__":
    m = build_map()
    output_file = "korea_grid_map.html"
    m.save(output_file)
    print(f"지도가 '{output_file}' 파일로 생성되었습니다.")
    print("웹 브라우저로 열어보세요.")
