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
];

const PLATFORMS = [
  { value: "facebook", label: "Facebook" },
  { value: "twitter", label: "X/Twitter" },
];

const LANGUAGES = [
  { value: "english", label: "English" },
  { value: "pidgin", label: "Pidgin" },
  { value: "french", label: "French" },
];

interface GeneratedContent {
  id: number;
  text: string;
  platform: string;
  angle: string;
  language: string;
}

export default function ContentStudio() {
  const [platform, setPlatform] = useState("facebook");
  const [angle, setAngle] = useState("earn_money");
  const [language, setLanguage] = useState("english");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GeneratedContent[]>([]);

  const generate = async () => {
    setLoading(true);
    try {
      const data = await api.post("/content/generate", {
        campaign_id: 1,
        platform,
        angle,
        language,
        count,
      });
      setResults(data);
    } catch (e) {
      alert("Error generating content");
    }
    setLoading(false);
  };

  const postNow = async (contentId: number) => {
    try {
      const result = await api.post(`/social/post-now/${contentId}?platform=${platform}`);
      alert(result.status === "posted" ? "Posted!" : `Failed: ${result.error}`);
    } catch (e) {
      alert("Error posting");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Content Studio</h2>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Platform</label>
            <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
              {PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Angle</label>
            <select value={angle} onChange={(e) => setAngle(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
              {ANGLES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
              {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Count</label>
            <input type="number" value={count} onChange={(e) => setCount(Number(e.target.value))} min={1} max={10} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <button onClick={generate} disabled={loading} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors">
          {loading ? "Generating..." : "Generate Content"}
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Generated ({results.length})</h3>
          {results.map((item) => (
            <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-200 text-sm whitespace-pre-wrap">{item.text}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => postNow(item.id)} className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs">
                  Post Now
                </button>
                <button onClick={() => navigator.clipboard.writeText(item.text)} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs">
                  Copy
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
