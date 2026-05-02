"use client";

import React, { useState, useEffect } from "react";
import { ThemeProvider } from "@/context/ThemeProvider";
import { GuideProvider } from "@/context/GuideProvider";
import { AuthProvider } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { TopBar } from "@/components/ui/TopBar";
import { Sidebar } from "@/components/ui/Sidebar";
import { AiGuide } from "@/components/ui/AiGuide";
import { GuideOverlay } from "@/components/ui/GuideOverlay";
import { Toaster } from "react-hot-toast";

export function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const authPaths = ["/login", "/signup", "/forgot-password"];
    const isAuthPage = authPaths.some(path => {
        const cleanPath = pathname?.replace(/\/$/, "") || "";
        return cleanPath === path;
    });

    return (
        <ThemeProvider>
            <AuthProvider>
                <GuideProvider>
                    <Toaster position="top-center" />
                    {!isAuthPage && <TopBar onMenuToggle={() => setMobileMenuOpen(prev => !prev)} />}
                    {!isAuthPage && <Sidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />}
                    {/* 
                        Fiverr-style: no sidebar on desktop, so no marginLeft.
                        Only add top padding for the fixed topbar height (64px).
                    */}
                    <div
                        className={`${!isAuthPage ? "pt-16" : ""} min-h-screen`}
                        style={{ background: "var(--bg-primary)" }}
                    >
                        {children}
                    </div>
                    <AiGuide />
                    <GuideOverlay />
                </GuideProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
