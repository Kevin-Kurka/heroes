'use client';

import { useEffect, useState } from 'react';
import { getRestaurantInfo } from '@/lib/menu';
import { isOpenNow } from '@/lib/hours';

/**
 * True when DoorDash ordering should be offered — i.e. the restaurant is currently
 * open per its posted hours. Starts false (SSR/first paint is hydration-safe) and
 * re-evaluates on mount and once a minute thereafter.
 */
export function useDoorDashAvailable(): boolean {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    const { hours } = getRestaurantInfo();
    const check = () => setAvailable(isOpenNow(hours));
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, []);

  return available;
}
