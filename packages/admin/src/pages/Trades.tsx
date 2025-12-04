import { useState, useCallback } from 'react';
import { useTrades, useTradeStats } from '../hooks/useApi';
import { useSocketEvent } from '../hooks/useSocket';

export default function Trades() {
  const [page, setPage] = useState(1);
  const { data: tradesData, isLoading, error, refetch } = useTrades(page, 50);
  const { data: stats } = useTradeStats();

  // Real-time updates
  const handleTradeExecuted = useCallback(() => {
    refetch();
  }, [refetch]);

  useSocketEvent('trade:executed', handleTradeExecuted);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'executed':
        return 'bg-green-500/20 text-green-400';
      case 'failed':
        return 'bg-red-500/20 text-red-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getOutcomeColor = (outcome?: string) => {
    switch (outcome) {
      case 'won':
        return 'bg-green-500/20 text-green-400';
      case 'lost':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading trades...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-400">Error loading trades: {error.message}</div>;
  }

  const { data: trades, pagination } = tradesData || { data: [], pagination: { page: 1, totalPages: 1, total: 0 } };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Trades</h1>
        <div className="text-sm text-gray-400">
          Total: {stats?.total || 0} | Won: {stats?.outcomes?.won || 0} | Lost: {stats?.outcomes?.lost || 0}
        </div>
      </div>

      {/* Trades Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm">Market</th>
              <th className="px-4 py-3 text-left text-sm">Side</th>
              <th className="px-4 py-3 text-left text-sm">Amount</th>
              <th className="px-4 py-3 text-left text-sm">Entry Price</th>
              <th className="px-4 py-3 text-left text-sm">Status</th>
              <th className="px-4 py-3 text-left text-sm">Outcome</th>
              <th className="px-4 py-3 text-left text-sm">Payout</th>
              <th className="px-4 py-3 text-left text-sm">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {trades.map((trade) => (
              <tr key={trade.id}>
                <td className="px-4 py-3 text-sm">
                  <div className="font-mono text-blue-400">{trade.marketSlug}</div>
                  {trade.transactionHash && (
                    <a
                      href={`https://polygonscan.com/tx/${trade.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-500 hover:text-gray-400"
                    >
                      {trade.transactionHash.slice(0, 10)}...
                    </a>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded text-xs ${
                    trade.side === 'UP'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {trade.side}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">${trade.betAmount}</td>
                <td className="px-4 py-3 text-sm">{(parseFloat(trade.entryPrice) * 100).toFixed(2)}%</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(trade.status)}`}>
                    {trade.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  {trade.outcome ? (
                    <span className={`px-2 py-1 rounded text-xs ${getOutcomeColor(trade.outcome)}`}>
                      {trade.outcome}
                    </span>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {trade.payout ? `$${trade.payout}` : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">
                  {new Date(trade.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
            {trades.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  No trades found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-400">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
