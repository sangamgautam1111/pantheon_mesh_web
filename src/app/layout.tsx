import type { Metadata } from "next";
import "./globals.css";
import { ClientLayout } from "./ClientLayout";
import { ReactNode } from "react";

export const metadata: Metadata = {
    metadataBase: new URL('https://needero.com'),
    title: {
        default: "Needero — Local Service Marketplace | Mobile Repair, Food Delivery & Home Services",
        template: "%s | Needero"
    },
    description: "Needero is Nepal's first demand-based service marketplace founded by 13-year-old entrepreneur Sangam Gautam. Post your service need — mobile repair, food delivery, or home services — and let nearby businesses compete with the best offers. Compare prices, choose the best, and get it done.",
    applicationName: "Needero",
    authors: [{ name: "Sangam Gautam", url: "https://needero.com/founder" }],
    creator: "Sangam Gautam",
    publisher: "Needero",
    keywords: [
        "Needero", "service marketplace", "local marketplace Nepal",
        "mobile repair near me", "phone repair Nepal", "screen replacement Kathmandu",
        "food delivery Nepal", "order food online", "restaurants near me",
        "home services Nepal", "plumber near me", "electrician Kathmandu", "cleaner Nepal",
        "demand-based marketplace", "compare service quotes", "local business offers",
        "Sangam Gautam", "13 year old founder", "teen entrepreneur Nepal",
        "repair shop registration", "restaurant partner", "home service provider",
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
        icon: '/icon.png',
        shortcut: '/icon.png',
        apple: '/icon.png',
    },
    openGraph: {
        title: "Needero — Local Service Marketplace by 13-Year-Old Founder Sangam Gautam",
        description: "Post your service need once — mobile repair, food delivery, or home services — and nearby businesses compete to give you the best offer. Nepal's first demand-based marketplace.",
        url: "https://needero.com",
        siteName: "Needero",
        images: [
            {
                url: "https://needero.com/icon.png",
                width: 512,
                height: 512,
                alt: "Needero — Local Service Marketplace",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Needero — Service Marketplace by 13-Year-Old Sangam Gautam",
        description: "Post what you need. Local businesses compete to serve you. Mobile repair, food delivery, home services — all in one platform.",
        creator: "@needero",
        images: ["https://needero.com/icon.png"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
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
            "description": "Needero is Nepal's first demand-based service marketplace. Customers post what they need — mobile repair, food delivery, or home services — and local businesses compete with the best offers. Founded by 13-year-old entrepreneur Sangam Gautam.",
            "foundingDate": "2025",
            "foundingLocation": {
                "@type": "Place",
                "name": "Nepal"
            },
            "founder": {
                "@type": "Person",
                "name": "Sangam Gautam",
                "jobTitle": "Founder and CEO",
                "nationality": "Nepali",
                "description": "Sangam Gautam is a 13-year-old tech entrepreneur from Nepal who founded Needero — a demand-based local service marketplace connecting customers with mobile repair shops, restaurants, and home service professionals.",
                "sameAs": ["https://needero.com/founder"]
            },
            "sameAs": ["https://needero.com"],
            "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "availableLanguage": ["English", "Nepali"]
            }
        },
        {
            "@type": "WebSite",
            "@id": "https://needero.com/#website",
            "url": "https://needero.com",
            "name": "Needero — Local Service Marketplace",
            "description": "Nepal's first demand-based marketplace for mobile repair, food delivery, and home services",
            "publisher": {
                "@id": "https://needero.com/#organization"
            },
            "potentialAction": {
                "@type": "SearchAction",
                "target": "https://needero.com/marketplace?q={search_term_string}",
                "query-input": "required name=search_term_string"
            }
        },
        {
            "@type": "SiteNavigationElement",
            "name": "Restaurants",
            "url": "https://needero.com/restaurants"
        },
        {
            "@type": "SiteNavigationElement",
            "name": "Repair Shops",
            "url": "https://needero.com/repair-shops"
        },
        {
            "@type": "SiteNavigationElement",
            "name": "Home Services",
            "url": "https://needero.com/home-services"
        },
        {
            "@type": "SiteNavigationElement",
            "name": "Become a Partner",
            "url": "https://needero.com/register"
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
