"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface ReferralLink {
  code: string;
  angle: string;
  clicks: number;
  created_at: string;
}

const ANGLES = ["earn_money", "report_corruption", "election_monitor", "emergency_sos", "go_live", "community"];

const ANGLE_COLORS: Record<string, string> = {
  earn_money: "bg-yellow-600/20 text-yellow-400",
  report_corruption: "bg-red-600/20 text-red-400",
  election_monitor: "bg-blue-600/20 text-blue-400",
  emergency_sos: "bg-orange-600/20 text-orange-400",
  go_live: "bg-purple-600/20 text-purple-400",
  community: "bg-green-600/20 text-green-400",
};

export default function ReferralsPage() {
  const [links, setLinks] = useState<ReferralLink[]>([]);
  const [totalClicks, setTotalClicks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedAngle, setSelectedAngle] = useState("earn_money");
  const [copied, setCopied] = useState<string | null>(null);

  const fetchStats = () => {
    api.get("/referrals/stats").then((data) => {
      setLinks(data.top_links || []);
      setTotalClicks(data.total_clicks || 0);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchStats(); }, []);

  const createLink = async () => {
    setCreating(true);
    try {
      await api.post(`/referrals/create?angle=${selectedAngle}`);
      fetchStats();
    } finally {
      setCreating(false);
    }
  };

  const copyLink = (code: string) => {
    const url = `https://marketpilot-backend.onrender.com/api/referrals/r/${code}`;
    navigator.clipboard.writeText(url);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  // Group clicks by angle
  const byAngle = ANGLES.map((angle) => {
    const angleLinks = links.filter((l) => l.angle === angle);
    const clicks = angleLinks.reduce((sum, l) => sum + l.clicks, 0);
    return { angle, clicks, count: angleLinks.length };
  }).sort((a, b) => b.clicks - a.clicks);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">🔗 Referral Engine</h2>
        <span className="text-sm text-gray-400">Total clicks: <span className="text-white font-bold">{totalClicks}</span></span>
      </div>

      {/* Angle Performance */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {byAngle.map(({ angle, clicks, count }) => (
          <div key={angle} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs px-2 py-0.5 rounded capitalize ${ANGLE_COLORS[angle] || "bg-gray-700 text-gray-300"}`}>
                {angle.replace(/_/g, " ")}
              </span>
              <span className="text-xs text-gray-500">{count} links</span>
            </div>
            <p className="text-2xl font-bold text-white">{clicks}</p>
            <p className="text-xs text-gray-500 mt-1">clicks</p>
          </div>
        ))}
      </div>

      {/* Create New Link */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Create Referral Link</h3>
        <div className="flex gap-3 flex-wrap items-center">
          <select
            value={selectedAngle}
            onChange={(e) => setSelectedAngle(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
          >
            {ANGLES.map((a) => (
              <option key={a} value={a}>{a.replace(/_/g, " ")}</option>
            ))}
          </select>
          <button
            onClick={createLink}
            disabled={creating}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {creating ? "Creating..." : "Generate Link"}
          </button>
          <p className="text-xs text-gray-500">Links are also auto-created with every scheduled post</p>
        </div>
      </div>

      {/* All Links Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">All Referral Links</h3>
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : links.length === 0 ? (
          <p className="text-gray-500 text-sm">No links yet — generate content to auto-create links, or create one manually above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase border-b border-gray-800">
                  <th className="text-left pb-3">Code</th>
                  <th className="text-left pb-3">Angle</th>
                  <th className="text-left pb-3">Clicks</th>
                  <th className="text-left pb-3">Created</th>
                  <th className="text-left pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {links.map((link) => (
                  <tr key={link.code} className="text-gray-300">
                    <td className="py-3 font-mono text-xs text-blue-400">{link.code}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded capitalize ${ANGLE_COLORS[link.angle] || "bg-gray-700 text-gray-300"}`}>
                        {link.angle?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${link.clicks > 0 ? "bg-green-600/20 text-green-400" : "bg-gray-800 text-gray-500"}`}>
                        {link.clicks}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-gray-500">
                      {new Date(link.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyLink(link.code)}
                          className="text-xs text-gray-400 hover:text-white transition-colors"
                        >
                          {copied === link.code ? "✅ Copied" : "📋 Copy"}
                        </button>
                        <a
                          href={`https://marketpilot-backend.onrender.com/api/referrals/r/${link.code}`}
                          target="_blank"
                          className="text-xs text-blue-400 hover:underline"
                        >
                          Test →
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
