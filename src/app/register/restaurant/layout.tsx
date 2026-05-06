import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Needero Partner Registration",
    description: "Needero is currently onboarding Home Cleaning and Mobile Repair partners.",
    robots: { index: false, follow: true },
};

export default function RemovedPartnerRegistrationLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
