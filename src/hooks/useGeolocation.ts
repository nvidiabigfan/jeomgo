'use client';

import { useState, useEffect } from 'react';

interface Coords {
  lat: number;
  lng: number;
}

interface GeolocationState {
  coords: Coords | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ coords: null, error: '위치 서비스를 지원하지 않는 브라우저입니다.', loading: false });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          error: null,
          loading: false,
        });
      },
      (err) => {
        // 위치 거부 시 서울 시청 기본 좌표
        setState({
          coords: { lat: 37.5665, lng: 126.978 },
          error: '위치 권한이 거부되어 기본 위치(서울 시청)를 사용합니다.',
          loading: false,
        });
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  return state;
}
