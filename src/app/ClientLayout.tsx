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

export function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    
    // Improved auth page check to handle trailing slashes and potential case issues
    const authPaths = ["/login", "/signup", "/forgot-password"];
    const isAuthPage = authPaths.some(path => {
        const cleanPath = pathname?.replace(/\/$/, "") || "";
        return cleanPath === path;
    });

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 769);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    return (
        <ThemeProvider>
            <AuthProvider>
                <GuideProvider>
                    {!isAuthPage && <TopBar onMenuToggle={() => setMobileMenuOpen(prev => !prev)} />}
                    {!isAuthPage && <Sidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />}
                    <main
                        className={`${!isAuthPage ? "mt-12" : ""} min-h-screen transition-all duration-200`}
                        style={{
                            marginLeft: !isAuthPage && !isMobile ? 256 : 0,
                            background: "var(--bg-primary)",
                        }}
                    >
                        {children}
                    </main>
                    <AiGuide />
                    <GuideOverlay />
                </GuideProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
