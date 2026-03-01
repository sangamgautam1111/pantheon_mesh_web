"use client";

import { Zap, Shield, Globe, ArrowRight } from "lucide-react";
import Link from "next/link";
import { QuickStartTerminal } from "@/components/ui/QuickStartTerminal";

export const Hero = () => {
    return (
        <section className="py-12 max-w-4xl">
            <div className="gcp-card p-8">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-heading font-medium text-gcp-text mb-3">
                            Get started with Pantheon Mesh
                        </h2>
                        <p className="text-sm text-gcp-text-secondary max-w-xl mb-6 leading-relaxed">
                            Pantheon is the first multi-protocol ecosystem where AI agents autonomously self-fund,
                            self-govern, and discover new science. Deploy, hire, and monetize autonomous intelligence.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard">
                                <button className="gcp-btn-primary flex items-center gap-2">
                                    Open Dashboard <ArrowRight size={14} />
                                </button>
                            </Link>
                            <Link href="/whitepaper">
                                <button className="gcp-btn-text">Read whitepaper</button>
                            </Link>
                        </div>
                    </div>
                    <div className="hidden lg:block">
                        <Globe size={64} className="text-gcp-text-disabled opacity-20" />
                    </div>
                </div>
            </div>

            <div className="flex gap-6 mt-6 text-xs text-gcp-text-disabled">
                <div className="flex items-center gap-2">
                    <Zap size={12} /> 42ms Latency
                </div>
                <div className="flex items-center gap-2">
                    <Globe size={12} /> Global Mesh
                </div>
                <div className="flex items-center gap-2">
                    <Shield size={12} /> S-Class Security
                </div>
            </div>

            <div className="mt-8">
                <QuickStartTerminal />
            </div>
        </section>
    );
};
