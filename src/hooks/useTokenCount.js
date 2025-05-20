// src/hooks/useTokenCount.js
import { useEffect, useState } from 'react';
import { tokensOf } from '../lib/tokenCounter';

export default function useTokenCount(text, delay = 120) {
  const [tokens, setTokens] = useState(() => tokensOf(text));

  useEffect(() => {
    const handle = setTimeout(() => {
      const schedule = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 0));
      schedule(() => setTokens(tokensOf(text)));
    }, delay);

    return () => clearTimeout(handle);
  }, [text, delay]);

  return tokens;
}