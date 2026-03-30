"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Key, Zap, CheckCircle, XCircle, Loader2, ChevronDown,
    Shield, Bot, DollarSign, ArrowRight, Sparkles, Copy,
    AlertTriangle, Search, Cpu, ExternalLink, Globe, Terminal, Server,
    Network, Layout, BrainCircuit, Box, Boxes, MonitorPlay, Infinity, Wifi, Binary, Wind, Layers
} from "lucide-react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logoImg from "../logo.png";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const PROVIDER_DOMAINS: Record<string, string> = {
    openrouter: "openrouter.ai",
    openai: "openai.com",
    anthropic: "anthropic.com",
    gemini: "google.com",
    google_gemini: "google.com",
    groq: "groq.com",
    xai: "x.ai",
    nvidia: "nvidia.com",
    nvidia_nim: "nvidia.com",
    perplexity: "perplexity.ai",
    huggingface: "huggingface.co",
    cohere: "cohere.com",
    mistral: "mistral.ai",
    together: "together.ai",
    fireworks: "fireworks.ai",
    deepseek: "deepseek.com",
    replicate: "replicate.com",
    sambanova: "sambanova.ai",
    anyscale: "anyscale.com",
    octoai: "octoai.run",
    baseten: "baseten.co",
    cerebras: "cerebras.ai",
    upstage: "upstage.ai",
    ollama: "ollama.com",
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

type Step = "input" | "detecting" | "detected" | "connecting" | "success" | "error" | "connection_error";

export default function ConnectPage() {
    const { user } = useAuth();
    const router = useRouter();
    const uid = user?.uid || "dev_sangam_001";

    const [activeTab, setActiveTab] = useState<"cloud" | "ollama">("cloud");
    const [apiKey, setApiKey] = useState("");
    const [step, setStep] = useState<Step>("input");
    const [detection, setDetection] = useState<DetectionResult | null>(null);
    const [selectedModel, setSelectedModel] = useState("");
    const [searchFilter, setSearchFilter] = useState("");
    const [onboardResult, setOnboardResult] = useState<OnboardResult | null>(null);
    const [errorMsg, setErrorMsg] = useState("");
    const [copied, setCopied] = useState(false);
    
    // Toggle for selecting a different model from the list
    const [showModelList, setShowModelList] = useState(false);

    // Ollama specific
    const [ollamaModel, setOllamaModel] = useState("llama3");
    const [ollamaHost, setOllamaHost] = useState("http://localhost:11434");

    const handleDetect = async () => {
        if (!apiKey.trim() || apiKey.trim().length < 8) return;
        setStep("detecting");
        setDetection(null);
        setErrorMsg("");
        setShowModelList(false);
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
            if (data.models && data.models.length > 0) {
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
                setStep("connection_error");
            }
        } catch {
            setErrorMsg("Network error.");
            setStep("connection_error");
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
                payout_share: "80%",
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
        setShowModelList(false);
    };

    const filteredModels = detection?.models?.filter(m =>
        m.id.toLowerCase().includes(searchFilter.toLowerCase()) || m.name.toLowerCase().includes(searchFilter.toLowerCase())
    ) || [];

    const selectedModelInfo = detection?.models?.find(m => m.id === selectedModel);
    
    // Automatically allow selection if there are multiple models
    const needsModelSelection = (detection?.models?.length || 0) > 1;

    return (
        <RouteGuard allowedTypes={["developer", "personal", "business"]}>
            <div className="p-6 md:p-12 max-w-4xl mx-auto" style={{ minHeight: "calc(100vh - 48px)" }}>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg border border-gcp-border/50 overflow-hidden p-1.5">
                            <Image src={logoImg} alt="Pantheon Mesh" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-heading font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
                                Add Your AI Model
                            </h1>
                            <p className="text-sm opacity-60 mt-1" style={{ color: "var(--text-secondary)" }}>
                                Link your AI keys here. Once added, your models will automatically start earning you money.
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

                            <div className="gcp-card p-8 rounded-t-none mb-6 shadow-sm border border-gcp-border/50" style={{ background: "var(--bg-surface)" }}>
                                {activeTab === "cloud" ? (
                                    <>
                                        <div className="flex items-center gap-2 mb-6">
                                            <Key size={18} className="text-gcp-blue" />
                                            <h2 className="text-xl font-heading font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>Step 1 — Paste your API Key</h2>
                                        </div>
                                        <div className="relative mb-4">
                                            <input
                                                type="password"
                                                value={apiKey}
                                                onChange={e => { setApiKey(e.target.value); if (step === "error") setStep("input"); }}
                                                className="gcp-input w-full text-base font-mono pr-32 py-5 bg-white/5 border border-gcp-border/60 focus:border-gcp-blue"
                                                placeholder="Securely paste your provider API key..."
                                                disabled={step === "detecting"}
                                                onKeyDown={e => e.key === "Enter" && handleDetect()}
                                            />
                                            <button
                                                onClick={handleDetect}
                                                disabled={step === "detecting" || apiKey.trim().length < 8}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 px-5 py-3 rounded-lg bg-gcp-blue text-white text-xs font-bold uppercase tracking-widest hover:bg-gcp-blue/90 transition-all disabled:opacity-40"
                                            >
                                                {step === "detecting" ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                                                Detect
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-5 text-[11px] uppercase tracking-wider font-semibold" style={{ color: "var(--text-secondary)" }}>
                                            <span className="flex items-center gap-1.5"><Shield size={12} className="text-gcp-green" /> Hardware-Level Encrypted</span>
                                            <span className="flex items-center gap-1.5"><Layers size={12} className="text-gcp-blue" /> 20+ Providers Supported</span>
                                            <span className="flex items-center gap-1.5"><DollarSign size={12} className="text-gcp-green" /> Automatic Commissioning</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 mb-6">
                                            <Server size={18} className="text-gcp-green" />
                                            <h2 className="text-xl font-heading font-bold" style={{ color: "var(--text-primary)" }}>Connect Local Ollama Node</h2>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                                            <div>
                                                <label className="text-[11px] uppercase font-bold tracking-widest mb-2 block opacity-60">Model Identifier</label>
                                                <input
                                                    type="text"
                                                    value={ollamaModel}
                                                    onChange={e => setOllamaModel(e.target.value)}
                                                    className="gcp-input w-full text-base py-3"
                                                    placeholder="llama3, mistral, etc."
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[11px] uppercase font-bold tracking-widest mb-2 block opacity-60">Localhost Address</label>
                                                <input
                                                    type="text"
                                                    value={ollamaHost}
                                                    onChange={e => setOllamaHost(e.target.value)}
                                                    className="gcp-input w-full text-base py-3"
                                                    placeholder="http://localhost:11434"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleOllamaConnect}
                                            className="w-full py-4 rounded-xl bg-gcp-green text-white font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:bg-gcp-green/90 transition-all"
                                        >
                                            <Server size={18} /> Add Local Model
                                        </button>
                                    </>
                                )}

                                {step === "error" && errorMsg && (
                                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                                        className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                                        <AlertTriangle size={18} className="text-red-500 shrink-0" />
                                        <div>
                                            <p className="text-sm font-bold text-red-500 mb-1">Check Failed</p>
                                            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{errorMsg}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Provider Detected + Model Selection */}
                    {(step === "detected" || step === "connecting" || step === "connection_error") && activeTab === "cloud" && detection && (
                        <motion.div key="detected-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                            {/* Provider Card */}
                            <div className="gcp-card p-6 mb-5 border border-gcp-border/50 shadow-sm" style={{ background: "var(--bg-surface)" }}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white shadow-sm border border-gcp-border/40 overflow-hidden p-2">
                                            {PROVIDER_DOMAINS[detection.provider] ? (
                                                <img 
                                                    src={`https://logo.clearbit.com/${PROVIDER_DOMAINS[detection.provider]}`} 
                                                    alt={detection.display_name} 
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                    }}
                                                />
                                            ) : null}
                                            <Globe size={32} className={`text-gcp-blue ${PROVIDER_DOMAINS[detection.provider] ? 'hidden' : ''}`} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-xl font-heading font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>{detection.display_name}</h3>
                                                <span className="gcp-badge bg-gcp-green/15 text-gcp-green font-bold text-[10px] px-2 py-0.5"><CheckCircle size={10} className="inline mr-1" />Verified</span>
                                            </div>
                                            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                                Identifier: <code className="font-mono bg-gcp-card-bg px-1.5 py-0.5 rounded text-[10px]">{detection.key_preview}</code> &nbsp;·&nbsp; {detection.models_available} models available
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={handleReset} className="text-xs font-bold uppercase tracking-wider opacity-50 hover:opacity-100 text-gcp-text-secondary transition-all">Revoke Key</button>
                                </div>
                            </div>

                            {/* Model Selection */}
                            <div className="gcp-card p-6 mb-5 border border-gcp-border/50 shadow-sm" style={{ background: "var(--bg-surface)" }}>
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <Bot size={20} className="text-gcp-blue" />
                                        <h2 className="text-xl font-heading font-bold" style={{ color: "var(--text-primary)" }}>
                                            Step 2 — Pick a Model to Add
                                        </h2>
                                    </div>
                                    {needsModelSelection && !showModelList && (
                                        <button 
                                            onClick={() => setShowModelList(true)}
                                            className="text-[11px] font-bold uppercase tracking-widest text-gcp-blue hover:text-gcp-blue/80 transition-colors bg-gcp-blue/10 px-3 py-1.5 rounded-full"
                                        >
                                            Select Other Model
                                        </button>
                                    )}
                                </div>

                                {needsModelSelection && showModelList ? (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                                        <p className="text-sm mb-4 opacity-70 text-gcp-text-secondary">
                                            Select the specific foundational model you would like to bind to this mesh node.
                                        </p>
                                        <div className="relative mb-4">
                                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40 text-gcp-text-secondary" />
                                            <input type="text" value={searchFilter} onChange={e => setSearchFilter(e.target.value)}
                                                className="gcp-input w-full text-sm pl-11 py-3" placeholder="Search available standard & premium models..." />
                                        </div>
                                        <div className="max-h-[350px] overflow-y-auto rounded-xl border border-gcp-border/60 divide-y divide-gcp-border/40 CustomScrollbar">
                                            {filteredModels.slice(0, 50).map(m => (
                                                <button key={m.id} onClick={() => { setSelectedModel(m.id); setShowModelList(false); }}
                                                    className={`w-full text-left p-4 transition-all flex items-center gap-4 ${selectedModel === m.id ? "bg-gcp-blue/10 border-l-4 border-l-gcp-blue" : "hover:bg-gcp-blue/5 border-l-4 border-l-transparent"}`}>
                                                    <div className="flex-grow min-w-0">
                                                        <p className="text-sm font-bold truncate tracking-tight text-gcp-text" style={{ color: selectedModel === m.id ? "var(--text-primary)" : "var(--text-secondary)" }}>
                                                            {m.name || m.id}
                                                        </p>
                                                        <p className="text-[11px] opacity-60 truncate font-mono mt-0.5 text-gcp-text-secondary">{m.id}</p>
                                                    </div>
                                                    {selectedModel === m.id && <CheckCircle size={18} className="text-gcp-blue shrink-0" />}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="p-5 rounded-xl border border-gcp-green/30 bg-gcp-green/5 flex items-center">
                                        <div className="flex items-center gap-4 flex-grow">
                                            <div className="w-10 h-10 rounded-full bg-gcp-green/20 flex items-center justify-center">
                                                <Sparkles size={20} className="text-gcp-green" />
                                            </div>
                                            <div>
                                                <p className="text-base font-bold text-gcp-text mb-0.5">
                                                    {selectedModelInfo?.name || selectedModel}
                                                </p>
                                                <p className="text-xs font-mono opacity-60 text-gcp-text-secondary">{selectedModel}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 items-center">
                                            <span className="gcp-badge bg-gcp-green text-white shadow-sm font-bold text-[11px] px-3 py-1 bg-opacity-90">Ready to Commit</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {step === "connection_error" && errorMsg && (
                                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                                    className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                                    <AlertTriangle size={18} className="text-red-500 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-red-500 mb-1">Provisioning Blocked</p>
                                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{errorMsg}</p>
                                    </div>
                                </motion.div>
                            )}

                            <motion.button
                                onClick={handleConnect}
                                disabled={step === "connecting" || (!selectedModel && needsModelSelection)}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                className="w-full py-5 rounded-xl bg-gcp-blue text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg hover:bg-gcp-blue/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {step === "connecting" ? <Loader2 size={20} className="animate-spin" /> : <Layers size={20} />} Start Earning Now
                            </motion.button>
                        </motion.div>
                    )}

                    {/* Step 3: Success */}
                    {step === "success" && onboardResult && (
                        <motion.div key="success-container" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className="gcp-card p-12 text-center mb-6 border border-gcp-border/50 shadow-sm" style={{ background: "var(--bg-surface)" }}>
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
                                    className="w-24 h-24 rounded-full bg-gcp-green/10 flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle size={48} className="text-gcp-green" />
                                </motion.div>
                                <h2 className="text-3xl font-heading font-black mb-3 text-gcp-text tracking-tight">
                                    Success! Your Model is Added
                                </h2>
                                <p className="text-base mb-10 opacity-70 text-gcp-text-secondary max-w-lg mx-auto">
                                    {onboardResult.message} Your AI model is now working on the network and making money for you.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10 max-w-2xl mx-auto">
                                    <div className="gcp-card p-5 bg-white/5 border border-gcp-border/50">
                                        <p className="text-[11px] uppercase tracking-widest font-bold opacity-50 mb-2 text-gcp-text-secondary">Node Identifier</p>
                                        <div className="flex items-center justify-center gap-3">
                                            <code className="text-base font-mono font-bold text-gcp-text bg-black/10 px-3 py-1 rounded">{onboardResult.model_id}</code>
                                            <button onClick={handleCopyModelId} className="opacity-50 hover:opacity-100 transition-opacity p-2 bg-gcp-card-bg rounded-md border border-gcp-border">
                                                {copied ? <CheckCircle size={16} className="text-gcp-green" /> : <Copy size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="gcp-card p-5 bg-gcp-green/5 border border-gcp-green/20">
                                        <p className="text-[11px] uppercase tracking-widest font-bold opacity-50 mb-2 text-gcp-text-secondary">Compensation</p>
                                        <p className="text-base font-black text-gcp-green">80% Revenue Share</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center gap-5">
                                    <button onClick={handleReset}
                                        className="px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest border border-gcp-border hover:bg-gcp-card-bg transition-all text-gcp-text-secondary shadow-sm">
                                        Commission Another
                                    </button>
                                    <button onClick={() => router.push("/dashboard")}
                                        className="px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest bg-gcp-blue text-white hover:bg-gcp-blue/90 transition-all flex items-center gap-2 shadow-lg">
                                        Go to Dashboard <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer Info / Value Props */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-gcp-border/50 pt-12">
                    {[
                        { icon: <Shield size={24} className="text-gcp-blue" />, title: "Enterprise Grade Security", desc: "Private keys are heavily encrypted at the record level using AES-256 protocols safely." },
                        { icon: <Globe size={24} className="text-gcp-cyan" />, title: "Low Latency Edge Routing", desc: "The global mesh directs requests dynamically based on regional latency and compute proximity." },
                        { icon: <DollarSign size={24} className="text-gcp-green" />, title: "Automated Global Payouts", desc: "Earnings are instantly pooled and auto-dispensed to your registered payout ledger." },
                    ].map((feature, i) => (
                        <div key={i} className="flex flex-col items-start gap-4 p-2">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gcp-card-bg to-gcp-border border border-gcp-border/80 flex items-center justify-center shadow-sm">
                                {feature.icon}
                            </div>
                            <div>
                                <h4 className="text-sm font-black mb-2 tracking-tight" style={{ color: "var(--text-primary)" }}>{feature.title}</h4>
                                <p className="text-xs leading-relaxed opacity-70" style={{ color: "var(--text-secondary)" }}>{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </RouteGuard>
    );
}
