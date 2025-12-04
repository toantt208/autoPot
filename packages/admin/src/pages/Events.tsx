import { useState } from 'react';
import { useEvents, useToggleEvent, useCreateEvent, useUpdateEvent, useDeleteEvent, Event } from '../hooks/useApi';

interface EventFormData {
  crypto: string;
  name: string;
  tradingWindowSeconds: number;
  threshold: number;
  betAmountUsdc: number;
  enabled: boolean;
}

const defaultFormData: EventFormData = {
  crypto: '',
  name: '',
  tradingWindowSeconds: 10,
  threshold: 0.99,
  betAmountUsdc: 10,
  enabled: true,
};

export default function Events() {
  const { data: events, isLoading, error } = useEvents();
  const toggleEvent = useToggleEvent();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<EventFormData>(defaultFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingEvent) {
      await updateEvent.mutateAsync({
        id: editingEvent.id,
        ...formData,
      });
    } else {
      await createEvent.mutateAsync(formData);
    }

    setShowForm(false);
    setEditingEvent(null);
    setFormData(defaultFormData);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      crypto: event.crypto,
      name: event.name,
      tradingWindowSeconds: event.tradingWindowSeconds,
      threshold: parseFloat(event.threshold),
      betAmountUsdc: parseFloat(event.betAmountUsdc),
      enabled: event.enabled,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      await deleteEvent.mutateAsync(id);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading events...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-400">Error loading events: {error.message}</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Events</h1>
        <button
          onClick={() => {
            setEditingEvent(null);
            setFormData(defaultFormData);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Event
        </button>
      </div>

      {/* Event Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingEvent ? 'Edit Event' : 'Create Event'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Crypto Symbol</label>
                  <input
                    type="text"
                    value={formData.crypto}
                    onChange={(e) => setFormData({ ...formData, crypto: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="btc, eth, sol"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="BTC Up/Down 15m"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Trading Window (seconds)</label>
                  <input
                    type="number"
                    value={formData.tradingWindowSeconds}
                    onChange={(e) => setFormData({ ...formData, tradingWindowSeconds: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    min={1}
                    max={900}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Threshold</label>
                  <input
                    type="number"
                    value={formData.threshold}
                    onChange={(e) => setFormData({ ...formData, threshold: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    step={0.01}
                    min={0.5}
                    max={1}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Bet Amount (USDC)</label>
                  <input
                    type="number"
                    value={formData.betAmountUsdc}
                    onChange={(e) => setFormData({ ...formData, betAmountUsdc: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    step={0.01}
                    min={0.01}
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="enabled" className="text-sm text-gray-400">Enabled</label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingEvent(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createEvent.isPending || updateEvent.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {createEvent.isPending || updateEvent.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Events Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm">Crypto</th>
              <th className="px-4 py-3 text-left text-sm">Name</th>
              <th className="px-4 py-3 text-left text-sm">Window</th>
              <th className="px-4 py-3 text-left text-sm">Threshold</th>
              <th className="px-4 py-3 text-left text-sm">Bet Amount</th>
              <th className="px-4 py-3 text-left text-sm">Status</th>
              <th className="px-4 py-3 text-left text-sm">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {events?.map((event) => (
              <tr key={event.id} className={!event.enabled ? 'opacity-50' : ''}>
                <td className="px-4 py-3 text-sm font-mono uppercase">{event.crypto}</td>
                <td className="px-4 py-3 text-sm">{event.name}</td>
                <td className="px-4 py-3 text-sm">{event.tradingWindowSeconds}s</td>
                <td className="px-4 py-3 text-sm">{(parseFloat(event.threshold) * 100).toFixed(0)}%</td>
                <td className="px-4 py-3 text-sm">${event.betAmountUsdc}</td>
                <td className="px-4 py-3 text-sm">
                  <button
                    onClick={() => toggleEvent.mutate(event.id)}
                    className={`px-2 py-1 rounded text-xs ${
                      event.enabled
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {event.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(event)}
                      className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600 text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {events?.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No events found. Click "Add Event" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
