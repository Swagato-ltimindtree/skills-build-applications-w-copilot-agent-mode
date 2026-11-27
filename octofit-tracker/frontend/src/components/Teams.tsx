import { useCallback } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';
import type { CapabilityItem } from './CapabilityCard.js';
import { useCapabilityData } from './useCapabilityData.js';

export default function Teams() {
  const request = useCallback(
    () => getJson<{ teams: CapabilityItem[] }>('/api/teams').then(({ teams }) => teams),
    [],
  );
  const state = useCapabilityData(request);
  return <CapabilityCard title="Teams" description="Manage teams and members." emptyMessage="No teams yet." {...state} />;
}
