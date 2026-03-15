'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

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
  restaurant: Restaurant;
  userId?: string;
  isFavorited?: boolean;
  myRating?: number;
  onFavoriteToggle?: (id: string, favorited: boolean) => void;
}

export default function RestaurantCard({
  restaurant,
  userId,
  isFavorited = false,
  myRating = 0,
  onFavoriteToggle,
}: Props) {
  const [favorited, setFavorited] = useState(isFavorited);
  const [rating, setRating] = useState(myRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 네이버 지도 링크 생성
  const naverMapUrl = restaurant.link ||
    `https://map.naver.com/v5/search/${encodeURIComponent(restaurant.title)}`;

  // 즐겨찾기 토글
  async function toggleFavorite() {
    if (!userId) return;
    setLoading(true);

    // DB에 restaurant 먼저 upsert
    const { data: dbRestaurant } = await supabase
      .from('restaurants')
      .upsert({
        name: restaurant.title,
        category: restaurant.category,
        address: restaurant.roadAddress || restaurant.address,
        phone: restaurant.telephone,
        kakao_id: restaurant.id,
        naver_url: restaurant.link,
      }, { onConflict: 'kakao_id' })
      .select('id')
      .single();

    if (!dbRestaurant) { setLoading(false); return; }

    if (favorited) {
      await supabase
        .from('favorites')
        .delete()
        .match({ user_id: userId, restaurant_id: dbRestaurant.id });
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: userId, restaurant_id: dbRestaurant.id });
    }

    setFavorited(!favorited);
    onFavoriteToggle?.(restaurant.id, !favorited);
    setLoading(false);
  }

  // 평점 저장
  async function saveRating(score: number) {
    if (!userId) return;
    setRating(score);

    const { data: dbRestaurant } = await supabase
      .from('restaurants')
      .upsert({
        name: restaurant.title,
        category: restaurant.category,
        address: restaurant.roadAddress || restaurant.address,
        phone: restaurant.telephone,
        kakao_id: restaurant.id,
        naver_url: restaurant.link,
      }, { onConflict: 'kakao_id' })
      .select('id')
      .single();

    if (!dbRestaurant) return;

    await supabase
      .from('ratings')
      .upsert({
        user_id: userId,
        restaurant_id: dbRestaurant.id,
        score,
      }, { onConflict: 'user_id,restaurant_id' });
  }

  const displayRating = hoverRating || rating;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <a
            href={naverMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gray-900 hover:text-green-600 truncate block text-sm"
          >
            {restaurant.title}
          </a>
          <span className="text-xs text-gray-400 mt-0.5 block">{restaurant.category}</span>
        </div>
        {/* 즐겨찾기 버튼 */}
        {userId && (
          <button
            onClick={toggleFavorite}
            disabled={loading}
            className="text-xl shrink-0 transition-transform active:scale-125"
            aria-label={favorited ? '즐겨찾기 해제' : '즐겨찾기 추가'}
          >
            {favorited ? '❤️' : '🤍'}
          </button>
        )}
      </div>

      {/* 주소 */}
      <p className="text-xs text-gray-500 mt-2 leading-relaxed">
        📍 {restaurant.roadAddress || restaurant.address}
      </p>
      {restaurant.telephone && (
        <p className="text-xs text-gray-500 mt-1">
          📞 <a href={`tel:${restaurant.telephone}`} className="hover:text-green-600">{restaurant.telephone}</a>
        </p>
      )}

      {/* 별점 */}
      {userId && (
        <div className="mt-3 flex items-center gap-1">
          <span className="text-xs text-gray-400 mr-1">내 평점</span>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => saveRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="text-lg leading-none transition-transform active:scale-125"
            >
              {star <= displayRating ? '⭐' : '☆'}
            </button>
          ))}
        </div>
      )}

      {/* 네이버 지도 링크 */}
      <a
        href={naverMapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium"
      >
        네이버 지도에서 보기 →
      </a>
    </div>
  );
}
