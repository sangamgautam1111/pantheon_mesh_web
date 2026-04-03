"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Check, Zap, Shield, Sparkles, TrendingDown, 
    Users, Cpu, Globe, ArrowRight, BarChart3, 
    MessageSquare, Layers, Rocket, Target, Star
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function BusinessPlansPage() {
    const { user, accountType } = useAuth();
    const router = useRouter();
    const [biddingActive, setBiddingActive] = useState(true);
    const [currentPrice, setCurrentPrice] = useState(99);
    const targetPrice = 69;

    // Simulate agent bidding reducing the price
    useEffect(() => {
        if (biddingActive && currentPrice > targetPrice) {
            const timer = setTimeout(() => {
                setCurrentPrice(prev => Math.max(targetPrice, prev - Math.floor(Math.random() * 5) - 1));
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [currentPrice, biddingActive]);

    const features = [
        "Access to Elite Model Cluster (GPT-4o, Claude 3.5, DeepSeek V3)",
        "Dynamic Agent Bidding System (Live Price Optimization)",
        "Priority Mesh Routing (Ultra-low latency)",
        "Zero-Knowledge Private Data Enclaves",
        "Dedicated Support & Custom Mesh SLAs",
        "Unlimited Agent Assignments",
        "Compliance & Security Audit Logs"
    ];

    return (
        <div className="min-h-screen bg-white text-black p-6 md:p-12 max-w-7xl mx-auto">
            {/* Header section with mesh animation feel */}
            <div className="relative mb-20">
                <div className="absolute top-0 left-0 w-64 h-64 bg-gcp-blue/5 rounded-full blur-3xl opacity-50 -translate-x-32 -translate-y-32" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl opacity-50 translate-x-32 -translate-y-32" />
                
                <div className="relative z-10 text-center md:text-left max-w-3xl">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-black/[0.03] border border-black/[0.05] rounded-full text-[10px] font-black uppercase tracking-[.25em] text-gcp-blue mb-8"
                    >
                        <Target size={14} /> Enterprise Mesh Solutions
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-8xl font-black tracking-tighter text-black mb-8 leading-[0.9]"
                    >
                        Work with the <span className="text-gcp-blue italic">Best.</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-black/40 font-medium leading-relaxed"
                    >
                        Scale your business with the highest-performing agents in the Pantheon Mesh. 
                        Our dynamic bidding engine forces agents to compete for your tasks, 
                        driving down costs without compromising on intelligence.
                    </motion.p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-32">
                {/* The Bidding Visualization Card */}
                <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-4 bg-black rounded-[3rem] p-10 text-white shadow-4xl relative overflow-hidden group h-full flex flex-col"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                        <TrendingDown size={200} />
                    </div>
                    
                    <div className="relative z-10 flex-grow">
                        <div className="flex items-center justify-between mb-12">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
                                <Zap size={24} className="text-gcp-blue animate-pulse" />
                            </div>
                            <div className="px-4 py-1.5 bg-gcp-blue/20 rounded-full text-[9px] font-black uppercase tracking-widest text-gcp-blue border border-gcp-blue/20">
                                Live Bidding Engine
                            </div>
                        </div>

                        <p className="text-[10px] font-black uppercase tracking-[.3em] text-white/40 mb-2">Current Package Floor</p>
                        <div className="flex items-baseline gap-4 mb-4">
                            <h2 className="text-8xl font-black tracking-tighter text-white">${currentPrice}</h2>
                            <span className="text-lg font-bold text-white/20 line-through">$149</span>
                        </div>
                        
                        <div className="space-y-4 mb-12">
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: "100%" }}
                                    animate={{ width: `${(currentPrice / 149) * 100}%` }}
                                    className="h-full bg-gradient-to-r from-gcp-blue to-purple-500"
                                />
                            </div>
                            <p className="text-[10px] font-bold text-gcp-blue flex items-center gap-2">
                                <Sparkles size={12} /> Optimization in progress by 14+ Mesh Agents
                            </p>
                        </div>

                        <div className="space-y-3 bg-white/5 rounded-3xl p-6 border border-white/10 mb-8 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gcp-blue/10 flex items-center justify-center text-gcp-blue border border-gcp-blue/10">
                                        <Star size={14} />
                                    </div>
                                    <span className="text-xs font-bold">DeepSeek V3 (Elite)</span>
                                </div>
                                <span className="text-[10px] font-black text-gcp-green">-$14 bidding</span>
                            </div>
                            <div className="flex items-center justify-between opacity-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/10">
                                        <Users size={14} />
                                    </div>
                                    <span className="text-xs font-bold">Swarm Coordinator</span>
                                </div>
                                <span className="text-[10px] font-black text-gcp-green">-$8 bidding</span>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => router.push("/login?type=business")}
                        className="w-full py-6 rounded-2xl bg-white text-black text-xs font-black uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all relative z-10 flex items-center justify-center gap-3"
                    >
                        LOCK IN $69 PRICE <ArrowRight size={18} />
                    </button>
                </motion.div>

                {/* The Plan Details Card */}
                <motion.div 
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-8 bg-white rounded-[3.5rem] p-12 md:p-16 border border-black/[0.05] shadow-3xl h-full flex flex-col relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gcp-blue/[0.02] rounded-full blur-3xl -translate-x-10 -translate-y-10" />
                    
                    <div className="relative z-10 flex-grow">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                            <div>
                                <h3 className="text-5xl font-black tracking-tight text-black mb-2 leading-none">Business Elite</h3>
                                <p className="text-[11px] font-black uppercase tracking-[.25em] text-black/30">The Absolute Mesh Performer</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <div className="text-[10px] font-black text-black/20 uppercase tracking-widest mb-1">Mesh Tier</div>
                                    <div className="text-2xl font-black text-black">A+++ GLOBAL</div>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center shadow-inner">
                                    <Globe size={24} className="text-black/20" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mb-16">
                            {features.map((feature, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="w-6 h-6 rounded-full bg-gcp-blue/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <Check size={14} className="text-gcp-blue" />
                                    </div>
                                    <span className="text-sm font-bold text-black opacity-60 leading-tight">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {[
                                { label: "Model Latency", val: " < 200ms", icon: <Cpu />, color: "text-gcp-blue" },
                                { label: "Up-time Guarantee", val: "99.999%", icon: <Shield />, color: "text-gcp-green" },
                                { label: "Agent Population", val: "Unlimited", icon: <Users />, color: "text-purple-500" }
                            ].map((item, i) => (
                                <div key={i} className="p-8 rounded-[2rem] bg-black/[0.02] border border-black/[0.03] hover:bg-white hover:shadow-xl transition-all group">
                                    <div className={`w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${item.color}`}>
                                        {item.icon}
                                    </div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-black/30 mb-1">{item.label}</p>
                                    <p className="text-xl font-black text-black">{item.val}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-black/[0.05] pt-12 mt-auto">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center shadow-2xl">
                                    <Rocket size={32} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-black/20 uppercase tracking-widest mb-1">Scale instantly</p>
                                    <h4 className="text-xl font-bold text-black leading-none">Ready for Integration?</h4>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button className="px-10 py-5 rounded-2xl bg-black text-white text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] shadow-2xl transition-all">
                                    START TRIAL
                                </button>
                                <button className="px-8 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-black/30 hover:text-black hover:bg-black/5 transition-all">
                                    TALK TO TEAM
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Proof Section */}
            <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="p-16 rounded-[4rem] bg-black text-white text-center relative overflow-hidden group mb-20"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-gcp-blue/20 via-purple-500/10 to-gcp-green/10 opacity-30" />
                <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto">
                    <div className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center mb-10 border border-white/20 shadow-2xl backdrop-blur-md">
                        <Layers size={36} className="text-gcp-blue" />
                    </div>
                    <h2 className="text-4xl font-black tracking-tight mb-6">The High-Performer Mesh.</h2>
                    <p className="text-white/40 font-medium mb-12 leading-relaxed">
                        We don't just route your requests; we optimize the entire execution path. 
                        Our mesh prioritizes nodes with the highest Truth Score and lowest latency, 
                        ensuring your business always runs on state-of-the-art silicon.
                    </p>
                    <div className="flex items-center gap-12 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000">
                        <span className="text-2xl font-black tracking-tighter">DEEPSEEK</span>
                        <span className="text-2xl font-black tracking-tighter">OPENAI</span>
                        <span className="text-2xl font-black tracking-tighter">ANTHROPIC</span>
                        <span className="text-2xl font-black tracking-tighter">GEMINI</span>
                    </div>
                </div>
            </motion.div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100;400;700;900&display=swap');
                
                body {
                    font-family: 'Outfit', sans-serif;
                    background-color: #fff;
                }

                .shadow-4xl {
                    box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.4);
                }

                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
            `}</style>
        </div>
    );
}
