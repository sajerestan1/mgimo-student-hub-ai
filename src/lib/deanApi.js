import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// Every dean-level screen reads the institutional summary from one authorised
// endpoint; nothing here queries records directly.
export async function fetchDeanData(action, params = {}) {
  const response = await base44.functions.invoke('deanData', { action, ...params });
  return response.data;
}

export function useDeanData(action, params = {}) {
  const [state, setState] = useState({ loading: true, data: null, error: null });
  const key = JSON.stringify(params);

  useEffect(() => {
    let active = true;
    setState((previous) => ({ ...previous, loading: true, error: null }));
    fetchDeanData(action, JSON.parse(key))
      .then((payload) => {
        if (!active) return;
        if (payload && payload.error) setState({ loading: false, data: null, error: payload.error });
        else setState({ loading: false, data: payload, error: null });
      })
      .catch((error) => {
        if (!active) return;
        setState({
          loading: false,
          data: null,
          error: error?.response?.data?.error || error?.message || 'The institutional dataset could not be opened',
        });
      });
    return () => {
      active = false;
    };
  }, [action, key]);

  return state;
}

export function useDebouncedValue(value, delay = 320) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export const nf = (value, digits = 1) =>
  value === null || value === undefined || Number.isNaN(Number(value)) ? '—' : Number(value).toFixed(digits);

export const pct = (value, digits = 1) =>
  value === null || value === undefined || Number.isNaN(Number(value)) ? '—' : `${Number(value).toFixed(digits)}%`;

export const num = (value) =>
  value === null || value === undefined ? '—' : Number(value).toLocaleString('en-GB');

export const RISK_LABELS = { high: 'High risk', medium: 'Watch list', low: 'On track' };

export const RISK_TONES = { high: 'critical', medium: 'warning', low: 'positive' };

export const EMPLOYMENT_LABELS = {
  full_time: 'Full time',
  part_time: 'Part time',
  visiting: 'Visiting',
};

export const STATUS_LABELS = {
  active: 'Active',
  academic_leave: 'Academic leave',
  monitoring: 'Monitoring',
  none: 'No intervention',
};

export function gradeTone(value) {
  if (value === null || value === undefined) return 'neutral';
  if (value < 60) return 'critical';
  if (value < 70) return 'warning';
  if (value >= 85) return 'positive';
  return 'brand';
}

export function rateTone(value) {
  if (value === null || value === undefined) return 'neutral';
  if (value < 65) return 'critical';
  if (value < 75) return 'warning';
  return 'positive';
}

export function readFilter(key) {
  return new URLSearchParams(window.location.search).get(key) || '';
}