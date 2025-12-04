import { useState, useCallback } from 'react';
import { useWorkers, useQueueStats, useQueueJobs } from '../hooks/useApi';
import { useSocketEvent } from '../hooks/useSocket';

type JobStatus = 'waiting' | 'delayed' | 'active' | 'completed' | 'failed';

export default function Workers() {
  const [selectedJobStatus, setSelectedJobStatus] = useState<JobStatus>('delayed');
  const { data: workers, isLoading: workersLoading, refetch: refetchWorkers } = useWorkers();
  const { data: queueStats, refetch: refetchStats } = useQueueStats();
  const { data: jobs, isLoading: jobsLoading, refetch: refetchJobs } = useQueueJobs(selectedJobStatus);

  // Real-time updates
  const handleWorkerUpdate = useCallback(() => {
    refetchWorkers();
    refetchStats();
  }, [refetchWorkers, refetchStats]);

  const handleQueueUpdate = useCallback(() => {
    refetchStats();
    refetchJobs();
  }, [refetchStats, refetchJobs]);

  useSocketEvent('worker:job:started', handleWorkerUpdate);
  useSocketEvent('worker:job:completed', handleWorkerUpdate);
  useSocketEvent('worker:job:failed', handleWorkerUpdate);
  useSocketEvent('queue:stats', handleQueueUpdate);

  const jobStatusTabs: { id: JobStatus; label: string; count?: number }[] = [
    { id: 'delayed', label: 'Delayed', count: queueStats?.delayed },
    { id: 'waiting', label: 'Waiting', count: queueStats?.waiting },
    { id: 'active', label: 'Active', count: queueStats?.active },
    { id: 'completed', label: 'Completed', count: queueStats?.completed },
    { id: 'failed', label: 'Failed', count: queueStats?.failed },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Workers & Queue</h1>

      {/* Workers Section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-300">Active Workers</h2>
        {workersLoading ? (
          <div className="text-center py-4 text-gray-400">Loading workers...</div>
        ) : workers && workers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workers.map((worker) => (
              <div key={worker.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm">{worker.id}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    worker.status === 'running'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {worker.status}
                  </span>
                </div>
                <div className="text-sm text-gray-400 space-y-1">
                  <div>Concurrency: {worker.concurrency}</div>
                  {worker.currentJob && (
                    <div>Current: <span className="text-blue-400">{worker.marketSlug}</span></div>
                  )}
                  {worker.updatedAt && (
                    <div>Updated: {new Date(worker.updatedAt).toLocaleTimeString()}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400">
            No workers online. Start the worker service to process jobs.
          </div>
        )}
      </section>

      {/* Queue Stats */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-300">Queue Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-sm text-gray-400">Delayed</div>
            <div className="text-2xl font-bold text-blue-400">{queueStats?.delayed || 0}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-sm text-gray-400">Waiting</div>
            <div className="text-2xl font-bold text-yellow-400">{queueStats?.waiting || 0}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-sm text-gray-400">Active</div>
            <div className="text-2xl font-bold text-green-400">{queueStats?.active || 0}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-sm text-gray-400">Completed</div>
            <div className="text-2xl font-bold">{queueStats?.completed || 0}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-sm text-gray-400">Failed</div>
            <div className="text-2xl font-bold text-red-400">{queueStats?.failed || 0}</div>
          </div>
        </div>
      </section>

      {/* Jobs Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-300">Jobs</h2>
          <div className="flex gap-2">
            {jobStatusTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedJobStatus(tab.id)}
                className={`px-3 py-1 rounded text-sm ${
                  selectedJobStatus === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {tab.label} {tab.count !== undefined && `(${tab.count})`}
              </button>
            ))}
          </div>
        </div>

        {jobsLoading ? (
          <div className="text-center py-4 text-gray-400">Loading jobs...</div>
        ) : jobs && jobs.length > 0 ? (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm">Job ID</th>
                  <th className="px-4 py-3 text-left text-sm">Crypto</th>
                  <th className="px-4 py-3 text-left text-sm">Market</th>
                  <th className="px-4 py-3 text-left text-sm">Window End</th>
                  <th className="px-4 py-3 text-left text-sm">Delay/Process Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td className="px-4 py-3 text-sm font-mono">{job.id}</td>
                    <td className="px-4 py-3 text-sm uppercase">{job.data.crypto}</td>
                    <td className="px-4 py-3 text-sm font-mono text-blue-400">{job.data.marketSlug}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {new Date(job.data.windowEnd * 1000).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {job.delay ? (
                        <span>Starts in {Math.round(job.delay / 1000)}s</span>
                      ) : job.processedOn ? (
                        <span>Processed {new Date(job.processedOn).toLocaleTimeString()}</span>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400">
            No {selectedJobStatus} jobs found.
          </div>
        )}
      </section>
    </div>
  );
}
