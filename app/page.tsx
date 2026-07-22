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

interface Overview {
  total_posts: number;
  total_blogs: number;
  total_referral_clicks: number;
  total_spend: number;
  telegram_members: number;
  platform_counts: Record<string, number>;
  chart: { date: string; posts: number }[];
}

interface AnglePerf {
  angle: string;
  clicks: number;
  posts: number;
  ctr: number;
}

interface RecentPost {
  id: number;
  platform: string;
  status: string;
  posted_at: string;
  post_url: string;
}

interface TrendData {
  all_topics: string[];
  relevant: string[];
}

interface ReferralLink {
  code: string;
  angle: string;
  clicks: number;
  created_at: string;
}

interface ReferralStats {
  total_clicks: number;
  top_links: ReferralLink[];
}

interface PlatformHealth {
  facebook:  { ok: boolean; page?: string; error?: string };
  instagram: { ok: boolean; account?: string; error?: string };
  linkedin:  { ok: boolean; name?: string; error?: string };
  twitter:   { ok: boolean; username?: string; error?: string };
  summary:   { healthy: number; broken: number };
}

interface EngagementPost {
  id: number;
  posted_at: string;
  post_url: string;
  angle: string;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  clicks: number;
  text: string;
}

interface EngagementData {
  posts: EngagementPost[];
  totals: { reach: number; likes: number; clicks: number; posts: number };
  best_post: EngagementPost | null;
}

const PLATFORM_ICONS: Record<string, string> = {
  facebook: "📘",
  linkedin: "💼",
  instagram: "📸",
  twitter: "🐦",
  telegram: "✈️",
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [anglePerf, setAnglePerf] = useState<AnglePerf[]>([]);
  const [recent, setRecent] = useState<RecentPost[]>([]);
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [referrals, setReferrals] = useState<ReferralStats | null>(null);
  const [health, setHealth] = useState<PlatformHealth | null>(null);
  const [engagement, setEngagement] = useState<EngagementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const client = JSON.parse(localStorage.getItem("mp_client") || "{}");
    const isAdmin = client?.plan === "agency";

    // Admin uses campaign 1 (ReportAfrica), others use their assigned campaign
    const loadDashboard = async () => {
      let campaignId = 1;
      if (!isAdmin) {
        try {
          const camp = await api.get("/auth/my-campaign");
          campaignId = camp.id;
        } catch {
          // fallback to 1
        }
      }
      const q = `?campaign_id=${campaignId}`;
      Promise.all([
        api.get(`/analytics/dashboard${q}`),
        api.get(`/analytics/overview${q}`),
        api.get(`/analytics/angle-performance${q}`),
        api.get(`/analytics/history${q}&days=1`),
        api.get("/jobs/trends"),
        api.get("/referrals/stats"),
      ]).then(([statsData, overviewData, anglePerfData, recentData, trendsData, referralData]) => {
        setStats(statsData);
        setOverview(overviewData);
        setAnglePerf(anglePerfData.angles || []);
        setRecent(recentData.slice(0, 10));
        setTrends(trendsData);
        setReferrals(referralData);
        setLoading(false);
      }).catch(() => setLoading(false));

      api.get(`/analytics/engagement${q}`).then(setEngagement).catch(() => {});
      api.get("/health/platforms").then(setHealth).catch(() => {});
    };

    loadDashboard();
  }, []);

  const runAction = async (label: string, endpoint: string, successMsg: string) => {
    setActionLoading(label);
    try {
      await api.post(endpoint);
      alert(successMsg);
    } catch {
      alert("Error — check backend logs");
    } finally {
      setActionLoading(null);
    }
  };

  const statCards = stats
    ? [
        { label: "Posts Today", value: stats.total_posts_today, icon: "📝" },
        { label: "Boosts Today", value: stats.total_boosts_today, icon: "🚀" },
        { label: "Spend Today", value: `$${stats.spend_today.toFixed(2)}`, icon: "💰" },
        { label: "Queued Posts", value: stats.queued_posts, icon: "📅" },
        { label: "Total Posts (All Time)", value: overview?.total_posts ?? "—", icon: "📊" },
        { label: "Blogs Published", value: overview?.total_blogs ?? "—", icon: "✍️" },
        { label: "Referral Clicks", value: overview?.total_referral_clicks ?? "—", icon: "🔗" },
        { label: "Telegram Members", value: overview?.telegram_members ?? "—", icon: "✈️" },
        { label: "Active Campaigns", value: stats.active_campaigns, icon: "🎯" },
      ]
    : [];

  const quickActions = [
    { label: "Generate Content", href: "/content", color: "bg-blue-600 hover:bg-blue-700" },
    { label: "Write Blog Post", href: "/blog", color: "bg-indigo-600 hover:bg-indigo-700" },
  ];

  const cronActions = [
    { label: "Run Posts Now", endpoint: "/scheduler/run-posts", msg: "Posts triggered!", color: "bg-green-600 hover:bg-green-700" },
    { label: "Run Boosts Now", endpoint: "/scheduler/run-boosts", msg: "Boosts triggered!", color: "bg-purple-600 hover:bg-purple-700" },
    { label: "🔥 Newsjack Now", endpoint: "/jobs/newsjack", msg: "Newsjack post sent!", color: "bg-orange-600 hover:bg-orange-700" },
    { label: "📈 Milestone Post", endpoint: "/jobs/milestone", msg: "Milestone post sent!", color: "bg-pink-600 hover:bg-pink-700" },
    { label: "📝 Auto Blog", endpoint: "/jobs/auto-blog", msg: "Blog post generated & published!", color: "bg-teal-600 hover:bg-teal-700" },
    { label: "📧 Send Report", endpoint: "/scheduler/run-morning-report", msg: "Report sent!", color: "bg-yellow-600 hover:bg-yellow-700" },
    { label: "📊 Weekly Report", endpoint: "/scheduler/run-weekly-report", msg: "Weekly report sent!", color: "bg-yellow-700 hover:bg-yellow-800" },
    { label: "🧹 Dedup Queue", endpoint: "/scheduler/dedup-queue", msg: "Queue deduplicated!", color: "bg-gray-600 hover:bg-gray-500" },
    { label: "📣 Telegram Growth", endpoint: "/scheduler/telegram-growth", msg: "Telegram growth post sent!", color: "bg-blue-500 hover:bg-blue-600" },
    { label: "👥 Boost Audience", endpoint: "/scheduler/boost-audience", msg: "Audience boost ordered!", color: "bg-violet-600 hover:bg-violet-700" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <span className="text-xs text-green-400 bg-green-400/10 px-3 py-1 rounded-full">● Autopilot Active</span>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {statCards.map((card) => (
              <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-400 text-xs">{card.label}</span>
                  <span className="text-lg">{card.icon}</span>
                </div>
                <p className="text-xl font-bold text-white">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Telegram + Platform Row */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Telegram Channel Card */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">✈️</span>
                <h3 className="text-lg font-semibold">Telegram Channel</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Members</span>
                  <span className="text-white font-bold text-lg">
                    {overview?.telegram_members != null ? overview.telegram_members.toLocaleString() : "—"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Channel</span>
                  <a href="https://t.me/ReportAfricaNews" target="_blank" className="text-blue-400 hover:underline">@ReportAfricaNews</a>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Posts mirror from</span>
                  <span className="text-gray-300">FB + LinkedIn + Newsjack</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Status</span>
                  <span className="text-green-400">● Live</span>
                </div>
              </div>
            </div>

            {/* Platform Activity */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Platform Activity</h3>
              <div className="space-y-2">
                {["facebook", "linkedin", "instagram", "twitter", "telegram"].map((p) => {
                  const today_count = recent.filter((r) => r.platform === p && r.status === "posted").length;
                  const all_time = overview?.platform_counts?.[p] ?? 0;
                  return (
                    <div key={p} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-gray-300 capitalize">
                        {PLATFORM_ICONS[p]} {p}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{all_time} total</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${today_count > 0 ? "bg-green-600/20 text-green-400" : "bg-gray-800 text-gray-500"}`}>
                          {today_count} today
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 7-Day Post Chart */}
          {overview?.chart && (
            <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">📈 Posts — Last 7 Days</h3>
                <span className="text-xs text-gray-500">{overview.total_posts} total all time</span>
              </div>
              <div className="flex items-end gap-2 h-24">
                {overview.chart.map((day) => {
                  const max = Math.max(...overview.chart.map((d) => d.posts), 1);
                  const height = Math.max((day.posts / max) * 100, 4);
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-gray-400">{day.posts}</span>
                      <div
                        className="w-full bg-blue-500 rounded-t"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-xs text-gray-500">{day.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Angle Performance */}
          {anglePerf.length > 0 && (
            <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">🎯 Angle Performance</h3>
                <span className="text-xs text-gray-500">clicks ÷ posts = CTR · rotation auto-weighted</span>
              </div>
              <div className="space-y-2">
                {anglePerf.slice(0, 8).map((a, i) => {
                  const maxClicks = Math.max(...anglePerf.map(x => x.clicks), 1);
                  const barWidth = Math.max((a.clicks / maxClicks) * 100, 2);
                  return (
                    <div key={a.angle} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-4">{i + 1}</span>
                      <span className="text-sm text-gray-300 capitalize w-36 flex-shrink-0">
                        {a.angle.replace(/_/g, " ")}
                      </span>
                      <div className="flex-1 bg-gray-800 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-16 text-right">{a.clicks} clicks</span>
                      <span className="text-xs text-gray-600 w-16 text-right">{a.posts} posts</span>
                      <span className={`text-xs w-14 text-right font-mono ${
                        a.ctr > 0.1 ? "text-green-400" : a.ctr > 0 ? "text-yellow-400" : "text-gray-600"
                      }`}>
                        {a.ctr > 0 ? `${(a.ctr * 100).toFixed(1)}%` : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Engagement Data */}
          {engagement && engagement.totals.reach > 0 && (
            <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">📊 Facebook Engagement (Last 7 Days)</h3>
                <span className="text-xs text-gray-500">synced hourly</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: "Total Reach", value: engagement.totals.reach.toLocaleString(), icon: "👁️" },
                  { label: "Total Likes", value: engagement.totals.likes.toLocaleString(), icon: "❤️" },
                  { label: "Link Clicks", value: engagement.totals.clicks.toLocaleString(), icon: "🔗" },
                  { label: "Posts", value: engagement.totals.posts.toLocaleString(), icon: "📝" },
                ].map((s) => (
                  <div key={s.label} className="bg-gray-800 rounded-lg p-3 text-center">
                    <div className="text-xl mb-1">{s.icon}</div>
                    <div className="text-xl font-bold text-white">{s.value}</div>
                    <div className="text-xs text-gray-500">{s.label}</div>
                  </div>
                ))}
              </div>
              {engagement.best_post && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-xs text-blue-400 mb-1">🏆 Best performing post</p>
                  <p className="text-sm text-gray-300 mb-2">{engagement.best_post.text}...</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>👁️ {engagement.best_post.reach} reach</span>
                    <span>❤️ {engagement.best_post.likes} likes</span>
                    <span>🔗 {engagement.best_post.clicks} clicks</span>
                    <span className="capitalize">{engagement.best_post.angle?.replace(/_/g, " ")}</span>
                    {engagement.best_post.post_url && (
                      <a href={engagement.best_post.post_url} target="_blank" className="text-blue-400 hover:underline ml-auto">View →</a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Trending Now */}
          {trends && (
            <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">🔥 Trending Now in Nigeria</h3>
                <span className="text-xs text-gray-500">Google Trends · Live</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Relevant to ReportAfrica</p>
                  <div className="space-y-1">
                    {trends.relevant.length > 0 ? trends.relevant.slice(0, 5).map((t, i) => (
                      <div key={i} className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2">
                        <span className="text-orange-400 text-xs font-bold">#{i + 1}</span>
                        <span className="text-sm text-white capitalize">{t}</span>
                        <span className="ml-auto text-xs text-orange-400">● Relevant</span>
                      </div>
                    )) : <p className="text-gray-500 text-sm">No relevant topics right now</p>}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">All Trending</p>
                  <div className="space-y-1">
                    {trends.all_topics.slice(0, 5).map((t, i) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
                        <span className="text-gray-500 text-xs">#{i + 1}</span>
                        <span className="text-sm text-gray-300 capitalize">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Referral Links */}
          {referrals && (
            <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">🔗 Referral Link Performance</h3>
                <span className="text-sm text-gray-400">Total clicks: <span className="text-white font-bold">{referrals.total_clicks}</span></span>
              </div>
              {referrals.top_links.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gray-500 text-xs uppercase border-b border-gray-800">
                        <th className="text-left pb-2">Code</th>
                        <th className="text-left pb-2">Angle</th>
                        <th className="text-left pb-2">Clicks</th>
                        <th className="text-left pb-2">Link</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {referrals.top_links.slice(0, 8).map((link) => (
                        <tr key={link.code} className="text-gray-300">
                          <td className="py-2 font-mono text-xs text-blue-400">{link.code}</td>
                          <td className="py-2 capitalize">{link.angle?.replace("_", " ")}</td>
                          <td className="py-2">
                            <span className={`px-2 py-0.5 rounded text-xs ${link.clicks > 0 ? "bg-green-600/20 text-green-400" : "bg-gray-800 text-gray-500"}`}>
                              {link.clicks}
                            </span>
                          </td>
                          <td className="py-2">
                            <a
                              href={`https://marketpilot-backend.onrender.com/api/referrals/r/${link.code}`}
                              target="_blank"
                              className="text-xs text-blue-400 hover:underline"
                            >
                              Open →
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No referral links yet — they are auto-created when content is generated.</p>
              )}
            </div>
          )}

          {/* Platform Health */}
          {health && (
            <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">🔌 Platform Health</h3>
                <span className={`text-xs px-3 py-1 rounded-full ${
                  health.summary.broken === 0 ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400"
                }`}>
                  {health.summary.healthy}/4 connected
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { key: "facebook",  label: "Facebook",  icon: "📘", detail: health.facebook.page     || health.facebook.error  },
                  { key: "instagram", label: "Instagram", icon: "📸", detail: health.instagram.account || health.instagram.error },
                  { key: "linkedin",  label: "LinkedIn",  icon: "💼", detail: health.linkedin.name     || health.linkedin.error  },
                  { key: "twitter",   label: "Twitter/X", icon: "🐦", detail: health.twitter.username  || health.twitter.error   },
                ] as const).map(({ key, label, icon, detail }) => {
                  const ok = health[key].ok;
                  return (
                    <div key={key} className={`rounded-lg p-4 border ${
                      ok ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span>{icon}</span>
                        <span className="text-sm font-medium">{label}</span>
                        <span className={`ml-auto text-xs ${ok ? "text-green-400" : "text-red-400"}`}>
                          {ok ? "●" : "✕"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{detail || "—"}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="flex gap-2 flex-wrap">
              {quickActions.map((a) => (
                <a key={a.label} href={a.href} className={`px-3 py-2 ${a.color} rounded-lg text-xs transition-colors`}>
                  {a.label}
                </a>
              ))}
              {cronActions.map((a) => (
                <button
                  key={a.label}
                  onClick={() => runAction(a.label, a.endpoint, a.msg)}
                  disabled={actionLoading === a.label}
                  className={`px-3 py-2 ${a.color} rounded-lg text-xs transition-colors disabled:opacity-50`}
                >
                  {actionLoading === a.label ? "Running..." : a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Today's Activity Feed */}
          {recent.length > 0 && (
            <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">📋 Today's Activity</h3>
              <div className="space-y-2">
                {recent.map((post) => (
                  <div key={post.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span>{PLATFORM_ICONS[post.platform] || "📱"}</span>
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
