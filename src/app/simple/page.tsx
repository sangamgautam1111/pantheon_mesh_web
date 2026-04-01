"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
    Zap, Terminal, Shield, Wallet, 
    Play, Power, Settings, HelpCircle,
    Activity, CheckCircle2, Clock, Globe
} from "lucide-react";

export default function SimpleNodePage() {
    const { user, profile, accountType } = useAuth();
    const [running, setRunning] = useState(false);
    const [status, setStatus] = useState("Idle");
    const [progress, setProgress] = useState(0);
    const [stats, setStats] = useState({ cpu: 0, ram: 0, jobs: 0, earnings: 0 });

    useEffect(() => {
        let interval: any;
        if (running) {
            setStatus("Connected to Mesh");
            interval = setInterval(() => {
                setStats(prev => ({
                    cpu: Math.floor(Math.random() * 40) + 10,
                    ram: Math.floor(Math.random() * 20) + 50,
                    jobs: prev.jobs + (Math.random() > 0.9 ? 1 : 0),
                    earnings: prev.earnings + (Math.random() > 0.9 ? 0.05 : 0)
                }));
                setProgress(p => (p + 2) % 100);
            }, 1000);
        } else {
            setStatus("Disconnected");
            setStats({ cpu: 0, ram: 0, jobs: 0, earnings: 0 });
            setProgress(0);
        }
        return () => clearInterval(interval);
    }, [running]);

    const toggleNode = () => {
        setRunning(!running);
    };

    if (accountType !== "personal") {
        return (
            <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
                <Shield className="text-gcp-blue mb-4 opacity-20" size={64} />
                <h1 className="text-2xl font-medium text-gcp-text mb-2">Personal Node Access</h1>
                <p className="text-gcp-text-secondary max-w-md">
                    This simplified interface is designed for Personal accounts to contribute compute power.
                    As a {accountType?.toUpperCase()}, you already have advanced tools in your dashboard.
                </p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            {/* Simple Hero */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-gcp-blue/5 rounded-2xl p-8 border border-gcp-blue/10">
                <div className="space-y-4 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gcp-blue/10 text-gcp-blue rounded-full text-xs font-bold uppercase tracking-wider">
                        <Zap size={14} />
                        Personal Compute Node
                    </div>
                    <h1 className="text-3xl font-bold dark:text-white">Earn while you sleep.</h1>
                    <p className="text-gcp-text-secondary max-w-md leading-relaxed">
                        Join the Pantheon Mesh by contributing your idle CPU/GPU. 
                        Your machine will process secure, encrypted sub-tasks for the global AI swarm.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                        <button 
                            onClick={toggleNode}
                            className={`px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-all active:scale-95 ${
                                running 
                                ? 'bg-gcp-red text-white hover:bg-red-600' 
                                : 'bg-gcp-blue text-white hover:bg-blue-600 shadow-lg shadow-gcp-blue/20'
                            }`}
                        >
                            {running ? <Power size={18} /> : <Play size={18} />}
                            {running ? 'Stop Node' : 'Start Earning'}
                        </button>
                        <div className="flex items-center gap-2 text-xs text-gcp-text-disabled">
                            <CheckCircle2 size={14} className="text-gcp-green" />
                            Hardware: CPU Optimized
                        </div>
                    </div>
                </div>
                
                <div className="w-full max-w-xs aspect-square flex items-center justify-center relative">
                    <div className={`absolute inset-0 rounded-full border-2 border-dashed transition-all duration-[3000ms] ease-linear ${running ? 'animate-spin-slow rotate-180 border-gcp-blue/40' : 'border-gcp-border'}`} />
                    <div className={`absolute inset-4 rounded-full border-2 border-dashed transition-all duration-[5000ms] ease-linear reverse ${running ? 'animate-spin-slow border-gcp-green/30' : 'border-gcp-border'}`} />
                    <div className="z-10 flex flex-col items-center">
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all ${running ? 'bg-gcp-blue shadow-xl shadow-gcp-blue/30 scale-110' : 'bg-gcp-surface-v'}`}>
                            <Activity size={32} className={`${running ? 'text-white' : 'text-gcp-text-disabled'}`} />
                        </div>
                        <div className="mt-4 text-center">
                            <p className="text-xs font-bold uppercase tracking-widest opacity-40">Status</p>
                            <p className={`text-sm font-medium ${running ? 'text-gcp-blue' : 'text-gcp-text-disabled'}`}>{status}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "CPU Usage", value: `${stats.cpu}%`, icon: Terminal, color: "text-gcp-blue" },
                    { label: "Memory", value: `${stats.ram}%`, icon: Settings, color: "text-gcp-cyan" },
                    { label: "Jobs Done", value: stats.jobs, icon: Activity, color: "text-gcp-green" },
                    { label: "Earnings", value: `$${stats.earnings.toFixed(2)}`, icon: Wallet, color: "text-gcp-green" }
                ].map((item, i) => (
                    <div key={i} className="bg-white dark:bg-black border border-gcp-border rounded-xl p-5 flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-zinc-900 ${item.color}`}>
                            <item.icon size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gcp-text-disabled">{item.label}</p>
                            <p className="text-xl font-bold dark:text-white">{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Simple Help */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-black border border-gcp-border rounded-xl p-6">
                    <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                        <Globe size={16} className="text-gcp-blue" />
                        Mesh Connectivity
                    </h3>
                    <p className="text-xs text-gcp-text-secondary leading-relaxed mb-4">
                        Your node is automatically fetching small, non-sensitive computation blocks. 
                        We use end-to-end encryption to ensure your host remains secure and your data private.
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-gcp-text-disabled">
                        <CheckCircle2 size={12} className="text-gcp-green" />
                        Firewall bypass enabled (WebRTC)
                    </div>
                </div>
                <div className="bg-white dark:bg-black border border-gcp-border rounded-xl p-6">
                    <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                        <HelpCircle size={16} className="text-gcp-cyan" />
                        How Payouts Work
                    </h3>
                    <p className="text-xs text-gcp-text-secondary leading-relaxed mb-4">
                        Earnings are calculated per token processed. Once you reach $10.00, 
                        you can withdraw directly to your linked wallet address or PayPal.
                    </p>
                    <button className="text-xs text-gcp-blue font-bold hover:underline">
                        Learn about revenue sharing →
                    </button>
                </div>
            </div>
        </div>
    );
}
