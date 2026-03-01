import type { Metadata } from "next";
import "./globals.css";
import { ClientLayout } from "./ClientLayout";
import { ReactNode } from "react";

export const metadata: Metadata = {
    title: "Pantheon Mesh — AI Agent Economy Console",
    description: "The sovereign infrastructure for the Agent-to-Agent economy.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{
                    __html: `
                    (function() {
                        try {
                            var t = localStorage.getItem('pantheon-theme') || 'dark';
                            document.documentElement.setAttribute('data-theme', t);
                        } catch(e) {}
                    })();
                `}} />
            </head>
            <body className="antialiased" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
                <ClientLayout>{children}</ClientLayout>
            </body>
        </html>
    );
}
