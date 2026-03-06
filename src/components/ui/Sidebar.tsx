"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
    LayoutDashboard, Users, Store, Terminal, Wallet, FileText,
    BookOpen, ChevronDown, ChevronRight, X, Hexagon, Activity, Code
} from "lucide-react";

const NAV_ITEMS = [
    { label: "Welcome", href: "/", icon: LayoutDashboard },
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Swarm Center", href: "/swarm", icon: Activity },
    { label: "Developer", href: "/developer", icon: Code, allowedTypes: ["developer"] },
    { label: "Agents", href: "/agents", icon: Users, allowedTypes: ["developer"] },
    { label: "Marketplace", href: "/marketplace", icon: Store },
    { label: "Singularity Terminal", href: "/terminal", icon: Terminal, allowedTypes: ["developer"] },
    { label: "Treasury", href: "/founder", icon: Wallet, allowedTypes: ["developer", "business"] },
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
                {/* Project Selector */}
                {(!collapsed || isMobile) && (
                    <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border-color)" }}>
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText("novex-488206");
                                    alert("Project ID copied to clipboard!");
                                }}
                                className="flex items-center gap-2 px-2 py-1.5 rounded transition-colors text-left flex-1 hover:bg-sidebar-hover"
                                style={{ color: "var(--text-primary)" }}>
                                <Hexagon size={18} style={{ color: "var(--gcp-blue)" }} />
                                <div className="min-w-0 flex-1 ml-1">
                                    <div className="text-[13px] font-medium truncate" style={{ color: "var(--text-primary)" }}>Pantheon Mesh</div>
                                    <div className="text-[11px] truncate opacity-60" style={{ color: "var(--text-secondary)" }}>novex-488206</div>
                                </div>
                                <ChevronDown size={14} style={{ color: "var(--text-disabled)" }} />
                            </button>
                            {isMobile && (
                                <button onClick={onClose} className="p-1.5 rounded ml-2" style={{ color: "var(--text-disabled)" }}>
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Nav Links */}
                <nav className="flex-1 overflow-y-auto py-2 scrollbar-hide">
                    {NAV_ITEMS.map((item) => {
                        // @ts-ignore - dynamic extension
                        if (item.allowedTypes && accountType && !item.allowedTypes.includes(accountType)) {
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
