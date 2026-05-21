import { useState } from 'react';
import {
  xoaTimKiemGanDay,
  docTimKiemGanDay,
  luuTimKiemGanDay,
} from '../utils/lichSuTimKiem';

function useTimKiemGanDay() {
  const [searches, setSearches] = useState(() => docTimKiemGanDay());

  const addSearch = (payload) => {
    const next = luuTimKiemGanDay(payload);
    setSearches(next);
  };

  const clearAll = () => {
    xoaTimKiemGanDay();
    setSearches([]);
  };

  return {
    searches,
    addSearch,
    clearAll,
  };
}

export default useTimKiemGanDay;
