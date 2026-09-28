import { useCallback, useEffect, useState } from 'react';

function useFetch(fetchFunction, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const result = await fetchFunction();

      setData(result);
      return result;
    } catch (err) {
      console.error('useFetch error:', err);

      setError(
        err?.message ||
          'Something went wrong while fetching data.'
      );

      setData(null);

      return null;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError('');

        const result = await fetchFunction();

        if (cancelled) {
          return;
        }

        setData(result);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error('useFetch error:', err);

        setError(
          err?.message ||
            'Something went wrong while fetching data.'
        );

        setData(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, dependencies);

  return {
    data,
    loading,
    error,
    refetch: execute,
  };
}

export default useFetch;