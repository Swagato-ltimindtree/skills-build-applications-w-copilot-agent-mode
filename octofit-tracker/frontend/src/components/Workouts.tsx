import { useCallback } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';
import type { CapabilityItem } from './CapabilityCard.js';
import { useCapabilityData } from './useCapabilityData.js';

export default function Workouts() {
  const userEmail = encodeURIComponent('mona@example.com');
  const request = useCallback(
    () => getJson<{ suggestions: CapabilityItem[] }>(`/api/workouts/suggestions/${userEmail}`).then(({ suggestions }) => suggestions),
    [userEmail],
  );
  const state = useCapabilityData(request);
  return <CapabilityCard title="Workout suggestions" description="Recommend workouts from activity patterns." emptyMessage="No workout suggestions yet." {...state} />;
}
