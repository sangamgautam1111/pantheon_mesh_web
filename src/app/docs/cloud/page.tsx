"use client";

import { motion } from "framer-motion";
import { NeuralBackground } from "@/components/ui/NeuralBackground";
import { 
    FileText, ArrowLeft, Cloud, CheckCircle2, 
    Shield, Key, Zap, Globe, Cpu, RefreshCw, 
    BrainCircuit, Network, Layers, Sparkles
} from "lucide-react";
import Link from "next/link";

export default function CloudGuide() {
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
                    <ArrowLeft size={18} className="text-gcp-blue" />
                    <span className="text-xs font-black uppercase tracking-widest text-black/40 group-hover:text-black">Back to Provisioning</span>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gcp-blue/10 flex items-center justify-center">
                        <Cloud size={16} className="text-gcp-blue" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black">Cloud API Protocol</span>
                </div>
            </nav>

            {/* Content */}
            <main className="relative z-10 pt-32 pb-40 px-6 max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-20"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-black text-white text-[10px] font-black tracking-widest uppercase shadow-xl">
                        <Sparkles size={12} className="text-gcp-blue" /> SECURE PROVISIONING
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 text-black leading-none">
                        Bridge Your <span className="text-gcp-blue">Cloud Fleet.</span>
                    </h1>
                    <p className="text-xl text-black/50 leading-relaxed font-medium italic max-w-2xl border-l-4 border-gcp-blue pl-6 py-2">
                        "Transform standard LLM API keys into high-performance mesh compute nodes with zero-knowledge security."
                    </p>
                </motion.div>

                <div className="space-y-32">
                    {/* Security First */}
                    <section className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                        <div className="md:col-span-7 space-y-8">
                            <div className="space-y-4">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gcp-blue flex items-center gap-3">
                                    <Shield size={14} /> 01. Zero-Knowledge Sealing
                                </h2>
                                <h3 className="text-3xl font-black text-black tracking-tight">Your Secrets Never Leave the Client Unencrypted.</h3>
                                <p className="text-lg text-black/50 leading-relaxed font-medium">
                                    Pantheon Mesh utilizes a <strong>Sovereign Key Architecture</strong>. When you paste your API key, it is encrypted locally before transmission. We only store fragmented identities that allow the mesh relay to authenticate inference calls without ever seeing your plain-text secret.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <div className="px-5 py-3 rounded-2xl bg-black/[0.03] border border-black/[0.05] flex items-center gap-3">
                                    <CheckCircle2 size={16} className="text-gcp-green" />
                                    <span className="text-[11px] font-black uppercase tracking-widest opacity-60">AES-256-GCM</span>
                                </div>
                                <div className="px-5 py-3 rounded-2xl bg-black/[0.03] border border-black/[0.05] flex items-center gap-3">
                                    <CheckCircle2 size={16} className="text-gcp-green" />
                                    <span className="text-[11px] font-black uppercase tracking-widest opacity-60">Client-Side Encryption</span>
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-5 aspect-square bg-black rounded-[3rem] p-10 flex flex-col justify-center gap-8 shadow-4xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-gcp-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-4">
                                <Key size={32} />
                            </div>
                            <div className="space-y-2 relative z-10">
                                <div className="h-2 w-3/4 bg-white/10 rounded-full"></div>
                                <div className="h-2 w-1/2 bg-white/5 rounded-full"></div>
                            </div>
                            <div className="p-4 rounded-xl bg-gcp-blue/20 border border-gcp-blue/30 text-gcp-blue text-[10px] font-mono relative z-10">
                                PROVISIONING_VAULT_ACTIVE
                            </div>
                        </div>
                    </section>

                    {/* How it works */}
                    <section className="space-y-12">
                        <div className="text-center max-w-2xl mx-auto space-y-6">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-600 flex items-center justify-center gap-3">
                                <Layers size={14} /> 02. The Mesh Pipeline
                            </h2>
                            <h3 className="text-4xl font-black text-black tracking-tight">Automated Discovery & Settlement</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { 
                                    icon: <Sparkles size={24} className="text-gcp-blue" />, 
                                    title: "Smart Detect", 
                                    desc: "Our engine automatically identifies your provider (Groq, OpenAI, Anthropic) and validates the token integrity in milliseconds."
                                },
                                { 
                                    icon: <BrainCircuit size={24} className="text-purple-500" />, 
                                    title: "Profile Matching", 
                                    desc: "Choose from 500+ model profiles. We match your hardware nodes with the optimal mesh routing layers."
                                },
                                { 
                                    icon: <Zap size={24} className="text-yellow-500" />, 
                                    title: "Live Revenue", 
                                    desc: "Once deployed, your node begins receiving inference tasks. Earn 80% commission on every processed token."
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

                    {/* Payout Engine */}
                    <section className="p-12 md:p-20 rounded-[4rem] bg-black text-white relative overflow-hidden shadow-4xl group">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.05] group-hover:rotate-12 transition-transform duration-1000">
                            <Network size={300} />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10 items-center">
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gcp-green">03. Financial Sovereignty</h2>
                                    <h3 className="text-4xl font-black text-white tracking-tight">Real-Time Payout Settlements.</h3>
                                    <p className="text-lg text-white/40 leading-relaxed font-medium">
                                        The Pantheon settlement engine executes automated micro-transactions for every inference task. Your earnings are credited to your developer wallet in <strong>ANTP tokens</strong> immediately upon task validation.
                                    </p>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div>
                                        <div className="text-4xl font-black text-gcp-green">80%</div>
                                        <div className="text-[9px] font-black uppercase tracking-widest text-white/30">Developer Share</div>
                                    </div>
                                    <div className="w-px h-12 bg-white/10"></div>
                                    <div>
                                        <div className="text-4xl font-black text-white">0s</div>
                                        <div className="text-[9px] font-black uppercase tracking-widest text-white/30">Settlement Delay</div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">System Status</span>
                                        <span className="flex items-center gap-2 text-gcp-green text-[10px] font-black uppercase tracking-widest">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gcp-green animate-pulse"></div> Operational
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span>Mesh Throughput</span>
                                            <span className="text-gcp-blue">12.4k t/s</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-gcp-blue w-[85%] rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[9px] font-black uppercase tracking-widest opacity-30">Network Node Registry</div>
                                        <div className="text-[10px] font-mono opacity-60">ID_77B2X_PROVISIONED_SUCCESS</div>
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
                    <h2 className="text-4xl font-black text-black tracking-tighter">Ready to Deploy?</h2>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link href="/connect">
                            <button className="px-16 py-6 rounded-full bg-black text-white text-xs font-black uppercase tracking-[0.2em] shadow-4xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                                Provision Now <Zap size={18} />
                            </button>
                        </Link>
                        <Link href="/whitepaper">
                            <button className="px-10 py-6 rounded-full text-xs font-black uppercase tracking-widest text-black/30 hover:text-black transition-all">
                                Read Whitepaper
                            </button>
                        </Link>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
