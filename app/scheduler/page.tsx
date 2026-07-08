"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface QueuedPost {
  id: number;
  content_id: number;
  platform: string;
  scheduled_time: string;
  status: string;
}

export default function Scheduler() {
  const [queued, setQueued] = useState<QueuedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    try {
      const data = await api.get("/social/queued");
      setQueued(data);
    } catch (e) {}
    setLoading(false);
  };

  const runNow = async () => {
    try {
      const result = await api.post("/scheduler/run-posts");
      alert(`Done! Posted: ${result.posted}/${result.total_due}`);
      loadQueue();
    } catch (e) {
      alert("Error running scheduler");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Scheduler</h2>
        <button onClick={runNow} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm">
          Run Due Posts Now
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold mb-3">⏰ Auto-Post Schedule</h3>
        <p className="text-sm text-gray-400 mb-4">Posts are automatically published at these times (WAT):</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <p className="text-2xl">🌅</p>
            <p className="text-sm font-medium mt-1">7:00 AM</p>
            <p className="text-xs text-gray-500">Morning</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <p className="text-2xl">🍽️</p>
            <p className="text-sm font-medium mt-1">12:30 PM</p>
            <p className="text-xs text-gray-500">Lunch</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <p className="text-2xl">🌙</p>
            <p className="text-sm font-medium mt-1">8:00 PM</p>
            <p className="text-xs text-gray-500">Evening</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-3">📋 Queued Posts ({queued.length})</h3>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : queued.length === 0 ? (
          <p className="text-gray-500 text-sm">No posts in queue. Generate content first!</p>
        ) : (
          <div className="space-y-2">
            {queued.map((post) => (
              <div key={post.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
                <div>
                  <span className="text-sm font-medium capitalize">{post.platform}</span>
                  <span className="text-xs text-gray-500 ml-3">
                    {new Date(post.scheduled_time).toLocaleString()}
                  </span>
                </div>
                <span className="text-xs px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded">
                  {post.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
