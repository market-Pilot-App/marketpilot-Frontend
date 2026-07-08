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

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/analytics/dashboard").then((data) => {
      setStats(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        { label: "Posts Today", value: stats.total_posts_today, icon: "📝" },
        { label: "Boosts Today", value: stats.total_boosts_today, icon: "🚀" },
        { label: "Spend Today", value: `₦${stats.spend_today.toFixed(0)}`, icon: "💰" },
        { label: "Spend This Week", value: `₦${stats.spend_this_week.toFixed(0)}`, icon: "📊" },
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
      )}

      <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="flex gap-3 flex-wrap">
          <a href="/content" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors">
            Generate Content
          </a>
          <button
            onClick={() => api.post("/scheduler/run-posts")}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition-colors"
          >
            Run Posts Now
          </button>
          <button
            onClick={() => api.post("/scheduler/run-boosts")}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition-colors"
          >
            Run Boosts Now
          </button>
        </div>
      </div>
    </div>
  );
}
