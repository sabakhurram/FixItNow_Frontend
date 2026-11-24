import { useCallback, useEffect, useState } from 'react';
import { fetchPublicProducts } from '../api/productApi';

export default function useProducts() {
  const [state, setState] = useState({ products: [], status: 'loading', error: '' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let ignore = false;
    setState((s) => ({ ...s, status: 'loading', error: '' }));

    fetchPublicProducts()
      .then((data) => {
        if (!ignore) {
          setState({ products: Array.isArray(data) ? data : [], status: 'success', error: '' });
        }
      })
      .catch((err) => {
        console.error('Public products fetch error:', err);
        if (!ignore) {
          setState({ products: [], status: 'error', error: err.message || 'Unable to load products.' });
        }
      });

    return () => { ignore = true; };
  }, [attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, retry };
}