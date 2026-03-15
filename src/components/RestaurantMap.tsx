'use client';

import { useEffect, useRef } from 'react';

interface Restaurant {
  id: string;
  title: string;
  mapx: string;
  mapy: string;
  address: string;
}

interface Props {
  restaurants: Restaurant[];
  centerLat: number;
  centerLng: number;
  selectedId?: string;
  onMarkerClick?: (id: string) => void;
}

declare global {
  interface Window {
    naver: any;
  }
}

export default function RestaurantMap({
  restaurants,
  centerLat,
  centerLng,
  selectedId,
  onMarkerClick,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // 지도 초기화
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || !window.naver) return;

      const center = new window.naver.maps.LatLng(centerLat, centerLng);
      mapInstanceRef.current = new window.naver.maps.Map(mapRef.current, {
        center,
        zoom: 15,
        scaleControl: false,
        logoControl: false,
        mapDataControl: false,
        zoomControl: true,
        zoomControlOptions: {
          position: window.naver.maps.Position.TOP_RIGHT,
        },
      });

      // 내 위치 마커 (파란 점)
      new window.naver.maps.Marker({
        position: center,
        map: mapInstanceRef.current,
        icon: {
          content: `<div style="
            width:16px; height:16px;
            background:#3b82f6; border-radius:50%;
            border:3px solid white;
            box-shadow:0 2px 6px rgba(59,130,246,0.5);
          "></div>`,
          anchor: new window.naver.maps.Point(8, 8),
        },
        title: '내 위치',
      });
    };

    // 네이버 지도 SDK 로드 확인
    if (window.naver?.maps) {
      initMap();
    } else {
      const checkInterval = setInterval(() => {
        if (window.naver?.maps) {
          clearInterval(checkInterval);
          initMap();
        }
      }, 200);
      return () => clearInterval(checkInterval);
    }
  }, [centerLat, centerLng]);

  // 마커 업데이트
  useEffect(() => {
    if (!mapInstanceRef.current || !window.naver?.maps) return;

    // 기존 마커 제거
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    restaurants.forEach((r) => {
      if (!r.mapx || !r.mapy) return;

      // 카카오 API는 WGS84 좌표 반환 (mapx=lng, mapy=lat)
      const coord = new window.naver.maps.LatLng(
        Number(r.mapy), // lat
        Number(r.mapx)  // lng
      );

      const isSelected = r.id === selectedId;
      const marker = new window.naver.maps.Marker({
        position: coord,
        map: mapInstanceRef.current,
        icon: {
          content: `<div style="
            background:${isSelected ? '#f97316' : '#22c55e'};
            color:white; font-size:11px; font-weight:600;
            padding:4px 8px; border-radius:12px;
            white-space:nowrap; max-width:80px;
            overflow:hidden; text-overflow:ellipsis;
            box-shadow:0 2px 8px rgba(0,0,0,0.2);
            border:2px solid white;
            cursor:pointer;
          ">${r.title.length > 8 ? r.title.slice(0, 8) + '…' : r.title}</div>`,
          anchor: new window.naver.maps.Point(30, 15),
        },
        title: r.title,
      });

      window.naver.maps.Event.addListener(marker, 'click', () => {
        onMarkerClick?.(r.id);
      });

      markersRef.current.push(marker);
    });
  }, [restaurants, selectedId, onMarkerClick]);

  return (
    <div
      ref={mapRef}
      className="w-full h-64 rounded-2xl overflow-hidden border border-gray-100"
      style={{ minHeight: '256px' }}
    />
  );
}
