import type { Metadata } from "next";
import "./globals.css";
import { ClientLayout } from "./ClientLayout";
import { ReactNode } from "react";

export const metadata: Metadata = {
    metadataBase: new URL("https://needero.com"),
    title: {
        default: "Needero - Local Service Marketplace | Home Cleaning & Mobile Repair",
        template: "%s | Needero",
    },
    description:
        "Needero is a demand-based local service marketplace for home cleaning and mobile repair. Post your service Need and let nearby businesses compete with clear offers. Compare prices, choose the best, and get it done.",
    applicationName: "Needero",
    authors: [{ name: "Needero" }],
    creator: "Needero",
    publisher: "Needero",
    keywords: [
        "Needero",
        "service marketplace",
        "local marketplace Nepal",
        "home cleaning Nepal",
        "house cleaning service",
        "deep cleaning Kathmandu",
        "cleaner Nepal",
        "mobile repair near me",
        "phone repair Nepal",
        "screen replacement Kathmandu",
        "demand-based marketplace",
        "compare service quotes",
        "local business offers",
        "mobile repair shop registration",
        "home cleaning partner",
        "local service provider",
    ],
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    alternates: {
        canonical: "/",
    },
    icons: {
        icon: "/icon.png",
        shortcut: "/icon.png",
        apple: "/icon.png",
    },
    openGraph: {
        title: "Needero - Local Service Marketplace",
        description:
            "Post your service Need once - home cleaning or mobile repair - and nearby businesses compete to give you the best offer.",
        url: "https://needero.com",
        siteName: "Needero",
        images: [
            {
                url: "https://needero.com/icon.png",
                width: 512,
                height: 512,
                alt: "Needero - Local Service Marketplace",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Needero - Home Cleaning & Mobile Repair Marketplace",
        description: "Post what you need. Local businesses compete to serve you. Home cleaning and mobile repair in one platform.",
        creator: "@needero",
        images: ["https://needero.com/icon.png"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
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
            "description":
                "Needero is a demand-based local service marketplace where customers post home cleaning or mobile repair Needs and local businesses compete with clear offers.",
            "foundingDate": "2025",
            "foundingLocation": {
                "@type": "Place",
                "name": "Nepal",
            },
            "sameAs": ["https://needero.com"],
            "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "availableLanguage": ["English", "Nepali"],
            },
        },
        {
            "@type": "WebSite",
            "@id": "https://needero.com/#website",
            "url": "https://needero.com",
            "name": "Needero - Local Service Marketplace",
            "description": "Demand-based marketplace for home cleaning and mobile repair",
            "publisher": {
                "@id": "https://needero.com/#organization",
            },
            "potentialAction": {
                "@type": "SearchAction",
                "target": "https://needero.com/marketplace?q={search_term_string}",
                "query-input": "required name=search_term_string",
            },
        },
        {
            "@type": "SiteNavigationElement",
            "name": "Home Cleaning",
            "url": "https://needero.com/home-services",
        },
        {
            "@type": "SiteNavigationElement",
            "name": "Mobile Repair",
            "url": "https://needero.com/repair-shops",
        },
        {
            "@type": "SiteNavigationElement",
            "name": "Become a Partner",
            "url": "https://needero.com/register",
        },
    ],
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
