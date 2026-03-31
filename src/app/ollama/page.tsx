'use client'

import React, { useState, useEffect } from 'react';
import { Bot, Cpu, Link as LinkIcon, RefreshCw, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function OllamaBotPage() {
    const [models, setModels] = useState<any[]>([]);
    const [selectedModel, setSelectedModel] = useState("");
    const [status, setStatus] = useState("disconnected");
    const [chat, setChat] = useState<{ role: string, content: string }[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const API_URL = "http://localhost:8000";

    const discoverModels = async () => {
        setStatus("connecting");
        try {
            const resp = await fetch(`${API_URL}/market`);
            if (!resp.ok) throw new Error("Offline");
            
            const ollamaResp = await fetch("http://localhost:11434/api/tags");
            if (ollamaResp.ok) {
                const data = await ollamaResp.json();
                setModels(data.models || []);
                if (data.models && data.models.length > 0) {
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
        discoverModels();
    }, []);

    const handleSendMessage = async () => {
        if (!input.trim() || !selectedModel) return;
        
        const newMsg = { role: "user", content: input };
        setChat(prev => [...prev, newMsg]);
        setInput("");
        setLoading(true);

        try {
            const response = "Local node active. Response from " + selectedModel;
            setChat(prev => [...prev, { role: "bot", content: response }]);
        } catch (e) {
            setChat(prev => [...prev, { role: "bot", content: "Error." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">
                
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                            <Bot className="text-blue-400" size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Ollama Node</h1>
                            <p className="text-sm text-white/40">Local Intelligence bridge</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={discoverModels}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-[10px] font-bold uppercase tracking-widest"
                    >
                        <RefreshCw size={14} className={status === "connecting" ? "animate-spin" : ""} />
                        Refresh Nodes
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    <div className="space-y-6">
                        <div className="p-6 bg-white/[0.02] border border-white/[0.05] rounded-3xl space-y-4">
                            <h2 className="text-[10px] font-bold uppercase tracking-widest text-blue-400 flex items-center gap-2">
                                <LinkIcon size={14} /> Status
                            </h2>
                            
                            <div className="flex items-center gap-2">
                                {status === "connected" ? (
                                    <><CheckCircle2 size={16} className="text-green-500" /> <span className="text-sm">Mesh Link Active</span></>
                                ) : status === "connecting" ? (
                                    <><RefreshCw size={16} className="text-yellow-500 animate-spin" /> <span className="text-sm">Syncing...</span></>
                                ) : (
                                    <><AlertCircle size={16} className="text-red-500" /> <span className="text-sm">Host Offline</span></>
                                )}
                            </div>

                            <div className="space-y-2 pt-2">
                                <label className="text-[10px] uppercase font-bold text-white/30">Active Model</label>
                                <select 
                                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
                                    value={selectedModel}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                >
                                    {models.length > 0 ? (
                                        models.map(m => <option key={m.name} value={m.name}>{m.name}</option>)
                                    ) : (
                                        <option value="">No models</option>
                                    )}
                                </select>
                            </div>
                        </div>

                        <div className="p-6 bg-white/[0.01] border border-white/[0.05] rounded-3xl space-y-3">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/50 flex items-center gap-2">
                                <Cpu size={14} /> Pro: Hardware Bridge
                            </h3>
                            <p className="text-[11px] leading-relaxed text-white/30">
                                Browser scans are limited by CORS. For 24/7 earnings and stable connectivity, run the PANTHEON Bridge locally.
                            </p>
                            <div className="bg-black/50 p-3 rounded-xl border border-white/5 font-mono text-[9px] text-blue-400 break-all">
                                python pantheon_client.py --uid DEMO_USER --model {selectedModel || "llama3"}
                            </div>
                            <p className="text-[9px] text-white/20 italic">
                                * Requires Python 3.8+ and 'requests' library.
                            </p>
                        </div>
                    </div>

                    <div className="md:col-span-2 flex flex-col h-[600px] bg-white/[0.02] border border-white/[0.05] rounded-3xl overflow-hidden relative">
                        <div className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-hide">
                            {chat.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                                    <Cpu size={48} className="text-white/20" />
                                    <p className="text-xs max-w-[200px]">Node ready. Initialize session.</p>
                                </div>
                            ) : (
                                chat.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                        <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${msg.role === "user" ? "bg-blue-600/10 border border-blue-500/20" : "bg-white/5 border border-white/10"}`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))
                            )}
                            {loading && <div className="text-[10px] text-white/20 italic animate-pulse px-4">Synchronizing...</div>}
                        </div>

                        {/* Node Control Overlay: Shown when a model is selected but not 'active' in mesh */}
                        {status === "connected" && selectedModel && (
                            <div className="absolute top-6 right-6 flex gap-2">
                                <button 
                                    onClick={async () => {
                                        try {
                                            const res = await fetch(`${API_URL}/v1/ollama/register?uid=DEMO_USER&model_name=${selectedModel}`);
                                            if (res.ok) alert("Model registered to PANTHEON Mesh!");
                                        } catch (e) {
                                            alert("Registration failed. Check browser console.");
                                        }
                                    }}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all"
                                >
                                    Add to Mesh
                                </button>
                            </div>
                        )}

                        <div className="p-6 border-t border-white/5 bg-black/50 backdrop-blur-3xl">
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder={status === "connected" ? "Ask your local node..." : "Connect node..."}
                                    disabled={status !== "connected"}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-blue-500/40 transition-all pr-12"
                                />
                                <button 
                                    onClick={handleSendMessage}
                                    disabled={!selectedModel || status !== "connected" || loading}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-500 hover:bg-blue-400 rounded-xl transition-all disabled:opacity-10"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
