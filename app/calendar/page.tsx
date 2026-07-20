"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const PLATFORM_COLORS: Record<string, string> = {
  facebook: "bg-blue-500",
  instagram: "bg-pink-500",
  linkedin: "bg-sky-500",
  twitter: "bg-gray-400",
  telegram: "bg-cyan-500",
};

const STATUS_COLORS: Record<string, string> = {
  posted: "bg-green-500",
  queued: "bg-yellow-500",
  failed: "bg-red-500",
  draft: "bg-gray-500",
};

interface DayPost {
  id: number;
  platform: string;
  status: string;
  scheduled_time: string;
  angle: string;
  text: string;
  post_url: string | null;
}

export default function CalendarPage() {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [days, setDays] = useState<Record<string, DayPost[]>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/scheduler/calendar?month=${month}`)
      .then((d) => { setDays(d.days); setLoading(false); })
      .catch(() => setLoading(false));
  }, [month]);

  const [year, mon] = month.split("-").map(Number);
  const firstDay = new Date(year, mon - 1, 1).getDay();
  const daysInMonth = new Date(year, mon, 0).getDate();
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  );

  const prevMonth = () => setMonth(new Date(year, mon - 2, 1).toISOString().slice(0, 7));
  const nextMonth = () => setMonth(new Date(year, mon, 1).toISOString().slice(0, 7));

  const selectedKey = selected ? `${month}-${String(selected).padStart(2, "0")}` : null;
  const selectedPosts = selectedKey ? days[selectedKey] || [] : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">📅 Content Calendar</h2>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">←</button>
          <span className="text-sm font-medium w-28 text-center">
            {new Date(year, mon - 1).toLocaleString("default", { month: "long", year: "numeric" })}
          </span>
          <button onClick={nextMonth} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">→</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        {Object.entries(PLATFORM_COLORS).map(([p, c]) => (
          <span key={p} className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className={`w-2 h-2 rounded-full ${c}`} />{p}
          </span>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gray-800">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center text-xs text-gray-500 py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              const key = day ? `${month}-${String(day).padStart(2, "0")}` : null;
              const posts = key ? days[key] || [] : [];
              const isSelected = selected === String(day);
              return (
                <div
                  key={i}
                  onClick={() => day && setSelected(isSelected ? null : String(day))}
                  className={`min-h-[72px] p-1.5 border-b border-r border-gray-800 cursor-pointer transition-colors ${
                    day ? "hover:bg-gray-800/50" : "opacity-0 pointer-events-none"
                  } ${isSelected ? "bg-gray-800" : ""}`}
                >
                  {day && (
                    <>
                      <p className={`text-xs mb-1 font-medium ${isSelected ? "text-blue-400" : "text-gray-400"}`}>{day}</p>
                      <div className="flex flex-wrap gap-0.5">
                        {posts.map((p) => (
                          <span
                            key={p.id}
                            title={`${p.platform} — ${p.status}\n${p.text}`}
                            className={`w-2 h-2 rounded-full ${PLATFORM_COLORS[p.platform] || "bg-gray-500"} ${p.status === "posted" ? "opacity-100" : "opacity-50"}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selected && (
        <div className="mt-4 bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-3 text-gray-300">
            {new Date(year, mon - 1, Number(selected)).toLocaleDateString("default", { weekday: "long", month: "long", day: "numeric" })}
            <span className="ml-2 text-gray-500">({selectedPosts.length} posts)</span>
          </h3>
          {selectedPosts.length === 0 ? (
            <p className="text-gray-500 text-sm">No posts scheduled.</p>
          ) : (
            <div className="space-y-2">
              {selectedPosts.map((p) => (
                <div key={p.id} className="flex items-start justify-between bg-gray-800 rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${PLATFORM_COLORS[p.platform] || "bg-gray-500"}`} />
                    <span className="text-xs capitalize text-gray-300 w-20 flex-shrink-0">{p.platform}</span>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {new Date(p.scheduled_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <p className="text-xs text-gray-400 truncate">{p.text}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${p.status === "posted" ? "text-green-400" : p.status === "queued" ? "text-yellow-400" : "text-red-400"}`}>
                      {p.status}
                    </span>
                    {p.post_url && (
                      <a href={p.post_url} target="_blank" className="text-xs text-blue-400 hover:underline">View</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
