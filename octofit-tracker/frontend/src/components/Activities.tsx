import { useCallback } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';
import type { CapabilityItem } from './CapabilityCard.js';
import { useCapabilityData } from './useCapabilityData.js';

export default function Activities() {
  const request = useCallback(
    () => getJson<{ activities: CapabilityItem[] }>('/api/activities').then(({ activities }) => activities),
    [],
  );
  const state = useCapabilityData(request);
  return <CapabilityCard title="Activities" description="Track student activity minutes and points." emptyMessage="No activities yet." {...state} />;
}
