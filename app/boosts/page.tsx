"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function Boosts() {
  const [settings, setSettings] = useState({
    platform: "facebook",
    auto_boost_enabled: true,
    likes_per_post: 500,
    views_per_post: 2000,
    daily_budget_limit: 500,
  });
  const [saving, setSaving] = useState(false);
  const [balance, setBalance] = useState<string | null>(null); // v2

  const saveSettings = async () => {
    setSaving(true);
    try {
      await api.post("/boost/settings", settings);
      alert("Settings saved!");
    } catch (e) {
      alert("Error saving");
    }
    setSaving(false);
  };

  const checkBalance = async () => {
    try {
      const data = await api.get("/boost/balance");
      setBalance(data.balance);
    } catch (e) {
      alert("Error checking balance");
    }
  };

  const runBoosts = async () => {
    try {
      const result = await api.post("/scheduler/run-boosts");
      alert(`Done! Boosted: ${result.boosted} posts`);
    } catch (e) {
      alert("Error running boosts");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Boost Settings</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">⚙️ Auto-Boost Config</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Platform</label>
              <select
                value={settings.platform}
                onChange={(e) => setSettings({ ...settings, platform: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
              >
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="linkedin">LinkedIn</option>
                <option value="telegram">Telegram</option>
                <option value="twitter">X/Twitter</option>
                <option value="website">Website</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.auto_boost_enabled}
                onChange={(e) => setSettings({ ...settings, auto_boost_enabled: e.target.checked })}
                className="w-4 h-4"
              />
              <label className="text-sm">Auto-boost enabled</label>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Likes per post</label>
              <input
                type="number"
                value={settings.likes_per_post}
                onChange={(e) => setSettings({ ...settings, likes_per_post: Number(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Views per post</label>
              <input
                type="number"
                value={settings.views_per_post}
                onChange={(e) => setSettings({ ...settings, views_per_post: Number(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Daily budget limit ($)</label>
              <input
                type="number"
                value={settings.daily_budget_limit}
                onChange={(e) => setSettings({ ...settings, daily_budget_limit: Number(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <button onClick={saveSettings} disabled={saving} className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-sm font-medium">
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">🌐 Website Traffic</h3>
            <p className="text-sm text-gray-400 mb-1">1,000 Nigerian Google organic + 1,000 Nigerian social visitors</p>
            <p className="text-sm text-gray-500 mb-3">~$1.16 per run → reportafrica.africa</p>
            <button onClick={async () => { try { const r = await api.post("/scheduler/boost-website"); alert(`Done! Orders: ${r.results?.map((x: any) => x.order_id).join(', ')}`); } catch { alert("Error"); } }} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm">
              🚀 Boost Website Now
            </button>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">💰 Provider Balance</h3>
            {balance !== null ? (
              <p className="text-3xl font-bold text-green-400">${balance}</p>
            ) : (
              <p className="text-gray-500 text-sm">Click to check</p>
            )}
            <button onClick={checkBalance} className="mt-3 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">
              Check Balance
            </button>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">🚀 Manual Boost</h3>
            <p className="text-sm text-gray-400 mb-3">Boost all recent unboosted posts now</p>
            <button onClick={runBoosts} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm">
              Run Boosts Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
