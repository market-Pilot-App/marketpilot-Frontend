"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Stats {
  total_posts_today: number;
  total_boosts_today: number;
  spend_today: number;
  spend_this_week: number;
  queued_posts: number;
  active_campaigns: number;
}

interface RecentPost {
  id: number;
  platform: string;
  status: string;
  posted_at: string;
  post_url: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<RecentPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/analytics/dashboard"),
      api.get("/analytics/history?days=1"),
    ]).then(([statsData, recentData]) => {
      setStats(statsData);
      setRecent(recentData.slice(0, 10));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        { label: "Posts Today", value: stats.total_posts_today, icon: "📝" },
        { label: "Boosts Today", value: stats.total_boosts_today, icon: "🚀" },
        { label: "Spend Today", value: `$${stats.spend_today.toFixed(2)}`, icon: "💰" },
        { label: "Spend This Week", value: `$${stats.spend_this_week.toFixed(2)}`, icon: "📊" },
        { label: "Queued Posts", value: stats.queued_posts, icon: "📅" },
        { label: "Active Campaigns", value: stats.active_campaigns, icon: "🎯" },
      ]
    : [];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card) => (
              <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">{card.label}</span>
                  <span className="text-2xl">{card.icon}</span>
                </div>
                <p className="text-3xl font-bold text-white">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="flex gap-3 flex-wrap">
              <a href="/content" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors">
                Generate Content
              </a>
              <a href="/blog" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm transition-colors">
                Write Blog Post
              </a>
              <button
                onClick={() => api.post("/scheduler/run-posts").then(() => alert("Done!"))}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition-colors"
              >
                Run Posts Now
              </button>
              <button
                onClick={() => api.post("/scheduler/run-boosts").then(() => alert("Done!"))}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition-colors"
              >
                Run Boosts Now
              </button>
              <button
                onClick={() => api.post("/scheduler/run-morning-report").then(() => alert("Report sent!"))}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm transition-colors"
              >
                📧 Send Report
              </button>
            </div>
          </div>

          {recent.length > 0 && (
            <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">📋 Today's Activity</h3>
              <div className="space-y-2">
                {recent.map((post) => (
                  <div key={post.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm capitalize">{post.platform}</span>
                      <span className="text-xs text-gray-500">
                        {post.posted_at ? new Date(post.posted_at).toLocaleTimeString() : "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        post.status === "posted" ? "bg-green-600/20 text-green-400" : "bg-red-600/20 text-red-400"
                      }`}>
                        {post.status}
                      </span>
                      {post.post_url && (
                        <a href={post.post_url} target="_blank" className="text-xs text-blue-400 hover:underline">View</a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
