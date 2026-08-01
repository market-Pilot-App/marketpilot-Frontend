"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

interface SeriesDay { date: string; posts: number; likes: number; reach: number; }
interface Totals { posts: number; likes: number; reach: number; boost_spend: number; }
interface ByPlatform { [platform: string]: { posts: number; likes: number; reach: number } }

export default function Analytics() {
  const [totals, setTotals] = useState<Totals>({ posts: 0, likes: 0, reach: 0, boost_spend: 0 });
  const [series, setSeries] = useState<SeriesDay[]>([]);
  const [byPlatform, setByPlatform] = useState<ByPlatform>({});
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async (d: number) => {
    setLoading(true);
    try {
      const data = await api.get(`/analytics/summary?days=${d}`);
      setTotals(data.totals);
      setSeries(data.series);
      setByPlatform(data.by_platform);
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(days); }, [days, load]);

  const sync = async () => {
    setSyncing(true);
    try {
      await api.post("/analytics/aggregate");
      await load(days);
    } catch { /* silent */ }
    setSyncing(false);
  };

  const sendReport = async () => {
    try {
      await api.post("/analytics/report");
      alert("Report sent to your email!");
    } catch { alert("Error sending report"); }
  };

  // Sparkline: last 14 days for chart
  const chartData = series.slice(-14);
  const maxReach = Math.max(...chartData.map(d => d.reach), 1);
  const maxLikes = Math.max(...chartData.map(d => d.likes), 1);
  const maxPosts = Math.max(...chartData.map(d => d.posts), 1);

  const now = new Date();
  const monthName = now.toLocaleString("default", { month: "long" });
  const year = now.getFullYear();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">📈 Analytics</h2>
          <p className="text-gray-400 text-sm mt-1">Posts, engagement &amp; reach — scoped to your campaign</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={e => setDays(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded-lg px-3 py-2"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button
            onClick={sync}
            disabled={syncing}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm disabled:opacity-50"
          >
            {syncing ? "Syncing…" : "↻ Sync Now"}
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: "✍️", label: "Total Posts", value: totals.posts, color: "text-white" },
          { icon: "❤️", label: "Total Likes", value: totals.likes, color: "text-pink-400" },
          { icon: "👁️", label: "Total Reach", value: totals.reach, color: "text-blue-400" },
          { icon: "🚀", label: "Boost Spend", value: `$${totals.boost_spend.toFixed(2)}`, color: "text-yellow-400" },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-400">{s.icon}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{loading ? "…" : s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Mini sparkline charts */}
      {(["reach", "likes", "posts"] as const).map(metric => {
        const maxVal = metric === "reach" ? maxReach : metric === "likes" ? maxLikes : maxPosts;
        const color = metric === "reach" ? "#3b82f6" : metric === "likes" ? "#ec4899" : "#22c55e";
        const total = chartData.reduce((s, d) => s + d[metric], 0);
        return (
          <div key={metric} className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-400 uppercase tracking-wide">{metric} — {days}d</span>
              <span className="text-sm font-bold" style={{ color }}>{loading ? "…" : total}</span>
            </div>
            <div className="flex items-end gap-0.5 h-12">
              {chartData.map((d, i) => {
                const h = maxVal > 0 ? Math.max((d[metric] / maxVal) * 100, 2) : 2;
                return (
                  <div
                    key={i}
                    title={`${d.date}: ${d[metric]}`}
                    className="flex-1 rounded-sm opacity-80 hover:opacity-100 transition-opacity"
                    style={{ height: `${h}%`, backgroundColor: color }}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>{chartData[0]?.date?.slice(5)}</span>
              <span>{chartData[chartData.length - 1]?.date?.slice(5)}</span>
            </div>
          </div>
        );
      })}

      {/* Platform breakdown */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Platform Breakdown</h3>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading…</p>
        ) : Object.keys(byPlatform).length === 0 ? (
          <p className="text-gray-500 text-sm">No platform data yet. Click ↻ Sync Now to aggregate your posts.</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(byPlatform).map(([platform, stats]) => (
              <div key={platform} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
                <span className="text-sm capitalize text-gray-200 w-28">{platform}</span>
                <div className="flex gap-6 text-xs text-gray-400">
                  <span>✍️ {stats.posts} posts</span>
                  <span>❤️ {stats.likes} likes</span>
                  <span>👁️ {stats.reach} reach</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Monthly report */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-1">📄 Monthly Performance Report</h3>
        <p className="text-xs text-gray-500 mb-4">{monthName} {year} · MarketPiloting Engine</p>
        <div className="flex gap-3">
          <button
            onClick={sendReport}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
          >
            📄 Generate &amp; Email Report
          </button>
        </div>
      </div>
    </div>
  );
}
