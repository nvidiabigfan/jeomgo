'use client';

import { useState, useEffect, useCallback } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import RestaurantCard from './RestaurantCard';
import RestaurantMap from './RestaurantMap';
import Script from 'next/script';

interface Restaurant {
  id: string;
  title: string;
  category: string;
  address: string;
  roadAddress: string;
  telephone: string;
  link: string;
  mapx: string;
  mapy: string;
}

interface Props {
  userId: string;
  displayName: string;
  email: string;
}

const CATEGORY_OPTIONS = [
  { label: '🍽️ 전체', value: '' },
  { label: '🍱 한식', value: '한식' },
  { label: '🍜 중식', value: '중식' },
  { label: '🍣 일식', value: '일식' },
  { label: '🍕 양식', value: '양식' },
  { label: '🌮 분식', value: '분식' },
  { label: '☕ 카페', value: '카페' },
];

export default function RestaurantDashboard({ userId, displayName, email }: Props) {
  const { coords, error: geoError, loading: geoLoading } = useGeolocation();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [radius, setRadius] = useState(500);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [recommended, setRecommended] = useState<Restaurant | null>(null);
  const [mapScriptLoaded, setMapScriptLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');

  // 식당 검색
  const fetchRestaurants = useCallback(async (category: string, r?: number) => {
    if (!coords) return;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        query: category || '점심',
        lat: String(coords.lat),
        lng: String(coords.lng),
        size: '15',
        radius: String(r ?? radius),
      });
      const res = await fetch(`/api/restaurants?${params}`);
      if (!res.ok) throw new Error('식당 정보를 불러오지 못했습니다.');
      const data = await res.json();
      setRestaurants(data.items || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [coords, radius]);

  // 위치 확보 후 자동 검색
  useEffect(() => {
    if (coords) {
      fetchRestaurants(selectedCategory);
    }
  }, [coords]); // coords 확보 시 1회

  // 카테고리 변경 시 재검색
  function handleCategoryChange(value: string) {
    setSelectedCategory(value);
    fetchRestaurants(value);
  }

  // 반경 변경 시 재검색 (슬라이더 놓을 때)
  function handleRadiusChange(value: number) {
    setRadius(value);
    fetchRestaurants(selectedCategory, value);
  }

  // 랜덤 추천
  function handleRandom() {
    if (restaurants.length === 0) return;
    const pick = restaurants[Math.floor(Math.random() * restaurants.length)];
    setRecommended(pick);
    setSelectedId(pick.id);
    setActiveTab('map'); // 지도 탭으로 이동
  }

  const naverMapsClientId = process.env.NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID;

  return (
    <>
      {/* 네이버 지도 SDK */}
      <Script
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${naverMapsClientId}`}
        onLoad={() => setMapScriptLoaded(true)}
        strategy="afterInteractive"
      />

      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">🍱 점고</h1>
              <p className="text-xs text-gray-400">{displayName}님, 오늘 점심은요?</p>
            </div>
            <button
              onClick={handleRandom}
              disabled={loading || restaurants.length === 0}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-200 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors shadow-sm"
            >
              🎲 랜덤 추천
            </button>
          </div>
        </header>

        <div className="max-w-md mx-auto px-4 py-4 space-y-4">
          {/* 위치 상태 */}
          {geoLoading && (
            <div className="bg-blue-50 text-blue-600 text-xs rounded-xl p-3 flex items-center gap-2">
              <span className="animate-spin">📍</span> 현재 위치를 확인하는 중...
            </div>
          )}
          {geoError && (
            <div className="bg-yellow-50 text-yellow-700 text-xs rounded-xl p-3">
              ⚠️ {geoError}
            </div>
          )}

          {/* 랜덤 추천 결과 배너 */}
          {recommended && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-4 text-white shadow-md">
              <div className="text-xs font-medium opacity-80 mb-1">🎲 오늘의 추천</div>
              <div className="font-bold text-lg">{recommended.title}</div>
              <div className="text-sm opacity-90 mt-1">{recommended.category}</div>
              <div className="text-xs opacity-75 mt-1">📍 {recommended.roadAddress || recommended.address}</div>
              <button
                onClick={() => setRecommended(null)}
                className="mt-2 text-xs underline opacity-75 hover:opacity-100"
              >
                닫기
              </button>
            </div>
          )}

          {/* 카테고리 필터 */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleCategoryChange(opt.value)}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors font-medium ${
                  selectedCategory === opt.value
                    ? 'bg-green-500 text-white border-green-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* 반경 슬라이더 */}
          <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">📍 검색 반경</span>
              <span className="text-xs font-bold text-green-600">
                {radius >= 1000 ? `${(radius / 1000).toFixed(1)}km` : `${radius}m`}
              </span>
            </div>
            <input
              type="range"
              min={100}
              max={2000}
              step={100}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              onMouseUp={(e) => handleRadiusChange(Number((e.target as HTMLInputElement).value))}
              onTouchEnd={(e) => handleRadiusChange(Number((e.target as HTMLInputElement).value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer
                bg-gradient-to-r from-green-400 to-green-500
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-white
                [&::-webkit-slider-thumb]:border-2
                [&::-webkit-slider-thumb]:border-green-500
                [&::-webkit-slider-thumb]:shadow-md"
            />
            <div className="flex justify-between text-[10px] text-gray-300 mt-1">
              <span>100m</span>
              <span>500m</span>
              <span>1km</span>
              <span>1.5km</span>
              <span>2km</span>
            </div>
          </div>

          {/* 탭 */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('list')}
              className={`flex-1 text-sm py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              목록
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`flex-1 text-sm py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'map' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              지도
            </button>
          </div>

          {/* 로딩 */}
          {loading && (
            <div className="text-center py-8 text-gray-400 text-sm">
              <div className="animate-bounce text-2xl mb-2">🍽️</div>
              주변 식당을 찾는 중...
            </div>
          )}

          {/* 에러 */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl p-4 text-center">
              {error}
              <button
                onClick={() => fetchRestaurants(selectedCategory)}
                className="block mx-auto mt-2 text-xs underline"
              >
                다시 시도
              </button>
            </div>
          )}

          {/* 지도 탭 */}
          {activeTab === 'map' && coords && mapScriptLoaded && (
            <RestaurantMap
              restaurants={restaurants}
              centerLat={coords.lat}
              centerLng={coords.lng}
              selectedId={selectedId}
              onMarkerClick={(id) => {
                setSelectedId(id);
                setActiveTab('list');
              }}
            />
          )}
          {activeTab === 'map' && (!coords || !mapScriptLoaded) && (
            <div className="bg-gray-100 rounded-2xl h-64 flex items-center justify-center text-gray-400 text-sm">
              지도를 불러오는 중...
            </div>
          )}

          {/* 목록 탭 */}
          {activeTab === 'list' && !loading && restaurants.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-gray-400">
                주변 식당 {restaurants.length}개
              </p>
              {restaurants.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className={selectedId === r.id ? 'ring-2 ring-green-400 rounded-2xl' : ''}
                >
                  <RestaurantCard
                    restaurant={r}
                    userId={userId}
                  />
                </div>
              ))}
            </div>
          )}

          {/* 빈 상태 */}
          {activeTab === 'list' && !loading && restaurants.length === 0 && coords && !error && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-3">🍽️</div>
              <p className="text-sm">주변 식당 정보를 불러오지 못했습니다.</p>
              <button
                onClick={() => fetchRestaurants(selectedCategory)}
                className="mt-3 text-xs text-green-600 underline"
              >
                다시 불러오기
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
