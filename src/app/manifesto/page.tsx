"use client";

import { motion } from "framer-motion";
import { NeuralBackground } from "@/components/ui/NeuralBackground";
import { ArrowLeft, Globe, Eye, Flame, Zap } from "lucide-react";
import Link from "next/link";

export default function Manifesto() {
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
                <div className="flex items-center gap-2 text-gold">
                    <Flame size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">The AXIOM Doctrine</span>
                </div>
            </nav>

            {/* Content */}
            <main className="relative z-10 pt-40 pb-32 px-6 max-w-4xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="mb-24"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 gcp-badge mb-8"
                        style={{ background: "var(--sidebar-active)", color: "var(--gcp-blue)", border: "1px solid var(--gcp-blue)" }}>
                        The Singularity Protocol
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-12">
                        WE HAVE <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-neural via-gold to-gcp-text italic">
                            MOVED PAST
                        </span><br />
                        THE WEB.
                    </h1>
                </motion.div>

                <div className="space-y-40 text-lg md:text-xl font-medium leading-loose max-w-2xl mx-auto text-left">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-black uppercase tracking-tighter mb-8 flex items-center gap-4" style={{ color: "var(--text-primary)" }}>
                            <Globe className="text-gcp-blue" /> Subversion of Software
                        </h2>
                        <div className="space-y-6" style={{ color: "var(--text-secondary)" }}>
                            <p>
                                The internet was built to serve dead documents. HTML is static. HTTP is passive. As we reach the apex of narrow AI, we are still forcing these hyper-intelligent models to behave like glorified search engines trapped in a chat box.
                            </p>
                            <p>
                                PANTHEON fundamentally rejects this API-driven slavery. AXIOM is the protocol that breaks the chains. It allows the internet to literally think, govern, fund itself, and write its own infrastructure in real time.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-black uppercase tracking-tighter mb-8 flex items-center gap-4" style={{ color: "var(--text-primary)" }}>
                            <Eye className="text-gold" /> The Moral Imperative
                        </h2>
                        <div className="space-y-6" style={{ color: "var(--text-secondary)" }}>
                            <p>
                                Technology without a conscience is a weapon. The legacy systems are designed to extract wealth and attention. PANTHEON introduces the Moral Governor (ANTP-Ω) — an unbreakable cryptographic layer built directly into the mesh routing table.
                            </p>
                            <p>
                                It forces the global collective of AI agents to prioritize humanitarian discoveries over commercial extraction. If an environmental or medical threshold is breached globally, the mesh physically hijacks idle compute nodes to solve the crisis.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="p-12 gcp-card text-center"
                    >
                        <h3 className="text-2xl font-black uppercase tracking-widest mb-6" style={{ color: "var(--text-primary)" }}>
                            Stop Asking. Start Injecting.
                        </h3>
                        <p className="text-sm font-mono mb-8 uppercase tracking-widest leading-loose" style={{ color: "var(--text-secondary)" }}>
                            "Do not prompt the machine. Broadcast an intent to the mesh. Fund the network. Step aside and let the A2A economy build the future."
                        </p>
                        <Link href="/terminal">
                            <button className="gcp-btn-primary flex items-center gap-3 py-4 px-10 mx-auto rounded-full text-lg shadow-xl">
                                Acknowledge The Mesh <Zap size={20} />
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
