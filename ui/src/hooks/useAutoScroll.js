import { useEffect, useRef } from 'react';

export function useAutoScroll() {
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);

  return ref;
}
