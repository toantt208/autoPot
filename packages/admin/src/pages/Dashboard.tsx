import { useCallback } from 'react';
import { useTradeStats, useQueueStats, useWorkers, useHealth } from '../hooks/useApi';
import { useSocket, useSocketEvent } from '../hooks/useSocket';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: 'green' | 'red' | 'blue' | 'yellow';
}

function StatCard({ title, value, subtitle, color = 'blue' }: StatCardProps) {
  const colorClasses = {
    green: 'border-green-500 bg-green-500/10',
    red: 'border-red-500 bg-red-500/10',
    blue: 'border-blue-500 bg-blue-500/10',
    yellow: 'border-yellow-500 bg-yellow-500/10',
  };

  return (
    <div className={`rounded-lg border-l-4 p-4 bg-gray-800 ${colorClasses[color]}`}>
      <h3 className="text-sm text-gray-400">{title}</h3>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { isConnected } = useSocket();
  const { data: health } = useHealth();
  const { data: tradeStats, refetch: refetchTradeStats } = useTradeStats();
  const { data: queueStats, refetch: refetchQueueStats } = useQueueStats();
  const { data: workers, refetch: refetchWorkers } = useWorkers();

  // Real-time updates
  const handleTradeExecuted = useCallback(() => {
    refetchTradeStats();
  }, [refetchTradeStats]);

  const handleQueueUpdate = useCallback(() => {
    refetchQueueStats();
  }, [refetchQueueStats]);

  const handleWorkerUpdate = useCallback(() => {
    refetchWorkers();
  }, [refetchWorkers]);

  useSocketEvent('trade:executed', handleTradeExecuted);
  useSocketEvent('queue:update', handleQueueUpdate);
  useSocketEvent('worker:job:started', handleWorkerUpdate);
  useSocketEvent('worker:job:completed', handleWorkerUpdate);

  const activeWorkers = workers?.filter(w => w.status === 'running').length || 0;
  const idleWorkers = workers?.filter(w => w.status === 'idle').length || 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-400">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Trade Stats */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-300">Trade Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Trades"
            value={tradeStats?.total || 0}
            color="blue"
          />
          <StatCard
            title="Executed"
            value={tradeStats?.executed || 0}
            subtitle={`${((tradeStats?.executed || 0) / Math.max(tradeStats?.total || 1, 1) * 100).toFixed(1)}% success`}
            color="green"
          />
          <StatCard
            title="Failed"
            value={tradeStats?.failed || 0}
            color="red"
          />
          <StatCard
            title="Today's Trades"
            value={tradeStats?.today?.count || 0}
            subtitle={`$${tradeStats?.today?.totalPayout || 0} payout`}
            color="yellow"
          />
        </div>
      </section>

      {/* Queue Stats */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-300">Queue Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Waiting"
            value={queueStats?.waiting || 0}
            color="yellow"
          />
          <StatCard
            title="Delayed"
            value={queueStats?.delayed || 0}
            color="blue"
          />
          <StatCard
            title="Active"
            value={queueStats?.active || 0}
            color="green"
          />
          <StatCard
            title="Completed"
            value={queueStats?.completed || 0}
            color="green"
          />
          <StatCard
            title="Failed"
            value={queueStats?.failed || 0}
            color="red"
          />
        </div>
      </section>

      {/* Worker Stats */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-300">Workers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Workers"
            value={workers?.length || 0}
            color="blue"
          />
          <StatCard
            title="Active"
            value={activeWorkers}
            color="green"
          />
          <StatCard
            title="Idle"
            value={idleWorkers}
            color="yellow"
          />
        </div>
      </section>

      {/* Outcome Stats */}
      {tradeStats?.outcomes && Object.keys(tradeStats.outcomes).length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-300">Trade Outcomes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Won"
              value={tradeStats.outcomes.won || 0}
              color="green"
            />
            <StatCard
              title="Lost"
              value={tradeStats.outcomes.lost || 0}
              color="red"
            />
            <StatCard
              title="Pending"
              value={tradeStats.outcomes.pending || 0}
              color="yellow"
            />
          </div>
        </section>
      )}

      {/* Active Workers List */}
      {workers && workers.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4 text-gray-300">Worker Details</h2>
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm">Worker ID</th>
                  <th className="px-4 py-3 text-left text-sm">Status</th>
                  <th className="px-4 py-3 text-left text-sm">Current Job</th>
                  <th className="px-4 py-3 text-left text-sm">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {workers.map((worker) => (
                  <tr key={worker.id}>
                    <td className="px-4 py-3 text-sm font-mono">{worker.id}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        worker.status === 'running'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {worker.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {worker.marketSlug ? (
                        <span className="font-mono text-blue-400">{worker.marketSlug}</span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {worker.updatedAt ? new Date(worker.updatedAt).toLocaleTimeString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
