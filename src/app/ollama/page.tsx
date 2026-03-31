'use client'

import React, { useState, useEffect } from 'react';
import { Bot, Cpu, Link as LinkIcon, RefreshCw, Send, CheckCircle2, AlertCircle, Shield, Globe, Terminal, ArrowRight, Activity, Server, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OllamaProvisioningPage() {
    const [step, setStep] = useState(1);
    const [models, setModels] = useState<any[]>([]);
    const [selectedModel, setSelectedModel] = useState("");
    const [ngrokUrl, setNgrokUrl] = useState("");
    const [status, setStatus] = useState("idle"); // idle, connecting, connected, error
    const [provisioning, setProvisioning] = useState(false);
    const [provisioned, setProvisioned] = useState(false);

    const API_URL = "http://localhost:8000";

    const fetchLocalModels = async () => {
        setStatus("connecting");
        try {
            const resp = await fetch("http://localhost:11434/api/tags");
            if (resp.ok) {
                const data = await resp.json();
                setModels(data.models || []);
                if (data.models?.length > 0) {
                    setSelectedModel(data.models[0].name);
                    setStatus("connected");
                }
            } else {
                setStatus("error");
            }
        } catch (e) {
            setStatus("error");
        }
    };

    useEffect(() => {
        if (step === 3) fetchLocalModels();
    }, [step]);

    const handleProvision = async () => {
        if (!selectedModel || !ngrokUrl) return;
        setProvisioning(true);
        try {
            const res = await fetch(`${API_URL}/v1/ollama/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: 'DEMO_USER',
                    model_name: selectedModel,
                    host: ngrokUrl
                })
            });
            if (res.ok) {
                setProvisioned(true);
                setStep(4);
            } else {
                alert("Provisioning failed. Ensure backend is active.");
            }
        } catch (e) {
            alert("Connection error.");
        }
        setProvisioning(false);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 lg:p-12 font-sans selection:bg-blue-500/30 overflow-hidden relative">
            
            {/* Background Glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none" />

            <div className="max-w-5xl mx-auto space-y-12 relative">
                
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-[0.3em] text-[10px]"
                        >
                            <Zap size={12} fill="currentColor" /> Local Node Provisioning
                        </motion.div>
                        <motion.h1 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl font-black tracking-tighter"
                        >
                            Bridge <span className="text-white/30">Ollama</span>
                        </motion.h1>
                    </div>

                    <div className="flex gap-2">
                        {[1, 2, 3, 4].map(s => (
                            <div 
                                key={s} 
                                className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step >= s ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "bg-white/10"}`} 
                            />
                        ))}
                    </div>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    
                    {/* Left Column: Instructions */}
                    <div className="lg:col-span-2 space-y-4">
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={step}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 space-y-6 backdrop-blur-3xl"
                            >
                                {step === 1 && (
                                    <>
                                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                                            <Terminal size={24} className="text-blue-400" />
                                        </div>
                                        <div className="space-y-4">
                                            <h2 className="text-2xl font-bold tracking-tight">Initialize Core</h2>
                                            <p className="text-sm text-white/50 leading-relaxed">Execute the local runtime. This prepares the weights for decentralized mesh routing.</p>
                                            <div className="bg-black/40 rounded-2xl p-4 border border-white/5 font-mono text-xs text-blue-300 relative group">
                                                <div className="absolute top-3 right-4 text-[9px] opacity-30 uppercase font-bold tracking-widest">Execute</div>
                                                ollama run llama3
                                            </div>
                                            <button 
                                                onClick={() => setStep(2)}
                                                className="w-full bg-white text-black py-4 rounded-2xl font-black text-sm tracking-tight hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                            >
                                                Core Initialized <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    </>
                                )}

                                {step === 2 && (
                                    <>
                                        <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20">
                                            <Globe size={24} className="text-purple-400" />
                                        </div>
                                        <div className="space-y-4">
                                            <h2 className="text-2xl font-bold tracking-tight">Establish Tunnel</h2>
                                            <p className="text-sm text-white/50 leading-relaxed">Generate a cryptographic bridge to the Pantheon Cloud. We recommend Ngrok for URI isolation.</p>
                                            <div className="bg-black/40 rounded-2xl p-4 border border-white/5 font-mono text-xs text-purple-300 relative group">
                                                <div className="absolute top-3 right-4 text-[9px] opacity-30 uppercase font-bold tracking-widest">Tunnel</div>
                                                ngrok http 11434
                                            </div>
                                            <button 
                                                onClick={() => setStep(3)}
                                                className="w-full bg-white text-black py-4 rounded-2xl font-black text-sm tracking-tight hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                            >
                                                Tunnel Active <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    </>
                                )}

                                {step === 3 && (
                                    <>
                                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                                            <Activity size={24} className="text-emerald-400" />
                                        </div>
                                        <div className="space-y-4">
                                            <h2 className="text-2xl font-bold tracking-tight">Mesh Handshake</h2>
                                            <p className="text-sm text-white/50 leading-relaxed">Bind your local hardware to the global compute network. AES-256-GCM encryption will be applied.</p>
                                            
                                            <div className="space-y-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] uppercase font-bold text-white/30 px-1">Model Identity</label>
                                                    <select 
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm appearance-none outline-none focus:border-blue-500/50 cursor-pointer"
                                                        value={selectedModel}
                                                        onChange={(e) => setSelectedModel(e.target.value)}
                                                    >
                                                        {models.length > 0 ? (
                                                            models.map(m => <option key={m.name} value={m.name}>{m.name}</option>)
                                                        ) : (
                                                            <option value="">No local models detected</option>
                                                        )}
                                                    </select>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] uppercase font-bold text-white/30 px-1">Ngrok URI</label>
                                                    <input 
                                                        type="text"
                                                        placeholder="https://....ngrok-free.app"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm outline-none focus:border-blue-500/50 transition-all font-mono"
                                                        value={ngrokUrl}
                                                        onChange={(e) => setNgrokUrl(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <button 
                                                onClick={handleProvision}
                                                disabled={provisioning || !ngrokUrl}
                                                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm tracking-tight hover:bg-blue-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-20 shadow-lg shadow-blue-600/20"
                                            >
                                                {provisioning ? <RefreshCw className="animate-spin" size={18} /> : <><Shield size={18} /> Provision Node</>}
                                            </button>
                                        </div>
                                    </>
                                )}

                                {step === 4 && (
                                    <>
                                        <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.4)] mx-auto">
                                            <CheckCircle2 size={32} className="text-white" />
                                        </div>
                                        <div className="space-y-6 text-center">
                                            <div>
                                                <h2 className="text-3xl font-black tracking-tighter">Node Synchronized</h2>
                                                <p className="text-sm text-white/50 mt-2">Local core is now live on the PANTHEON Swarm.</p>
                                            </div>
                                            <div className="flex justify-center gap-2">
                                                <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Status: Active</div>
                                                <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] font-bold text-white/40 uppercase tracking-widest">Latency: 42ms</div>
                                            </div>
                                            <button 
                                                onClick={() => setStep(1)}
                                                className="w-full border border-white/10 text-white/50 py-4 rounded-2xl font-bold text-sm hover:bg-white/5 transition-all"
                                            >
                                                Return to Overview
                                            </button>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Right Column: Visualizer / Analytics */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white/[0.01] border border-white/[0.05] rounded-[2.5rem] p-8 h-[600px] relative overflow-hidden flex flex-col group">
                            
                            {/* Visualizer Background */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--blue-500) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                            
                            <div className="flex items-center justify-between mb-8 z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                                        <Server size={20} className="text-white/40" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-widest">Mesh Monitor</h3>
                                        <p className="text-[10px] text-white/20">Real-time inference tracking</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">System Nominal</span>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 relative z-10">
                                {!provisioned ? (
                                    <>
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-blue-500/20 blur-[60px] animate-pulse" />
                                            <Bot size={80} className="text-white/20 relative animate-bounce" />
                                        </div>
                                        <div className="space-y-2 max-w-xs">
                                            <h4 className="text-sm font-bold">Waiting for Handshake</h4>
                                            <p className="text-xs text-white/20 leading-relaxed italic">Complete the initialization steps to activate hardware-level encryption.</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-full max-w-md bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 space-y-6">
                                            <div className="flex justify-between items-end">
                                                <div className="text-left">
                                                    <p className="text-[9px] font-bold uppercase text-white/20">Active Node</p>
                                                    <p className="text-xl font-bold tracking-tight">{selectedModel}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[9px] font-bold uppercase text-white/20">Revenue/Hr</p>
                                                    <p className="text-xl font-bold tracking-tight text-emerald-400">$1.24</p>
                                                </div>
                                            </div>
                                            
                                            <div className="h-32 flex items-end justify-between gap-1">
                                                {Array.from({ length: 24 }).map((_, i) => (
                                                    <motion.div 
                                                        key={i}
                                                        initial={{ height: 0 }}
                                                        animate={{ height: Math.random() * 100 + "%" }}
                                                        transition={{ duration: 1, delay: i * 0.05, repeat: Infinity, repeatType: "reverse" }}
                                                        className="w-full bg-blue-500/40 rounded-t-sm"
                                                    />
                                                ))}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 text-left">
                                                <div className="p-4 bg-white/5 rounded-2xl">
                                                    <p className="text-[8px] font-bold uppercase text-white/20 mb-1">Tokens Processed</p>
                                                    <p className="text-sm font-bold tracking-tight">1.2M</p>
                                                </div>
                                                <div className="p-4 bg-white/5 rounded-2xl">
                                                    <p className="text-[8px] font-bold uppercase text-white/20 mb-1">Mesh Reputation</p>
                                                    <p className="text-sm font-bold tracking-tight">9.98/10</p>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="mt-8 border-t border-white/5 pt-8 z-10 flex items-center justify-between">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center p-1.5 overflow-hidden backdrop-blur-sm grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all">
                                            <div className="w-full h-full rounded-full bg-blue-500/20" />
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[9px] text-white/20 font-mono uppercase tracking-[0.2em]">Node-UID: {Math.random().toString(36).substring(7).toUpperCase()}</p>
                            </div>
                        </div>

                        <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shrink-0">
                                <Shield className="text-blue-500/40" size={24} />
                            </div>
                            <div className="space-y-1 text-center md:text-left translate-y-[-1px]">
                                <h4 className="text-xs font-bold uppercase tracking-widest leading-none">Security Architecture</h4>
                                <p className="text-[10px] text-white/30 leading-relaxed font-medium">Your endpoint is sealed via AES-256-GCM. Traffic is isolated and auto-revocation triggers at 500ms latency.</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
