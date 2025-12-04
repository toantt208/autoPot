import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE = '/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'API request failed');
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

// Events
export interface Event {
  id: string;
  crypto: string;
  name: string;
  slugPattern: string;
  tradingWindowSeconds: number;
  threshold: string;
  betAmountUsdc: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useEvents() {
  return useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: () => fetchApi('/events'),
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Event>) =>
      fetchApi<Event>('/events', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Event> & { id: string }) =>
      fetchApi<Event>(`/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useToggleEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      fetchApi<Event>(`/events/${id}/toggle`, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      fetchApi(`/events/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

// Trades
export interface Trade {
  id: string;
  eventId: string;
  marketSlug: string;
  windowStart: string;
  windowEnd: string;
  side: string;
  tokenId: string;
  betAmount: string;
  entryPrice: string;
  status: string;
  orderId?: string;
  transactionHash?: string;
  outcome?: string;
  payout?: string;
  errorMessage?: string;
  retryCount: number;
  createdAt: string;
  executedAt?: string;
  resolvedAt?: string;
  event?: Event;
}

export interface TradesResponse {
  data: Trade[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useTrades(page: number = 1, limit: number = 50) {
  return useQuery<TradesResponse>({
    queryKey: ['trades', page, limit],
    queryFn: () => fetchApi(`/trades?page=${page}&limit=${limit}`),
  });
}

export interface TradeStats {
  total: number;
  executed: number;
  failed: number;
  pending: number;
  outcomes: Record<string, number>;
  today: {
    count: number;
    totalPayout: number;
  };
}

export function useTradeStats() {
  return useQuery<TradeStats>({
    queryKey: ['trade-stats'],
    queryFn: () => fetchApi('/trades/stats'),
    refetchInterval: 30000,
  });
}

// Queue
export interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}

export function useQueueStats() {
  return useQuery<QueueStats>({
    queryKey: ['queue-stats'],
    queryFn: () => fetchApi('/queue/stats'),
    refetchInterval: 5000,
  });
}

export interface QueueJob {
  id: string;
  name: string;
  data: {
    eventId: string;
    crypto: string;
    marketSlug: string;
    windowStart: number;
    windowEnd: number;
    tradingWindowSeconds: number;
    threshold: number;
    betAmountUsdc: number;
  };
  timestamp: number;
  processedOn?: number;
  finishedOn?: number;
  delay?: number;
  failedReason?: string;
}

export function useQueueJobs(status: string = 'waiting') {
  return useQuery<QueueJob[]>({
    queryKey: ['queue-jobs', status],
    queryFn: () => fetchApi(`/queue/jobs?status=${status}`),
    refetchInterval: 5000,
  });
}

// Workers
export interface Worker {
  id: string;
  status: string;
  concurrency: string;
  currentJob?: string;
  marketSlug?: string;
  crypto?: string;
  startedAt?: number;
  updatedAt?: number;
}

export function useWorkers() {
  return useQuery<Worker[]>({
    queryKey: ['workers'],
    queryFn: () => fetchApi('/workers'),
    refetchInterval: 5000,
  });
}

// Health
export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => fetchApi('/health'),
    refetchInterval: 10000,
  });
}
