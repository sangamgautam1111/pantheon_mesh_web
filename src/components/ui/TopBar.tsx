"use client";

import { useState } from "react";
import { Search, Bell, HelpCircle, Sparkles, Hexagon, Sun, Moon, Menu, LogOut } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeProvider";
import { useGuide } from "@/context/GuideProvider";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface TopBarProps {
    onMenuToggle: () => void;
}

export const TopBar = ({ onMenuToggle }: TopBarProps) => {
    const { theme, toggleTheme } = useTheme();
    const { setChatOpen } = useGuide();
    const { user, profile, signOut } = useAuth();
    const router = useRouter();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-12 flex items-center justify-between px-4 border-b transition-colors duration-200"
            style={{ background: "var(--topbar-bg)", borderColor: "var(--border-color)" }}>
            <div className="flex items-center gap-3">
                <button onClick={onMenuToggle} className="mobile-only p-1.5 rounded transition-colors"
                    style={{ color: "var(--text-secondary)" }}>
                    <Menu size={20} />
                </button>

                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <Hexagon size={22} style={{ color: "var(--gcp-blue)" }} />
                    <span className="text-base font-heading font-medium" style={{ color: "var(--text-primary)" }}>
                        Pantheon Mesh
                    </span>
                </Link>
            </div>

            <div className="flex-1 max-w-2xl mx-8 desktop-only">
                <div className="flex items-center gap-2 rounded-lg px-3 py-1.5 cursor-text transition-colors"
                    style={{ background: "var(--bg-surface-variant)", border: "1px solid var(--border-color)" }}>
                    <Search size={16} style={{ color: "var(--text-disabled)" }} />
                    <span className="text-sm" style={{ color: "var(--text-disabled)" }}>
                        Search resources, docs, and agents
                    </span>
                    <div className="ml-auto flex items-center text-xs rounded px-1.5 py-0.5"
                        style={{ color: "var(--text-disabled)", border: "1px solid var(--border-color)" }}>
                        /
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-1">
                <button onClick={toggleTheme}
                    className="p-2 rounded-full transition-colors"
                    style={{ color: "var(--text-secondary)" }}
                    title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                    {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <button onClick={() => setChatOpen(true)}
                    className="px-4 py-1.5 rounded-full transition-all desktop-only flex items-center gap-2 shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
                    title="Mesh Assistant"
                    style={{ background: "var(--gcp-blue)", color: "#ffffff" }}>
                    <Sparkles size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Chat with AI Assistant</span>
                </button>
                <button onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-full transition-colors desktop-only relative hover:bg-sidebar-hover" title="Notifications"
                    style={{ color: "var(--text-secondary)" }}>
                    <Bell size={18} />
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gcp-red border border-[var(--topbar-bg)]" title="New notification" />
                </button>

                {user ? (
                    <div className="relative">
                        <button onClick={() => setShowUserMenu(!showUserMenu)}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ml-2 cursor-pointer transition-transform hover:scale-105 overflow-hidden"
                            title={profile?.displayName || "Account"}
                            style={{ background: "var(--gcp-blue)", color: "var(--btn-primary-text)" }}>
                            {profile?.photoURL ? (
                                <img src={profile.photoURL} alt="" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                                (profile?.displayName || profile?.email || "U").charAt(0).toUpperCase()
                            )}
                        </button>
                        {showUserMenu && (
                            <div className="absolute top-12 right-0 w-64 gcp-card overflow-hidden z-50 animate-in fade-in slide-in-from-top-2"
                                style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)" }}>
                                <div className="p-4 border-b" style={{ borderColor: "var(--border-color)" }}>
                                    <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{profile?.displayName || "User"}</p>
                                    <p className="text-xs opacity-60" style={{ color: "var(--text-secondary)" }}>{profile?.email}</p>
                                    <p className="text-[10px] mt-1 uppercase tracking-widest font-bold text-gcp-blue">{profile?.accountType} account</p>
                                </div>
                                <div className="p-2">
                                    <Link href="/dashboard" onClick={() => setShowUserMenu(false)}
                                        className="flex items-center gap-2 p-2 rounded text-sm hover:bg-sidebar-hover transition-colors w-full"
                                        style={{ color: "var(--text-primary)" }}>
                                        Dashboard
                                    </Link>
                                    <button onClick={async () => { await signOut(); setShowUserMenu(false); router.push("/login"); }}
                                        className="flex items-center gap-2 p-2 rounded text-sm hover:bg-sidebar-hover transition-colors w-full text-left"
                                        style={{ color: "var(--text-primary)" }}>
                                        <LogOut size={14} /> Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link href="/login">
                        <button className="px-4 py-1.5 rounded-md text-sm font-medium transition-all hover:bg-sidebar-hover desktop-only"
                            style={{ color: "var(--text-primary)", border: "1px solid var(--border-color)" }}>
                            Sign In
                        </button>
                    </Link>
                )}

                {showNotifications && (
                    <div className="absolute top-12 right-24 w-80 gcp-card overflow-hidden z-50 animate-in fade-in slide-in-from-top-2"
                        style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)" }}>
                        <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: "var(--border-color)" }}>
                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>Notifications</span>
                            <button onClick={() => setShowNotifications(false)} className="text-[10px] text-gcp-blue hover:underline">Clear all</button>
                        </div>
                        <div className="p-8 text-center">
                            <Bell size={32} className="mx-auto mb-4 opacity-20" />
                            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>No new notifications</p>
                            <p className="text-xs mt-1 opacity-50" style={{ color: "var(--text-secondary)" }}>You're all caught up with the mesh.</p>
                        </div>
                    </div>
                )}
                <button onClick={() => setChatOpen(true)}
                    className="p-2 rounded-full transition-colors desktop-only hover:bg-sidebar-hover" title="Help"
                    style={{ color: "var(--text-secondary)" }}>
                    <HelpCircle size={18} />
                </button>
            </div>
        </header>
    );
};
