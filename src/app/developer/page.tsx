"use client";
import { useState, useEffect } from "react";
import {
    Cpu, Plus, Trash2, Activity, DollarSign, Zap,
    Server, Cloud, RefreshCw, ArrowUpRight, BarChart3,
    Wallet, Clock, Shield, ChevronDown, Globe, Terminal
} from "lucide-react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ModelCard {
    model_id: string;
    model_name: string;
    provider: string;
    status: string;
    health_score: number;
    total_earnings: number;
    total_requests: number;
    average_latency_ms: number;
}

interface EarningRecord {
    id: string;
    model_id: string;
    job_id: string;
    gross_amount: number;
    developer_share: number;
    platform_share: number;
    tokens_used: number;
    timestamp: string;
}

interface Profile {
    display_name: string;
    uid: string;
    wallet_address: string;
    total_earnings: number;
    pending_payout: number;
    models_registered: number;
    total_jobs_completed: number;
    total_tokens_consumed: number;
}

interface CreditSummary {
    total_tokens_consumed: number;
    total_gross_revenue: number;
    total_developer_earnings: number;
    total_jobs_processed: number;
    platform_fee_percent: number;
    developer_fee_percent: number;
}

const MOCK_UID = "dev_sangam_001";

const PROVIDER_ICONS: Record<string, any> = {
    ollama: Terminal,
    openrouter: Globe,
    vertex: Cloud,
    custom_api: Server
};

const STATUS_COLORS: Record<string, string> = {
    active: "#00ff88",
    offline: "#ff4444",
    quarantined: "#ffaa00",
    pending_validation: "#8888ff"
};

export default function DeveloperPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [models, setModels] = useState<ModelCard[]>([]);
    const [earnings, setEarnings] = useState<EarningRecord[]>([]);
    const [creditSummary, setCreditSummary] = useState<CreditSummary | null>(null);
    const [activeTab, setActiveTab] = useState<"cloud" | "ollama">("cloud");
    const [showConnect, setShowConnect] = useState(false);

    const [apiProvider, setApiProvider] = useState("openrouter");
    const [apiModelName, setApiModelName] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [apiEndpoint, setApiEndpoint] = useState("");

    const [ollamaModel, setOllamaModel] = useState("llama3");
    const [ollamaHost, setOllamaHost] = useState("http://localhost:11434");

    const [savings, setSavings] = useState<{ total_tokens_routed: number, total_savings_usd: number, efficiency_score: number, cost_reduction_percent: string } | null>(null);

    useEffect(() => {
        loadProfile();
        loadModels();
        loadEarnings();
        loadSavings();
    }, []);

    async function loadProfile() {
        try {
            const res = await fetch(`${API}/v1/developer/${MOCK_UID}/profile`);
            if (res.ok) setProfile(await res.json());
        } catch { }
    }
    async function loadModels() {
        try {
            const res = await fetch(`${API}/v1/developer/${MOCK_UID}/models`);
            if (res.ok) {
                const data = await res.json();
                setModels(data.models || []);
            }
        } catch { }
    }
    async function loadEarnings() {
        try {
            const res = await fetch(`${API}/v1/developer/${MOCK_UID}/earnings`);
            if (res.ok) {
                const data = await res.json();
                setEarnings(data.history || []);
                setCreditSummary(data.summary || null);
            }
        } catch { }
    }
    async function loadSavings() {
        try {
            const res = await fetch(`${API}/v1/analytics/savings/${MOCK_UID}`);
            if (res.ok) {
                setSavings(await res.json());
            }
        } catch { }
    }

    async function connectCloudModel() {
        const res = await fetch(`${API}/v1/developer/${MOCK_UID}/models/connect-api`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                provider: apiProvider,
                model_name: apiModelName,
                api_key: apiKey,
                endpoint: apiEndpoint
            })
        });
        if (res.ok) {
            setApiModelName("");
            setApiKey("");
            setApiEndpoint("");
            loadModels();
            loadProfile();
        }
    }

    async function connectOllama() {
        const res = await fetch(`${API}/v1/developer/${MOCK_UID}/models/connect-ollama`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model_name: ollamaModel, host: ollamaHost })
        });
        if (res.ok) {
            setOllamaModel("llama3");
            loadModels();
            loadProfile();
        }
    }

    async function disconnectModel(modelId: string) {
        await fetch(`${API}/v1/developer/${MOCK_UID}/models/${modelId}`, { method: "DELETE" });
        loadModels();
        loadProfile();
    }

    async function healthCheck(modelId: string) {
        await fetch(`${API}/v1/developer/${MOCK_UID}/models/${modelId}/health`, { method: "POST" });
        loadModels();
    }

    return (
        <div style={{ padding: "32px", maxWidth: 1400, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
                <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                    <Cpu size={24} color="#fff" />
                </div>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", margin: 0 }}>
                        Developer Console
                    </h1>
                    <p style={{ color: "#888", margin: 0, fontSize: 14 }}>
                        Connect models, track earnings, manage your fleet
                    </p>
                </div>
            </div>

            {/* Stats Bar */}
            <div style={{
                display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16, marginBottom: 32
            }}>
                {[
                    {
                        label: "Total Savings",
                        value: `$${(savings?.total_savings_usd || 0).toFixed(2)}`,
                        icon: Zap, color: "#00ff88"
                    },
                    {
                        label: "Cost Reduction",
                        value: savings?.cost_reduction_percent || "0%",
                        icon: Shield, color: "#6366f1"
                    },
                    {
                        label: "Active Payout",
                        value: `$${(profile?.pending_payout || 0).toFixed(2)}`,
                        icon: Wallet, color: "#ffaa00"
                    },
                    {
                        label: "Models Active",
                        value: String(profile?.models_registered || models.length || 0),
                        icon: Server, color: "#00ccff"
                    },
                    {
                        label: "Jobs Completed",
                        value: String(profile?.total_jobs_completed || 0),
                        icon: Activity, color: "#ff66cc"
                    },
                    {
                        label: "Mesh Efficiency",
                        value: `${((savings?.efficiency_score || 0.94) * 100).toFixed(0)}%`,
                        icon: BarChart3, color: "#00ff88"
                    }
                ].map((stat, i) => (
                    <div key={i} style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 16, padding: 16
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <stat.icon size={14} color={stat.color} />
                            <span style={{ color: "#666", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
                                {stat.label}
                            </span>
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: stat.color }}>
                            {stat.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Connect Model Button */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: 0 }}>
                    Model Fleet ({models.length})
                </h2>
                <button
                    onClick={() => router.push("/connect")}
                    style={{
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        color: "#fff", border: "none", borderRadius: 12,
                        padding: "12px 24px", cursor: "pointer", fontWeight: 700,
                        display: "flex", alignItems: "center", gap: 8, fontSize: 14
                    }}
                >
                    <Plus size={16} /> Connect Model
                </button>
            </div>

            {/* Connect Panel */}
            {showConnect && (
                <div style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 16, padding: 24, marginBottom: 24
                }}>
                    <div style={{ display: "flex", gap: 0, marginBottom: 24 }}>
                        {(["cloud", "ollama"] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    background: activeTab === tab ? "rgba(99,102,241,0.2)" : "transparent",
                                    color: activeTab === tab ? "#818cf8" : "#666",
                                    border: "1px solid",
                                    borderColor: activeTab === tab ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.06)",
                                    borderRadius: tab === "cloud" ? "12px 0 0 12px" : "0 12px 12px 0",
                                    padding: "12px 32px", cursor: "pointer", fontWeight: 700, fontSize: 14
                                }}
                            >
                                {tab === "cloud" ? (
                                    <><Cloud size={14} style={{ marginRight: 8, verticalAlign: "middle" }} />Cloud API</>
                                ) : (
                                    <><Terminal size={14} style={{ marginRight: 8, verticalAlign: "middle" }} />Local Ollama</>
                                )}
                            </button>
                        ))}
                    </div>

                    {activeTab === "cloud" ? (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <div>
                                <label style={{ color: "#888", fontSize: 12, marginBottom: 6, display: "block" }}>Provider</label>
                                <select
                                    value={apiProvider}
                                    onChange={e => setApiProvider(e.target.value)}
                                    style={{
                                        width: "100%", background: "rgba(0,0,0,0.3)", color: "#fff",
                                        border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
                                        padding: "12px 16px", fontSize: 14
                                    }}
                                >
                                    <option value="openrouter">OpenRouter</option>
                                    <option value="vertex">Google Vertex AI</option>
                                    <option value="custom_api">Custom API</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ color: "#888", fontSize: 12, marginBottom: 6, display: "block" }}>Model Name</label>
                                <input
                                    value={apiModelName}
                                    onChange={e => setApiModelName(e.target.value)}
                                    placeholder="deepseek/deepseek-chat-v3"
                                    style={{
                                        width: "100%", background: "rgba(0,0,0,0.3)", color: "#fff",
                                        border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
                                        padding: "12px 16px", fontSize: 14
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ color: "#888", fontSize: 12, marginBottom: 6, display: "block" }}>API Key</label>
                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={e => setApiKey(e.target.value)}
                                    placeholder="sk-or-v1-..."
                                    style={{
                                        width: "100%", background: "rgba(0,0,0,0.3)", color: "#fff",
                                        border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
                                        padding: "12px 16px", fontSize: 14
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ color: "#888", fontSize: 12, marginBottom: 6, display: "block" }}>Endpoint URL (optional)</label>
                                <input
                                    value={apiEndpoint}
                                    onChange={e => setApiEndpoint(e.target.value)}
                                    placeholder="https://openrouter.ai/api/v1"
                                    style={{
                                        width: "100%", background: "rgba(0,0,0,0.3)", color: "#fff",
                                        border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
                                        padding: "12px 16px", fontSize: 14
                                    }}
                                />
                            </div>
                            <div style={{ gridColumn: "1 / -1" }}>
                                <button
                                    onClick={connectCloudModel}
                                    style={{
                                        background: "linear-gradient(135deg, #00ff88, #00ccaa)",
                                        color: "#000", border: "none", borderRadius: 12,
                                        padding: "14px 32px", cursor: "pointer", fontWeight: 800, fontSize: 14,
                                        width: "100%"
                                    }}
                                >
                                    Connect Cloud Model →
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <div>
                                <label style={{ color: "#888", fontSize: 12, marginBottom: 6, display: "block" }}>Model Name</label>
                                <input
                                    value={ollamaModel}
                                    onChange={e => setOllamaModel(e.target.value)}
                                    placeholder="llama3, mistral, codellama..."
                                    style={{
                                        width: "100%", background: "rgba(0,0,0,0.3)", color: "#fff",
                                        border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
                                        padding: "12px 16px", fontSize: 14
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ color: "#888", fontSize: 12, marginBottom: 6, display: "block" }}>Ollama Host</label>
                                <input
                                    value={ollamaHost}
                                    onChange={e => setOllamaHost(e.target.value)}
                                    placeholder="http://localhost:11434"
                                    style={{
                                        width: "100%", background: "rgba(0,0,0,0.3)", color: "#fff",
                                        border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
                                        padding: "12px 16px", fontSize: 14
                                    }}
                                />
                            </div>
                            <div style={{ gridColumn: "1 / -1" }}>
                                <button
                                    onClick={connectOllama}
                                    style={{
                                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                        color: "#fff", border: "none", borderRadius: 12,
                                        padding: "14px 32px", cursor: "pointer", fontWeight: 800, fontSize: 14,
                                        width: "100%"
                                    }}
                                >
                                    Connect Ollama Model →
                                </button>
                            </div>
                            <div style={{
                                gridColumn: "1 / -1",
                                background: "rgba(99,102,241,0.08)",
                                border: "1px solid rgba(99,102,241,0.15)",
                                borderRadius: 12, padding: 16
                            }}>
                                <p style={{ color: "#818cf8", fontSize: 13, margin: 0, fontWeight: 600, marginBottom: 8 }}>
                                    CLI Alternative
                                </p>
                                <code style={{
                                    color: "#00ff88", fontSize: 13, fontFamily: "JetBrains Mono, monospace",
                                    background: "rgba(0,0,0,0.4)", padding: "8px 12px", borderRadius: 8, display: "block"
                                }}>
                                    python scripts/developer_cli.py connect-ollama --model llama3 --host http://localhost:11434
                                </code>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Model Fleet Grid */}
            <div style={{
                display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380, 1fr))", gap: 16, marginBottom: 40
            }}>
                {models.length === 0 ? (
                    <div style={{
                        gridColumn: "1 / -1",
                        background: "rgba(255,255,255,0.02)",
                        border: "1px dashed rgba(255,255,255,0.08)",
                        borderRadius: 16, padding: 48, textAlign: "center"
                    }}>
                        <Server size={40} color="#333" style={{ marginBottom: 16 }} />
                        <p style={{ color: "#555", fontSize: 16, margin: 0 }}>
                            No models connected yet. Click "Connect Model" to start earning.
                        </p>
                    </div>
                ) : models.map((m, i) => {
                    const ProvIcon = PROVIDER_ICONS[m.provider] || Server;
                    const statusColor = STATUS_COLORS[m.status] || "#888";
                    return (
                        <div key={m.model_id || i} style={{
                            background: "rgba(255,255,255,0.03)",
                            border: `1px solid rgba(255,255,255,0.06)`,
                            borderRadius: 16, padding: 20, position: "relative",
                            transition: "border-color 0.3s",
                        }}>
                            <div style={{
                                position: "absolute", top: 16, right: 16,
                                display: "flex", gap: 8
                            }}>
                                <button
                                    onClick={() => healthCheck(m.model_id)}
                                    style={{
                                        background: "rgba(255,255,255,0.05)", border: "none",
                                        borderRadius: 8, padding: 8, cursor: "pointer"
                                    }}
                                    title="Health Check"
                                >
                                    <RefreshCw size={14} color="#888" />
                                </button>
                                <button
                                    onClick={() => disconnectModel(m.model_id)}
                                    style={{
                                        background: "rgba(255,68,68,0.1)", border: "none",
                                        borderRadius: 8, padding: 8, cursor: "pointer"
                                    }}
                                    title="Disconnect"
                                >
                                    <Trash2 size={14} color="#ff4444" />
                                </button>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 10,
                                    background: `${statusColor}15`,
                                    display: "flex", alignItems: "center", justifyContent: "center"
                                }}>
                                    <ProvIcon size={20} color={statusColor} />
                                </div>
                                <div>
                                    <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>
                                        {m.model_name}
                                    </div>
                                    <div style={{ color: "#666", fontSize: 12 }}>
                                        {m.provider.toUpperCase()} • {m.model_id?.slice(0, 8)}
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                display: "flex", alignItems: "center", gap: 8, marginBottom: 16
                            }}>
                                <div style={{
                                    width: 8, height: 8, borderRadius: "50%",
                                    background: statusColor,
                                    boxShadow: `0 0 8px ${statusColor}60`
                                }} />
                                <span style={{ color: statusColor, fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>
                                    {m.status}
                                </span>
                                <div style={{
                                    flex: 1, height: 4, background: "rgba(255,255,255,0.05)",
                                    borderRadius: 2, marginLeft: 8
                                }}>
                                    <div style={{
                                        width: `${(m.health_score || 0) * 100}%`,
                                        height: "100%", borderRadius: 2,
                                        background: statusColor,
                                        transition: "width 0.5s"
                                    }} />
                                </div>
                                <span style={{ color: "#666", fontSize: 11 }}>
                                    {((m.health_score || 0) * 100).toFixed(0)}%
                                </span>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                                {[
                                    { label: "Earnings", value: `$${(m.total_earnings || 0).toFixed(2)}`, color: "#00ff88" },
                                    { label: "Requests", value: String(m.total_requests || 0), color: "#00ccff" },
                                    { label: "Latency", value: `${(m.average_latency_ms || 0).toFixed(0)}ms`, color: "#ffaa00" }
                                ].map((s, j) => (
                                    <div key={j} style={{
                                        background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "8px 12px", textAlign: "center"
                                    }}>
                                        <div style={{ color: "#555", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
                                            {s.label}
                                        </div>
                                        <div style={{ color: s.color, fontSize: 16, fontWeight: 800 }}>
                                            {s.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Earnings & Credit Section */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, marginBottom: 32 }}>
                {/* Earnings Table */}
                <div style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 16, padding: 24
                }}>
                    <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: "0 0 20px 0" }}>
                        Earnings History
                    </h3>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr>
                                    {["Job ID", "Gross", "Your 80%", "Platform 20%", "Tokens", "Time"].map(h => (
                                        <th key={h} style={{
                                            color: "#555", fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                                            letterSpacing: 1, padding: "8px 12px", textAlign: "left",
                                            borderBottom: "1px solid rgba(255,255,255,0.06)"
                                        }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {earnings.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{ color: "#444", padding: 24, textAlign: "center" }}>
                                            No earnings recorded yet. Connect a model and start processing jobs.
                                        </td>
                                    </tr>
                                ) : earnings.map((e, i) => (
                                    <tr key={e.id || i} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                                        <td style={{ color: "#888", fontSize: 13, padding: "12px" }}>
                                            {e.job_id?.slice(0, 8)}...
                                        </td>
                                        <td style={{ color: "#fff", fontSize: 13, padding: "12px", fontWeight: 600 }}>
                                            ${e.gross_amount.toFixed(2)}
                                        </td>
                                        <td style={{ color: "#00ff88", fontSize: 13, padding: "12px", fontWeight: 700 }}>
                                            +${e.developer_share.toFixed(2)}
                                        </td>
                                        <td style={{ color: "#666", fontSize: 13, padding: "12px" }}>
                                            ${e.platform_share.toFixed(2)}
                                        </td>
                                        <td style={{ color: "#00ccff", fontSize: 13, padding: "12px" }}>
                                            {e.tokens_used.toLocaleString()}
                                        </td>
                                        <td style={{ color: "#555", fontSize: 12, padding: "12px" }}>
                                            {e.timestamp?.slice(0, 16)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Credit Summary Panel */}
                <div style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 16, padding: 24
                }}>
                    <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: "0 0 20px 0" }}>
                        Credit Summary
                    </h3>
                    {[
                        { label: "Total Tokens Used", value: (creditSummary?.total_tokens_consumed || 0).toLocaleString(), color: "#00ccff" },
                        { label: "Gross Revenue Generated", value: `$${(creditSummary?.total_gross_revenue || 0).toFixed(2)}`, color: "#fff" },
                        { label: "Your Earnings (80%)", value: `$${(creditSummary?.total_developer_earnings || 0).toFixed(2)}`, color: "#00ff88" },
                        { label: "Platform Share (20%)", value: `$${((creditSummary?.total_gross_revenue || 0) - (creditSummary?.total_developer_earnings || 0)).toFixed(2)}`, color: "#ff4444" },
                        { label: "Jobs Processed", value: String(creditSummary?.total_jobs_processed || 0), color: "#ffaa00" }
                    ].map((item, i) => (
                        <div key={i} style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "14px 0",
                            borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.04)" : "none"
                        }}>
                            <span style={{ color: "#666", fontSize: 13 }}>{item.label}</span>
                            <span style={{ color: item.color, fontSize: 16, fontWeight: 800 }}>{item.value}</span>
                        </div>
                    ))}

                    <div style={{
                        background: "linear-gradient(135deg, rgba(0,255,136,0.08), rgba(0,204,170,0.08))",
                        border: "1px solid rgba(0,255,136,0.15)",
                        borderRadius: 12, padding: 16, marginTop: 20, textAlign: "center"
                    }}>
                        <p style={{ color: "#00ff88", fontSize: 12, margin: "0 0 4px 0" }}>Developer Fee</p>
                        <p style={{ color: "#00ff88", fontSize: 32, fontWeight: 900, margin: 0 }}>80%</p>
                        <p style={{ color: "#666", fontSize: 11, margin: "4px 0 0 0" }}>of every job your models complete</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
