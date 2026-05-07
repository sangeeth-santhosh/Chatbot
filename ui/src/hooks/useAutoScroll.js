import { useEffect, useRef } from 'react';

export function useAutoScroll() {
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ block: 'end' });
  });

  return ref;
}
