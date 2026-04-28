"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
    Bell,
    BookOpen,
    Briefcase,
    Crown,
    HelpCircle,
    Layout,
    LogOut,
    Menu,
    Search,
    Sparkles,
    X,
    Store,
    MessageSquare,
    User,
    ChevronDown,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useGuide } from "@/context/GuideProvider";
import { useAuth } from "@/context/AuthContext";
import logoImg from "@/app/logo.png";

const API = "/api/needero";

interface SearchResult {
    type: string;
    label: string;
    href: string;
    subtitle?: string;
}

const TYPE_ICONS: Record<string, { icon: typeof Search; color: string }> = {
    page: { icon: Layout, color: "var(--text-primary)" },
    plan: { icon: Briefcase, color: "var(--text-primary)" },
    doc: { icon: BookOpen, color: "var(--text-primary)" },
    job: { icon: Briefcase, color: "var(--text-primary)" },
};

const TYPE_LABELS: Record<string, string> = {
    page: "Pages",
    plan: "Plans",
    doc: "Documentation",
    job: "Needs",
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
    const [scrolled, setScrolled] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const openAssistant = useCallback(() => {
        setChatOpen(true);
        window.dispatchEvent(new Event("needaro-open-assistant"));
    }, [setChatOpen]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const STATIC_PAGES: SearchResult[] = [
        { type: "page", label: "Local Business Marketplace", href: "/marketplace" },
        { type: "page", label: "My Needs", href: "/client" },
        { type: "page", label: "Post a Need", href: "/client/new" },
        { type: "page", label: "Messages", href: "/messages" },
        { type: "page", label: "Profile", href: "/profile" },
        { type: "page", label: "Marketplace", href: "/marketplace" },
        ...(profile?.accountType === "customer" ? [] : [
            { type: "page", label: "Business Plans", href: "/pricing" },
        ]),
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
            if (!response.ok) return;
            const data = await response.json();
            const apiResults: SearchResult[] = data.results || [];
            const merged = [...localResults];
            for (const result of apiResults) {
                const exists = merged.some(
                    (item) => item.href === result.href && item.label === result.label && item.type === result.type,
                );
                if (!exists) merged.push(result);
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

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setSelectedIndex((c) => Math.min(c + 1, searchResults.length - 1));
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setSelectedIndex((c) => Math.max(c - 1, -1));
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
                if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
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
        if (!searchOpen) return;
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

    const grouped = searchResults.reduce<Record<string, SearchResult[]>>((acc, result) => {
        if (!acc[result.type]) acc[result.type] = [];
        acc[result.type].push(result);
        return acc;
    }, {});

    const groupOrder = ["page", "doc", "job"];
    const accountHomeHref = profile?.accountType === "customer" ? "/client" : "/marketplace";
    const accountDisplayName = profile?.displayName || (profile?.accountType === "customer" ? "Customer" : "Business");
    const initials = (accountDisplayName || "U").charAt(0).toUpperCase();

    return (
        <header
            className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between px-4 lg:px-8 transition-shadow duration-200"
            style={{
                background: "#ffffff",
                borderBottom: "1px solid #e4e5e7",
                boxShadow: scrolled ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
            }}
        >
            {/* Left: Logo + mobile menu */}
            <div className="flex items-center gap-3 flex-shrink-0">
                <button
                    onClick={onMenuToggle}
                    className="mobile-only rounded p-1.5 transition-colors hover:bg-gray-100"
                    style={{ color: "var(--text-secondary)" }}
                >
                    <Menu size={20} />
                </button>

                <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
                    <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg">
                        <Image
                            src={logoImg}
                            alt="Needero"
                            width={32}
                            height={32}
                            className="h-full w-full rounded-lg object-cover"
                        />
                    </div>
                    <span className="hidden sm:block font-heading font-extrabold text-xl tracking-tight" style={{ color: "var(--text-primary)" }}>
                        Needle<span style={{ color: "var(--ndgreen)" }}>ro</span>
                    </span>
                </Link>
            </div>

            {/* Center: Search bar */}
            <div className="desktop-only relative mx-6 flex-1 max-w-2xl" ref={containerRef}>
                <div
                    className="flex cursor-text items-center gap-2 rounded-full border px-4 py-2 transition-all"
                    style={{
                        background: searchOpen ? "#ffffff" : "#f5f5f5",
                        borderColor: searchOpen ? "var(--ndgreen)" : "#e4e5e7",
                        boxShadow: searchOpen ? "0 0 0 3px rgba(29,191,115,0.12)" : "none",
                    }}
                    onClick={() => {
                        setSearchOpen(true);
                        setTimeout(() => inputRef.current?.focus(), 50);
                    }}
                >
                    <Search size={16} style={{ color: searchOpen ? "var(--ndgreen)" : "var(--text-disabled)", flexShrink: 0 }} />
                    {searchOpen ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearchInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 bg-transparent text-sm outline-none"
                            style={{ color: "var(--text-primary)" }}
                            placeholder="Search needs, categories, businesses..."
                            autoFocus
                        />
                    ) : (
                        <span className="flex-1 text-sm" style={{ color: "var(--text-disabled)" }}>
                            Search needs, categories, businesses...
                        </span>
                    )}
                    {searchOpen && searchQuery && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setSearchQuery(""); setSearchResults([]); inputRef.current?.focus(); }}
                            className="rounded-full p-0.5 hover:bg-gray-100"
                        >
                            <X size={14} style={{ color: "var(--text-disabled)" }} />
                        </button>
                    )}
                    {searchLoading && (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-transparent" style={{ borderTopColor: "var(--ndgreen)" }} />
                    )}
                    {!searchOpen && (
                        <button
                            className="nd-btn nd-btn-primary nd-btn-sm rounded-full ml-1 text-xs px-3 py-1"
                            style={{ borderRadius: "50px" }}
                            onClick={(e) => { e.stopPropagation(); setSearchOpen(true); }}
                        >
                            Search
                        </button>
                    )}
                </div>

                {searchOpen && (searchResults.length > 0 || searchQuery.length > 0) && (
                    <div
                        className="absolute left-0 right-0 top-full z-[100] mt-2 max-h-[440px] overflow-y-auto rounded-xl border bg-white"
                        style={{ borderColor: "var(--border-color)", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
                    >
                        {searchResults.length === 0 && searchQuery.length > 0 && !searchLoading && (
                            <div className="p-8 text-center">
                                <Search size={28} className="mx-auto mb-3 opacity-20" />
                                <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                                    No results for "{searchQuery}"
                                </p>
                                <p className="mt-1 text-xs" style={{ color: "var(--text-disabled)" }}>
                                    Try searching for needs, shops, or categories
                                </p>
                            </div>
                        )}
                        {groupOrder.map((type) => {
                            const items = grouped[type];
                            if (!items || items.length === 0) return null;
                            const typeInfo = TYPE_ICONS[type] || { icon: Search, color: "var(--text-secondary)" };
                            const TypeIcon = typeInfo.icon;
                            return (
                                <div key={type}>
                                    <div
                                        className="flex items-center gap-2 border-b px-4 py-2 text-[11px] font-bold uppercase tracking-widest"
                                        style={{ color: "var(--text-disabled)", borderColor: "var(--border-subtle)" }}
                                    >
                                        <TypeIcon size={10} />
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
                                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors"
                                                style={{
                                                    background: isSelected ? "var(--ndgreen-light)" : "transparent",
                                                    color: "var(--text-primary)",
                                                }}
                                            >
                                                <TypeIcon size={14} style={{ color: typeInfo.color, flexShrink: 0 }} />
                                                <div className="min-w-0 flex-1">
                                                    <span className="block truncate font-medium">{result.label}</span>
                                                    {result.subtitle && (
                                                        <span className="block text-xs" style={{ color: "var(--text-secondary)" }}>
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
                            className="flex items-center justify-between border-t px-4 py-2 text-[10px]"
                            style={{ borderColor: "var(--border-subtle)", color: "var(--text-disabled)" }}
                        >
                            <span>Press / to search</span>
                            <span>ESC to close</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Right: Nav links + actions */}
            <div className="flex items-center gap-1">

                {/* Nav links desktop */}
                <nav className="desktop-only flex items-center gap-1 mr-3">
                    <Link href="/marketplace" className="px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-green-600"
                        style={{ color: "var(--text-secondary)" }}>
                        Browse Needs
                    </Link>
                    {profile?.accountType === "customer" && (
                        <Link href="/client/new" className="px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-green-600"
                            style={{ color: "var(--text-secondary)" }}>
                            Post a Need
                        </Link>
                    )}
                    {profile?.accountType === "business" && (
                        <Link href="/pricing" className="px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-green-600"
                            style={{ color: "var(--text-secondary)" }}>
                            Plans
                        </Link>
                    )}
                    <Link href="/messages" className="px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-green-600"
                        style={{ color: "var(--text-secondary)" }}>
                        Messages
                    </Link>
                </nav>

                {/* AI Assistant */}
                <button
                    onClick={openAssistant}
                    className="desktop-only nd-btn nd-btn-ghost nd-btn-sm rounded-full gap-1.5 mr-1"
                    title="AI Assistant"
                >
                    <Sparkles size={14} style={{ color: "var(--ndgreen)" }} />
                    <span className="text-xs font-semibold">AI Help</span>
                </button>

                {/* Notifications */}
                <button
                    onClick={() => setShowNotifications((c) => !c)}
                    className="desktop-only relative rounded-full p-2 transition-colors hover:bg-gray-100"
                    title="Notifications"
                    style={{ color: "var(--text-secondary)" }}
                >
                    <Bell size={18} />
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white" />
                </button>

                {/* User menu */}
                {user && profile ? (
                    <div className="relative ml-1">
                        <button
                            onClick={() => setShowUserMenu((c) => !c)}
                            className="flex items-center gap-2 rounded-full border px-2 py-1.5 transition-all hover:shadow-md"
                            style={{ borderColor: "var(--border-color)" }}
                        >
                            <div
                                className="h-7 w-7 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                style={{ background: "var(--ndgreen)" }}
                            >
                                {profile.photoURL ? (
                                    <img src={profile.photoURL} alt="" className="h-full w-full object-cover" />
                                ) : initials}
                            </div>
                            {profile?.currentPlanId && profile.currentPlanId !== "free" && (
                                <Crown size={12} className="text-yellow-500" fill="currentColor" />
                            )}
                            <ChevronDown size={14} style={{ color: "var(--text-secondary)" }} />
                        </button>

                        {showUserMenu && (
                            <div
                                className="absolute right-0 top-12 z-50 w-64 rounded-xl border bg-white overflow-hidden shadow-xl"
                                style={{ borderColor: "var(--border-color)" }}
                            >
                                <div className="p-4 border-b" style={{ borderColor: "var(--border-subtle)" }}>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                                            style={{ background: "var(--ndgreen)" }}
                                        >
                                            {profile.photoURL ? (
                                                <img src={profile.photoURL} alt="" className="h-full w-full object-cover" />
                                            ) : initials}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                                                {accountDisplayName}
                                            </p>
                                            <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                                                {profile?.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2">
                                    {[
                                        { label: profile?.accountType === "customer" ? "My Needs" : "Marketplace", href: accountHomeHref, icon: Store },
                                        { label: "Profile", href: "/profile", icon: User },
                                        { label: "Messages", href: "/messages", icon: MessageSquare },
                                    ].map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setShowUserMenu(false)}
                                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-gray-50"
                                            style={{ color: "var(--text-primary)" }}
                                        >
                                            <item.icon size={15} style={{ color: "var(--text-secondary)" }} />
                                            {item.label}
                                        </Link>
                                    ))}
                                    <div className="my-1 border-t" style={{ borderColor: "var(--border-subtle)" }} />
                                    <button
                                        onClick={async () => {
                                            await signOut();
                                            setShowUserMenu(false);
                                            router.push("/login");
                                        }}
                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-red-50"
                                        style={{ color: "#e63946" }}
                                    >
                                        <LogOut size={15} />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-2 ml-1">
                        <Link href="/login">
                            <button
                                className="nd-btn nd-btn-ghost nd-btn-sm rounded-full text-sm"
                                style={{ color: "var(--text-primary)" }}
                            >
                                Sign In
                            </button>
                        </Link>
                        <Link href="/login">
                            <button className="nd-btn nd-btn-primary nd-btn-sm rounded-full text-sm">
                                Join
                            </button>
                        </Link>
                    </div>
                )}

                {/* Notifications dropdown */}
                {showNotifications && (
                    <div
                        className="absolute right-24 top-16 z-50 w-80 rounded-xl border bg-white overflow-hidden shadow-xl"
                        style={{ borderColor: "var(--border-color)" }}
                    >
                        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border-subtle)" }}>
                            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Notifications</span>
                            <button
                                onClick={() => setShowNotifications(false)}
                                className="text-xs font-medium hover:underline"
                                style={{ color: "var(--ndgreen)" }}
                            >
                                Clear all
                            </button>
                        </div>
                        <div className="p-8 text-center">
                            <Bell size={32} className="mx-auto mb-3 opacity-20" />
                            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>No new notifications</p>
                            <p className="mt-1 text-xs" style={{ color: "var(--text-disabled)" }}>Your Needero workspace is up to date.</p>
                        </div>
                    </div>
                )}

                <button
                    onClick={openAssistant}
                    className="rounded-full p-2 transition-colors hover:bg-gray-100"
                    title="Help"
                    style={{ color: "var(--text-secondary)" }}
                >
                    <HelpCircle size={18} />
                </button>
            </div>
        </header>
    );
};
