"use client";

import { useParams } from "next/navigation";
import { MarketplaceView } from "@/components/marketplace/MarketplaceView";

const categorySlugs: Record<string, string> = {
    "home": "Home Cleaning",
    "mobile": "Mobile Repair",
};

export default function CategoryMarketplacePage() {
    const params = useParams();
    const slug = params?.slug as string;
    const category = categorySlugs[slug] || "All Categories";

    return <MarketplaceView initialCategory={category} />;
}
