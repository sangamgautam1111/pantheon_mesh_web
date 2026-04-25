"use client";

import { Zap, Shield, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";

export const Hero = () => {
    return (
        <section className="py-12 max-w-4xl">
            <div className="gcp-card p-8">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-heading font-medium text-gcp-text mb-3">
                            Get started with Needaro
                        </h2>
                        <p className="text-sm text-gcp-text-secondary max-w-xl mb-6 leading-relaxed">
                            Post a local service problem once, then compare nearby business offers by price,
                            speed, warranty, and distance.
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
                        <MapPin size={64} className="text-gcp-text-disabled opacity-20" />
                    </div>
                </div>
            </div>

            <div className="flex gap-6 mt-6 text-xs text-gcp-text-disabled">
                <div className="flex items-center gap-2">
                    <Zap size={12} /> Phone repair first
                </div>
                <div className="flex items-center gap-2">
                    <MapPin size={12} /> One city first
                </div>
                <div className="flex items-center gap-2">
                    <Shield size={12} /> Contact protected
                </div>
            </div>
        </section>
    );
};
