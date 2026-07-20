"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface TrendDay {
  date: string;
  reach: number;
  likes: number;
  clicks: number;
  posts: number;
}

interface Totals {
  reach: number;
  likes: number;
  clicks: number;
  comments: number;
}

interface PostHistory {
  id: number;
  platform: string;
  status: string;
  posted_at: string;
  post_url: string;
  likes: number;
  reach: number;
  clicks: number;
}

export default function Analytics() {
  const [trend, setTrend] = useState<TrendDay[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [history, setHistory] = useState<PostHistory[]>([]);
  const [spendToday, setSpendToday] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/analytics/engagement-summary"),
      api.get("/analytics/history?days=7"),
      api.get("/boost/spend-today"),
    ]).then(([eng, hist, spend]) => {
      setTrend(eng.trend);
      setTotals(eng.totals);
      setHistory(hist);
      setSpendToday(spend.spend_today);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const sendReport = async () => {
    try {
      await api.post("/scheduler/run-morning-report");
      alert("Report sent to your email!");
    } catch {
      alert("Error sending report");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">📈 Analytics</h2>
        <button onClick={sendReport} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm">
          📧 Send Report Now
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "7-Day Reach", value: totals?.reach?.toLocaleString() ?? "—", color: "text-blue-400" },
          { label: "7-Day Likes", value: totals?.likes?.toLocaleString() ?? "—", color: "text-pink-400" },
          { label: "7-Day Clicks", value: totals?.clicks?.toLocaleString() ?? "—", color: "text-green-400" },
          { label: "Spend Today", value: `$${spendToday.toFixed(2)}`, color: "text-yellow-400" },
        ].map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-400">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{loading ? "..." : s.value}</p>
          </div>
        ))}
      </div>

      {/* Reach + Likes trend chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">7-Day Reach & Likes</h3>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend}>
              <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }}
                labelStyle={{ color: "#e5e7eb" }}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: "#9ca3af" }} />
              <Line type="monotone" dataKey="reach" stroke="#3b82f6" strokeWidth={2} dot={false} name="Reach" />
              <Line type="monotone" dataKey="likes" stroke="#ec4899" strokeWidth={2} dot={false} name="Likes" />
              <Line type="monotone" dataKey="clicks" stroke="#22c55e" strokeWidth={2} dot={false} name="Clicks" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Post history */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Recent Posts (7 Days)</h3>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : history.length === 0 ? (
          <p className="text-gray-500 text-sm">No posts yet.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {history.map((post) => (
              <div key={post.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm capitalize text-gray-300 w-20 flex-shrink-0">{post.platform}</span>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {post.posted_at ? new Date(post.posted_at).toLocaleDateString() : "—"}
                  </span>
                  <div className="flex gap-3 text-xs text-gray-400">
                    <span>👁 {post.reach || 0}</span>
                    <span>❤️ {post.likes || 0}</span>
                    <span>🔗 {post.clicks || 0}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    post.status === "posted" ? "text-green-400" : "text-red-400"
                  }`}>{post.status}</span>
                  {post.post_url && (
                    <a href={post.post_url} target="_blank" className="text-xs text-blue-400 hover:underline">View</a>
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
