"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Client {
  id: number;
  name: string;
  email: string;
  plan: string;
  brand_name: string;
  active: boolean;
  created_at: string;
  last_login_at: string | null;
}

interface Campaign {
  id: number;
  name: string;
  app_name: string;
  client_id: number | null;
}

type Tab = "clients" | "create-client" | "create-campaign";

const PLAN_COLORS: Record<string, string> = {
  starter: "bg-gray-600/20 text-gray-400",
  growth: "bg-blue-600/20 text-blue-400",
  agency: "bg-purple-600/20 text-purple-400",
};

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("clients");
  const [clients, setClients] = useState<Client[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  // Create client form
  const [newClient, setNewClient] = useState({ name: "", email: "", password: "", plan: "starter", brand_name: "", website_url: "" });

  // Create campaign form
  const [newCampaign, setNewCampaign] = useState({ name: "", app_name: "", app_url: "", description: "", target_audience: "", client_id: "" });

  // Assign campaign form
  const [assignClientId, setAssignClientId] = useState("");
  const [assignCampaignId, setAssignCampaignId] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [c, camp] = await Promise.all([
        api.get("/auth/clients"),
        api.get("/campaigns/"),
      ]);
      setClients(c);
      setCampaigns(camp);
    } catch (err: unknown) {
      flash(err instanceof Error ? err.message : "Failed to load data — backend may still be deploying", true);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const flash = (m: string, isError = false) => {
    if (isError) setError(m); else setMsg(m);
    setTimeout(() => { setMsg(""); setError(""); }, 4000);
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/create-client", newClient);
      flash(`✅ Client created — ${res.email} (ID: ${res.id})`);
      setNewClient({ name: "", email: "", password: "", plan: "starter", brand_name: "", website_url: "" });
      await loadData();
      setTab("clients");
    } catch (err: unknown) {
      flash(err instanceof Error ? err.message : "Failed to create client", true);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...newCampaign,
        client_id: newCampaign.client_id ? parseInt(newCampaign.client_id) : null,
      };
      const res = await api.post("/campaigns/", payload);
      flash(`✅ Campaign created — ID: ${res.id}`);
      setNewCampaign({ name: "", app_name: "", app_url: "", description: "", target_audience: "", client_id: "" });
      loadData();
      setTab("clients");
    } catch (err: unknown) {
      flash(err instanceof Error ? err.message : "Failed to create campaign", true);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/auth/assign-campaign", {
        client_id: parseInt(assignClientId),
        campaign_id: parseInt(assignCampaignId),
      });
      flash("✅ Campaign assigned to client");
      setAssignClientId("");
      setAssignCampaignId("");
      loadData();
    } catch (err: unknown) {
      flash(err instanceof Error ? err.message : "Failed to assign", true);
    }
  };

  const handleToggleClient = async (id: number) => {
    await api.patch(`/auth/clients/${id}/toggle`);
    loadData();
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "clients", label: "All Clients", icon: "👥" },
    { key: "create-client", label: "New Client", icon: "➕" },
    { key: "create-campaign", label: "New Campaign", icon: "🎯" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">⚙️ Admin Panel</h2>
        <span className="text-xs text-purple-400 bg-purple-400/10 px-3 py-1 rounded-full">Agency Access</span>
      </div>

      {/* Flash messages */}
      {msg && <div className="mb-4 px-4 py-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl text-sm">{msg}</div>}
      {error && <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-800 pb-3">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* --- CLIENTS TAB --- */}
      {tab === "clients" && (
        <div>
          {loading ? <p className="text-gray-400">Loading...</p> : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-500 text-sm">{clients.length} client{clients.length !== 1 ? "s" : ""} total</p>
                <button onClick={loadData} className="text-xs text-blue-400 hover:text-blue-300 px-3 py-1.5 bg-blue-500/10 rounded-lg transition-colors">↻ Refresh</button>
              </div>
              <div className="space-y-3">
                {clients.map((c) => {
                  const clientCampaigns = campaigns.filter((camp) => camp.client_id === c.id);
                  return (
                    <div key={c.id} className={`bg-gray-900 border rounded-xl p-5 ${c.active ? "border-gray-800" : "border-red-500/30 opacity-60"}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-bold text-white">{c.name}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${PLAN_COLORS[c.plan] ?? "bg-gray-700 text-gray-300"}`}>
                              {c.plan}
                            </span>
                            {!c.active && <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs">Suspended</span>}
                          </div>
                          <p className="text-gray-400 text-sm">{c.email}</p>
                          {c.brand_name && <p className="text-gray-500 text-xs mt-1">Brand: {c.brand_name}</p>}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                            <span>ID: {c.id}</span>
                            <span>Joined: {new Date(c.created_at).toLocaleDateString()}</span>
                            <span>Last login: {c.last_login_at ? new Date(c.last_login_at).toLocaleDateString() : "Never"}</span>
                          </div>
                          {/* Campaigns */}
                          {clientCampaigns.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {clientCampaigns.map((camp) => (
                                <span key={camp.id} className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs rounded-lg">
                                  🎯 {camp.name} (ID: {camp.id})
                                </span>
                              ))}
                            </div>
                          )}
                          {clientCampaigns.length === 0 && (
                            <p className="text-xs text-yellow-500/70 mt-2">⚠️ No campaign assigned</p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <button onClick={() => handleToggleClient(c.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${c.active ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-green-500/10 text-green-400 hover:bg-green-500/20"}`}>
                            {c.active ? "Suspend" : "Activate"}
                          </button>
                          <button onClick={() => { setAssignClientId(String(c.id)); setTab("create-campaign"); }}
                            className="px-3 py-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg text-xs font-medium transition-colors">
                            + Campaign
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Assign Campaign Form */}
              {campaigns.length > 0 && (
                <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <h3 className="font-bold text-white mb-4">🔗 Assign Existing Campaign to Client</h3>
                  <form onSubmit={handleAssign} className="grid sm:grid-cols-3 gap-3">
                    <select value={assignClientId} onChange={(e) => setAssignClientId(e.target.value)} required
                      className="px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500">
                      <option value="">Select client...</option>
                      {clients.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                    </select>
                    <select value={assignCampaignId} onChange={(e) => setAssignCampaignId(e.target.value)} required
                      className="px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500">
                      <option value="">Select campaign...</option>
                      {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.app_name}</option>)}
                    </select>
                    <button type="submit" className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors">
                      Assign →
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* --- CREATE CLIENT TAB --- */}
      {tab === "create-client" && (
        <div className="max-w-xl">
          <h3 className="font-bold text-white mb-6">Create New Client Account</h3>
          <form onSubmit={handleCreateClient} className="space-y-4">
            {[
              { label: "Full Name", key: "name", placeholder: "e.g. Chidi Okafor", type: "text" },
              { label: "Email Address", key: "email", placeholder: "client@example.com", type: "email" },
              { label: "Password", key: "password", placeholder: "Min 8 characters", type: "password" },
              { label: "Brand Name", key: "brand_name", placeholder: "e.g. Chidi Foods", type: "text" },
              { label: "Website URL", key: "website_url", placeholder: "https://chidifoods.com", type: "text" },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-sm text-gray-400 mb-1.5 block">{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} value={(newClient as Record<string, string>)[f.key]}
                  onChange={(e) => setNewClient({ ...newClient, [f.key]: e.target.value })}
                  required={["name", "email", "password"].includes(f.key)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            ))}
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Plan</label>
              <select value={newClient.plan} onChange={(e) => setNewClient({ ...newClient, plan: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500">
                <option value="starter">Starter</option>
                <option value="growth">Growth</option>
                <option value="agency">Agency</option>
              </select>
            </div>
            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all">
              Create Client →
            </button>
          </form>
        </div>
      )}

      {/* --- CREATE CAMPAIGN TAB --- */}
      {tab === "create-campaign" && (
        <div className="max-w-xl">
          <h3 className="font-bold text-white mb-6">Create New Campaign</h3>
          <form onSubmit={handleCreateCampaign} className="space-y-4">
            {[
              { label: "Campaign Name", key: "name", placeholder: "e.g. Chidi Foods Marketing" },
              { label: "App / Brand Name", key: "app_name", placeholder: "e.g. Chidi Foods" },
              { label: "Website / App URL", key: "app_url", placeholder: "https://chidifoods.com" },
              { label: "Description", key: "description", placeholder: "What does this brand do?" },
              { label: "Target Audience", key: "target_audience", placeholder: "e.g. Nigerian food lovers, 18-45" },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-sm text-gray-400 mb-1.5 block">{f.label}</label>
                <input type="text" placeholder={f.placeholder} value={(newCampaign as Record<string, string>)[f.key]}
                  onChange={(e) => setNewCampaign({ ...newCampaign, [f.key]: e.target.value })}
                  required={["name", "app_name", "app_url"].includes(f.key)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            ))}
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Assign to Client (optional)</label>
              <select value={newCampaign.client_id} onChange={(e) => setNewCampaign({ ...newCampaign, client_id: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500">
                <option value="">No client yet</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.email}</option>)}
              </select>
            </div>
            <button type="submit" className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all">
              Create Campaign →
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
