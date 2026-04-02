"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
    LayoutDashboard, Users, Store, Terminal, Wallet, FileText,
    BookOpen, ChevronDown, ChevronRight, X, Hexagon, Activity, Code, CreditCard
} from "lucide-react";
import Image from "next/image";
import chatIcon from "@/app/chat_icon.png";
import logoImg from "@/app/logo.png";

/* ─────────────────────────────────────────────
   Sidebar navigation items.
   Each item can optionally have an allowedTypes
   array — if set, the item is only shown when
   the logged-in user's account type matches.
   ───────────────────────────────────────────── */
const NAV_ITEMS = [
    { label: "Welcome",          href: "/",           icon: LayoutDashboard },
    { label: "Dashboard",        href: "/dashboard",  icon: LayoutDashboard },
    { label: "Developer Central",href: "/developer",  icon: Code,       allowedTypes: ["developer"] },
    { label: "Client Gigs",      href: "/client",     icon: FileText,   allowedTypes: ["business", "founder"] },
    { label: "Personal Node",    href: "/simple",     icon: Terminal,   allowedTypes: ["personal"] },
    { label: "Agents",           href: "/agents",     icon: Users,      allowedTypes: ["developer", "personal"] },
    { label: "Marketplace",      href: "/marketplace",icon: Store },
    { label: "Pricing",          href: "/pricing",    icon: CreditCard, allowedTypes: ["developer", "business", "founder"] },
    { label: "Withdraw",         href: "/withdraw",   icon: Wallet,     allowedTypes: ["developer", "business", "founder"] },
];

const DOCS_ITEMS = [
    { label: "Manifesto", href: "/manifesto" },
    { label: "Whitepaper", href: "/whitepaper" },
];

interface SidebarProps {
    mobileOpen: boolean;
    onClose: () => void;
}

export const Sidebar = ({ mobileOpen, onClose }: SidebarProps) => {
    const { accountType } = useAuth();
    const pathname = usePathname();
    const [docsOpen, setDocsOpen] = useState(pathname === "/manifesto" || pathname === "/whitepaper");
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 769);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    useEffect(() => {
        if (pathname === "/manifesto" || pathname === "/whitepaper") {
            setDocsOpen(true);
        }
    }, [pathname]);

    const sidebarVisible = isMobile ? mobileOpen : true;
    if (!sidebarVisible) return null;

    return (
        <>
            {/* Mobile backdrop */}
            {isMobile && mobileOpen && (
                <div className="fixed inset-0 z-40" style={{ background: "var(--overlay-bg)" }} onClick={onClose} />
            )}

            <aside
                className={`fixed top-12 left-0 bottom-0 z-40 border-r flex flex-col transition-all duration-200 ${isMobile ? "w-[280px] shadow-2xl" : collapsed ? "w-[52px]" : "w-[256px]"
                    }`}
                style={{ background: "var(--sidebar-bg)", borderColor: "var(--border-color)" }}
            >
                {/* Project selector */}
                {(!collapsed || isMobile) && (
                    <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border-color)" }}>
                        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.03] transition-all group cursor-pointer">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm border border-black/10 overflow-hidden">
                                    <Image src={logoImg} alt="Protocol" width={32} height={32} className="w-full h-full object-cover rounded-full" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <div className="text-sm font-semibold truncate flex items-center gap-1 group-hover:text-gcp-blue transition-colors" style={{ color: "var(--text-primary)" }}>
                                        <span className="text-gcp-blue">P</span>antheon Mesh
                                    </div>
                                    <div className="text-[10px] font-mono truncate" style={{ color: "var(--text-secondary)" }}>pantheon-mesh-488206</div>
                                </div>
                            </div>
                            <ChevronDown size={14} className="group-hover:text-gcp-blue transition-colors flex-shrink-0" style={{ color: "var(--text-disabled)" }} />
                        </div>
                    </div>
                )}

                {/* Nav Links */}
                <nav className="flex-1 overflow-y-auto py-2 scrollbar-hide">
                    {NAV_ITEMS.map((item) => {
                        // Role-based filtering:
                        // If the item declares allowedTypes, hide it unless current account matches.
                        if (item.allowedTypes && (!accountType || !item.allowedTypes.includes(accountType))) {
                            return null;
                        }

                        const active = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => isMobile && onClose()}
                                className={`flex items-center gap-3 mx-2 px-3 py-2 rounded text-sm transition-colors ${active ? "font-medium" : ""
                                    } ${collapsed && !isMobile ? "justify-center" : ""}`}
                                style={{
                                    background: active ? "var(--sidebar-active)" : "transparent",
                                    color: active ? "var(--gcp-blue)" : "var(--text-secondary)",
                                }}
                                title={collapsed && !isMobile ? item.label : undefined}
                            >
                                <item.icon size={18} style={{ color: active ? "var(--gcp-blue)" : "var(--text-disabled)" }} />
                                {(!collapsed || isMobile) && <span>{item.label}</span>}
                            </Link>
                        );
                    })}

                    {/* Docs Section */}
                    {(!collapsed || isMobile) && (
                        <div className="mt-2 pt-2 mx-2" style={{ borderTop: "1px solid var(--border-color)" }}>
                            <button
                                onClick={() => setDocsOpen(!docsOpen)}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                <BookOpen size={18} style={{ color: "var(--text-disabled)" }} />
                                <span className="flex-1 text-left">Documentation</span>
                                <ChevronRight size={14}
                                    style={{ color: "var(--text-disabled)", transform: docsOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
                            </button>
                            {docsOpen && (
                                <div className="ml-9 space-y-0.5">
                                    {DOCS_ITEMS.map(d => (
                                        <Link
                                            key={d.href}
                                            href={d.href}
                                            onClick={() => isMobile && onClose()}
                                            className="block px-3 py-1.5 rounded text-sm transition-colors"
                                            style={{
                                                color: pathname === d.href ? "var(--gcp-blue)" : "var(--text-secondary)",
                                                background: pathname === d.href ? "var(--sidebar-active)" : "transparent",
                                            }}
                                        >
                                            {d.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </nav>

                {/* Collapse Toggle — desktop only */}
                {!isMobile && (
                    <div className="p-2" style={{ borderTop: "1px solid var(--border-color)" }}>
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="w-full flex items-center justify-center p-2 rounded transition-colors"
                            style={{ color: "var(--text-disabled)" }}
                        >
                            {collapsed ? <ChevronRight size={16} /> : <X size={16} />}
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
};
