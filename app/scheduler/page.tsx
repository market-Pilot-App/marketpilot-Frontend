"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const PLATFORM_ICONS: Record<string, string> = {
  facebook: "📘",
  linkedin: "💼",
  instagram: "📸",
  twitter: "🐦",
  telegram: "✈️",
};

interface QueuedPost {
  id: number;
  platform: string;
  scheduled_time: string;
  status: string;
  content_id: number;
  text: string;
  image_url: string;
  angle: string;
  language: string;
}

interface PostedPost {
  id: number;
  platform: string;
  posted_at: string;
  post_url: string;
  text: string;
  angle: string;
}

type ActionState = "idle" | "loading" | "done" | "error";

export default function Scheduler() {
  const [queued, setQueued] = useState<QueuedPost[]>([]);
  const [posted, setPosted] = useState<PostedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionState, setActionState] = useState<Record<string, ActionState>>({});
  const [fillLoading, setFillLoading] = useState(false);
  const [runLoading, setRunLoading] = useState(false);
  const [tab, setTab] = useState<"queued" | "history">("queued");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [q, p] = await Promise.all([
        api.get("/social/queued"),
        api.get("/social/posted"),
      ]);
      setQueued(q);
      setPosted(p);
    } catch {}
    setLoading(false);
  };

  const setAction = (key: string, state: ActionState) =>
    setActionState((s) => ({ ...s, [key]: state }));

  const cancel = async (id: number) => {
    setAction(`cancel_${id}`, "loading");
    try {
      await api.delete(`/social/queued/${id}`);
      setQueued((q) => q.filter((p) => p.id !== id));
      setAction(`cancel_${id}`, "done");
    } catch {
      setAction(`cancel_${id}`, "error");
    }
  };

  const fireNow = async (id: number) => {
    setAction(`fire_${id}`, "loading");
    try {
      const result = await api.post(`/social/queued/${id}/fire`);
      if (result.status === "posted") {
        setQueued((q) => q.filter((p) => p.id !== id));
        setAction(`fire_${id}`, "done");
        load();
      } else {
        setAction(`fire_${id}`, "error");
      }
    } catch {
      setAction(`fire_${id}`, "error");
    }
  };

  const fillSchedule = async () => {
    setFillLoading(true);
    try {
      const result = await api.post("/scheduler/fill-schedule");
      alert(`Schedule filled! ${result.scheduled} posts queued.`);
      load();
    } catch {
      alert("Error filling schedule");
    }
    setFillLoading(false);
  };

  const runNow = async () => {
    setRunLoading(true);
    try {
      const result = await api.post("/scheduler/run-posts");
      alert(`Done! Posted: ${result.posted} / ${result.total_due} due`);
      load();
    } catch {
      alert("Error running posts");
    }
    setRunLoading(false);
  };

  const timeUntil = (iso: string) => {
    const diff = new Date(iso).getTime() - Date.now();
    if (diff < 0) return "overdue";
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return h > 0 ? `in ${h}h ${m}m` : `in ${m}m`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Scheduler</h2>
        <div className="flex gap-2">
          <button
            onClick={fillSchedule}
            disabled={fillLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-sm"
          >
            {fillLoading ? "Filling..." : "📅 Fill Schedule"}
          </button>
          <button
            onClick={runNow}
            disabled={runLoading}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-sm"
          >
            {runLoading ? "Running..." : "▶ Run Due Posts"}
          </button>
        </div>
      </div>

      {/* Cron schedule */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Auto-Post Schedule (WAT)</h3>
        <div className="grid grid-cols-3 gap-3">
          {[["🌅", "7:00 AM", "Morning"], ["🍽️", "12:30 PM", "Lunch"], ["🌙", "8:00 PM", "Evening"]].map(([icon, time, label]) => (
            <div key={label} className="bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-xl">{icon}</p>
              <p className="text-sm font-medium mt-1">{time}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab("queued")}
          className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${tab === "queued" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
        >
          ⏳ Queued ({queued.length})
        </button>
        <button
          onClick={() => setTab("history")}
          className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${tab === "history" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
        >
          ✅ History ({posted.length})
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : tab === "queued" ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {queued.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 text-sm">No posts queued.</p>
              <button onClick={fillSchedule} className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm">
                Fill Tomorrow's Schedule
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase border-b border-gray-800">
                  <th className="text-left px-4 py-3">Platform</th>
                  <th className="text-left px-4 py-3">Scheduled</th>
                  <th className="text-left px-4 py-3">Angle</th>
                  <th className="text-left px-4 py-3">Preview</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {queued.map((post) => {
                  const fireKey = `fire_${post.id}`;
                  const cancelKey = `cancel_${post.id}`;
                  const isOverdue = new Date(post.scheduled_time).getTime() < Date.now();
                  return (
                    <tr key={post.id} className="hover:bg-gray-800/50">
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2 capitalize">
                          {PLATFORM_ICONS[post.platform]} {post.platform}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-300">{new Date(post.scheduled_time).toLocaleString()}</div>
                        <div className={`text-xs mt-0.5 ${isOverdue ? "text-red-400" : "text-gray-500"}`}>
                          {timeUntil(post.scheduled_time)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 bg-gray-800 rounded capitalize text-gray-300">
                          {post.angle?.replace(/_/g, " ") ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="text-gray-400 text-xs truncate">{post.text}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => fireNow(post.id)}
                            disabled={actionState[fireKey] === "loading"}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded text-xs"
                          >
                            {actionState[fireKey] === "loading" ? "..." : actionState[fireKey] === "done" ? "✓" : "▶ Fire"}
                          </button>
                          <button
                            onClick={() => cancel(post.id)}
                            disabled={actionState[cancelKey] === "loading"}
                            className="px-3 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 disabled:opacity-50 rounded text-xs"
                          >
                            {actionState[cancelKey] === "loading" ? "..." : "✕ Cancel"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {posted.length === 0 ? (
            <p className="p-8 text-center text-gray-500 text-sm">No posts yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase border-b border-gray-800">
                  <th className="text-left px-4 py-3">Platform</th>
                  <th className="text-left px-4 py-3">Posted At</th>
                  <th className="text-left px-4 py-3">Angle</th>
                  <th className="text-left px-4 py-3">Preview</th>
                  <th className="text-right px-4 py-3">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {posted.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2 capitalize">
                        {PLATFORM_ICONS[post.platform]} {post.platform}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {post.posted_at ? new Date(post.posted_at).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 bg-gray-800 rounded capitalize text-gray-300">
                        {post.angle?.replace(/_/g, " ") ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-gray-400 text-xs truncate">{post.text}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {post.post_url ? (
                        <a href={post.post_url} target="_blank" className="text-xs text-blue-400 hover:underline">
                          View →
                        </a>
                      ) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
