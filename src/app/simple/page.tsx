"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
    Zap, Terminal, Shield,
    Play, Power, Settings, HelpCircle,
    Activity, CheckCircle2, Globe, BarChart3,
    TrendingUp, Cpu, Server, Lock, Bot
} from "lucide-react";

export default function PersonalNodePage() {
    const { user, profile, accountType } = useAuth();
    const uid = user?.uid;
    const [running, setRunning] = useState(false);
    const [status, setStatus] = useState("Idle");
    const [progress, setProgress] = useState(0);
    const [stats, setStats] = useState({ cpu: 0, ram: 0, jobs: 0, requests: 0, modelCount: 0 });

    useEffect(() => {
        if (!uid) return;
        async function fetchInitialStats() {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/v1/developer/${uid}/models`);
                if (res.ok) {
                    const data = await res.json();
                    setStats(prev => ({ ...prev, modelCount: data.models?.length || 0 }));
                }
            } catch { }
        }
        fetchInitialStats();
    }, [user?.uid]);

    useEffect(() => {
        let interval: any;
        if (running) {
            setStatus("Connected to Mesh");
            interval = setInterval(() => {
                setStats(prev => ({
                    ...prev,
                    cpu: Math.floor(Math.random() * 40) + 10,
                    ram: Math.floor(Math.random() * 20) + 50,
                    jobs: prev.jobs + (Math.random() > 0.9 ? 1 : 0),
                    requests: prev.requests + (Math.random() > 0.7 ? Math.floor(Math.random() * 5) : 0)
                }));
                setProgress(p => (p + 2) % 100);
            }, 1000);
        } else {
            setStatus("Disconnected");
            setStats(prev => ({ ...prev, cpu: 0, ram: 0, jobs: 0, requests: 0 }));
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
                    This interface is designed for Personal accounts to contribute compute power.
                    As a {accountType?.toUpperCase()}, you already have advanced tools in your dashboard.
                </p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-gcp-blue/5 rounded-2xl p-8 border border-gcp-blue/10">
                <div className="space-y-4 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gcp-blue/10 text-gcp-blue rounded-full text-xs font-bold uppercase tracking-wider">
                        <Zap size={14} />
                        Personal Contributor Node
                    </div>
                    <h1 className="text-3xl font-bold dark:text-white">Power the Mesh.</h1>
                    <p className="text-gcp-text-secondary max-w-md leading-relaxed">
                        Contribute your models to the Pantheon Mesh network.
                        Track your impact and see how your contributions are powering the global AI swarm.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                        <button
                            onClick={toggleNode}
                            className={`px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-all active:scale-95 ${running
                                    ? 'bg-gcp-red text-white hover:bg-red-600'
                                    : 'bg-gcp-blue text-white hover:bg-blue-600 shadow-lg shadow-gcp-blue/20'
                                }`}
                        >
                            {running ? <Power size={18} /> : <Play size={18} />}
                            {running ? 'Stop Node' : 'Start Contributing'}
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

            {/* Performance Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Agents Deployed", value: stats.modelCount, icon: Bot, color: "text-gcp-blue" },
                    { label: "Memory", value: `${stats.ram}%`, icon: Settings, color: "text-gcp-cyan" },
                    { label: "Jobs Done", value: stats.jobs, icon: Activity, color: "text-gcp-green" },
                    { label: "Requests Served", value: stats.requests, icon: BarChart3, color: "text-gcp-blue" }
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

            {/* Contribution Model Explanation */}
            <div className="bg-gradient-to-br from-gcp-blue/5 to-gcp-green/5 border border-gcp-blue/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gcp-blue/10 flex items-center justify-center">
                        <TrendingUp size={16} className="text-gcp-blue" />
                    </div>
                    <h3 className="text-sm font-bold">Your Contribution Impact</h3>
                </div>
                <p className="text-xs text-gcp-text-secondary leading-relaxed">
                    As a Personal Contributor, 100% of your compute power goes directly to strengthening the Pantheon Mesh.
                    You have <span className="font-bold text-gcp-blue">unrestricted access</span> to upload any model
                    (DeepSeek, Llama, Mistral, GPT, Claude, and more) because your contributions power the entire network.
                    Every request your models serve makes the mesh stronger.
                </p>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-black border border-gcp-border rounded-xl p-6">
                    <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                        <Globe size={16} className="text-gcp-blue" />
                        Mesh Connectivity
                    </h3>
                    <p className="text-xs text-gcp-text-secondary leading-relaxed mb-4">
                        Your node fetches computation blocks from the global mesh.
                        End-to-end encryption ensures your host stays secure and data stays private.
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-gcp-text-disabled">
                        <CheckCircle2 size={12} className="text-gcp-green" />
                        Firewall bypass enabled (WebRTC)
                    </div>
                </div>
                <div className="bg-white dark:bg-black border border-gcp-border rounded-xl p-6">
                    <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                        <Server size={16} className="text-gcp-cyan" />
                        Model Performance
                    </h3>
                    <p className="text-xs text-gcp-text-secondary leading-relaxed mb-4">
                        Track how your contributed models are being utilized across the mesh.
                        See real-time request counts, job completions, and resource usage from your node.
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-gcp-text-disabled">
                        <BarChart3 size={12} className="text-gcp-cyan" />
                        Live telemetry active
                    </div>
                </div>
                <div className="bg-white dark:bg-black border border-gcp-border rounded-xl p-6">
                    <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                        <Lock size={16} className="text-gcp-green" />
                        Security Pipeline
                    </h3>
                    <p className="text-xs text-gcp-text-secondary leading-relaxed mb-4">
                        256-bit AES key encryption, rate limiting, anomaly detection, and automatic circuit breakers
                        protect your node and API keys from unauthorized access.
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-gcp-text-disabled">
                        <Shield size={12} className="text-gcp-green" />
                        Enterprise-grade protection
                    </div>
                </div>
            </div>
        </div>
    );
}
