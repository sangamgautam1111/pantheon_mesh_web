import type { Metadata } from "next";
import "./globals.css";
import { ClientLayout } from "./ClientLayout";
import { ReactNode } from "react";

export const metadata: Metadata = {
    metadataBase: new URL('https://needero.com'),
    title: {
        default: "Needero - Phone Repair Offers From Nearby Shops",
        template: "%s | Needero"
    },
    description: "Needero is a demand-based marketplace platform designed to connect buyers and sellers. Post your phone issue once and compare repair offers from nearby shops.",
    applicationName: "Needero",
    authors: [{ name: "Sangam Gautam", url: "https://needero.com/founder" }],
    creator: "Sangam Gautam",
    publisher: "Needero",
    keywords: ["phone repair", "repair marketplace", "Needero", "Sangam Gautam", "local repair offers", "screen replacement", "demand-based marketplace"],
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    alternates: {
        canonical: "/",
    },
    icons: {
        icon: '/icon.png',
        shortcut: '/icon.png',
        apple: '/icon.png',
    },
    openGraph: {
        title: "Needero - Phone Repair Offers From Nearby Shops",
        description: "Demand-based marketplace platform designed to connect buyers and sellers.",
        url: "https://needero.com",
        siteName: "Needero",
        images: [
            {
                url: "https://needero.com/icon.png",
                width: 512,
                height: 512,
                alt: "Needero Logo",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Needero - Phone Repair Offers From Nearby Shops",
        description: "Post your phone issue once and compare repair offers from nearby shops.",
        creator: "@needero",
        images: ["https://needero.com/icon.png"],
    },
};

const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "Organization",
            "@id": "https://needero.com/#organization",
            "name": "Needero",
            "url": "https://needero.com",
            "logo": "https://needero.com/icon.png",
            "description": "Demand-based marketplace platform designed to connect buyers and sellers. Founded by 13-year-old entrepreneur Sangam Gautam from Nepal.",
            "founder": {
                "@type": "Person",
                "name": "Sangam Gautam",
                "jobTitle": "Founder and CEO",
                "nationality": "Nepal",
                "description": "Sangam Gautam is a 13-year-old tech entrepreneur from Nepal, Founder and CEO of Needero."
            }
        },
        {
            "@type": "WebSite",
            "@id": "https://needero.com/#website",
            "url": "https://needero.com",
            "name": "Needero",
            "publisher": {
                "@id": "https://needero.com/#organization"
            },
            "potentialAction": {
                "@type": "SearchAction",
                "target": "https://needero.com/marketplace?q={search_term_string}",
                "query-input": "required name=search_term_string"
            }
        }
    ]
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                />
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
