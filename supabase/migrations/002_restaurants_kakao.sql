-- restaurants 테이블에 kakao_id 컬럼 추가 및 기존 naver_id 대체
-- Supabase SQL Editor에서 실행

-- 1. kakao_id 컬럼 추가 (이미 있으면 무시)
ALTER TABLE restaurants 
  ADD COLUMN IF NOT EXISTS kakao_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS naver_url TEXT;

-- 2. name 컬럼 존재 확인 (기존 테이블 구조에 따라 조정)
-- restaurants 테이블이 아직 없다면 전체 생성:
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  address TEXT,
  phone TEXT,
  kakao_id TEXT UNIQUE,
  naver_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS 활성화 (이미 설정된 경우 무시)
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- 4. 모든 인증 유저가 읽기 가능
CREATE POLICY IF NOT EXISTS "restaurants_read_all" ON restaurants
  FOR SELECT USING (true);

-- 5. 인증 유저만 upsert 가능
CREATE POLICY IF NOT EXISTS "restaurants_insert_auth" ON restaurants
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "restaurants_update_auth" ON restaurants
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 6. 인덱스
CREATE INDEX IF NOT EXISTS idx_restaurants_kakao_id ON restaurants(kakao_id);
