"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    CreditCard,
    FileText,
    LayoutDashboard,
    MessageSquare,
    PlusCircle,
    Store,
    UserRound,
    X,
} from "lucide-react";
import { ActiveAccountType, useAuth } from "@/context/AuthContext";
import logoImg from "@/app/logo.png";

const NAV_ITEMS = [
    { label: "Home", href: "/", icon: LayoutDashboard },
    { label: "My Needs", href: "/client", icon: FileText, allowedTypes: ["customer"] as ActiveAccountType[] },
    { label: "Post a Need", href: "/client/new", icon: PlusCircle, allowedTypes: ["customer"] as ActiveAccountType[] },
    { label: "Marketplace", href: "/marketplace", icon: Store, allowedTypes: ["customer", "business"] as ActiveAccountType[] },
    { label: "Messages", href: "/messages", icon: MessageSquare, allowedTypes: ["customer", "business"] as ActiveAccountType[] },
    { label: "Profile", href: "/profile", icon: UserRound, allowedTypes: ["customer", "business"] as ActiveAccountType[] },
    { label: "Business Plans", href: "/pricing", icon: CreditCard, allowedTypes: ["business"] as ActiveAccountType[] },
];

interface SidebarProps {
    mobileOpen: boolean;
    onClose: () => void;
}

export const Sidebar = ({ mobileOpen, onClose }: SidebarProps) => {
    const { accountType } = useAuth();
    const pathname = usePathname();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 769);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    // On desktop, Fiverr uses top nav only — no persistent sidebar
    if (!isMobile) return null;

    // Mobile drawer
    return (
        <>
            {/* Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            {/* Drawer */}
            <aside
                className="fixed bottom-0 left-0 top-0 z-50 flex flex-col bg-white shadow-2xl transition-transform duration-300"
                style={{
                    width: "280px",
                    transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b px-4 py-4" style={{ borderColor: "#e4e5e7" }}>
                    <Link href="/" onClick={onClose} className="flex items-center gap-2">
                        <div className="h-8 w-8 overflow-hidden rounded-lg">
                            <Image src={logoImg} alt="Needero" width={32} height={32} className="h-full w-full object-cover rounded-lg" />
                        </div>
                        <span className="font-heading font-extrabold text-xl tracking-tight" style={{ color: "#404145" }}>
                            Needle<span style={{ color: "#1DBF73" }}>ro</span>
                        </span>
                    </Link>
                    <button onClick={onClose} className="rounded-full p-1.5 transition-colors hover:bg-gray-100" style={{ color: "#74767e" }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto p-3">
                    {NAV_ITEMS.map((item) => {
                        if (item.allowedTypes && (!accountType || !item.allowedTypes.includes(accountType))) return null;
                        const active = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className="flex items-center gap-3 rounded-lg px-3 py-3 mb-1 text-sm font-medium transition-all"
                                style={{
                                    background: active ? "#e9f9f0" : "transparent",
                                    color: active ? "#1DBF73" : "#404145",
                                    fontWeight: active ? 600 : 500,
                                }}
                            >
                                <item.icon
                                    size={18}
                                    style={{ color: active ? "#1DBF73" : "#74767e", flexShrink: 0 }}
                                />
                                {item.label}
                                {active && (
                                    <div className="ml-auto h-2 w-2 rounded-full" style={{ background: "#1DBF73" }} />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="border-t p-4" style={{ borderColor: "#e4e5e7" }}>
                    <p className="text-xs text-center" style={{ color: "#b5b6ba" }}>
                        Needero — Local Service Marketplace
                    </p>
                </div>
            </aside>
        </>
    );
};
