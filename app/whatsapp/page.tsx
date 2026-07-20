"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Subscriber {
  id: number;
  phone: string;
  name: string | null;
  source: string;
  created_at: string;
  last_message_at: string | null;
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
}

export default function WhatsAppPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [message, setMessage] = useState("");
  const [broadcasting, setBroadcasting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [tab, setTab] = useState<"subscribers" | "broadcast">("subscribers");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/whatsapp/stats"),
      api.get("/whatsapp/subscribers"),
    ]).then(([s, subs]) => {
      setStats(s);
      setSubscribers(subs);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const broadcast = async () => {
    if (!message.trim()) return alert("Message required");
    setBroadcasting(true);
    try {
      const r = await api.post("/whatsapp/broadcast", { message });
      alert(`✅ Sent: ${r.sent} / Failed: ${r.failed}`);
      setMessage("");
    } catch {
      alert("Broadcast failed");
    }
    setBroadcasting(false);
  };

  const testSend = async () => {
    setTesting(true);
    try {
      const r = await api.post("/whatsapp/send-admin", { message: "👋 MarketPilot WhatsApp is working! Test message from dashboard." });
      alert(r.success ? "✅ Test message sent to your WhatsApp!" : `❌ Failed: ${r.error}`);
    } catch {
      alert("Test failed");
    }
    setTesting(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">💬 WhatsApp</h2>
        <button
          onClick={testSend}
          disabled={testing}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-sm"
        >
          {testing ? "Sending..." : "🧪 Test Send"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Subscribers", value: stats?.total ?? 0, color: "text-white" },
          { label: "Active", value: stats?.active ?? 0, color: "text-green-400" },
          { label: "Unsubscribed", value: stats?.inactive ?? 0, color: "text-red-400" },
        ].map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-400">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{loading ? "..." : s.value}</p>
          </div>
        ))}
      </div>

      {/* Webhook info */}
      <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-4 mb-6">
        <p className="text-sm font-medium text-blue-300 mb-1">📡 Webhook URL (set this in Twilio)</p>
        <code className="text-xs text-blue-200 break-all">
          https://marketpilot-backend.onrender.com/api/whatsapp/webhook
        </code>
        <p className="text-xs text-gray-500 mt-2">Go to Twilio → Messaging → Sandbox Settings → paste this URL in "When a message comes in"</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
        {(["subscribers", "broadcast"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm capitalize transition-colors ${tab === t ? "bg-green-600 text-white" : "text-gray-400 hover:text-white"}`}>
            {t === "subscribers" ? `👥 Subscribers (${stats?.active ?? 0})` : "📢 Broadcast"}
          </button>
        ))}
      </div>

      {tab === "subscribers" ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {loading ? (
            <p className="p-6 text-gray-400 text-sm">Loading...</p>
          ) : subscribers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-4xl mb-3">💬</p>
              <p className="text-gray-400 text-sm font-medium">No subscribers yet</p>
              <p className="text-gray-600 text-xs mt-2">
                Share your WhatsApp number and tell people to send <span className="text-green-400 font-mono">JOIN</span> to subscribe
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase border-b border-gray-800">
                  <th className="text-left px-4 py-3">Phone</th>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Source</th>
                  <th className="text-left px-4 py-3">Joined</th>
                  <th className="text-left px-4 py-3">Last Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {subscribers.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-green-400 font-mono text-xs">{s.phone}</td>
                    <td className="px-4 py-3 text-gray-300">{s.name || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 bg-gray-800 rounded text-gray-400">{s.source}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {s.created_at ? new Date(s.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {s.last_message_at ? new Date(s.last_message_at).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <p className="text-sm text-gray-400">
            Send message to all <span className="text-white font-medium">{stats?.active ?? 0}</span> active subscribers.
          </p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Write your WhatsApp broadcast message...\n\nTip: Use *bold* and _italic_ for formatting.`}
            rows={8}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500 resize-none font-mono"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">{message.length} characters</p>
            <button
              onClick={broadcast}
              disabled={broadcasting || !message.trim() || (stats?.active ?? 0) === 0}
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-sm font-medium"
            >
              {broadcasting ? "Sending..." : `📢 Send to ${stats?.active ?? 0} subscribers`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
