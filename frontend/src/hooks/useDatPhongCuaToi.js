import { useCallback, useEffect, useState } from 'react';
import { layDatPhongCuaToiApi } from '../services/datPhongApi';

export function useDatPhongCuaToi(user) {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(user));
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!user) {
      setBookings([]);
      setIsLoading(false);
      setError('');
      return [];
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await layDatPhongCuaToiApi();
      const nextBookings = Array.isArray(data) ? data : [];
      setBookings(nextBookings);
      return nextBookings;
    } catch (apiError) {
      const message = apiError?.response?.data?.message || 'Không tải được dữ liệu đặt phòng từ MySQL.';
      setError(message);
      setBookings([]);
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh().catch(() => undefined);
  }, [refresh]);

  return {
    bookings,
    error,
    isLoading,
    refresh,
    setRemoteBookings: setBookings,
  };
}
