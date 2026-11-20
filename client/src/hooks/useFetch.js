import { useCallback, useEffect, useState } from 'react';

/**
 * Custom Hook 2: useFetch
 * Quản lý trạng thái loading, error, data khi gọi API bất đồng bộ kèm cleanup.
 */
export const useFetch = (fetcher, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const execute = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const result = await fetcher();
        if (isMounted) setData(result);
      } catch (err) {
        if (isMounted) setError(err.message || 'Không thể tải dữ liệu.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    run();

    return () => {
      isMounted = false;
    };
  }, [execute]);

  return { data, loading, error, refetch: execute };
};
