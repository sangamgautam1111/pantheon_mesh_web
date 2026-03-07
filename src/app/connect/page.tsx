"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Key, Zap, CheckCircle, XCircle, Loader2, ChevronDown,
    Shield, Bot, DollarSign, ArrowRight, Sparkles, Copy,
    AlertTriangle, Search, Cpu, ExternalLink, Globe, Terminal, Server
} from "lucide-react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const PROVIDER_LOGOS: Record<string, { color: string; icon: string }> = {
    openrouter: { color: "#6366f1", icon: "🔀" },
    openai: { color: "#10a37f", icon: "🧠" },
    anthropic: { color: "#d97706", icon: "🏛️" },
    google_gemini: { color: "#4285f4", icon: "💎" },
    groq: { color: "#f97316", icon: "⚡" },
    xai: { color: "#1d9bf0", icon: "𝕏" },
    nvidia_nim: { color: "#76b900", icon: "🟢" },
    perplexity: { color: "#20b2aa", icon: "🔍" },
    huggingface: { color: "#ffd21e", icon: "🤗" },
    cohere: { color: "#39594d", icon: "🧬" },
    mistral: { color: "#ff7000", icon: "🌬️" },
    together: { color: "#0ea5e9", icon: "🤝" },
    fireworks: { color: "#ef4444", icon: "🎆" },
    deepseek: { color: "#0066ff", icon: "🔬" },
    replicate: { color: "#000000", icon: "🔄" },
    sambanova: { color: "#ff6600", icon: "⚙️" },
    ollama: { color: "#6366f1", icon: "🦙" },
};

interface DetectionResult {
    status: string;
    provider: string;
    display_name: string;
    key_preview: string;
    models_available: number;
    models: { id: string; name: string; description?: string; context_length?: number; pricing?: any }[];
}

interface OnboardResult {
    status: string;
    model_id: string;
    model_name: string;
    provider: string;
    display_name: string;
    validation: { status: string; latency_ms?: number };
    key_preview: string;
    payout_share: string;
    message: string;
    all_available_models: string[];
}

type Step = "input" | "detecting" | "detected" | "selecting" | "connecting" | "success" | "error";

export default function ConnectPage() {
    const { user } = useAuth();
    const router = useRouter();
    const uid = user?.uid || "anonymous";

    const [activeTab, setActiveTab] = useState<"cloud" | "ollama">("cloud");
    const [apiKey, setApiKey] = useState("");
    const [step, setStep] = useState<Step>("input");
    const [detection, setDetection] = useState<DetectionResult | null>(null);
    const [selectedModel, setSelectedModel] = useState("");
    const [searchFilter, setSearchFilter] = useState("");
    const [onboardResult, setOnboardResult] = useState<OnboardResult | null>(null);
    const [errorMsg, setErrorMsg] = useState("");
    const [copied, setCopied] = useState(false);

    // Ollama specific
    const [ollamaModel, setOllamaModel] = useState("llama3");
    const [ollamaHost, setOllamaHost] = useState("http://localhost:11434");

    const needsModelSelection = detection?.provider === "openrouter";

    const handleDetect = async () => {
        if (!apiKey.trim() || apiKey.trim().length < 8) return;
        setStep("detecting");
        setDetection(null);
        setErrorMsg("");
        try {
            const res = await fetch(`${API}/v1/developer/detect-key`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ api_key: apiKey.trim() })
            });
            const data = await res.json();
            if (!res.ok) {
                setErrorMsg(data.detail || "Could not detect provider.");
                setStep("error");
                return;
            }
            setDetection(data);
            if (data.provider === "openrouter" && data.models?.length > 0) {
                setStep("detected");
            } else if (data.models?.length > 0) {
                setSelectedModel(data.models[0].id);
                setStep("detected");
            } else {
                setErrorMsg("Key detected but no models available.");
                setStep("error");
            }
        } catch {
            setErrorMsg("Network error — is the backend running?");
            setStep("error");
        }
    };

    const handleConnect = async () => {
        if (activeTab === "ollama") {
            return handleOllamaConnect();
        }

        setStep("connecting");
        try {
            const body: any = { api_key: apiKey.trim() };
            if (selectedModel) body.model_id = selectedModel;
            const res = await fetch(`${API}/v1/developer/${uid}/models/smart-connect`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (!res.ok) {
                setErrorMsg(data.detail || "Connection failed.");
                setStep("error");
                return;
            }
            if (data.status === "registered" || data.status === "already_registered") {
                setOnboardResult(data);
                setStep("success");
            } else {
                setErrorMsg(data.message || "Unexpected response.");
                setStep("error");
            }
        } catch {
            setErrorMsg("Network error.");
            setStep("error");
        }
    };

    const handleOllamaConnect = async () => {
        setStep("connecting");
        try {
            const res = await fetch(`${API}/v1/developer/${uid}/models/connect-ollama`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model_name: ollamaModel, host: ollamaHost })
            });
            const data = await res.json();
            if (!res.ok) {
                setErrorMsg(data.detail || "Ollama connection failed.");
                setStep("error");
                return;
            }
            setOnboardResult({
                status: "registered",
                model_id: data.model_id || "LOCAL-OLLAMA",
                model_name: ollamaModel,
                provider: "ollama",
                display_name: "Local Ollama",
                validation: { status: "valid" },
                key_preview: "Local Connection",
                payout_share: "5%",
                message: "Local Ollama model connected to mesh.",
                all_available_models: [ollamaModel]
            });
            setStep("success");
        } catch {
            setErrorMsg("Network error — is Ollama running at the provided host?");
            setStep("error");
        }
    };

    const handleCopyModelId = () => {
        if (onboardResult?.model_id) {
            navigator.clipboard.writeText(onboardResult.model_id);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleReset = () => {
        setApiKey("");
        setStep("input");
        setDetection(null);
        setSelectedModel("");
        setSearchFilter("");
        setOnboardResult(null);
        setErrorMsg("");
    };

    const providerInfo = detection ? PROVIDER_LOGOS[detection.provider] || { color: "#6b7280", icon: "🔌" } : null;
    const filteredModels = detection?.models?.filter(m =>
        m.id.toLowerCase().includes(searchFilter.toLowerCase()) || m.name.toLowerCase().includes(searchFilter.toLowerCase())
    ) || [];

    const selectedModelInfo = detection?.models?.find(m => m.id === selectedModel);

    return (
        <RouteGuard allowedTypes={["developer", "personal", "business"]}>
            <div className="p-6 md:p-12 max-w-4xl mx-auto" style={{ minHeight: "calc(100vh - 48px)" }}>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gcp-blue to-gcp-purple flex items-center justify-center shadow-lg">
                            <Zap size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-heading font-bold" style={{ color: "var(--text-primary)" }}>Connect Your AI Model</h1>
                            <p className="text-xs opacity-50" style={{ color: "var(--text-secondary)" }}>
                                Link your AI models to the mesh and earn 5% of every job they complete.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    {(step === "input" || step === "detecting" || step === "error") && (
                        <motion.div key="input-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                            {/* Tabs */}
                            <div className="flex bg-gcp-card-bg rounded-t-xl border-x border-t border-gcp-border overflow-hidden">
                                <button
                                    onClick={() => { setActiveTab("cloud"); setStep("input"); }}
                                    className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === "cloud" ? "bg-gcp-blue/10 text-gcp-blue border-b-2 border-gcp-blue" : "text-gcp-text-secondary opacity-50 hover:opacity-100"}`}>
                                    <Globe size={14} /> Cloud API
                                </button>
                                <button
                                    onClick={() => { setActiveTab("ollama"); setStep("input"); }}
                                    className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === "ollama" ? "bg-gcp-green/10 text-gcp-green border-b-2 border-gcp-green" : "text-gcp-text-secondary opacity-50 hover:opacity-100"}`}>
                                    <Terminal size={14} /> Local Ollama
                                </button>
                            </div>

                            <div className="gcp-card p-8 rounded-t-none mb-6" style={{ background: "var(--bg-surface)" }}>
                                {activeTab === "cloud" ? (
                                    <>
                                        <div className="flex items-center gap-2 mb-6">
                                            <Key size={18} className="text-gcp-blue" />
                                            <h2 className="text-lg font-heading font-bold" style={{ color: "var(--text-primary)" }}>Step 1 — Paste Your API Key</h2>
                                        </div>
                                        <div className="relative mb-4">
                                            <input
                                                type="password"
                                                value={apiKey}
                                                onChange={e => { setApiKey(e.target.value); if (step === "error") setStep("input"); }}
                                                className="gcp-input w-full text-sm font-mono pr-24 py-4"
                                                placeholder="sk-... / gsk_... / AIza... / or-... / ant-..."
                                                disabled={step === "detecting"}
                                                onKeyDown={e => e.key === "Enter" && handleDetect()}
                                            />
                                            <button
                                                onClick={handleDetect}
                                                disabled={step === "detecting" || apiKey.trim().length < 8}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-4 py-2 rounded-md bg-gcp-blue text-white text-xs font-bold uppercase tracking-widest hover:bg-gcp-blue/90 transition-all disabled:opacity-40"
                                            >
                                                {step === "detecting" ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                                                Detect
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-[10px]" style={{ color: "var(--text-secondary)" }}>
                                            <span className="flex items-center gap-1"><Shield size={10} className="text-gcp-green" /> AES-256 encrypted storage</span>
                                            <span className="flex items-center gap-1"><Zap size={10} className="text-gcp-yellow" /> 16 providers auto-detected</span>
                                            <span className="flex items-center gap-1"><DollarSign size={10} className="text-gcp-green" /> Earn 5% payout</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 mb-6">
                                            <Server size={18} className="text-gcp-green" />
                                            <h2 className="text-lg font-heading font-bold" style={{ color: "var(--text-primary)" }}>Connect Local Ollama Server</h2>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                            <div>
                                                <label className="text-[10px] uppercase font-bold tracking-widest mb-1 block opacity-50">Model Name</label>
                                                <input
                                                    type="text"
                                                    value={ollamaModel}
                                                    onChange={e => setOllamaModel(e.target.value)}
                                                    className="gcp-input w-full text-sm"
                                                    placeholder="llama3, mistral, etc."
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase font-bold tracking-widest mb-1 block opacity-50">Ollama Host</label>
                                                <input
                                                    type="text"
                                                    value={ollamaHost}
                                                    onChange={e => setOllamaHost(e.target.value)}
                                                    className="gcp-input w-full text-sm"
                                                    placeholder="http://localhost:11434"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleOllamaConnect}
                                            className="w-full py-4 rounded-xl bg-gradient-to-r from-gcp-green to-gcp-cyan text-black font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                                        >
                                            <Zap size={18} /> Connect Local Model
                                        </button>
                                        <p className="text-[10px] mt-4 opacity-40 text-center">
                                            Ensure your Ollama server has OLLAMA_ORIGINS="*" set to allow browser connections.
                                        </p>
                                    </>
                                )}

                                {step === "error" && errorMsg && (
                                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                                        className="mt-4 p-4 rounded-lg bg-red-500/5 border border-red-500/20 flex items-start gap-3">
                                        <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-sm font-bold text-red-500 mb-1">Connection Failed</p>
                                            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{errorMsg}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Provider Detected + Model Selection */}
                    {(step === "detected" || step === "selecting" || step === "connecting") && activeTab === "cloud" && detection && (
                        <motion.div key="detected-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                            {/* Provider Card */}
                            <div className="gcp-card p-6 mb-4" style={{ background: "var(--bg-surface)" }}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-md"
                                            style={{ backgroundColor: providerInfo!.color + "15", border: `2px solid ${providerInfo!.color}30` }}>
                                            {providerInfo!.icon}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-heading font-bold" style={{ color: "var(--text-primary)" }}>{detection.display_name}</h3>
                                                <span className="gcp-badge bg-gcp-green/10 text-gcp-green text-[10px]"><CheckCircle size={10} className="inline mr-1" />Detected</span>
                                            </div>
                                            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                                                Key: <code className="font-mono">{detection.key_preview}</code> · {detection.models_available} models available
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={handleReset} className="text-xs opacity-40 hover:opacity-70 text-gcp-text-secondary">Change key</button>
                                </div>
                            </div>

                            {/* Model Selection */}
                            <div className="gcp-card p-6 mb-4" style={{ background: "var(--bg-surface)" }}>
                                <div className="flex items-center gap-2 mb-4">
                                    <Bot size={18} className="text-gcp-cyan" />
                                    <h2 className="text-lg font-heading font-bold" style={{ color: "var(--text-primary)" }}>
                                        Step 2 — {needsModelSelection ? "Choose Your Model" : "Best Model Selected"}
                                    </h2>
                                </div>

                                {needsModelSelection ? (
                                    <>
                                        <p className="text-xs mb-4 opacity-60 text-gcp-text-secondary">
                                            OpenRouter gives you access to {detection.models_available} models. Pick the one you want to connect:
                                        </p>
                                        {/* Search */}
                                        <div className="relative mb-3">
                                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30 text-gcp-text-secondary" />
                                            <input type="text" value={searchFilter} onChange={e => setSearchFilter(e.target.value)}
                                                className="gcp-input w-full text-xs pl-9" placeholder="Search models..." />
                                        </div>
                                        {/* Model List */}
                                        <div className="max-h-[320px] overflow-y-auto rounded-lg border border-gcp-border divide-y divide-gcp-border/50">
                                            {filteredModels.slice(0, 50).map(m => (
                                                <button key={m.id} onClick={() => setSelectedModel(m.id)}
                                                    className={`w-full text-left p-3 transition-all flex items-center gap-3 ${selectedModel === m.id ? "bg-gcp-blue/5 border-l-2 border-l-gcp-blue" : "hover:bg-gcp-blue/3 border-l-2 border-l-transparent"}`}>
                                                    <div className="flex-grow min-w-0">
                                                        <p className="text-xs font-bold truncate text-gcp-text" style={{ color: selectedModel === m.id ? "var(--text-primary)" : "var(--text-secondary)" }}>
                                                            {m.name || m.id}
                                                        </p>
                                                        <p className="text-[10px] opacity-50 truncate font-mono text-gcp-text-secondary">{m.id}</p>
                                                    </div>
                                                    {selectedModel === m.id && <CheckCircle size={16} className="text-gcp-blue shrink-0" />}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-4 rounded-lg border border-gcp-green/20 bg-gcp-green/5">
                                        <div className="flex items-center gap-3">
                                            <Sparkles size={20} className="text-gcp-green" />
                                            <div>
                                                <p className="text-sm font-bold text-gcp-text">
                                                    {selectedModelInfo?.name || selectedModel}
                                                </p>
                                                <p className="text-[10px] font-mono opacity-50 text-gcp-text-secondary">{selectedModel}</p>
                                            </div>
                                            <span className="ml-auto gcp-badge bg-gcp-green/10 text-gcp-green text-[10px]">Best Available</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <motion.button
                                onClick={handleConnect}
                                disabled={step === "connecting" || (!selectedModel && needsModelSelection)}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-gcp-blue to-gcp-purple text-white font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-40"
                            >
                                {step === "connecting" ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />} Connect to Mesh
                            </motion.button>
                        </motion.div>
                    )}

                    {/* Step 3: Success */}
                    {step === "success" && onboardResult && (
                        <motion.div key="success-container" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className="gcp-card p-12 text-center mb-6" style={{ background: "var(--bg-surface)" }}>
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
                                    className="w-20 h-20 rounded-full bg-gcp-green/10 flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle size={40} className="text-gcp-green" />
                                </motion.div>
                                <h2 className="text-2xl font-heading font-bold mb-2 text-gcp-text">
                                    Model Connected!
                                </h2>
                                <p className="text-sm mb-8 opacity-60 text-gcp-text-secondary max-w-md mx-auto">
                                    {onboardResult.message} Your model is now visible to agent swarms and ready to bid on jobs.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-xl mx-auto">
                                    <div className="gcp-card p-4 bg-gcp-card-bg/50">
                                        <p className="text-[10px] uppercase tracking-widest opacity-50 mb-1 text-gcp-text-secondary">Model ID</p>
                                        <div className="flex items-center justify-center gap-2">
                                            <code className="text-sm font-mono font-bold text-gcp-text">{onboardResult.model_id}</code>
                                            <button onClick={handleCopyModelId} className="opacity-40 hover:opacity-100 transition-opacity">
                                                {copied ? <CheckCircle size={14} className="text-gcp-green" /> : <Copy size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="gcp-card p-4 bg-gcp-card-bg/50">
                                        <p className="text-[10px] uppercase tracking-widest opacity-50 mb-1 text-gcp-text-secondary">Earnings Share</p>
                                        <p className="text-sm font-bold text-gcp-green">5% Developer Payout</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center gap-4">
                                    <button onClick={handleReset}
                                        className="px-8 py-3 rounded-lg text-xs font-bold uppercase tracking-widest border border-gcp-border hover:bg-gcp-blue/5 transition-all text-gcp-text-secondary">
                                        Connect Another
                                    </button>
                                    <button onClick={() => router.push("/dashboard")}
                                        className="px-8 py-3 rounded-lg text-xs font-bold uppercase tracking-widest bg-gcp-blue text-white hover:bg-gcp-blue/90 transition-all flex items-center gap-2">
                                        Go to Dashboard <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer Info */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: <Shield size={20} className="text-gcp-blue" />, title: "Enterprise Security", desc: "Keys ARE NEVER stored in plain text. We use AES-256 encryption at the record level." },
                        { icon: <Cpu size={20} className="text-gcp-cyan" />, title: "Low Latency Routing", desc: "Our global mesh optimizes request routing to your connected models for maximum speed." },
                        { icon: <DollarSign size={20} className="text-gcp-green" />, title: "Automated Payouts", desc: "Earnings are credited in USD instantly upon job completion. Withdraw via Payoneer anytime." },
                    ].map((feature, i) => (
                        <div key={i}>
                            <div className="w-10 h-10 rounded-lg bg-gcp-card-bg border border-gcp-border flex items-center justify-center mb-4">{feature.icon}</div>
                            <h4 className="text-sm font-bold mb-2 text-gcp-text">{feature.title}</h4>
                            <p className="text-xs text-gcp-text-secondary leading-relaxed opacity-60">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </RouteGuard>
    );
}
