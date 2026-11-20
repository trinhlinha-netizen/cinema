import { useEffect, useState } from 'react';

/**
 * Custom Hook 1: useDebounce
 * Trì hoãn giá trị tìm kiếm để tránh gọi API liên tục khi người dùng đang gõ.
 */
export const useDebounce = (value, delay = 400) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};
