"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Header from "@/components/dashboard/header";
import {
  Settings,
  Palette,
  CreditCard,
  Users,
  Bell,
  Puzzle,
  Globe,
  Upload,
  Save,
  Check,
  Loader2,
  AlertCircle,
  RefreshCw,
  X,
  Eye,
  EyeOff,
  Unplug,
} from "lucide-react";

const tabs = [
  { key: "general", label: "General", icon: Settings },
  { key: "branding", label: "Branding", icon: Palette },
  { key: "billing", label: "Billing", icon: CreditCard },
  { key: "team", label: "Team", icon: Users },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "integrations", label: "Integrations", icon: Puzzle },
];

const comingSoonIntegrations = [
  { name: "Google Calendar", desc: "Sync meetings and availability", icon: "📅" },
  { name: "Slack", desc: "Team notifications and alerts", icon: "💬" },
  { name: "Zapier", desc: "Connect 5,000+ apps", icon: "⚡" },
];

// ═══════════════════════════════════════════
// STRIPE INTEGRATION COMPONENT
// ═══════════════════════════════════════════

function StripeIntegration() {
  const [connected, setConnected] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncPhase, setSyncPhase] = useState("");
  const [syncResult, setSyncResult] = useState<any>(null);
  const [error, setError] = useState("");

  // Check connection status on mount
  useEffect(() => {
    fetch("/api/integrations/stripe")
      .then((r) => r.json())
      .then((data) => {
        setConnected(data.connected || false);
        setAccountName(data.accountName || "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Check if a sync is already running (user navigated away and came back)
    fetch("/api/integrations/stripe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "sync-status" }),
    })
      .then((r) => r.json())
      .then((data) => {
        const p = data.progress;
        if (!p) return;

        if (p.status === "error") {
          // Stale/failed sync — show error, let user retry
          setError(p.error || "Previous sync failed. Click Import to try again.");
          return;
        }

        if (p.status === "complete") {
          if (data.lastResult) {
            setSyncResult({
              success: true,
              imported: data.lastResult.contacts,
              stripeData: { chargesFound: data.lastResult.charges },
              metrics: {
                totalRevenue: data.lastResult.totalRevenue,
                activeSubscribers: data.lastResult.active,
                lapsedCustomers: data.lastResult.lapsed,
              },
              duration: null,
            });
          }
          return;
        }

        // Check if the sync is stale (started more than 5 min ago with no progress updates)
        if (p.startedAt) {
          const elapsed = Date.now() - new Date(p.startedAt).getTime();
          if (elapsed > 5 * 60 * 1000) {
            // Stale — auto-reset
            fetch("/api/integrations/stripe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "reset-sync" }),
            }).catch(() => {});
            setError("Previous sync timed out. Click Import to try again.");
            return;
          }
        }

        // Active sync — show progress and start polling
        setSyncing(true);
        setSyncPhase("Sync in progress...");
        pollSyncStatus();
      })
      .catch(() => {});
  }, []);

  const handleConnect = async () => {
    if (!apiKey.trim() || !apiKey.startsWith("sk_")) {
      setError("Enter a valid Stripe secret key (starts with sk_)");
      return;
    }
    setConnecting(true);
    setError("");
    try {
      const res = await fetch("/api/integrations/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "connect", stripeSecretKey: apiKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to connect");
        return;
      }
      setConnected(true);
      setAccountName(data.accountName || "");
      setShowKeyInput(false);
      setApiKey("");
    } catch (err) {
      setError("Connection failed. Check your API key and try again.");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Disconnect Stripe? This will not delete imported contacts.")) return;
    try {
      await fetch("/api/integrations/stripe", { method: "DELETE" });
      setConnected(false);
      setAccountName("");
      setSyncResult(null);
    } catch {}
  };

  // Poll for sync status
  const pollInterval = React.useRef<NodeJS.Timeout | null>(null);

  const pollSyncStatus = () => {
    pollInterval.current = setInterval(async () => {
      try {
        const res = await fetch("/api/integrations/stripe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "sync-status" }),
        });
        const data = await res.json();
        const p = data.progress;

        if (!p) return;

        if (p.status === "starting") {
          setSyncPhase("Starting Stripe sync...");
        } else if (p.status === "pulling_customers") {
          setSyncPhase("Pulling customers from Stripe...");
        } else if (p.status === "customers_done") {
          setSyncPhase(`Found ${(p.customersFound || 0).toLocaleString()} customers...`);
        } else if (p.status === "pulling_subscriptions") {
          setSyncPhase(`Pulling subscriptions (${(p.customersFound || 0).toLocaleString()} customers found)...`);
        } else if (p.status === "subscriptions_done") {
          setSyncPhase(`Found ${(p.customersFound || 0).toLocaleString()} customers + ${(p.subscriptionsFound || 0).toLocaleString()} subscriptions...`);
        } else if (p.status === "pulling_charges") {
          setSyncPhase(`Pulling charges... ${(p.chargesSoFar || 0).toLocaleString()} so far (batch ${p.batch || 0})`);
        } else if (p.status === "enriching") {
          setSyncPhase(`Processing ${(p.chargesTotal || 0).toLocaleString()} charges...`);
        } else if (p.status === "error") {
          setSyncing(false);
          setSyncPhase("");
          setError(p.error || "Sync failed. Click Import to try again.");
          if (pollInterval.current) clearInterval(pollInterval.current);
        } else if (p.status === "complete") {
          setSyncing(false);
          setSyncPhase("");
          setSyncResult({
            success: true,
            imported: p.imported,
            metrics: { totalRevenue: p.totalRevenue },
            stripeData: { chargesFound: p.chargesProcessed },
            duration: null,
          });
          if (pollInterval.current) clearInterval(pollInterval.current);

          // Also grab the full last result
          const r2 = await fetch("/api/integrations/stripe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "sync-status" }),
          });
          const d2 = await r2.json();
          if (d2.lastResult) {
            setSyncResult({
              success: true,
              imported: d2.lastResult.contacts,
              stripeData: { chargesFound: d2.lastResult.charges },
              metrics: {
                totalRevenue: d2.lastResult.totalRevenue,
                activeSubscribers: d2.lastResult.active,
                lapsedCustomers: d2.lastResult.lapsed,
              },
              duration: null,
            });
          }
        }
      } catch {}
    }, 2000);
  };

  // Cleanup poll on unmount
  React.useEffect(() => {
    return () => { if (pollInterval.current) clearInterval(pollInterval.current); };
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setError("");
    setSyncResult(null);
    setSyncPhase("Starting Stripe sync...");
    try {
      // Clear any stale state first
      await fetch("/api/integrations/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset-sync" }),
      });

      const res = await fetch("/api/integrations/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync" }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Sync failed"); setSyncing(false); return; }

      // Start polling for progress
      pollSyncStatus();
    } catch (err) {
      setError("Failed to start sync.");
      setSyncing(false);
      setSyncPhase("");
    }
  };

  const handleDryRun = handleSync; // Dry run removed — sync is now background and instant

  return (
    <div className="space-y-4">
      {/* STRIPE CARD */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Integrations</h2>
        <p className="text-sm text-gray-500 mb-6">Connect your tools to Sonji</p>

        {/* Stripe */}
        <div className={`p-5 rounded-xl border-2 transition ${connected ? "border-emerald-200 bg-emerald-50/30" : "border-gray-100"}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center text-xl">💳</div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Stripe</p>
                <p className="text-xs text-gray-500">Import customers, sync payments, track revenue</p>
              </div>
            </div>
            {loading ? (
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            ) : connected ? (
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200">
                <Check className="w-3 h-3" /> Connected
              </span>
            ) : null}
          </div>

          {/* Connected State */}
          {connected && !loading && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{accountName}</p>
                  <p className="text-xs text-gray-400">Stripe account connected</p>
                </div>
                <button onClick={handleDisconnect} className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 transition">
                  <Unplug className="w-3.5 h-3.5" /> Disconnect
                </button>
              </div>

              {/* Sync Controls */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <button onClick={handleSync} disabled={syncing}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-lg transition">
                    {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    {syncing ? syncPhase || "Syncing..." : "Import Customers"}
                  </button>
                </div>
                {syncing && (
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    This runs in the background — feel free to navigate away. Your data will be ready when you come back.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Disconnected — Connect Flow */}
          {!connected && !loading && (
            <div className="space-y-3">
              {!showKeyInput ? (
                <button onClick={() => setShowKeyInput(true)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition">
                  Connect Stripe Account
                </button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">Stripe Secret Key</label>
                    <div className="relative">
                      <input
                        type="text"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        data-1p-ignore
                        data-lpignore="true"
                        data-form-type="other"
                        name="stripe_api_key_sonji"
                        id="stripe_api_key_sonji"
                        value={showKey ? apiKey : apiKey ? "•".repeat(Math.max(0, apiKey.length - 8)) + apiKey.slice(-8) : ""}
                        onChange={(e) => { setApiKey(e.target.value); setError(""); }}
                        onFocus={() => setShowKey(true)}
                        placeholder="sk_live_..."
                        className="w-full px-3.5 py-2.5 pr-20 text-sm font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300"
                      />
                      <button onClick={() => setShowKey(!showKey)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600">
                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">
                      Find this in your <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener" className="text-violet-600 hover:text-violet-700 underline">Stripe Dashboard → API Keys</a>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handleConnect} disabled={connecting}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-lg transition">
                      {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      {connecting ? "Verifying..." : "Connect"}
                    </button>
                    <button onClick={() => { setShowKeyInput(false); setApiKey(""); setError(""); }}
                      className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Resend Email Integration */}
        <ResendIntegration />

        {/* Twilio SMS Integration */}
        <TwilioIntegration />

        {/* CLYR Patient Sync — only for health_wellness tenants */}
        <CLYRSync />

        {/* Coming Soon */}
        <div className="mt-4 space-y-3">
          {comingSoonIntegrations.map((int) => (
            <div key={int.name} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl">{int.icon}</div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{int.name}</p>
                  <p className="text-xs text-gray-400">{int.desc}</p>
                </div>
              </div>
              <button className="text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 cursor-not-allowed">
                Coming Soon
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// RESEND EMAIL INTEGRATION COMPONENT
// ═══════════════════════════════════════════

function ResendIntegration() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState<"domain" | "byok">("domain");
  const [domain, setDomain] = useState("");
  const [fromName, setFromName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/integrations/resend").then(r => r.json())
      .then(d => { setConfig(d); if (d.configured) setExpanded(true); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleAddDomain = async () => {
    if (!domain.trim() || !domain.includes(".")) { setError("Enter a valid domain"); return; }
    setConnecting(true); setError(""); setSuccess("");
    try {
      const res = await fetch("/api/integrations/resend", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add-domain", domain: domain.trim(), fromName: fromName.trim() || undefined }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setConfig({ ...config, configured: false, domain: domain.trim(), domainVerified: false, dnsRecords: data.records });
      setSuccess("Domain added! Add the DNS records below to verify.");
    } catch { setError("Failed to add domain"); } finally { setConnecting(false); }
  };

  const handleVerify = async () => {
    setConnecting(true); setError(""); setSuccess("");
    try {
      const res = await fetch("/api/integrations/resend", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify-domain" }) });
      const data = await res.json();
      if (data.verified) { setSuccess("Domain verified! You can now send emails."); setConfig({ ...config, domainVerified: true, configured: true }); }
      else { setError("Domain not verified yet. DNS records may take up to 48 hours to propagate."); }
    } catch { setError("Verification failed"); } finally { setConnecting(false); }
  };

  const handleByok = async () => {
    if (!apiKey.startsWith("re_")) { setError("Key must start with re_"); return; }
    setConnecting(true); setError(""); setSuccess("");
    try {
      const res = await fetch("/api/integrations/resend", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "connect-byok", resendApiKey: apiKey }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setConfig({ ...config, configured: true, mode: "byok" });
      setSuccess("Resend connected! You can now add a sending domain.");
    } catch { setError("Failed to connect"); } finally { setConnecting(false); }
  };

  const handleDisconnect = async () => {
    if (!confirm("Disconnect email? This will remove your domain configuration.")) return;
    await fetch("/api/integrations/resend", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "disconnect" }) }).catch(() => {});
    setConfig(null); setExpanded(false); setSuccess(""); setDomain(""); setApiKey("");
  };

  const isConnected = config?.configured || config?.domainVerified;

  return (
    <div className="mt-4 border border-gray-100 rounded-xl overflow-hidden">
      <button onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full p-4 hover:bg-gray-50 transition">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl">📧</div>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900">Resend</p>
            <p className="text-xs text-gray-400">Transactional and marketing emails</p>
          </div>
        </div>
        {isConnected ? (
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">✓ Connected</span>
        ) : config?.domain ? (
          <span className="text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">Pending Verification</span>
        ) : (
          <span className="text-xs font-medium text-gray-500">Configure →</span>
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
          {isConnected && (
            <div className="flex items-center justify-between bg-emerald-50 rounded-lg p-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{config.domain || "BYOK Connected"}</p>
                <p className="text-xs text-gray-500">Sending from: {config.fromEmail || `noreply@${config.domain}`}</p>
              </div>
              <button onClick={handleDisconnect} className="text-xs text-red-500 hover:text-red-600 font-medium">Disconnect</button>
            </div>
          )}

          {!isConnected && (
            <>
              <div className="flex gap-2">
                <button onClick={() => setMode("domain")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full ${mode === "domain" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                  Add Sending Domain
                </button>
                <button onClick={() => setMode("byok")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full ${mode === "byok" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                  Use Your Own Resend Key
                </button>
              </div>

              {mode === "domain" && (
                <div className="space-y-2">
                  <input value={domain} onChange={e => setDomain(e.target.value)} placeholder="yourbusiness.com"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  <input value={fromName} onChange={e => setFromName(e.target.value)} placeholder="From name (e.g. Glow Med Spa)"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  <button onClick={handleAddDomain} disabled={connecting}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg">
                    {connecting ? "Adding..." : "Add Domain"}
                  </button>
                </div>
              )}

              {mode === "byok" && (
                <div className="space-y-2">
                  <input value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="re_xxxxxxxxx"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  <button onClick={handleByok} disabled={connecting}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg">
                    {connecting ? "Connecting..." : "Connect Resend"}
                  </button>
                </div>
              )}
            </>
          )}

          {/* DNS Records */}
          {config?.dnsRecords && !config?.domainVerified && (
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-gray-700">Add these DNS records to verify your domain:</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="text-gray-500"><th className="text-left py-1 pr-2">Type</th><th className="text-left py-1 pr-2">Name</th><th className="text-left py-1">Value</th></tr></thead>
                  <tbody>
                    {config.dnsRecords.map((r: any, i: number) => (
                      <tr key={i} className="border-t border-gray-200">
                        <td className="py-1.5 pr-2 font-mono text-gray-600">{r.type || r.record_type}</td>
                        <td className="py-1.5 pr-2 font-mono text-gray-600 break-all">{r.name || r.host}</td>
                        <td className="py-1.5 font-mono text-gray-600 break-all">{r.value || r.data}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={handleVerify} disabled={connecting}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg mt-2">
                {connecting ? "Checking..." : "Verify Domain"}
              </button>
            </div>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}
          {success && <p className="text-xs text-emerald-600">{success}</p>}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// TWILIO SMS INTEGRATION COMPONENT
// ═══════════════════════════════════════════

function TwilioIntegration() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState<"provision" | "byok">("provision");
  const [accountSid, setAccountSid] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [areaCode, setAreaCode] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/integrations/twilio").then(r => r.json())
      .then(d => { setConfig(d); if (d.configured) setExpanded(true); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleProvision = async () => {
    setConnecting(true); setError(""); setSuccess("");
    try {
      const res = await fetch("/api/integrations/twilio", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "provision", areaCode: areaCode || undefined }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setConfig({ ...config, configured: true, phoneNumber: data.phoneNumber, mode: "platform" });
      setSuccess(`Phone number provisioned: ${data.phoneNumber}`);
    } catch { setError("Provisioning failed"); } finally { setConnecting(false); }
  };

  const handleByok = async () => {
    if (!accountSid.startsWith("AC") || !authToken) { setError("Enter valid Twilio Account SID (starts with AC) and Auth Token"); return; }
    setConnecting(true); setError(""); setSuccess("");
    try {
      const res = await fetch("/api/integrations/twilio", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "connect-byok", accountSid, authToken }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setConfig({ ...config, configured: true, phoneNumber: data.phoneNumber, mode: "byok", availableNumbers: data.availableNumbers });
      setSuccess(`Twilio connected! Using ${data.phoneNumber || "your account"}`);
    } catch { setError("Connection failed"); } finally { setConnecting(false); }
  };

  const handleDisconnect = async () => {
    if (!confirm("Disconnect SMS? This will not release your phone number.")) return;
    await fetch("/api/integrations/twilio", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "disconnect" }) }).catch(() => {});
    setConfig(null); setExpanded(false); setSuccess(""); setAccountSid(""); setAuthToken("");
  };

  return (
    <div className="mt-3 border border-gray-100 rounded-xl overflow-hidden">
      <button onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full p-4 hover:bg-gray-50 transition">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-xl">💬</div>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900">Twilio</p>
            <p className="text-xs text-gray-400">SMS messaging and voice</p>
          </div>
        </div>
        {config?.configured ? (
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">✓ {config.phoneNumber}</span>
        ) : (
          <span className="text-xs font-medium text-gray-500">Configure →</span>
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
          {config?.configured && (
            <div className="flex items-center justify-between bg-emerald-50 rounded-lg p-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{config.phoneNumber}</p>
                <p className="text-xs text-gray-500">{config.mode === "byok" ? "Your Twilio account" : "Sonji-managed number"}</p>
              </div>
              <button onClick={handleDisconnect} className="text-xs text-red-500 hover:text-red-600 font-medium">Disconnect</button>
            </div>
          )}

          {!config?.configured && (
            <>
              <div className="flex gap-2">
                <button onClick={() => setMode("provision")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full ${mode === "provision" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                  Get a Number (Included)
                </button>
                <button onClick={() => setMode("byok")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full ${mode === "byok" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                  Use Your Own Twilio
                </button>
              </div>

              {mode === "provision" && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">We'll provision a dedicated phone number for your business. SMS costs are included in your plan.</p>
                  <input value={areaCode} onChange={e => setAreaCode(e.target.value)} placeholder="Preferred area code (optional, e.g. 239)"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  <button onClick={handleProvision} disabled={connecting}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg">
                    {connecting ? "Provisioning..." : "Get Phone Number"}
                  </button>
                </div>
              )}

              {mode === "byok" && (
                <div className="space-y-2">
                  <input value={accountSid} onChange={e => setAccountSid(e.target.value)} placeholder="Account SID (starts with AC)"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  <input value={authToken} onChange={e => setAuthToken(e.target.value)} placeholder="Auth Token" type="password"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  <button onClick={handleByok} disabled={connecting}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg">
                    {connecting ? "Connecting..." : "Connect Twilio"}
                  </button>
                </div>
              )}
            </>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}
          {success && <p className="text-xs text-emerald-600">{success}</p>}
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const initialTab = searchParams?.get("tab") || "general";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [tenant, setTenant] = useState<any>(null);
  const [tenantLoading, setTenantLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // General form state
  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");
  const [currency, setCurrency] = useState("USD");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");

  // Branding form state
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [accentColor, setAccentColor] = useState("#0f172a");

  // Notification state
  const [notifs, setNotifs] = useState<Record<string, boolean>>({
    newContact: true, dealStage: true, taskAssigned: true,
    formSubmission: true, meetingReminder: true, weeklyDigest: true,
  });

  // Load tenant data
  useEffect(() => {
    fetch("/api/tenant-settings").then(r => r.json()).then(d => {
      setTenant(d);
      setBusinessName(d.name || "");
      setSlug(d.slug || "");
      const s = d.settings || {};
      setTimezone(s.timezone || "America/New_York");
      setCurrency(s.currency || "USD");
      setDateFormat(s.dateFormat || "MM/DD/YYYY");
      const b = d.branding || {};
      setPrimaryColor(b.primaryColor || "#6366f1");
      setAccentColor(b.accentColor || "#0f172a");
      if (s.notifications) setNotifs({ ...notifs, ...s.notifications });
    }).catch(() => {}).finally(() => setTenantLoading(false));
  }, []);

  const handleSave = async (data: any) => {
    setSaving(true); setSaveMsg("");
    try {
      const res = await fetch("/api/tenant-settings", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) setSaveMsg("Saved!");
      else setSaveMsg("Failed to save");
      setTimeout(() => setSaveMsg(""), 2000);
    } catch { setSaveMsg("Failed"); }
    finally { setSaving(false); }
  };

  return (
    <>
      <Header title="Settings" />

      <div className="p-6">
        <div className="flex gap-6">
          {/* Sidebar Tabs */}
          <div className="w-56 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                      activeTab === tab.key ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}>
                    <Icon className={`w-4 h-4 ${activeTab === tab.key ? "text-indigo-600" : "text-gray-400"}`} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 max-w-2xl">

            {/* GENERAL */}
            {activeTab === "general" && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">General Settings</h2>
                <p className="text-sm text-gray-500 mb-6">Manage your workspace configuration</p>
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Business Name</label>
                    <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Workspace URL</label>
                    <div className="flex items-center">
                      <span className="px-3 py-2.5 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-200 rounded-l-lg">https://</span>
                      <input type="text" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        className="flex-1 px-3 py-2.5 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300" />
                      <span className="px-3 py-2.5 text-sm text-gray-500 bg-gray-50 border border-l-0 border-gray-200 rounded-r-lg">.sonji.io</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">Timezone</label>
                      <select value={timezone} onChange={(e) => setTimezone(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                        <option value="America/New_York">America/New_York (EST)</option>
                        <option value="America/Chicago">America/Chicago (CST)</option>
                        <option value="America/Denver">America/Denver (MST)</option>
                        <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">Currency</label>
                      <select value={currency} onChange={(e) => setCurrency(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                        <option value="USD">USD — US Dollar</option>
                        <option value="EUR">EUR — Euro</option>
                        <option value="GBP">GBP — British Pound</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Date Format</label>
                    <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                  {saveMsg && <span className="text-xs text-emerald-600 font-medium">{saveMsg}</span>}
                  <button onClick={() => handleSave({ name: businessName, slug, settings: { timezone, currency, dateFormat } })} disabled={saving}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* BRANDING */}
            {activeTab === "branding" && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Branding</h2>
                <p className="text-sm text-gray-500 mb-6">Customize how your CRM looks</p>
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Logo</label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-indigo-100 flex items-center justify-center border-2 border-dashed border-indigo-300">
                        <span className="text-xl font-bold text-indigo-600">{businessName?.[0] || "S"}</span>
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition">
                        <Upload className="w-4 h-4" /> Upload Logo
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">Primary Color</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                        <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
                          className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">Accent Color</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)}
                          className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                        <input type="text" value={accentColor} onChange={(e) => setAccentColor(e.target.value)}
                          className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Preview</label>
                    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: primaryColor }}>
                          <span className="text-white text-xs font-bold">{businessName?.[0] || "S"}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{businessName || "Your Business"}</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="px-3 py-1.5 text-xs font-medium text-white rounded-lg" style={{ background: primaryColor }}>Primary Button</div>
                        <div className="px-3 py-1.5 text-xs font-medium bg-white text-gray-700 border border-gray-200 rounded-lg">Secondary Button</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                  {saveMsg && <span className="text-xs text-emerald-600 font-medium">{saveMsg}</span>}
                  <button onClick={() => handleSave({ branding: { primaryColor, accentColor } })} disabled={saving}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Branding
                  </button>
                </div>
              </div>
            )}

            {/* BILLING */}
            {activeTab === "billing" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Current Plan</h2>
                  <p className="text-sm text-gray-500 mb-4">Manage your subscription</p>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{tenant?.plan ? `${tenant.plan.charAt(0).toUpperCase()}${tenant.plan.slice(1)} Plan` : "Free Trial"}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Unlimited contacts · All features included</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Billing not yet configured</p>
                      <p className="text-xs text-gray-400 mt-1">Stripe billing will be enabled before launch</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
                  <div className="p-4 border border-dashed border-gray-200 rounded-xl text-center">
                    <p className="text-sm text-gray-500">No payment method on file</p>
                    <p className="text-xs text-gray-400 mt-1">Payment will be configured when Stripe billing goes live</p>
                  </div>
                </div>
              </div>
            )}

            {/* TEAM */}
            {activeTab === "team" && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Manage who has access to this workspace</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
                    <Users className="w-4 h-4" /> Invite Member
                  </button>
                </div>
                <div className="divide-y divide-gray-100">
                  <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center">
                        <span className="text-xs font-semibold text-white">O</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Orlando</p>
                        <p className="text-xs text-gray-400">hello@sonji.io</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">Active</span>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">Owner</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 border border-dashed border-gray-200 rounded-xl text-center">
                  <p className="text-sm text-gray-500">Team invites will be functional once Clerk is in production mode</p>
                  <p className="text-xs text-gray-400 mt-1">Roles: Owner, Admin, Member, Viewer — RBAC with 35 permissions</p>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS */}
            {activeTab === "notifications" && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Notification Preferences</h2>
                <p className="text-sm text-gray-500 mb-6">Choose what you want to be notified about</p>
                <div className="space-y-4">
                  {[
                    { key: "newContact", label: "New contact created", desc: "Get notified when a new contact is added" },
                    { key: "dealStage", label: "Deal stage changes", desc: "Get notified when deals move between pipeline stages" },
                    { key: "taskAssigned", label: "Task assigned to you", desc: "Get notified when someone assigns you a task" },
                    { key: "formSubmission", label: "Form submissions", desc: "Get notified when someone submits a form" },
                    { key: "meetingReminder", label: "Meeting reminders", desc: "15-minute reminders before meetings" },
                    { key: "weeklyDigest", label: "Weekly digest", desc: "Weekly summary of CRM activity" },
                  ].map((n) => (
                    <div key={n.key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{n.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{n.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={notifs[n.key] ?? true}
                          onChange={(e) => setNotifs({ ...notifs, [n.key]: e.target.checked })}
                          className="sr-only peer" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-indigo-500/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                      </label>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                  {saveMsg && <span className="text-xs text-emerald-600 font-medium">{saveMsg}</span>}
                  <button onClick={() => handleSave({ settings: { notifications: notifs } })} disabled={saving}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* INTEGRATIONS */}
            {activeTab === "integrations" && (
              <StripeIntegration />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function CLYRSync() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [tenant, setTenant] = useState<any>(null);

  useEffect(() => {
    try {
      const t = JSON.parse(sessionStorage.getItem("sonji-tenant") || "{}");
      setTenant(t);
    } catch {}
  }, []);

  // Only show for health_wellness tenants
  if (!tenant || tenant.industry !== "health_wellness") return null;

  const handleSync = async () => {
    setSyncing(true); setError(""); setResult(null);
    try {
      const res = await fetch("https://clyr-backend.onrender.com/api/admin/backfill-sonji?key=CLYR2026");
      const data = await res.json();
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || "Sync failed");
      }
    } catch (e: any) {
      setError(e.message || "Connection failed");
    } finally { setSyncing(false); }
  };

  return (
    <div className="mt-4 border border-gray-100 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-xl">🏥</div>
          <div>
            <p className="text-sm font-medium text-gray-900">CLYR Health Sync</p>
            <p className="text-xs text-gray-400">Push all patients from CLYR backend to Sonji</p>
          </div>
        </div>
        <button onClick={handleSync} disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-lg transition">
          {syncing ? "Syncing..." : "Sync Now"}
        </button>
      </div>
      {result && (
        <div className="px-4 pb-4">
          <div className="bg-emerald-50 rounded-lg p-3 text-sm text-emerald-700">
            ✓ Synced {result.synced} of {result.total} patients to Sonji
          </div>
        </div>
      )}
      {error && (
        <div className="px-4 pb-4">
          <div className="bg-red-50 rounded-lg p-3 text-sm text-red-700">{error}</div>
        </div>
      )}
    </div>
  );
}
