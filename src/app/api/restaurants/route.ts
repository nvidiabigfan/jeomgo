import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '맛집';
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const size = searchParams.get('display') || '15';

  if (!lat || !lng) {
    return NextResponse.json({ error: '위치 정보가 필요합니다.' }, { status: 400 });
  }

  // 카카오 Local API - 키워드로 장소 검색
  // 반경 500m 이내 식당 검색
  const url = new URL('https://dapi.kakao.com/v2/local/search/keyword.json');
  url.searchParams.set('query', query === '점심' ? '맛집' : query);
  url.searchParams.set('category_group_code', 'FD6'); // 음식점 카테고리
  url.searchParams.set('x', lng);
  url.searchParams.set('y', lat);
  url.searchParams.set('radius', '500'); // 500m 반경
  url.searchParams.set('size', size);
  url.searchParams.set('sort', 'distance'); // 가까운 순

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}`,
    },
    cache: 'no-store', // 캐시 비활성화 (502 캐싱 방지)
  });

  if (!res.ok) {
    const errText = await res.text();
    return NextResponse.json(
      { error: '카카오 API 호출 실패', detail: errText, status: res.status },
      { status: 502 }
    );
  }

  const data = await res.json();

  // 카카오 응답 → 앱 형식으로 변환
  const items = (data.documents || []).map((doc: any) => ({
    id: doc.id,
    title: doc.place_name,
    category: doc.category_name.split(' > ').slice(-1)[0] || doc.category_name,
    address: doc.address_name,
    roadAddress: doc.road_address_name,
    telephone: doc.phone,
    link: doc.place_url,
    // WGS84 좌표 (네이버 지도에서 직접 사용 가능)
    mapx: doc.x, // lng
    mapy: doc.y, // lat
    distance: doc.distance, // 미터 단위
  }));

  return NextResponse.json({ items, total: data.meta?.total_count || items.length });
}
