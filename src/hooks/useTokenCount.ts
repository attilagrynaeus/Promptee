// src/hooks/useTokenCount.ts
import { useEffect, useState } from 'react';
import { tokensOf } from 'utils/tokenCounter';

export default function useTokenCount(text: string, delay: number = 120): number {
  const [tokens, setTokens] = useState<number>(() => tokensOf(text));

  useEffect(() => {
    const handle = setTimeout(() => {
      const schedule = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 0));
      schedule(() => setTokens(tokensOf(text)));
    }, delay);

    return () => clearTimeout(handle);
  }, [text, delay]);

  return tokens;
}