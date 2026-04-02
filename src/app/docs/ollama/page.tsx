"use client";

import { motion } from "framer-motion";
import { NeuralBackground } from "@/components/ui/NeuralBackground";
import { 
    Cpu, ArrowLeft, Network, Shield, 
    Database, Activity, CheckCircle2, 
    Terminal, Globe, Zap, Sparkles, 
    Layers, RefreshCw, Info, Lock
} from "lucide-react";
import Link from "next/link";

export default function OllamaGuide() {
    return (
        <div className="relative min-h-screen transition-colors duration-200 bg-white"
            style={{ color: "var(--text-primary)" }}>

            <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
                <NeuralBackground />
            </div>

            {/* Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-8 border-b backdrop-blur-xl bg-white/70"
                style={{ borderColor: "var(--border-color)" }}>
                <Link href="/connect" className="flex items-center gap-2.5 group transition-all hover:translate-x-[-4px]">
                    <ArrowLeft size={18} className="text-gcp-green" />
                    <span className="text-xs font-black uppercase tracking-widest text-black/40 group-hover:text-black">Back to Provisioning</span>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gcp-green/10 flex items-center justify-center">
                        <Cpu size={16} className="text-gcp-green" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black">Local Edge Protocol</span>
                </div>
            </nav>

            {/* Content */}
            <main className="relative z-10 pt-32 pb-40 px-6 max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-20"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-gcp-green text-white text-[10px] font-black tracking-widest uppercase shadow-xl">
                        <Zap size={12} className="text-white" /> HARDWARE BRIDGE
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 text-black leading-none">
                        Monetize Your <span className="text-gcp-green">Hardware.</span>
                    </h1>
                    <p className="text-xl text-black/50 leading-relaxed font-medium italic max-w-2xl border-l-4 border-gcp-green pl-6 py-2">
                        "Convert local GPU power into sovereign mesh credits by bridging physical Ollama nodes to the global network."
                    </p>
                </motion.div>

                <div className="space-y-32">
                    {/* The Architecture */}
                    <section className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                        <div className="md:col-span-7 space-y-8">
                            <div className="space-y-4">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gcp-green flex items-center gap-3">
                                    <Network size={14} /> 01. P2P Tunneling
                                </h2>
                                <h3 className="text-3xl font-black text-black tracking-tight">Your Data Never Leaves Your Machine.</h3>
                                <p className="text-lg text-black/50 leading-relaxed font-medium">
                                    Local Ollama provisioning utilizes <strong>In-Place Inference</strong>. Unlike cloud APIs, no model weights or sensitive prompt data are ever uploaded. Our bridge creates an encrypted P2P tunnel where only the final inference stream is routed through the mesh relay. 
                                </p>
                            </div>
                            <div className="p-6 rounded-2xl bg-black shadow-2xl space-y-4 border border-white/10 group overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform text-white">
                                    <Terminal size={100} />
                                </div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                    <span className="text-[9px] font-mono text-white/40 ml-2">ollama_config.sh</span>
                                </div>
                                <code className="text-xs font-mono text-gcp-green block leading-relaxed relative z-10 transition-colors group-hover:text-white">
                                    export OLLAMA_ORIGINS="*" <br/>
                                    ollama run llama3 <br/>
                                    // Mesh Bridge Protocol Active
                                </code>
                            </div>
                        </div>
                        <div className="md:col-span-5 aspect-[4/5] bg-gcp-green/[0.03] border-4 border-dashed border-gcp-green/20 rounded-[3rem] p-10 flex flex-col justify-center gap-8 relative overflow-hidden group">
                            <div className="w-16 h-16 rounded-2xl bg-gcp-green/10 flex items-center justify-center text-gcp-green mb-4">
                                <Cpu size={32} />
                            </div>
                            <div className="space-y-4 relative z-10">
                                <h4 className="text-xl font-black text-black">Local Cluster</h4>
                                <p className="text-[11px] font-bold opacity-40 uppercase tracking-widest">Bridging physical silicon to neural fabric.</p>
                                <div className="space-y-2">
                                    <div className="h-1.5 w-full bg-black/5 rounded-full">
                                        <div className="h-full bg-gcp-green w-[70%] rounded-full"></div>
                                    </div>
                                    <div className="text-[9px] font-black uppercase text-gcp-green">Latency: 1.2ms</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Setup Steps */}
                    <section className="space-y-12">
                        <div className="text-center max-w-2xl mx-auto space-y-6">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gcp-blue flex items-center justify-center gap-3">
                                <RefreshCw size={14} className="animate-spin-slow" /> 02. Node Configuration
                            </h2>
                            <h3 className="text-4xl font-black text-black tracking-tight">Deploy in 3 Seconds</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { 
                                    icon: <Info size={24} className="text-gcp-blue" />, 
                                    title: "1. Expose Host", 
                                    desc: "Ensure your Ollama server is accessible via the network (default: http://localhost:11434)."
                                },
                                { 
                                    icon: <Shield size={24} className="text-gcp-green" />, 
                                    title: "2. Verify CORS", 
                                    desc: "Set OLLAMA_ORIGINS to allow the Pantheon Mesh Bridge to communicate with your local daemon."
                                },
                                { 
                                    icon: <Activity size={24} className="text-yellow-500" />, 
                                    title: "3. Smart Bridge", 
                                    desc: "Enter your host URL and model name. We instantly provision your node into the mesh registry."
                                }
                            ].map((step, i) => (
                                <div key={i} className="p-10 rounded-[2.5rem] bg-white border border-black/[0.05] shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] group">
                                    <div className="w-14 h-14 rounded-2xl bg-black/[0.03] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">{step.icon}</div>
                                    <h4 className="text-sm font-black uppercase tracking-widest mb-4">{step.title}</h4>
                                    <p className="text-xs font-medium text-black/40 leading-relaxed">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Security Deep Dive */}
                    <section className="p-12 md:p-20 rounded-[4rem] bg-black text-white relative overflow-hidden shadow-4xl group">
                        <div className="absolute top-0 left-0 p-12 opacity-[0.05] group-hover:-rotate-12 transition-transform duration-1000">
                            <Lock size={300} />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10 items-center">
                            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gcp-green">Hardware Integrity Log</h4>
                                    <div className="space-y-3">
                                        {[
                                            "PROBING_LOCAL_HOST...",
                                            "VALIDATING_OLLAMA_VERSION_0.1.32",
                                            "ESTABLISHING_ENCRYPTED_TUNNEL",
                                            "MESH_REGISTRY_SYNC_COMPLETE"
                                        ].map((log, i) => (
                                            <div key={i} className="flex items-center gap-3 text-[10px] font-mono opacity-50">
                                                <div className="w-1 h-1 rounded-full bg-gcp-green"></div>
                                                {log}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                        <div className="text-[9px] font-black uppercase tracking-widest opacity-30">Node Reputation</div>
                                        <div className="text-lg font-black text-gcp-blue">A+</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-4 text-left">
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gcp-blue">03. Protocol Integrity</h2>
                                    <h3 className="text-4xl font-black text-white tracking-tight">Zero-Knowledge Hardware Provisioning.</h3>
                                    <p className="text-lg text-white/40 leading-relaxed font-medium">
                                        Our bridge implements a <strong>Stateless Tunneling</strong> protocol. We never see your local data, we never control your models. We only provide the routing layer to monetize your idle GPU.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                                        <Globe size={16} className="text-gcp-blue" />
                                        <span className="text-[11px] font-black uppercase tracking-widest opacity-60">Global Routing</span>
                                    </div>
                                    <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                                        <CheckCircle2 size={16} className="text-gcp-green" />
                                        <span className="text-[11px] font-black uppercase tracking-widest opacity-60">Instant Payout</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Final CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-40 text-center space-y-10"
                >
                    <h2 className="text-4xl font-black text-black tracking-tighter">Turn Silicon into Revenue.</h2>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link href="/connect">
                            <button className="px-16 py-6 rounded-full bg-gcp-green text-white text-xs font-black uppercase tracking-[0.2em] shadow-4xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                                Provision Node <Cpu size={18} />
                            </button>
                        </Link>
                        <Link href="/whitepaper">
                            <button className="px-10 py-6 rounded-full text-xs font-black uppercase tracking-widest text-black/30 hover:text-black transition-all">
                                Mesh Whitepaper
                            </button>
                        </Link>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
