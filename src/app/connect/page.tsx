"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Key, Zap, CheckCircle, XCircle, Loader2, ChevronDown,
    Shield, Bot, DollarSign, ArrowRight, Sparkles, Copy,
    AlertTriangle, Search, Cpu, ExternalLink, Globe, Terminal, Server,
    Network, Layout, BrainCircuit, Box, Boxes, MonitorPlay, Wifi, Binary, Wind, Layers,
    FileText, BookOpen, ShieldCheck, Activity, BookText, X
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
    const uid = user?.uid || "dev_pioneer_001";

    const [activeTab, setActiveTab] = useState<"cloud" | "ollama">("cloud");
    const [apiKey, setApiKey] = useState("");
    const [step, setStep] = useState<Step>("input");
    const [detection, setDetection] = useState<DetectionResult | null>(null);
    const [selectedModel, setSelectedModel] = useState<any>(null);
    const [searchFilter, setSearchFilter] = useState("");
    const [onboardResult, setOnboardResult] = useState<OnboardResult | null>(null);
    const [errorMsg, setErrorMsg] = useState("");
    const [copied, setCopied] = useState(false);
    
    // Toggle for selecting a different model from the list
    const [showModelList, setShowModelList] = useState(false);

    // Ollama specific
    const [ollamaModel, setOllamaModel] = useState("llama3");
    const [ollamaHost, setOllamaHost] = useState("http://localhost:11434");

    const [showWhitepaper, setShowWhitepaper] = useState(false);
    const [whitepaperTarget, setWhitepaperTarget] = useState<"cloud" | "ollama">("cloud");

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
                setSelectedModel(data.models[0]);
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
            if (selectedModel) body.model_id = typeof selectedModel === 'string' ? selectedModel : selectedModel.id;
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
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-6 mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-xl border border-black/5 overflow-hidden p-2">
                            <Image src={logoImg} alt="Pantheon Mesh" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-heading font-black tracking-tighter text-black mb-1">
                                Connect New Model
                            </h1>
                            <p className="text-xs font-medium opacity-50 flex items-center gap-2 justify-center md:justify-start">
                                <ShieldCheck size={14} className="text-gcp-blue" /> Secure Model Integration & Node Payouts
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    {(step === "input" || step === "detecting" || step === "error") && (
                        <motion.div key="input-container" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}>
                            {/* Premium Tabs */}
                            <div className="flex p-1 bg-black/5 backdrop-blur-xl rounded-2xl mb-6 shadow-inner border border-black/5 max-w-md mx-auto md:mx-0">
                                <button
                                    onClick={() => { setActiveTab("cloud"); setStep("input"); }}
                                    className={`flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-500 ${activeTab === "cloud" ? "bg-white text-gcp-blue shadow-lg shadow-blue-500/10 scale-100" : "text-black/40 hover:text-black/60 scale-95"}`}>
                                    <Globe size={14} /> Cloud API
                                </button>
                                <button
                                    onClick={() => { setActiveTab("ollama"); setStep("input"); }}
                                    className={`flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-500 ${activeTab === "ollama" ? "bg-white text-gcp-green shadow-lg shadow-green-500/10 scale-100" : "text-black/40 hover:text-black/60 scale-95"}`}>
                                    <Terminal size={14} /> Local Ollama
                                </button>
                            </div>

                            <div className="bg-white rounded-[2rem] p-10 mb-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-black/[0.03] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                                    {activeTab === "cloud" ? <Key size={200} /> : <Cpu size={200} />}
                                </div>

                                {activeTab === "cloud" ? (
                                    <>
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                                                <div>
                                                    <h2 className="text-2xl font-heading font-black text-black mb-1">Provision API Core</h2>
                                                    <p className="text-xs font-medium opacity-40">Zero-knowledge key sealing & distributed auth</p>
                                                </div>
                                                <button 
                                                    onClick={() => { setWhitepaperTarget("cloud"); setShowWhitepaper(true); }}
                                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gcp-blue bg-gcp-blue/5 px-4 py-2 rounded-full border border-gcp-blue/10 hover:bg-gcp-blue/10 transition-all"
                                                >
                                                    <BookOpen size={12} /> View Guide
                                                </button>
                                            </div>

                                        <div className="relative mb-8 group/input">
                                            <div className="absolute -inset-1 bg-gradient-to-r from-gcp-blue/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover/input:opacity-100 transition duration-500"></div>
                                            <input
                                                type="password"
                                                value={apiKey}
                                                onChange={e => { setApiKey(e.target.value); if (step === "error") setStep("input"); }}
                                                className="relative w-full text-base font-mono bg-gcp-card-bg/50 border border-black/[0.08] px-6 py-6 rounded-2xl focus:outline-none focus:ring-4 focus:ring-gcp-blue/5 focus:bg-white transition-all placeholder:opacity-30"
                                                placeholder="Securely paste your provider API key..."
                                                disabled={step === "detecting"}
                                            />
                                            <button
                                                onClick={handleDetect}
                                                disabled={step === "detecting" || apiKey.trim().length < 8}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-3 px-8 py-3.5 rounded-xl bg-black text-white text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-20 shadow-xl shadow-black/20"
                                            >
                                                {step === "detecting" ? <Loader2 size={16} className="animate-spin" /> : <Activity size={16} />}
                                                Detect Provider
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                                            {[
                                                { icon: <Shield size={14} className="text-gcp-green" />, label: "Encrypted Storage" },
                                                { icon: <Layers size={14} className="text-gcp-blue" />, label: "Wide Compatibility" },
                                                { icon: <Cpu size={14} className="text-purple-500" />, label: "Automated Setup" }
                                            ].map((b, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-black/[0.02] border border-black/[0.04]">
                                                    {b.icon} <span className="text-[10px] font-black uppercase tracking-wider opacity-60">{b.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                                            <div>
                                                <h2 className="text-2xl font-heading font-black text-black mb-1">Local Compute Bridge</h2>
                                                <p className="text-xs font-medium opacity-40">Decentralized P2P node provisioning</p>
                                            </div>
                                            <button 
                                                onClick={() => { setWhitepaperTarget("ollama"); setShowWhitepaper(true); }}
                                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gcp-green bg-gcp-green/5 px-4 py-2 rounded-full border border-gcp-green/10 hover:bg-gcp-green/10 transition-all"
                                            >
                                                <BookOpen size={12} /> View Guide
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.15em] opacity-40 ml-1">Model ID</label>
                                                <input
                                                    type="text"
                                                    value={ollamaModel}
                                                    onChange={e => setOllamaModel(e.target.value)}
                                                    className="w-full text-sm font-bold bg-gcp-card-bg/50 border border-black/[0.08] px-5 py-4 rounded-xl focus:bg-white focus:ring-4 focus:ring-gcp-green/5 outline-none transition-all"
                                                    placeholder="e.g. llama3, mistral"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.15em] opacity-40 ml-1">Hardware Interface</label>
                                                <input
                                                    type="text"
                                                    value={ollamaHost}
                                                    onChange={e => setOllamaHost(e.target.value)}
                                                    className="w-full text-sm font-bold bg-gcp-card-bg/50 border border-black/[0.08] px-5 py-4 rounded-xl focus:bg-white focus:ring-4 focus:ring-gcp-green/5 outline-none transition-all"
                                                    placeholder="http://localhost:11434"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleOllamaConnect}
                                            className="w-full py-5 rounded-2xl bg-black text-white font-black text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-4 shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all group"
                                        >
                                            <Wifi size={18} /> Add Local Model to Mesh
                                        </button>
                                    </>
                                )}

                                {step === "error" && errorMsg && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        className="mt-8 p-5 rounded-2xl bg-red-500/5 border border-red-500/10 flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                                            <AlertTriangle size={20} className="text-red-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-red-600 mb-1 tracking-tight">Provisioning Blocked</p>
                                            <p className="text-xs font-medium text-red-500/70 leading-relaxed">
                                                {typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg)}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Provider Detected + Model Selection */}
                    {(step === "detected" || step === "connecting" || step === "connection_error") && activeTab === "cloud" && detection && (
                        <motion.div key="detected-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                            {/* Premium Provider Display */}
                            <div className="bg-white rounded-[2rem] p-8 mb-6 shadow-2xl border border-black/[0.03] flex items-center justify-between group overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4 opacity-5 translate-x-8 -translate-y-8 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700">
                                    <Globe size={120} />
                                </div>
                                
                                <div className="flex items-center gap-8 relative z-10">
                                    <div className="w-20 h-20 rounded-2xl bg-white shadow-xl border border-black/5 flex items-center justify-center p-3">
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
                                        <Globe size={40} className={`text-gcp-blue ${PROVIDER_DOMAINS[detection.provider] ? 'hidden' : ''}`} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-2xl font-black tracking-tight text-black">{detection.display_name}</h3>
                                            <span className="flex items-center gap-1 bg-gcp-green/10 text-gcp-green font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full border border-gcp-green/10">
                                                <ShieldCheck size={10} /> Authenticated
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-[10px] font-bold opacity-40 uppercase tracking-widest">
                                            <span>Vector: <code className="font-mono text-black">{detection.key_preview}</code></span>
                                            <span className="w-1 h-1 rounded-full bg-black"></span>
                                            <span>{detection.models_available} Active Sub-Models</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={handleReset} className="relative z-10 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-black hover:bg-black/5 transition-all">Revoke Vault Access</button>
                            </div>

                            {/* Model Architect Selection */}
                            <div className="bg-white rounded-[2rem] p-10 mb-8 shadow-xl border border-black/[0.03]">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                            <BrainCircuit size={20} className="text-purple-600" />
                                        </div>
                                        <h2 className="text-xl font-heading font-black text-black tracking-tight">
                                            Node Architecture Configuration
                                        </h2>
                                    </div>
                                    {(detection?.models?.length || 0) > 1 && !showModelList && (
                                        <button 
                                            onClick={() => setShowModelList(true)}
                                            className="text-[10px] font-black uppercase tracking-widest text-gcp-blue bg-gcp-blue/5 px-5 py-2 rounded-full border border-gcp-blue/10 hover:bg-gcp-blue/10 transition-all"
                                        >
                                            Switch Model Profile
                                        </button>
                                    )}
                                </div>

                                {(detection?.models?.length || 0) > 1 && showModelList ? (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                                        <p className="text-sm mb-4 opacity-70 text-gcp-text-secondary">
                                            Select the specific foundational model you would like to bind to this mesh node.
                                        </p>
                                        <div className="relative mb-4">
                                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40 text-gcp-text-secondary" />
                                            <input type="text" value={searchFilter} onChange={e => setSearchFilter(e.target.value)}
                                                className="w-full text-sm font-bold bg-gcp-card-bg/50 border border-black/[0.08] pl-11 py-3 rounded-xl focus:bg-white outline-none transition-all" placeholder="Search available standard & premium models..." />
                                        </div>
                                        <div className="max-h-[350px] overflow-y-auto rounded-xl border border-black/5 divide-y divide-black/5 CustomScrollbar">
                                            {filteredModels.slice(0, 50).map((m: any) => (
                                                <button key={m.id} onClick={() => { setSelectedModel(m); setShowModelList(false); }}
                                                    className={`w-full text-left p-4 transition-all flex items-center gap-4 ${selectedModel?.id === m.id ? "bg-gcp-blue/10 border-l-4 border-l-gcp-blue" : "hover:bg-gcp-blue/5 border-l-4 border-l-transparent"}`}>
                                                    <div className="flex-grow min-w-0">
                                                        <p className={`text-sm font-bold truncate tracking-tight ${selectedModel?.id === m.id ? "text-gcp-blue" : "text-black"}`}>
                                                            {m.name || m.id}
                                                        </p>
                                                        <p className="text-[11px] opacity-60 truncate font-mono mt-0.5">{m.id}</p>
                                                    </div>
                                                    {selectedModel?.id === m.id && <CheckCircle size={18} className="text-gcp-blue shrink-0" />}
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
                                                <p className="text-base font-bold text-black mb-0.5">
                                                    {selectedModel?.name || selectedModel?.id}
                                                </p>
                                                <p className="text-xs font-mono opacity-60">{selectedModel?.id}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 items-center">
                                            <span className="bg-gcp-green text-white shadow-sm font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full">Ready to Commit</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {step === "connection_error" && errorMsg && (
                                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                                    className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-4">
                                    <AlertTriangle size={18} className="text-red-500 shrink-0" />
                                    <div>
                                        <p className="text-sm font-black text-red-500 mb-1 uppercase tracking-tight">Provisioning Blocked</p>
                                        <p className="text-xs opacity-60 text-red-600/80 leading-relaxed">
                                            {typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg)}
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            <motion.button
                                onClick={handleConnect}
                                disabled={step === "connecting" || (!selectedModel)}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                className="w-full py-6 rounded-[1.5rem] bg-black text-white font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-3xl hover:bg-black/90 transition-all disabled:opacity-40"
                            >
                                {step === "connecting" ? <Loader2 size={20} className="animate-spin" /> : <Layers size={22} />} Connect Model architecture to Mesh
                            </motion.button>
                        </motion.div>
                    )}

                    {/* Step: Provisioning Handshake / Connecting */}
                    {step === "connecting" && (
                        <motion.div key="connecting-container" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[3rem] p-16 shadow-3xl border border-black/[0.03] text-center">
                            <div className="relative w-24 h-24 mx-auto mb-10">
                                <div className="absolute inset-0 rounded-full border-4 border-black/5"></div>
                                <motion.div 
                                    className="absolute inset-0 rounded-full border-4 border-t-gcp-blue border-r-transparent border-b-transparent border-l-transparent"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Shield size={32} className="text-gcp-blue" />
                                </div>
                            </div>
                            <h2 className="text-xl font-black text-black mb-2 uppercase tracking-tight">Connecting to Mesh</h2>
                            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-10">Setting up secure node access</p>
                            
                            <div className="max-w-xs mx-auto space-y-4">
                                {[
                                    { label: "Verifying Key", delay: 0 },
                                    { label: "Securing Connection", delay: 1 },
                                    { label: "Finalizing", delay: 2 }
                                ].map((stepItem, i) => (
                                    <div key={i} className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gcp-blue animate-pulse"></div>
                                            <span className="opacity-60">{stepItem.label}</span>
                                        </div>
                                        <span className="text-gcp-blue">...</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Success */}
                    {step === "success" && onboardResult && (
                        <motion.div key="success-container" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className="bg-white rounded-[3rem] p-16 text-center border border-black/[0.03] shadow-4xl relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gcp-blue via-purple-500 to-gcp-green"></div>
                                <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:scale-110 transition-transform duration-1000">
                                    <CheckCircle size={300} />
                                </div>

                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
                                    className="w-24 h-24 rounded-3xl bg-gcp-green flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/20 rotate-3">
                                    <CheckCircle size={40} className="text-white" />
                                </motion.div>

                                <h2 className="text-4xl font-heading font-black mb-4 text-black tracking-tighter">
                                    Node Provisioned
                                </h2>
                                <p className="text-sm font-medium opacity-50 mb-12 max-w-md mx-auto leading-relaxed">
                                    Your architecture is now active within the global mesh. {onboardResult.message}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-2xl mx-auto">
                                    <div className="p-8 rounded-[2rem] bg-black shadow-2xl text-left border border-white/5 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <Binary size={40} className="text-white" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gcp-blue mb-2">Global Node ID</p>
                                        <div className="flex items-center gap-4">
                                            <code className="text-lg font-mono font-black text-white">{onboardResult.model_id}</code>
                                            <button onClick={handleCopyModelId} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                                                {copied ? <CheckCircle size={14} className="text-gcp-green" /> : <Copy size={14} className="text-white opacity-40" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-8 rounded-[2rem] bg-gcp-green/5 border border-gcp-green/10 text-left">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gcp-green mb-2">Commission Status</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-black text-black">80%</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Revenue Share</span>
                                        </div>
                                        <div className="mt-4 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-gcp-green animate-pulse"></div>
                                            <span className="text-[10px] font-black uppercase text-gcp-green tracking-widest">Active Earning</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                                    <button onClick={() => router.push("/dashboard")}
                                        className="w-full sm:w-auto px-12 py-5 rounded-2xl bg-black text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] transition-all">
                                        Open Terminal <ArrowRight size={16} />
                                    </button>
                                    <button onClick={handleReset}
                                        className="w-full sm:w-auto px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-widest border border-black/5 hover:bg-black/5 transition-all text-black/40">
                                        Provision Another
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Infrastructure Insights */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-20 p-10 rounded-[2.5rem] bg-black shadow-3xl border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:rotate-12 transition-transform duration-1000">
                        <BrainCircuit size={180} className="text-white" />
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-12 items-center relative z-10">
                        <div className="shrink-0 flex -space-x-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gcp-blue to-blue-400 flex items-center justify-center shadow-lg border border-white/10 z-20">
                                <Network size={32} className="text-white" />
                            </div>
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gcp-green to-emerald-400 flex items-center justify-center shadow-lg border border-white/10 mt-6 z-10">
                                <Activity size={32} className="text-white" />
                            </div>
                        </div>
                        
                        <div className="flex-grow">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="w-2 h-2 rounded-full bg-gcp-blue"></span>
                                <h3 className="text-lg font-heading font-black text-white tracking-tight italic">
                                    Network Diagnostics & Security
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <p className="text-xs font-medium text-white/50 leading-relaxed">
                                        Each node is protected by AES-256 encryption. Your keys are never stored in plain text and are sealed within our secure vault during provisioning.
                                    </p>
                                    <button 
                                        onClick={() => setShowWhitepaper(true)}
                                        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-gcp-blue hover:text-white transition-colors"
                                    >
                                        <BookText size={14} /> Open Tech Whitepaper
                                    </button>
                                </div>
                                <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/[0.03] border border-white/10">
                                    <div className="text-2xl font-black text-white mb-1">99.9%</div>
                                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Network Uptime</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Footer Value Props */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12 pb-20">
                    {[
                        { icon: <Shield size={28} className="text-black" />, title: "Institutional Custody", desc: "Military-grade credential isolation in the Pantheon Vault." },
                        { icon: <Activity size={28} className="text-black" />, title: "P2P Load Balancing", desc: "Automatic traffic sharding across personal and cloud nodes." },
                        { icon: <Binary size={28} className="text-black" />, title: "Revenue Integrity", desc: "Smart-contract verified commission flows on the global ledger." },
                    ].map((f, i) => (
                        <div key={i} className="flex flex-col gap-4 text-center items-center">
                            <div className="w-14 h-14 rounded-2xl bg-black/5 flex items-center justify-center border border-black/5 group-hover:bg-black transition-colors">
                                {f.icon}
                            </div>
                            <h4 className="text-xs font-black uppercase tracking-widest">{f.title}</h4>
                            <p className="text-[10px] opacity-40 font-bold max-w-[180px]">{f.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Whitepaper Modal */}
                <AnimatePresence>
                    {showWhitepaper && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 backdrop-blur-2xl bg-black/40"
                        >
                            <motion.div 
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="w-full max-w-4xl bg-white rounded-[2rem] shadow-4xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
                            >
                                <div className="w-full md:w-1/3 bg-black p-10 text-white flex flex-col justify-between">
                                    <div>
                                        <div className="w-12 h-12 bg-white rounded-xl mb-8 flex items-center justify-center p-2">
                                            <Image src={logoImg} alt="logo" className="w-full h-full object-contain" />
                                        </div>
                                        <h2 className="text-3xl font-heading font-black tracking-tighter mb-4 italic">Mesh Node Guide</h2>
                                        <p className="text-xs text-white/50 leading-relaxed font-medium">Learn how to securely add models and participate in the decentralized AI revolution.</p>
                                    </div>
                                    <div className="pt-10 space-y-4">
                                        <a href="/docs/ollama-provisioning" className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                                            <div className="text-[10px] font-black uppercase">Local Ollama Guide</div>
                                            <ArrowRight size={14} className="opacity-40 group-hover:translate-x-1 transition-transform" />
                                        </a>
                                        <a href="/docs/cloud-provisioning" className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                                            <div className="text-[10px] font-black uppercase">Cloud API Guide</div>
                                            <ArrowRight size={14} className="opacity-40 group-hover:translate-x-1 transition-transform" />
                                        </a>
                                    </div>
                                </div>
                                <div className="flex-grow p-10 overflow-y-auto custom-scrollbar bg-white">
                                    <div className="flex justify-end mb-4">
                                        <button onClick={() => setShowWhitepaper(false)} className="p-2 rounded-full hover:bg-black/5 transition-all text-black/40 hover:text-black">
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <div className="prose prose-sm font-medium text-black/70 italic">
                                        <h1 className="text-2xl font-black text-black not-italic mb-6">Security & Provisioning</h1>
                                        <p>Our mesh uses a decentralized AES-256-GCM encryption system to seal your API keys as opaque blobs. When you connect a model, the following happens:</p>
                                        <ul className="list-disc pl-5 space-y-2 mb-6">
                                            <li><strong>Health Validation:</strong> We verify the model is responsive and meets performance standards.</li>
                                            <li><strong>Secret Sealing:</strong> Your key is encrypted before it ever touches our long-term database.</li>
                                            <li><strong>Node Identification:</strong> A unique Hardware Fingerprint is assigned to your session.</li>
                                            <li><strong>Revenue Flow:</strong> Requests routed to your node generate ANTP token credits in real-time.</li>
                                        </ul>
                                        <h3 className="font-black text-black not-italic">How to contribute?</h3>
                                        <p>Simply provide your API key or local Ollama host. The system automatically detects the provider (Groq, OpenAI, Anthropic, etc.) and offers you the best model profiles to provision.</p>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </RouteGuard>
    );
}

// Custom styles for scrollbar
const styleSheet = typeof document !== 'undefined' ? document.createElement("style") : null;
if (styleSheet) {
    styleSheet.innerText = `
        .CustomScrollbar::-webkit-scrollbar { width: 6px; }
        .CustomScrollbar::-webkit-scrollbar-track { background: transparent; }
        .CustomScrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
        .CustomScrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.1); }
    `;
    document.head.appendChild(styleSheet);
}
