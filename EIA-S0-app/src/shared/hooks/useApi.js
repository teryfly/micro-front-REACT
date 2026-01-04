import { useState, useCallback } from 'react';

/**
 * Generic API call hook with loading and error states
 * Provides consistent pattern for async operations
 * 
 * @template T
 * @param {Function} apiFunc - API function to call
 * @param {boolean} [immediate=false] - Execute immediately on mount
 * @returns {{data: T|null, loading: boolean, error: Error|null, execute: Function}}
 * 
 * @example
 * const { data, loading, error, execute } = useApi(docTypeService.getAll);
 * useEffect(() => { execute(); }, [execute]);
 */
export const useApi = (apiFunc, immediate = false) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunc(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunc]);

  return { data, loading, error, execute };
};