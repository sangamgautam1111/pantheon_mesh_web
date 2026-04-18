"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    BookOpen,
    ChevronDown,
    ChevronRight,
    CreditCard,
    FileText,
    LayoutDashboard,
    Store,
    X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import logoImg from "@/app/logo.png";

const NAV_ITEMS = [
    { label: "Welcome", href: "/", icon: LayoutDashboard },
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Jobs", href: "/client", icon: FileText, allowedTypes: ["business"] as const },
    { label: "Business Plans", href: "/business/plans", icon: CreditCard, allowedTypes: ["business"] as const },
    { label: "Marketplace", href: "/marketplace", icon: Store },
    { label: "Pricing", href: "/pricing", icon: CreditCard },
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
    if (!sidebarVisible) {
        return null;
    }

    return (
        <>
            {isMobile && mobileOpen && (
                <div
                    className="fixed inset-0 z-40"
                    style={{ background: "var(--overlay-bg)" }}
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed bottom-0 left-0 top-12 z-40 flex flex-col border-r transition-all duration-200 ${
                    isMobile ? "w-[280px] shadow-2xl" : collapsed ? "w-[52px]" : "w-[256px]"
                }`}
                style={{ background: "var(--sidebar-bg)", borderColor: "var(--border-color)" }}
            >
                {(!collapsed || isMobile) && (
                    <div className="border-b px-4 py-3" style={{ borderColor: "var(--border-color)" }}>
                        <div className="group flex cursor-pointer items-center justify-between rounded-lg p-2 transition-all hover:bg-white/[0.03]">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full border border-black/10 bg-white shadow-sm">
                                    <Image
                                        src={logoImg}
                                        alt="Pantheon Mesh"
                                        width={32}
                                        height={32}
                                        className="h-full w-full rounded-full object-cover"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <div
                                        className="truncate text-sm font-semibold transition-colors group-hover:text-gcp-blue"
                                        style={{ color: "var(--text-primary)" }}
                                    >
                                        Pantheon Mesh
                                    </div>
                                    <div className="truncate text-[10px] font-mono" style={{ color: "var(--text-secondary)" }}>
                                        business workspace
                                    </div>
                                </div>
                            </div>
                            <ChevronDown
                                size={14}
                                className="flex-shrink-0 transition-colors group-hover:text-gcp-blue"
                                style={{ color: "var(--text-disabled)" }}
                            />
                        </div>
                    </div>
                )}

                <nav className="flex-1 overflow-y-auto py-2 scrollbar-hide">
                    {NAV_ITEMS.map((item) => {
                        if (item.allowedTypes && (!accountType || !item.allowedTypes.includes(accountType))) {
                            return null;
                        }

                        const active = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => isMobile && onClose()}
                                className={`mx-2 flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors ${
                                    collapsed && !isMobile ? "justify-center" : ""
                                } ${active ? "font-medium" : ""}`}
                                style={{
                                    background: active ? "var(--sidebar-active)" : "transparent",
                                    color: active ? "var(--gcp-blue)" : "var(--text-secondary)",
                                }}
                                title={collapsed && !isMobile ? item.label : undefined}
                            >
                                <item.icon
                                    size={18}
                                    style={{ color: active ? "var(--gcp-blue)" : "var(--text-disabled)" }}
                                />
                                {(!collapsed || isMobile) && <span>{item.label}</span>}
                            </Link>
                        );
                    })}

                    {(!collapsed || isMobile) && (
                        <div className="mx-2 mt-2 border-t pt-2" style={{ borderTop: "1px solid var(--border-color)" }}>
                            <button
                                onClick={() => setDocsOpen((current) => !current)}
                                className="flex w-full items-center gap-3 rounded px-3 py-2 text-sm transition-colors"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                <BookOpen size={18} style={{ color: "var(--text-disabled)" }} />
                                <span className="flex-1 text-left">Documentation</span>
                                <ChevronRight
                                    size={14}
                                    style={{
                                        color: "var(--text-disabled)",
                                        transform: docsOpen ? "rotate(90deg)" : "none",
                                        transition: "transform 0.2s",
                                    }}
                                />
                            </button>
                            {docsOpen && (
                                <div className="ml-9 space-y-0.5">
                                    {DOCS_ITEMS.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => isMobile && onClose()}
                                            className="block rounded px-3 py-1.5 text-sm transition-colors"
                                            style={{
                                                color:
                                                    pathname === item.href ? "var(--gcp-blue)" : "var(--text-secondary)",
                                                background:
                                                    pathname === item.href
                                                        ? "var(--sidebar-active)"
                                                        : "transparent",
                                            }}
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </nav>

                {!isMobile && (
                    <div className="p-2" style={{ borderTop: "1px solid var(--border-color)" }}>
                        <button
                            onClick={() => setCollapsed((current) => !current)}
                            className="flex w-full items-center justify-center rounded p-2 transition-colors"
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
