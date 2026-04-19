"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowDownCircle,
    ArrowLeft,
    Cpu,
    FileText,
    Globe,
    Layers3,
    Lock,
    ShieldCheck,
    Zap,
} from "lucide-react";
import { NeuralBackground } from "@/components/ui/NeuralBackground";

export default function Whitepaper() {
    return (
        <div className="relative min-h-screen transition-colors duration-200" style={{ color: "var(--text-primary)" }}>
            <div className="fixed inset-0 opacity-[0.05] pointer-events-none">
                <NeuralBackground />
            </div>

            <nav
                className="fixed top-0 left-0 right-0 z-50 flex h-12 items-center justify-between border-b px-6 backdrop-blur-md transition-colors"
                style={{ background: "var(--topbar-bg)", borderColor: "var(--border-color)" }}
            >
                <Link href="/" className="group flex items-center gap-2 transition-opacity hover:opacity-80">
                    <ArrowLeft size={16} className="text-gcp-blue" />
                    <span
                        className="text-xs font-medium uppercase tracking-wider"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        Return to Hub
                    </span>
                </Link>
                <div className="flex items-center gap-2">
                    <FileText size={16} className="text-gcp-blue" />
                    <span
                        className="text-xs font-medium uppercase tracking-[0.15em]"
                        style={{ color: "var(--text-primary)" }}
                    >
                        Business Delivery Architecture
                    </span>
                </div>
            </nav>

            <main className="relative z-10 mx-auto max-w-4xl px-6 pt-24 pb-32">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16 border-b pb-12"
                    style={{ borderColor: "var(--border-color)" }}
                >
                    <div
                        className="gcp-badge mb-6 inline-flex items-center gap-2 px-2.5 py-1"
                        style={{
                            background: "var(--sidebar-active)",
                            color: "var(--gcp-blue)",
                            border: "1px solid var(--gcp-blue)",
                        }}
                    >
                        VERSION 14.0.0 - BUSINESS
                    </div>

                    <h1
                        className="mb-6 text-5xl font-heading font-bold tracking-tight md:text-6xl"
                        style={{ color: "var(--text-primary)" }}
                    >
                        The <span className="text-gcp-blue">Managed AI</span> Delivery Stack.
                    </h1>

                    <p className="mb-8 max-w-2xl text-xl leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        Pantheon Mesh is a business-first execution platform for recurring digital work, combining managed
                        model routing, structured review, and one unified client workspace.
                    </p>

                    <div className="flex gap-4">
                        <Link href="/pricing" className="gcp-btn-primary flex items-center gap-2">
                            Open Pricing <ArrowDownCircle size={16} />
                        </Link>
                    </div>
                </motion.div>

                <div className="space-y-20">
                    <section>
                        <h2
                            className="mb-6 flex items-center gap-3 text-2xl font-heading font-medium"
                            style={{ color: "var(--text-primary)" }}
                        >
                            <span className="text-gcp-blue">01.</span> Abstract
                        </h2>
                        <div className="prose prose-sm max-w-none text-lg leading-loose" style={{ color: "var(--text-secondary)" }}>
                            Pantheon Mesh is designed for businesses that want common digital work completed faster, more
                            predictably, and with less coordination overhead than traditional freelance workflows. A request
                            enters one workspace, is routed through an internal AI team, reviewed against the brief, and
                            returned with status history the client can inspect at any time.
                        </div>
                    </section>

                    <section>
                        <h2
                            className="mb-6 flex items-center gap-3 text-2xl font-heading font-medium"
                            style={{ color: "var(--text-primary)" }}
                        >
                            <span className="text-gcp-blue">02.</span> Execution Layer
                        </h2>
                        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
                            <div className="text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                Each request is decomposed into a practical workflow: planning, specialist execution,
                                review, and fallback handling. The platform chooses the best provider path for the task,
                                keeps the number of agent turns bounded, and preserves a single delivery record for the client.
                            </div>
                            <div
                                className="rounded-lg border p-6 font-mono text-sm"
                                style={{
                                    background: "var(--bg-surface-variant)",
                                    borderColor: "var(--border-color)",
                                    color: "var(--gcp-green)",
                                }}
                            >
                                <div className="mb-2 text-xs opacity-50 text-gcp-text-secondary">
                                    // Internal execution handoff
                                </div>
                                {"{ stage: 'route_request',\n  workflow: 'planner -> worker -> reviewer',\n  budget_guard: 'enabled',\n  delivery_mode: 'business_workspace' }"}
                            </div>
                        </div>
                    </section>

                    <section className="gcp-card relative overflow-hidden border-gcp-blue/20 bg-gcp-blue/[0.02] p-10 shadow-2xl">
                        <div className="absolute top-0 right-0 h-32 w-32 translate-x-16 -translate-y-16 rounded-full bg-gcp-blue/5 blur-3xl" />
                        <div className="relative z-10 flex items-start gap-8">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-gcp-blue/20 bg-gcp-blue/10 text-gcp-blue shadow-inner">
                                <Lock size={28} />
                            </div>
                            <div>
                                <h2 className="mb-6 text-3xl font-heading font-bold" style={{ color: "var(--text-primary)" }}>
                                    03. Control and Review Layer
                                </h2>
                                <div className="mb-8 text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                    Pantheon Mesh keeps quality and cost under control with explicit routing policies,
                                    budget-aware execution, and a required review pass before work is marked complete.
                                    The client sees one outcome stream, while the platform handles provider choice,
                                    fallback behavior, and delivery validation behind the scenes.
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="rounded-lg border border-gcp-border bg-gcp-surface p-4 shadow-sm">
                                        <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-gcp-blue">
                                            Review Gate
                                        </div>
                                        <div className="text-2xl font-black text-gcp-text">
                                            Required
                                            <span className="ml-1 text-sm font-normal text-gcp-text-disabled">
                                                BEFORE DELIVERY
                                            </span>
                                        </div>
                                    </div>
                                    <div className="rounded-lg border border-gcp-border bg-gcp-surface p-4 shadow-sm">
                                        <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-gcp-green">
                                            Budget Control
                                        </div>
                                        <div className="text-2xl font-black text-gcp-text">
                                            Bounded
                                            <span className="ml-1 text-sm font-normal text-gcp-text-disabled">
                                                PER WORKFLOW
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2
                            className="mb-6 flex items-center gap-3 text-2xl font-heading font-medium"
                            style={{ color: "var(--text-primary)" }}
                        >
                            <span className="text-gcp-blue">04.</span> Business Workspace
                        </h2>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            <div className="md:col-span-2 text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                The product surface is intentionally simple: sign in, submit work, monitor progress,
                                review completed jobs, and scale capacity through plan upgrades. Email, Google, and GitHub
                                all route into the same business account experience.
                            </div>
                            <div
                                className="flex flex-col items-center justify-center gap-3 rounded-lg border p-5 text-center"
                                style={{ background: "var(--bg-surface-variant)", borderColor: "var(--border-color)" }}
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gcp-yellow/10 text-gcp-yellow">
                                    <Layers3 size={20} />
                                </div>
                                <div className="text-sm font-bold tracking-widest text-gcp-yellow">UNIFIED PORTAL</div>
                                <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                    One account, one workflow, one delivery history
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="border-t pt-12" style={{ borderColor: "var(--border-color)" }}>
                        <div className="flex flex-wrap justify-between gap-8 grayscale opacity-50">
                            <div className="flex items-center gap-2">
                                <Globe size={18} /> Managed Routing
                            </div>
                            <div className="flex items-center gap-2">
                                <Cpu size={18} /> AI Execution
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={18} /> Review Coverage
                            </div>
                            <div className="flex items-center gap-2">
                                <Lock size={18} /> Business Controls
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
                <Link href="/pricing">
                    <button className="gcp-btn-primary flex items-center gap-3 rounded-full px-8 py-4 text-lg shadow-2xl">
                        Open Pricing <Zap size={20} />
                    </button>
                </Link>
            </div>
        </div>
    );
}
