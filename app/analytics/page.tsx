"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface PostHistory {
  id: number;
  platform: string;
  status: string;
  posted_at: string;
  post_url: string;
}

export default function Analytics() {
  const [history, setHistory] = useState<PostHistory[]>([]);
  const [spendToday, setSpendToday] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/analytics/history?days=7"),
      api.get("/boost/spend-today"),
    ]).then(([historyData, spendData]) => {
      setHistory(historyData);
      setSpendToday(spendData.spend_today);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const sendReport = async () => {
    try {
      await api.post("/scheduler/run-morning-report");
      alert("Report sent to your email!");
    } catch (e) {
      alert("Error sending report");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Analytics</h2>
        <button onClick={sendReport} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm">
          📧 Send Report Now
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-sm text-gray-400">Posts (7 days)</p>
          <p className="text-3xl font-bold mt-1">{history.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-sm text-gray-400">Spend Today</p>
          <p className="text-3xl font-bold mt-1 text-yellow-400">${spendToday.toFixed(2)}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-sm text-gray-400">Success Rate</p>
          <p className="text-3xl font-bold mt-1 text-green-400">
            {history.length > 0
              ? `${Math.round((history.filter((h) => h.status === "posted").length / history.length) * 100)}%`
              : "—"}
          </p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">📋 Recent Posts (Last 7 Days)</h3>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : history.length === 0 ? (
          <p className="text-gray-500 text-sm">No posts yet. Generate and schedule content first!</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {history.map((post) => (
              <div key={post.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm capitalize">{post.platform}</span>
                  <span className="text-xs text-gray-500">
                    {post.posted_at ? new Date(post.posted_at).toLocaleString() : "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    post.status === "posted" ? "bg-green-600/20 text-green-400" : "bg-red-600/20 text-red-400"
                  }`}>
                    {post.status}
                  </span>
                  {post.post_url && (
                    <a href={post.post_url} target="_blank" className="text-xs text-blue-400 hover:underline">
                      View
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
