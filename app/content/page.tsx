"use client";

import { useState } from "react";
import { api } from "@/lib/api";

const ANGLES = [
  { value: "earn_money", label: "💰 Earn Money" },
  { value: "report_corruption", label: "🗣️ Report Corruption" },
  { value: "election_monitor", label: "🗳️ Election Monitor" },
  { value: "emergency_sos", label: "🆘 Emergency SOS" },
  { value: "go_live", label: "🔴 Go Live" },
  { value: "community", label: "🤝 Community" },
  { value: "academy", label: "🎓 Academy" },
  { value: "fan_subscription", label: "⭐ Fan Subscriptions" },
  { value: "bounty_board", label: "🎯 Bounty Board" },
];

const PLATFORMS = [
  { value: "facebook", label: "📘 Facebook", limit: 500 },
  { value: "twitter", label: "🐦 X/Twitter", limit: 280 },
  { value: "linkedin", label: "💼 LinkedIn", limit: 500 },
  { value: "instagram", label: "📸 Instagram", limit: 300 },
];

const LANGUAGES = [
  { value: "english", label: "🇬🇧 English" },
  { value: "pidgin", label: "🇳🇬 Pidgin" },
  { value: "french", label: "🇫🇷 French" },
];

interface GeneratedContent {
  id: number;
  text: string;
  platform: string;
  angle: string;
  language: string;
  image_url: string;
}

type PostStatus = "idle" | "posting" | "posted" | "failed";

export default function ContentStudio() {
  const [platform, setPlatform] = useState("facebook");
  const [angle, setAngle] = useState("earn_money");
  const [language, setLanguage] = useState("english");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GeneratedContent[]>([]);
  const [postStatus, setPostStatus] = useState<Record<number, PostStatus>>({});
  const [editText, setEditText] = useState<Record<number, string>>({});

  const charLimit = PLATFORMS.find((p) => p.value === platform)?.limit ?? 500;

  const generate = async () => {
    setLoading(true);
    setResults([]);
    setPostStatus({});
    setEditText({});
    try {
      const data = await api.post("/content/generate", {
        campaign_id: 1,
        platform,
        angle,
        language,
        count,
      });
      setResults(data);
    } catch {
      alert("Error generating content — check backend logs");
    }
    setLoading(false);
  };

  const getText = (item: GeneratedContent) =>
    editText[item.id] !== undefined ? editText[item.id] : item.text;

  const postNow = async (item: GeneratedContent) => {
    setPostStatus((s) => ({ ...s, [item.id]: "posting" }));
    try {
      const result = await api.post(`/social/post-now/${item.id}?platform=${platform}`);
      setPostStatus((s) => ({
        ...s,
        [item.id]: result.status === "posted" ? "posted" : "failed",
      }));
    } catch {
      setPostStatus((s) => ({ ...s, [item.id]: "failed" }));
    }
  };

  const postToAll = async (item: GeneratedContent) => {
    setPostStatus((s) => ({ ...s, [item.id]: "posting" }));
    try {
      const results = await Promise.all(
        ["facebook", "linkedin", "twitter"].map((p) =>
          api.post(`/social/post-now/${item.id}?platform=${p}`).catch(() => ({ status: "failed" }))
        )
      );
      const anyPosted = results.some((r: any) => r.status === "posted");
      setPostStatus((s) => ({ ...s, [item.id]: anyPosted ? "posted" : "failed" }));
    } catch {
      setPostStatus((s) => ({ ...s, [item.id]: "failed" }));
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Content Studio</h2>

      {/* Controls */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
            >
              {PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">Angle</label>
            <select
              value={angle}
              onChange={(e) => setAngle(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
            >
              {ANGLES.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">Count</label>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(Math.min(10, Math.max(1, Number(e.target.value))))}
              min={1}
              max={10}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={generate}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
          >
            {loading ? "Generating..." : "✨ Generate Content"}
          </button>
          {results.length > 0 && (
            <span className="text-xs text-gray-500">{results.length} posts generated</span>
          )}
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((item) => {
            const text = getText(item);
            const charCount = text.length;
            const overLimit = charCount > charLimit;
            const status = postStatus[item.id] ?? "idle";

            return (
              <div
                key={item.id}
                className={`bg-gray-900 border rounded-xl overflow-hidden transition-colors ${
                  status === "posted"
                    ? "border-green-600/50"
                    : status === "failed"
                    ? "border-red-600/50"
                    : "border-gray-800"
                }`}
              >
                <div className="flex gap-4 p-4">
                  {/* Image preview */}
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt=""
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                  )}

                  {/* Text editor */}
                  <div className="flex-1 min-w-0">
                    <textarea
                      value={text}
                      onChange={(e) =>
                        setEditText((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                      rows={4}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 resize-none focus:outline-none focus:border-blue-500"
                    />
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-xs ${overLimit ? "text-red-400" : "text-gray-500"}`}>
                        {charCount} / {charLimit} chars
                        {overLimit && " — over limit"}
                      </span>
                      <span className="text-xs text-gray-600 capitalize">
                        {item.angle?.replace(/_/g, " ")} · {item.language}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 px-4 pb-4">
                  <button
                    onClick={() => postNow(item)}
                    disabled={status === "posting" || status === "posted"}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-xs font-medium transition-colors"
                  >
                    {status === "posting" ? "Posting..." : status === "posted" ? "✓ Posted" : `Post to ${platform}`}
                  </button>
                  <button
                    onClick={() => postToAll(item)}
                    disabled={status === "posting" || status === "posted"}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-xs font-medium transition-colors"
                  >
                    Post to All
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(text)}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs transition-colors"
                  >
                    Copy
                  </button>
                  {status === "failed" && (
                    <span className="text-xs text-red-400 ml-1">Failed — check logs</span>
                  )}
                  {status === "posted" && (
                    <span className="text-xs text-green-400 ml-1">✓ Live</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
