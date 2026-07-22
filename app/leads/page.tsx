"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Lead {
  id: number;
  name: string;
  email: string;
  whatsapp: string;
  source: string;
  created_at: string;
  last_contacted_at: string | null;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [broadcasting, setBroadcasting] = useState(false);
  const [tab, setTab] = useState<"list" | "broadcast">("list");

  useEffect(() => {
    const client = JSON.parse(localStorage.getItem("mp_client") || "{}");
    const admin = client?.plan === "agency";
    setIsAdmin(admin);
    api.get("/leads").then((d) => { setLeads(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const broadcast = async () => {
    if (!subject || !message) return alert("Subject and message required");
    setBroadcasting(true);
    try {
      const r = await api.post("/leads/broadcast", { subject, message });
      alert(`Sent: ${r.sent} / Failed: ${r.failed}`);
      setSubject("");
      setMessage("");
    } catch {
      alert("Broadcast failed");
    }
    setBroadcasting(false);
  };

  const withEmail = leads.filter((l) => l.email).length;
  const withWhatsapp = leads.filter((l) => l.whatsapp).length;

  if (!isAdmin) return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <p className="text-4xl mb-4">👥</p>
      <h3 className="text-lg font-bold mb-2">Leads & CRM</h3>
      <p className="text-gray-400 text-sm max-w-sm">Lead management is handled by the MarketPilot team. Your leads are being collected and managed on your behalf.</p>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">👥 Leads & CRM</h2>
        <a href="/subscribe" target="_blank" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300">
          🔗 Subscribe Page ↗
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Leads", value: leads.length, color: "text-white" },
          { label: "With Email", value: withEmail, color: "text-blue-400" },
          { label: "With WhatsApp", value: withWhatsapp, color: "text-green-400" },
        ].map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-400">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{loading ? "..." : s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
        {(["list", "broadcast"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm capitalize transition-colors ${tab === t ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}>
            {t === "list" ? `📋 Leads (${leads.length})` : "📢 Broadcast"}
          </button>
        ))}
      </div>

      {tab === "list" ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {loading ? (
            <p className="p-6 text-gray-400 text-sm">Loading...</p>
          ) : leads.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 text-sm">No leads yet.</p>
              <p className="text-gray-600 text-xs mt-1">Share your <a href="/subscribe" target="_blank" className="text-blue-400 hover:underline">subscribe page</a> to collect leads.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase border-b border-gray-800">
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">WhatsApp</th>
                  <th className="text-left px-4 py-3">Source</th>
                  <th className="text-left px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {leads.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-gray-200">{l.name || "—"}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{l.email || "—"}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{l.whatsapp || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 bg-gray-800 rounded text-gray-400">{l.source}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {l.created_at ? new Date(l.created_at).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <p className="text-sm text-gray-400">Send email to all <span className="text-white font-medium">{withEmail}</span> leads with email addresses.</p>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message here..."
            rows={6}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
          />
          <button
            onClick={broadcast}
            disabled={broadcasting || !subject || !message}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-sm font-medium"
          >
            {broadcasting ? "Sending..." : `📢 Send to ${withEmail} leads`}
          </button>
        </div>
      )}
    </div>
  );
}
