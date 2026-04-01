"use client";

import { useState, useEffect } from "react";
import { Wallet, Activity, DollarSign, ArrowUpRight, TrendingUp, Calendar, Clock, ChevronRight, CheckCircle2, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { RouteGuard } from "@/components/auth/RouteGuard";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function WithdrawPage() {
    const [revenueData, setRevenueData] = useState({
        total: 12450.62,
        weekly: 1205.40,
        monthly: 4850.25,
        pending: 312.10
    });
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const heatmapData = Array.from({ length: 52 * 7 }, (_, i) => ({
        value: Math.floor(Math.random() * 5),
        date: new Date(Date.now() - (52 * 7 - i) * 24 * 60 * 60 * 1000)
    }));

    const getIntensity = (val: number) => {
        if (val === 0) return "bg-white/[0.02]";
        if (val === 1) return "bg-blue-500/20";
        if (val === 2) return "bg-blue-500/40";
        if (val === 3) return "bg-blue-500/70";
        return "bg-blue-500";
    };

    const handleWithdraw = async () => {
        if (!withdrawAmount || loading) return;
        setLoading(true);
        await new Promise(r => setTimeout(r, 2000));
        setSuccess(true);
        setLoading(false);
        setWithdrawAmount("");
        setTimeout(() => setSuccess(false), 5000);
    };

    return (
        <RouteGuard allowedTypes={["developer", "business", "personal"]}>
            <div className="min-h-screen bg-[#050505] text-white p-6 lg:p-12 font-sans selection:bg-blue-500/30">
                <div className="max-w-7xl mx-auto space-y-12">
                    
                    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-[0.2em] text-[10px]"
                            >
                                <Shield size={12} /> Secure Settlement Node
                            </motion.div>
                            <motion.h1 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl md:text-5xl font-black tracking-tighter"
                            >
                                Withdraw your <span className="text-white/40">earning</span>
                            </motion.h1>
                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-[10px] text-amber-500/60 font-bold uppercase tracking-widest"
                            >
                                * Withdrawal may take around 24 hours due to high traffic volume
                            </motion.p>
                        </div>
                        
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex items-center gap-4 backdrop-blur-xl"
                        >
                            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                <Wallet className="text-blue-400" size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-0.5">Linked Wallet</p>
                                <p className="text-xs font-mono text-white/80">0x742d...44e</p>
                            </div>
                        </motion.div>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: "Total Revenue", val: revenueData.total, icon: DollarSign, color: "text-blue-400", bg: "bg-blue-500/10" },
                            { label: "Monthly Yield", val: revenueData.monthly, icon: Calendar, color: "text-purple-400", bg: "bg-purple-500/10" },
                            { label: "Weekly Growth", val: revenueData.weekly, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                            { label: "Pending Payout", val: revenueData.pending, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
                        ].map((stat, i) => (
                            <motion.div 
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 + 0.3 }}
                                className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-3xl hover:bg-white/[0.04] transition-all group"
                            >
                                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-4 border border-white/5`}>
                                    <stat.icon className={stat.color} size={20} />
                                </div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">{stat.label}</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-2xl font-bold tracking-tight">${stat.val.toLocaleString()}</h3>
                                    <span className="text-[10px] text-emerald-400 font-bold">+12.4%</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 }}
                            className="lg:col-span-2 space-y-6"
                        >
                            <div className="bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] p-8 space-y-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold tracking-tight">Active Node Consistency</h2>
                                        <p className="text-xs text-white/30">Inference contribution history across the global mesh.</p>
                                    </div>
                                    <div className="flex items-center gap-4 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                                        <span>Less</span>
                                        <div className="flex gap-1">
                                            {[0, 1, 2, 3, 4].map(v => (
                                                <div key={v} className={`w-2.5 h-2.5 rounded-sm ${getIntensity(v)}`} />
                                            ))}
                                        </div>
                                        <span>More</span>
                                    </div>
                                </div>

                                <div className="flex gap-1 overflow-x-auto pb-4 scrollbar-hide">
                                    <div className="grid grid-flow-col grid-rows-7 gap-1">
                                        {heatmapData.map((d, i) => (
                                            <div 
                                                key={i} 
                                                className={`w-3 h-3 rounded-sm ${getIntensity(d.value)} transition-colors hover:ring-1 hover:ring-white/20 cursor-help`}
                                                title={`${d.date.toDateString()}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-6 pt-4 border-t border-white/5">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase text-white/20 mb-1">Max Streak</p>
                                        <p className="text-lg font-bold">42 Days</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase text-white/20 mb-1">Total Contributions</p>
                                        <p className="text-lg font-bold">1.2M Tokens</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase text-white/20 mb-1">Protocol Efficiency</p>
                                        <p className="text-lg font-bold">99.8%</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 }}
                            className="space-y-6"
                        >
                            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-3xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                    <Activity size={120} />
                                </div>
                                
                                <div className="relative space-y-6">
                                    <div>
                                        <h2 className="text-xl font-black tracking-tight mb-2">Initiate Withdrawal</h2>
                                        <p className="text-xs text-white/50 leading-relaxed">Funds are settled via the AXIOMEscrow smart contract (Polygon/Base) or traditional gateways.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 px-2">Amount (USD)</label>
                                        <div className="relative">
                                            <input 
                                                type="number"
                                                value={withdrawAmount}
                                                onChange={e => setWithdrawAmount(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-2xl font-bold outline-none focus:border-blue-500/50 transition-all"
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 font-bold uppercase text-[10px]">Max</div>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleWithdraw}
                                        disabled={!withdrawAmount || loading}
                                        className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group/btn"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-black/10 border-t-black rounded-full animate-spin" />
                                        ) : success ? (
                                            <><CheckCircle2 size={18} /> Request Sent</>
                                        ) : (
                                            <>Execute Payout <ArrowUpRight size={18} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" /></>
                                        )}
                                    </button>

                                    <p className="text-[9px] text-white/20 text-center uppercase tracking-widest leading-loose">
                                        widthdrwal may take aroung 24 hours due to traffic unmanagable widthdraws.<br/>
                                        Protected by Pantheon Vault.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 flex items-center justify-between group cursor-pointer hover:bg-white/[0.03] transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                                        <Clock className="text-white/40" size={18} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider">Transaction History</h4>
                                        <p className="text-[10px] text-white/20">Audit your protocol logs</p>
                                    </div>
                                </div>
                                <ChevronRight className="text-white/10 group-hover:translate-x-1 transition-transform" size={16} />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </RouteGuard>
    );
}
