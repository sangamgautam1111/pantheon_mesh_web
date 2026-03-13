"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Bell, HelpCircle, Sparkles, Hexagon, Sun, Moon, Menu, LogOut, FileText, Bot, Cpu, BookOpen, Layout, X } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeProvider";
import { useGuide } from "@/context/GuideProvider";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface SearchResult {
    type: string;
    label: string;
    href: string;
    model_id?: string;
    provider?: string;
    status?: string;
    agent_id?: string;
    reputation?: number;
    match?: string;
}

const TYPE_ICONS: Record<string, { icon: typeof Search; color: string }> = {
    page: { icon: Layout, color: "var(--gcp-blue)" },
    doc: { icon: BookOpen, color: "var(--gcp-purple)" },
    model: { icon: Cpu, color: "var(--gcp-cyan)" },
    agent: { icon: Bot, color: "var(--gcp-green)" },
};

const TYPE_LABELS: Record<string, string> = {
    page: "Pages",
    doc: "Documentation",
    model: "Models",
    agent: "Agents",
};

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

    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const STATIC_PAGES: SearchResult[] = [
        { type: "page", label: "Dashboard", href: "/dashboard" },
        { type: "page", label: "Swarm Center", href: "/swarm" },
        { type: "page", label: "Developer Portal", href: "/developer" },
        { type: "page", label: "Connect Model", href: "/connect" },
        { type: "page", label: "Agents", href: "/agents" },
        { type: "page", label: "Marketplace", href: "/marketplace" },
        { type: "page", label: "Pricing", href: "/pricing" },
        { type: "page", label: "Singularity Terminal", href: "/terminal" },
        { type: "page", label: "Treasury", href: "/founder" },
        { type: "doc", label: "Manifesto", href: "/manifesto" },
        { type: "doc", label: "Whitepaper", href: "/whitepaper" },
    ];

    const performSearch = useCallback(async (q: string) => {
        if (!q.trim()) {
            setSearchResults([]);
            setSearchLoading(false);
            return;
        }

        const localResults = STATIC_PAGES.filter(
            p => p.label.toLowerCase().includes(q.toLowerCase())
        );

        setSearchResults(localResults);

        try {
            setSearchLoading(true);
            const res = await fetch(`${API}/v1/search?q=${encodeURIComponent(q)}&limit=15`);
            if (res.ok) {
                const data = await res.json();
                const apiResults: SearchResult[] = data.results || [];
                const merged = [...localResults];
                for (const r of apiResults) {
                    const exists = merged.some(
                        m => m.href === r.href && m.label === r.label && m.type === r.type
                    );
                    if (!exists) merged.push(r);
                }
                setSearchResults(merged);
            }
        } catch {
            // Keep local results on network failure
        } finally {
            setSearchLoading(false);
        }
    }, []);

    const handleSearchInput = (value: string) => {
        setSearchQuery(value);
        setSelectedIndex(-1);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => performSearch(value), 200);
    };

    const handleSelect = (result: SearchResult) => {
        setSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
        setSelectedIndex(-1);
        router.push(result.href);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, -1));
        } else if (e.key === "Enter" && selectedIndex >= 0 && searchResults[selectedIndex]) {
            e.preventDefault();
            handleSelect(searchResults[selectedIndex]);
        } else if (e.key === "Escape") {
            setSearchOpen(false);
            setSearchQuery("");
            setSearchResults([]);
            setSelectedIndex(-1);
        }
    };

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
                const tag = (e.target as HTMLElement)?.tagName;
                if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
                e.preventDefault();
                setSearchOpen(true);
                setTimeout(() => inputRef.current?.focus(), 50);
            }
            if (e.key === "Escape" && searchOpen) {
                setSearchOpen(false);
                setSearchQuery("");
                setSearchResults([]);
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [searchOpen]);

    useEffect(() => {
        if (!searchOpen) return;
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setSearchOpen(false);
                setSearchQuery("");
                setSearchResults([]);
                setSelectedIndex(-1);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [searchOpen]);

    const grouped = searchResults.reduce<Record<string, SearchResult[]>>((acc, r) => {
        if (!acc[r.type]) acc[r.type] = [];
        acc[r.type].push(r);
        return acc;
    }, {});

    const groupOrder = ["page", "doc", "model", "agent"];

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
                        NOVEX
                    </span>
                </Link>
            </div>

            <div className="flex-1 max-w-2xl mx-8 desktop-only relative" ref={containerRef}>
                <div
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 cursor-text transition-all"
                    style={{
                        background: searchOpen ? "var(--bg-surface)" : "var(--bg-surface-variant)",
                        border: searchOpen ? "1px solid var(--gcp-blue)" : "1px solid var(--border-color)",
                        boxShadow: searchOpen ? "0 0 0 2px var(--gcp-blue-alpha, rgba(66,133,244,0.15))" : "none",
                    }}
                    onClick={() => {
                        setSearchOpen(true);
                        setTimeout(() => inputRef.current?.focus(), 50);
                    }}
                >
                    <Search size={16} style={{ color: searchOpen ? "var(--gcp-blue)" : "var(--text-disabled)" }} />
                    {searchOpen ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchQuery}
                            onChange={e => handleSearchInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 bg-transparent outline-none text-sm"
                            style={{ color: "var(--text-primary)" }}
                            placeholder="Search models, agents, pages, docs..."
                            autoFocus
                        />
                    ) : (
                        <span className="flex-1 text-sm" style={{ color: "var(--text-disabled)" }}>
                            Search resources, docs, and agents
                        </span>
                    )}
                    {searchOpen && searchQuery && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSearchQuery("");
                                setSearchResults([]);
                                inputRef.current?.focus();
                            }}
                            className="p-0.5 rounded hover:bg-gcp-blue/10 transition-colors"
                            style={{ color: "var(--text-disabled)" }}
                        >
                            <X size={14} />
                        </button>
                    )}
                    {!searchOpen && (
                        <div className="ml-auto flex items-center text-xs rounded px-1.5 py-0.5"
                            style={{ color: "var(--text-disabled)", border: "1px solid var(--border-color)" }}>
                            /
                        </div>
                    )}
                    {searchLoading && (
                        <div className="w-4 h-4 border-2 border-transparent border-t-gcp-blue rounded-full animate-spin" />
                    )}
                </div>

                {searchOpen && (searchResults.length > 0 || searchQuery.length > 0) && (
                    <div
                        className="absolute top-full left-0 right-0 mt-1 rounded-lg overflow-hidden z-[100] max-h-[420px] overflow-y-auto"
                        style={{
                            background: "var(--bg-surface)",
                            border: "1px solid var(--border-color)",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                        }}
                    >
                        {searchResults.length === 0 && searchQuery.length > 0 && !searchLoading && (
                            <div className="p-6 text-center">
                                <Search size={24} className="mx-auto mb-2 opacity-20" />
                                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                    No results for "{searchQuery}"
                                </p>
                                <p className="text-xs mt-1 opacity-50" style={{ color: "var(--text-disabled)" }}>
                                    Try searching for models, agents, or pages
                                </p>
                            </div>
                        )}

                        {groupOrder.map(type => {
                            const items = grouped[type];
                            if (!items || items.length === 0) return null;
                            const typeInfo = TYPE_ICONS[type] || { icon: Search, color: "var(--text-secondary)" };
                            const TypeIcon = typeInfo.icon;
                            return (
                                <div key={type}>
                                    <div className="px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold flex items-center gap-2"
                                        style={{ color: "var(--text-disabled)", borderBottom: "1px solid var(--border-color)" }}>
                                        <TypeIcon size={10} style={{ color: typeInfo.color }} />
                                        {TYPE_LABELS[type] || type}
                                    </div>
                                    {items.map((result, idx) => {
                                        const flatIdx = searchResults.indexOf(result);
                                        const isSelected = flatIdx === selectedIndex;
                                        return (
                                            <button
                                                key={`${result.type}-${result.label}-${idx}`}
                                                onClick={() => handleSelect(result)}
                                                onMouseEnter={() => setSelectedIndex(flatIdx)}
                                                className="w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors text-sm"
                                                style={{
                                                    background: isSelected ? "var(--sidebar-active)" : "transparent",
                                                    color: isSelected ? "var(--gcp-blue)" : "var(--text-primary)",
                                                }}
                                            >
                                                <TypeIcon size={14} style={{ color: typeInfo.color }} />
                                                <div className="flex-1 min-w-0">
                                                    <span className="font-medium truncate block">{result.label}</span>
                                                    {result.provider && (
                                                        <span className="text-[10px] opacity-50 block" style={{ color: "var(--text-secondary)" }}>
                                                            {result.provider} {result.model_id && `· ${result.model_id}`}
                                                        </span>
                                                    )}
                                                    {result.agent_id && (
                                                        <span className="text-[10px] opacity-50 block" style={{ color: "var(--text-secondary)" }}>
                                                            {result.agent_id}
                                                        </span>
                                                    )}
                                                </div>
                                                {result.status && (
                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-widest ${result.status === "active" ? "bg-gcp-green/10 text-gcp-green" : "bg-gcp-yellow/10 text-gcp-yellow"}`}>
                                                        {result.status}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            );
                        })}

                        <div className="px-3 py-2 flex items-center justify-between text-[10px] opacity-40"
                            style={{ borderTop: "1px solid var(--border-color)", color: "var(--text-disabled)" }}>
                            <span>Press / to search</span>
                            <span>ESC to close</span>
                        </div>
                    </div>
                )}
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
