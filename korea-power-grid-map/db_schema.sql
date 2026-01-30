-- ============================================================
-- 대한민국 전력 송전망 데이터베이스 스키마
-- PostgreSQL + PostGIS 기준 설계
-- ============================================================
-- 실제 데이터를 관리한다면 이 구조를 사용합니다.
-- PostGIS는 지리정보(좌표, 선형) 저장에 필수입니다.
--
-- 설치: CREATE EXTENSION postgis;
-- ============================================================

-- 1. 발전소 --------------------------------------------------
CREATE TABLE power_plants (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,          -- 고리원자력발전소
    name_en         VARCHAR(100),                   -- Kori Nuclear Power Plant
    plant_type      VARCHAR(20) NOT NULL,           -- nuclear, coal, lng, hydro, wind, solar
    capacity_mw     NUMERIC(10,2),                  -- 총 설비용량 (MW)
    unit_count      INTEGER,                        -- 발전기 호기 수
    operator        VARCHAR(100),                   -- 한국수력원자력, 한국동서발전 등
    status          VARCHAR(20) DEFAULT 'operating',-- operating, construction, decommissioned
    commissioned_at DATE,                           -- 최초 준공일
    address         VARCHAR(200),                   -- 부산광역시 기장군 장안읍
    location        GEOMETRY(Point, 4326),          -- PostGIS 좌표 (WGS84)
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_power_plants_type ON power_plants(plant_type);
CREATE INDEX idx_power_plants_location ON power_plants USING GIST(location);

-- 2. 변전소 --------------------------------------------------
CREATE TABLE substations (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,          -- 신안성변전소
    name_en         VARCHAR(100),                   -- Shin-Anseong Substation
    voltage_kv      INTEGER NOT NULL,               -- 765, 345, 154
    capacity_mva    NUMERIC(10,2),                  -- 변압기 용량 (MVA)
    sub_type        VARCHAR(20) DEFAULT 'GIS',      -- GIS(가스절연), AIS(기중절연)
    regional_hq     VARCHAR(50),                    -- 소속 지역본부 (경기본부 등)
    status          VARCHAR(20) DEFAULT 'operating',
    commissioned_at DATE,
    address         VARCHAR(200),
    location        GEOMETRY(Point, 4326),
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_substations_voltage ON substations(voltage_kv);
CREATE INDEX idx_substations_location ON substations USING GIST(location);

-- 3. 송전선로 (구간 단위) ------------------------------------
CREATE TABLE transmission_lines (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,          -- 서해안 765kV 1회선
    voltage_kv      INTEGER NOT NULL,               -- 765, 345, 154
    line_type       VARCHAR(20) DEFAULT 'overhead',  -- overhead(가공), underground(지중), submarine(해저)
    circuit_count   INTEGER DEFAULT 2,              -- 회선 수
    length_km       NUMERIC(8,2),                   -- 선로 연장 (km)
    conductor_type  VARCHAR(50),                    -- 도체 종류 (ACSR 410mm² 등)
    from_facility   INTEGER,                        -- 시작 시설 ID (FK는 아래 참조)
    from_type       VARCHAR(20),                    -- power_plant 또는 substation
    to_facility     INTEGER,                        -- 종점 시설 ID
    to_type         VARCHAR(20),
    status          VARCHAR(20) DEFAULT 'operating',
    commissioned_at DATE,
    route           GEOMETRY(LineString, 4326),     -- PostGIS 선형 (경로 좌표)
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- 참고: from_facility/to_facility는 다형성 FK입니다.
-- 엄격한 정규화가 필요하면 별도 연결 테이블을 사용합니다 (아래 참조).

CREATE INDEX idx_tl_voltage ON transmission_lines(voltage_kv);
CREATE INDEX idx_tl_route ON transmission_lines USING GIST(route);

-- 4. 송전탑 (철탑) -------------------------------------------
CREATE TABLE transmission_towers (
    id              SERIAL PRIMARY KEY,
    line_id         INTEGER NOT NULL REFERENCES transmission_lines(id),
    tower_number    VARCHAR(20),                    -- 철탑 번호 (예: #032)
    tower_type      VARCHAR(30),                    -- 직선형, 각도형, 내장형 등
    height_m        NUMERIC(6,2),                   -- 철탑 높이 (m)
    location        GEOMETRY(Point, 4326),
    installed_at    DATE,
    last_inspected  DATE,                           -- 최근 점검일
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_towers_line ON transmission_towers(line_id);
CREATE INDEX idx_towers_location ON transmission_towers USING GIST(location);

-- 5. HVDC 연계선 (직류 송전, 별도 관리) ----------------------
CREATE TABLE hvdc_links (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,          -- 해남-제주 HVDC #1
    capacity_mw     NUMERIC(10,2),                  -- 전송 용량 (MW)
    voltage_kv      INTEGER,                        -- DC 전압 (±250kV 등)
    cable_type      VARCHAR(30),                    -- submarine, underground
    length_km       NUMERIC(8,2),
    converter_from  VARCHAR(100),                   -- 해남 변환소
    converter_to    VARCHAR(100),                   -- 제주 변환소
    status          VARCHAR(20) DEFAULT 'operating',
    commissioned_at DATE,
    route           GEOMETRY(LineString, 4326),
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_hvdc_route ON hvdc_links USING GIST(route);

-- 6. 지역별 전력 수급 통계 -----------------------------------
CREATE TABLE regional_power_stats (
    id              SERIAL PRIMARY KEY,
    region_name     VARCHAR(50) NOT NULL,           -- 서울, 경기, 충남 등
    year            INTEGER NOT NULL,
    demand_mw       NUMERIC(10,2),                  -- 최대 전력 수요 (MW)
    supply_mw       NUMERIC(10,2),                  -- 공급 가능 용량 (MW)
    reserve_rate    NUMERIC(5,2),                   -- 예비율 (%)
    population      INTEGER,
    created_at      TIMESTAMP DEFAULT NOW(),
    UNIQUE(region_name, year)
);

-- 7. 정비/점검 이력 ------------------------------------------
CREATE TABLE maintenance_logs (
    id              SERIAL PRIMARY KEY,
    facility_type   VARCHAR(30) NOT NULL,           -- transmission_line, substation, tower
    facility_id     INTEGER NOT NULL,
    work_type       VARCHAR(50),                    -- 정기점검, 긴급보수, 교체
    description     TEXT,
    started_at      TIMESTAMP,
    completed_at    TIMESTAMP,
    worker_team     VARCHAR(100),
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_maint_facility ON maintenance_logs(facility_type, facility_id);

-- ============================================================
-- 관계도 (ERD 요약)
-- ============================================================
--
--  power_plants ──┐
--                 ├──→ transmission_lines ──→ transmission_towers
--  substations ───┘          │
--                            │
--  hvdc_links (독립)         │
--                            ▼
--                   maintenance_logs
--
--  regional_power_stats (독립 통계)
--
-- ============================================================
-- 사용 예시 쿼리
-- ============================================================

-- 765kV 송전선로 전체 조회 (GeoJSON 변환)
-- SELECT id, name, length_km,
--        ST_AsGeoJSON(route) AS geojson
-- FROM transmission_lines
-- WHERE voltage_kv = 765 AND status = 'operating';

-- 특정 변전소 반경 50km 내 발전소 검색
-- SELECT p.name, p.plant_type, p.capacity_mw,
--        ST_Distance(p.location::geography, s.location::geography) / 1000 AS dist_km
-- FROM power_plants p, substations s
-- WHERE s.name = '신안성변전소'
--   AND ST_DWithin(p.location::geography, s.location::geography, 50000)
-- ORDER BY dist_km;

-- 지역별 발전 용량 합계
-- SELECT s.regional_hq, SUM(p.capacity_mw) AS total_mw
-- FROM power_plants p
-- JOIN substations s ON ST_DWithin(p.location, s.location, 0.5)
-- GROUP BY s.regional_hq
-- ORDER BY total_mw DESC;
