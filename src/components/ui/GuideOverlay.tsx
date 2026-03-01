"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useGuide } from "@/context/GuideProvider";
import { MousePointer2, X } from "lucide-react";

export const GuideOverlay = () => {
    const { steps, currentStep, isActive, nextStep, stopGuide } = useGuide();
    const [pos, setPos] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

    const updatePosition = useCallback(() => {
        if (!isActive || !steps[currentStep]) return;
        const el = document.getElementById(steps[currentStep].elementId);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        setPos({ top: rect.top + window.scrollY, left: rect.left + window.scrollX, width: rect.width, height: rect.height });
        el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, [isActive, steps, currentStep]);

    useEffect(() => {
        if (!isActive) { setPos(null); return; }
        const timer = setTimeout(updatePosition, 300);
        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition);
        return () => {
            clearTimeout(timer);
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition);
        };
    }, [isActive, currentStep, updatePosition]);

    useEffect(() => {
        if (!isActive) return;
        const timeout = setTimeout(stopGuide, 8000);
        return () => clearTimeout(timeout);
    }, [isActive, currentStep, stopGuide]);

    if (!isActive || !pos) return null;

    const step = steps[currentStep];

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none" style={{ isolation: "isolate" }}>
            {/* Dim Overlay */}
            <div className="absolute inset-0 pointer-events-auto" onClick={stopGuide}
                style={{ background: "var(--overlay-bg)" }} />

            {/* Spotlight Cutout */}
            <div
                className="absolute rounded-lg guide-ring pointer-events-none"
                style={{
                    top: pos.top - 6,
                    left: pos.left - 6,
                    width: pos.width + 12,
                    height: pos.height + 12,
                    border: "3px solid var(--gcp-blue)",
                    zIndex: 101,
                    boxShadow: "0 0 0 9999px var(--overlay-bg)",
                    background: "transparent",
                }}
            />

            {/* Arrow & Label */}
            <div
                className="absolute flex flex-col items-center pointer-events-auto guide-arrow"
                style={{
                    top: pos.top - 64,
                    left: pos.left + pos.width / 2 - 80,
                    width: 160,
                    zIndex: 102,
                }}
            >
                <div className="px-4 py-2 rounded-lg text-sm font-medium text-center shadow-lg"
                    style={{ background: "var(--btn-primary-bg)", color: "var(--btn-primary-text)" }}>
                    <div className="flex items-center gap-1.5">
                        <MousePointer2 size={14} />
                        <span>{step.label}</span>
                    </div>
                </div>
                <svg width="16" height="10" viewBox="0 0 16 10" className="mt-[-1px]">
                    <polygon points="0,0 16,0 8,10" style={{ fill: "var(--btn-primary-bg)" }} />
                </svg>
            </div>

            {/* Close / Next */}
            <div className="absolute pointer-events-auto flex items-center gap-2"
                style={{ top: pos.top + pos.height + 16, left: pos.left + pos.width / 2 - 60, zIndex: 102 }}>
                <button onClick={stopGuide}
                    className="px-3 py-1.5 rounded text-xs font-medium border transition-colors"
                    style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)", background: "var(--bg-surface)" }}>
                    Dismiss
                </button>
                {steps.length > 1 && currentStep < steps.length - 1 && (
                    <button onClick={nextStep}
                        className="px-3 py-1.5 rounded text-xs font-medium"
                        style={{ background: "var(--btn-primary-bg)", color: "var(--btn-primary-text)" }}>
                        Next
                    </button>
                )}
            </div>
        </div>
    );
};
