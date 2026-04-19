"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
    Bell,
    BookOpen,
    Briefcase,
    HelpCircle,
    Layout,
    LogOut,
    Menu,
    Search,
    Sparkles,
    X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useGuide } from "@/context/GuideProvider";
import { useAuth } from "@/context/AuthContext";
import logoImg from "@/app/logo.png";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface SearchResult {
    type: string;
    label: string;
    href: string;
    subtitle?: string;
}

const TYPE_ICONS: Record<string, { icon: typeof Search; color: string }> = {
    page: { icon: Layout, color: "var(--gcp-blue)" },
    plan: { icon: Briefcase, color: "var(--gcp-cyan)" },
    doc: { icon: BookOpen, color: "var(--gcp-purple)" },
    job: { icon: Briefcase, color: "var(--gcp-green)" },
};

const TYPE_LABELS: Record<string, string> = {
    page: "Pages",
    plan: "Plans",
    doc: "Documentation",
    job: "Jobs",
};

interface TopBarProps {
    onMenuToggle: () => void;
}

export const TopBar = ({ onMenuToggle }: TopBarProps) => {
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
        { type: "page", label: "Job Center", href: "/client" },
        { type: "page", label: "Marketplace", href: "/marketplace" },
        { type: "page", label: "Pricing", href: "/pricing" },
        { type: "doc", label: "Manifesto", href: "/manifesto" },
        { type: "doc", label: "Whitepaper", href: "/whitepaper" },
    ];

    const performSearch = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            setSearchLoading(false);
            return;
        }

        const localResults = STATIC_PAGES.filter((page) =>
            page.label.toLowerCase().includes(query.toLowerCase()),
        );

        setSearchResults(localResults);

        try {
            setSearchLoading(true);
            const response = await fetch(`${API}/v1/search?q=${encodeURIComponent(query)}&limit=15`);
            if (!response.ok) {
                return;
            }

            const data = await response.json();
            const apiResults: SearchResult[] = data.results || [];
            const merged = [...localResults];

            for (const result of apiResults) {
                const exists = merged.some(
                    (item) => item.href === result.href && item.label === result.label && item.type === result.type,
                );
                if (!exists) {
                    merged.push(result);
                }
            }

            setSearchResults(merged);
        } catch {
            setSearchResults(localResults);
        } finally {
            setSearchLoading(false);
        }
    }, []);

    const handleSearchInput = (value: string) => {
        setSearchQuery(value);
        setSelectedIndex(-1);
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => performSearch(value), 200);
    };

    const handleSelect = (result: SearchResult) => {
        setSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
        setSelectedIndex(-1);
        router.push(result.href);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setSelectedIndex((current) => Math.min(current + 1, searchResults.length - 1));
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setSelectedIndex((current) => Math.max(current - 1, -1));
        } else if (event.key === "Enter" && selectedIndex >= 0 && searchResults[selectedIndex]) {
            event.preventDefault();
            handleSelect(searchResults[selectedIndex]);
        } else if (event.key === "Escape") {
            setSearchOpen(false);
            setSearchQuery("");
            setSearchResults([]);
            setSelectedIndex(-1);
        }
    };

    useEffect(() => {
        const handler = (event: KeyboardEvent) => {
            if (event.key === "/" && !event.ctrlKey && !event.metaKey) {
                const tag = (event.target as HTMLElement)?.tagName;
                if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
                    return;
                }
                event.preventDefault();
                setSearchOpen(true);
                setTimeout(() => inputRef.current?.focus(), 50);
            }

            if (event.key === "Escape" && searchOpen) {
                setSearchOpen(false);
                setSearchQuery("");
                setSearchResults([]);
            }
        };

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [searchOpen]);

    useEffect(() => {
        if (!searchOpen) {
            return;
        }

        const handler = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setSearchOpen(false);
                setSearchQuery("");
                setSearchResults([]);
                setSelectedIndex(-1);
            }
        };

        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [searchOpen]);

    const grouped = searchResults.reduce<Record<string, SearchResult[]>>((accumulator, result) => {
        if (!accumulator[result.type]) {
            accumulator[result.type] = [];
        }
        accumulator[result.type].push(result);
        return accumulator;
    }, {});

    const groupOrder = ["page", "doc", "job"];

    return (
        <header
            className="fixed left-0 right-0 top-0 z-50 flex h-12 items-center justify-between border-b px-4 transition-colors duration-200"
            style={{ background: "var(--topbar-bg)", borderColor: "var(--border-color)" }}
        >
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuToggle}
                    className="mobile-only rounded p-1.5 transition-colors"
                    style={{ color: "var(--text-secondary)" }}
                >
                    <Menu size={20} />
                </button>

                <Link href="/" className="flex min-w-0 items-center gap-3 transition-opacity hover:opacity-80">
                    <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full border border-black/10 bg-white shadow-sm">
                        <Image
                            src={logoImg}
                            alt="Pantheon Mesh"
                            width={32}
                            height={32}
                            className="h-full w-full rounded-full object-cover"
                        />
                    </div>
                    <span
                        className="truncate text-sm font-semibold tracking-tight"
                        style={{ color: "var(--text-primary)" }}
                    >
                        Pantheon Mesh
                    </span>
                </Link>
            </div>

            <div className="desktop-only relative mx-8 max-w-2xl flex-1" ref={containerRef}>
                <div
                    className="flex cursor-text items-center gap-2 rounded-lg px-3 py-1.5 transition-all"
                    style={{
                        background: searchOpen ? "var(--bg-surface)" : "var(--bg-surface-variant)",
                        border: searchOpen ? "1px solid var(--gcp-blue)" : "1px solid var(--border-color)",
                        boxShadow: searchOpen
                            ? "0 0 0 2px var(--gcp-blue-alpha, rgba(66,133,244,0.15))"
                            : "none",
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
                            onChange={(event) => handleSearchInput(event.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 bg-transparent text-sm outline-none"
                            style={{ color: "var(--text-primary)" }}
                            placeholder="Search jobs, pricing, pages, and docs..."
                            autoFocus
                        />
                    ) : (
                        <span className="flex-1 text-sm" style={{ color: "var(--text-disabled)" }}>
                            Search business pages, docs, and workflows
                        </span>
                    )}
                    {searchOpen && searchQuery && (
                        <button
                            onClick={(event) => {
                                event.stopPropagation();
                                setSearchQuery("");
                                setSearchResults([]);
                                inputRef.current?.focus();
                            }}
                            className="rounded p-0.5 transition-colors hover:bg-gcp-blue/10"
                            style={{ color: "var(--text-disabled)" }}
                        >
                            <X size={14} />
                        </button>
                    )}
                    {!searchOpen && (
                        <div
                            className="ml-auto flex items-center rounded px-1.5 py-0.5 text-xs"
                            style={{ color: "var(--text-disabled)", border: "1px solid var(--border-color)" }}
                        >
                            /
                        </div>
                    )}
                    {searchLoading && (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-gcp-blue" />
                    )}
                </div>

                {searchOpen && (searchResults.length > 0 || searchQuery.length > 0) && (
                    <div
                        className="absolute left-0 right-0 top-full z-[100] mt-1 max-h-[420px] overflow-y-auto rounded-lg border"
                        style={{
                            background: "var(--bg-surface)",
                            borderColor: "var(--border-color)",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                        }}
                    >
                        {searchResults.length === 0 && searchQuery.length > 0 && !searchLoading && (
                            <div className="p-6 text-center">
                                <Search size={24} className="mx-auto mb-2 opacity-20" />
                                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                    No results for "{searchQuery}"
                                </p>
                                <p className="mt-1 text-xs opacity-50" style={{ color: "var(--text-disabled)" }}>
                                Try searching for jobs, pricing, or pages
                                </p>
                            </div>
                        )}

                        {groupOrder.map((type) => {
                            const items = grouped[type];
                            if (!items || items.length === 0) {
                                return null;
                            }

                            const typeInfo = TYPE_ICONS[type] || { icon: Search, color: "var(--text-secondary)" };
                            const TypeIcon = typeInfo.icon;

                            return (
                                <div key={type}>
                                    <div
                                        className="flex items-center gap-2 border-b px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest"
                                        style={{ color: "var(--text-disabled)", borderColor: "var(--border-color)" }}
                                    >
                                        <TypeIcon size={10} style={{ color: typeInfo.color }} />
                                        {TYPE_LABELS[type] || type}
                                    </div>
                                    {items.map((result, index) => {
                                        const flatIndex = searchResults.indexOf(result);
                                        const isSelected = flatIndex === selectedIndex;

                                        return (
                                            <button
                                                key={`${result.type}-${result.label}-${index}`}
                                                onClick={() => handleSelect(result)}
                                                onMouseEnter={() => setSelectedIndex(flatIndex)}
                                                className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors"
                                                style={{
                                                    background: isSelected ? "var(--sidebar-active)" : "transparent",
                                                    color: isSelected ? "var(--gcp-blue)" : "var(--text-primary)",
                                                }}
                                            >
                                                <TypeIcon size={14} style={{ color: typeInfo.color }} />
                                                <div className="min-w-0 flex-1">
                                                    <span className="block truncate font-medium">{result.label}</span>
                                                    {result.subtitle && (
                                                        <span
                                                            className="block text-[10px] opacity-50"
                                                            style={{ color: "var(--text-secondary)" }}
                                                        >
                                                            {result.subtitle}
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            );
                        })}

                        <div
                            className="flex items-center justify-between border-t px-3 py-2 text-[10px] opacity-40"
                            style={{ borderColor: "var(--border-color)", color: "var(--text-disabled)" }}
                        >
                            <span>Press / to search</span>
                            <span>ESC to close</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => setChatOpen(true)}
                    className="desktop-only flex items-center gap-2 rounded-full px-4 py-1.5 shadow-sm transition-all hover:scale-105 hover:shadow-md active:scale-95"
                    title="Workspace Assistant"
                    style={{ background: "var(--gcp-blue)", color: "#ffffff" }}
                >
                    <Sparkles size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Chat with Assistant</span>
                </button>

                <button
                    onClick={() => setShowNotifications((current) => !current)}
                    className="desktop-only relative rounded-full p-2 transition-colors hover:bg-sidebar-hover"
                    title="Notifications"
                    style={{ color: "var(--text-secondary)" }}
                >
                    <Bell size={18} />
                    <span
                        className="absolute right-2 top-2 h-2 w-2 rounded-full border bg-gcp-red"
                        style={{ borderColor: "var(--topbar-bg)" }}
                    />
                </button>

                {user ? (
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu((current) => !current)}
                            className="ml-2 h-8 w-8 cursor-pointer overflow-hidden rounded-full text-sm font-medium transition-transform hover:scale-105"
                            title={profile?.displayName || "Account"}
                            style={{ background: "var(--gcp-blue)", color: "var(--btn-primary-text)" }}
                        >
                            {profile?.photoURL ? (
                                <img src={profile.photoURL} alt="" className="h-8 w-8 rounded-full object-cover" />
                            ) : (
                                (profile?.displayName || profile?.email || "B").charAt(0).toUpperCase()
                            )}
                        </button>

                        {showUserMenu && (
                            <div
                                className="gcp-card absolute right-0 top-12 z-50 w-64 overflow-hidden"
                                style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)" }}
                            >
                                <div className="border-b p-4" style={{ borderColor: "var(--border-color)" }}>
                                    <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                                        {profile?.displayName || "Business User"}
                                    </p>
                                    <p className="text-xs opacity-60" style={{ color: "var(--text-secondary)" }}>
                                        {profile?.email}
                                    </p>
                                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gcp-blue">
                                        {(profile?.accountType || "business")} account
                                    </p>
                                </div>

                                <div className="p-2">
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setShowUserMenu(false)}
                                        className="flex w-full items-center gap-2 rounded p-2 text-sm transition-colors hover:bg-sidebar-hover"
                                        style={{ color: "var(--text-primary)" }}
                                    >
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={async () => {
                                            await signOut();
                                            setShowUserMenu(false);
                                            router.push("/login");
                                        }}
                                        className="flex w-full items-center gap-2 rounded p-2 text-left text-sm transition-colors hover:bg-sidebar-hover"
                                        style={{ color: "var(--text-primary)" }}
                                    >
                                        <LogOut size={14} />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link href="/login">
                        <button
                            className="desktop-only rounded-md px-4 py-1.5 text-sm font-medium transition-all hover:bg-sidebar-hover"
                            style={{ color: "var(--text-primary)", border: "1px solid var(--border-color)" }}
                        >
                            Sign In
                        </button>
                    </Link>
                )}

                {showNotifications && (
                    <div
                        className="gcp-card absolute right-24 top-12 z-50 w-80 overflow-hidden"
                        style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)" }}
                    >
                        <div
                            className="flex items-center justify-between border-b p-3"
                            style={{ borderColor: "var(--border-color)" }}
                        >
                            <span
                                className="text-xs font-bold uppercase tracking-wider"
                                style={{ color: "var(--text-primary)" }}
                            >
                                Notifications
                            </span>
                            <button
                                onClick={() => setShowNotifications(false)}
                                className="text-[10px] text-gcp-blue hover:underline"
                            >
                                Clear all
                            </button>
                        </div>
                        <div className="p-8 text-center">
                            <Bell size={32} className="mx-auto mb-4 opacity-20" />
                            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                                No new notifications
                            </p>
                            <p className="mt-1 text-xs opacity-50" style={{ color: "var(--text-secondary)" }}>
                                Your business workspace is up to date.
                            </p>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => setChatOpen(true)}
                    className="desktop-only rounded-full p-2 transition-colors hover:bg-sidebar-hover"
                    title="Help"
                    style={{ color: "var(--text-secondary)" }}
                >
                    <HelpCircle size={18} />
                </button>
            </div>
        </header>
    );
};
