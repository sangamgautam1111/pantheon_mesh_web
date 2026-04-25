import type { Metadata } from "next";
import "./globals.css";
import { ClientLayout } from "./ClientLayout";
import { ReactNode } from "react";

export const metadata: Metadata = {
    title: "Needero - Local Offers From Nearby Businesses",
    description: "Post a local problem once and compare offers from nearby businesses.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                    (function() {
                        try {
                            var t = localStorage.getItem('needero-theme') || localStorage.getItem('needaro-theme') || 'light';
                            document.documentElement.setAttribute('data-theme', t);
                        } catch(e) {}
                    })();
                `,
                    }}
                />
            </head>
            <body className="antialiased" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
                <ClientLayout>{children}</ClientLayout>
            </body>
        </html>
    );
}
