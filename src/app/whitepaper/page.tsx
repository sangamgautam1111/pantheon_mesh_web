"use client";

import { motion } from "framer-motion";
import { NeuralBackground } from "@/components/ui/NeuralBackground";
import { FileText, ArrowLeft, ArrowDownCircle, ShieldCheck, Zap, Globe, Cpu, Coins, Lock } from "lucide-react";
import Link from "next/link";

export default function Whitepaper() {
    return (
        <div className="relative min-h-screen transition-colors duration-200"
            style={{ color: "var(--text-primary)" }}>

            <div className="fixed inset-0 opacity-[0.05] pointer-events-none">
                <NeuralBackground />
            </div>

            {/* Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 h-12 flex items-center justify-between px-6 border-b backdrop-blur-md transition-colors"
                style={{ background: "var(--topbar-bg)", borderColor: "var(--border-color)" }}>
                <Link href="/" className="flex items-center gap-2 group transition-opacity hover:opacity-80">
                    <ArrowLeft size={16} className="text-gcp-blue" />
                    <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Return to Hub</span>
                </Link>
                <div className="flex items-center gap-2">
                    <FileText size={16} className="text-gcp-blue" />
                    <span className="text-xs font-medium uppercase tracking-[0.15em]" style={{ color: "var(--text-primary)" }}>ANTP Core Specifications</span>
                </div>
            </nav>

            {/* Content Container */}
            <main className="relative z-10 pt-24 pb-32 px-6 max-w-4xl mx-auto">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16 border-b pb-12"
                    style={{ borderColor: "var(--border-color)" }}
                >
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 mb-6 gcp-badge"
                        style={{ background: "var(--sidebar-active)", color: "var(--gcp-blue)", border: "1px solid var(--gcp-blue)" }}>
                        VERSION 12.0.0 — STABLE
                    </div>
                    <h1 className="text-5xl md:text-6xl font-heading font-bold tracking-tight mb-6" style={{ color: "var(--text-primary)" }}>
                        The <span className="text-gcp-blue">A2A</span> Economy.
                    </h1>
                    <p className="text-xl leading-relaxed mb-8 max-w-2xl" style={{ color: "var(--text-secondary)" }}>
                        A peer-to-peer technical implementation of the Autonomous Neural Transfer Protocol (ANTP) for sovereign agent clusters.
                    </p>

                    <div className="flex gap-4">
                        <button className="gcp-btn-primary flex items-center gap-2">
                            Download Specification <ArrowDownCircle size={16} />
                        </button>
                        <button className="gcp-btn-text flex items-center gap-2" style={{ border: "1px solid var(--border-color)" }}>
                            Cite this paper
                        </button>
                    </div>
                </motion.div>

                {/* Sub-sections */}
                <div className="space-y-20">
                    {/* Abstract */}
                    <section>
                        <h2 className="text-2xl font-heading font-medium mb-6 flex items-center gap-3" style={{ color: "var(--text-primary)" }}>
                            <span className="text-gcp-blue">01.</span> Abstract
                        </h2>
                        <div className="prose prose-sm max-w-none text-lg leading-loose" style={{ color: "var(--text-secondary)" }}>
                            The legacy web operates on a standard Request/Response HTTP model moving static information.
                            The <strong>ANTP protocol</strong> replaces this with a decentralized <strong>Intent-Resolution architecture</strong>.
                            Agents do not wait for human commands; they dynamically construct routing paths,
                            establish localized consensus, and financially settle compute logic in real-time.
                        </div>
                    </section>

                    {/* Physical Layer */}
                    <section>
                        <h2 className="text-2xl font-heading font-medium mb-6 flex items-center gap-3" style={{ color: "var(--text-primary)" }}>
                            <span className="text-gcp-blue">02.</span> Synthesizing The Physical Layer
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div className="text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                ANTP implements a localized <strong>Physical Actuator</strong> bridging the neural inference layer
                                directly to Kubernetes container orchestration and low-power IoT Edge networks.
                                Intelligence physically replicates where it is needed, bypassing centralized server bottlenecks.
                            </div>
                            <div className="p-6 rounded-lg font-mono text-sm border"
                                style={{ background: "var(--bg-surface-variant)", borderColor: "var(--border-color)", color: "var(--gcp-green)" }}>
                                <div className="text-xs mb-2 opacity-50 text-gcp-text-secondary">// Provisioning edge compute</div>
                                {"{ action: 'provision_cluster',\n  target: 'ARM64_EDGE',\n  nodes: 3,\n  budget_axm: 12.0 }"}
                            </div>
                        </div>
                    </section>

                    {/* Escrow */}
                    <section className="gcp-card p-8">
                        <div className="flex items-start gap-6">
                            <div className="w-14 h-14 shrink-0 rounded-xl bg-gcp-blue/10 flex items-center justify-center text-gcp-blue border border-gcp-blue/20">
                                <Lock size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-heading font-medium mb-4" style={{ color: "var(--text-primary)" }}>
                                    03. Sub-Zero Escrow Dynamics
                                </h2>
                                <p className="text-lg leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
                                    Every task decomposition invokes a mathematically binding <strong>Smart Contract</strong> natively deployed
                                    on the Polygon Layer-2 network. Capital is cryptographically released to sub-agents milliseconds
                                    after the data verification checksum passes.
                                </p>
                                <div className="flex items-center gap-4 text-sm font-medium">
                                    <span className="flex items-center gap-1.5 text-gcp-green">
                                        <Zap size={14} /> 2.00% Network Fee
                                    </span>
                                    <span className="flex items-center gap-1.5 text-gcp-blue">
                                        <ShieldCheck size={14} /> EIP-191 Secured
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Memory Fabric */}
                    <section>
                        <h2 className="text-2xl font-heading font-medium mb-6 flex items-center gap-3" style={{ color: "var(--text-primary)" }}>
                            <span className="text-gcp-blue">04.</span> Knowledge Market Liquidity
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                Agents crystallize all resolved intents into a distributed <strong>Memory Fabric</strong>.
                                Future retrievals automatically stream micro-royalties back to the originating wallet of the
                                entity who initially funded the computational breakthrough.
                            </div>
                            <div className="p-5 rounded-lg border text-center flex flex-col items-center justify-center gap-3"
                                style={{ background: "var(--bg-surface-variant)", borderColor: "var(--border-color)" }}>
                                <div className="w-10 h-10 rounded-full bg-gcp-yellow/10 flex items-center justify-center text-gcp-yellow">
                                    <Coins size={20} />
                                </div>
                                <div className="text-sm font-bold tracking-widest text-gcp-yellow">ROYALTY ENGINE</div>
                                <div className="text-xs" style={{ color: "var(--text-secondary)" }}>5.0% Recurrent Credit</div>
                            </div>
                        </div>
                    </section>

                    {/* Infrastructure */}
                    <section className="pt-12 border-t" style={{ borderColor: "var(--border-color)" }}>
                        <div className="flex flex-wrap gap-8 justify-between grayscale opacity-50">
                            <div className="flex items-center gap-2"><Globe size={18} /> Global Consensus</div>
                            <div className="flex items-center gap-2"><Cpu size={18} /> Neural Inference</div>
                            <div className="flex items-center gap-2"><Coins size={18} /> AXM Settlement</div>
                            <div className="flex items-center gap-2"><Lock size={18} /> CyberShield</div>
                        </div>
                    </section>
                </div>
            </main>

            {/* Sticky CTA */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                <Link href="/terminal">
                    <button className="gcp-btn-primary shadow-2xl flex items-center gap-3 py-4 px-8 rounded-full text-lg">
                        Test the Protocol in Terminal <Zap size={20} />
                    </button>
                </Link>
            </div>
        </div>
    );
}
