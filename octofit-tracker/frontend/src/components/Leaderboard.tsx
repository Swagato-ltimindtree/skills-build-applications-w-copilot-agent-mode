import { useCallback } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';
import type { CapabilityItem } from './CapabilityCard.js';
import { useCapabilityData } from './useCapabilityData.js';

export default function Leaderboard() {
  const request = useCallback(
    () => getJson<{ leaderboard: CapabilityItem[] }>('/api/leaderboard').then(({ leaderboard }) => leaderboard),
    [],
  );
  const state = useCapabilityData(request);
  return <CapabilityCard title="Leaderboard" description="Compare team point totals." emptyMessage="No leaderboard rankings yet." {...state} />;
}
