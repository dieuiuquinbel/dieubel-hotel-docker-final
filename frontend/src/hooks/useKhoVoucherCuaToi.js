import { useEffect, useState } from 'react';
import { layKhoVoucherApi } from '../services/voucherApi';

export function useKhoVoucherCuaToi(user) {
  const [vouchers, setVouchers] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(Boolean(user));
  const hasUser = Boolean(user?.id || user?.email);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(hasUser);
    setError('');

    layKhoVoucherApi()
      .then((data) => {
        if (isMounted && Array.isArray(data)) setVouchers(data);
      })
      .catch((apiError) => {
        if (!isMounted) return;
        setVouchers([]);
        setError(apiError?.response?.data?.message || 'Không tải được kho voucher từ MySQL.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [hasUser, user?.id, user?.email]);

  return [vouchers, setVouchers, error, isLoading];
}
