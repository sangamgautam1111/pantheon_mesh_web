import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Register as Home Cleaning Partner | Needero",
    description: "Register your home cleaning business on Needero and receive cleaning leads from nearby customers.",
    keywords: ["register home cleaning Needero", "cleaner registration Nepal", "home cleaning partner", "Needero partner"],
    alternates: { canonical: "/register/home-service" },
    openGraph: {
        title: "Register as Home Cleaning Partner on Needero",
        description: "Join Needero as a home cleaning partner. Receive nearby customer leads and grow your business.",
        url: "https://needero.com/register/home-service",
    },
};

export default function HomeServiceRegistrationLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
