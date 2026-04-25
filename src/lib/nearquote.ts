export type NeedaroPlan = {
    id: "free" | "starter" | "pro" | "premium";
    name: string;
    price: string;
    cadence: string;
    quoteReplies: string;
    visibility: string;
    aiTools: string;
    analytics: string;
    bestFor: string;
    features: string[];
};

export type ServiceRequest = {
    id: string;
    title: string;
    location: string;
    urgency: string;
    category: string;
    issue: string;
    device?: string;
    status: "open" | "quoted" | "chosen";
    offers: number;
    firstOfferTime: string;
};

export type BusinessOffer = {
    shop: string;
    price: string;
    time: string;
    warranty: string;
    distance: string;
    note: string;
};

export const NEEDARO_PLANS: NeedaroPlan[] = [
    {
        id: "free",
        name: "Free",
        price: "Rs. 0",
        cadence: "/month",
        quoteReplies: "5 replies/month",
        visibility: "Standard listing",
        aiTools: "Basic templates",
        analytics: "Not included",
        bestFor: "Trying leads",
        features: [
            "Reply to 5 customer requests per month",
            "Basic shop profile",
            "Manual quote replies",
            "Appear in matching phone repair requests",
        ],
    },
    {
        id: "starter",
        name: "Starter",
        price: "Rs. 500",
        cadence: "/month",
        quoteReplies: "30 replies/month",
        visibility: "Better request access",
        aiTools: "Reply helper",
        analytics: "Basic",
        bestFor: "Small repair shops",
        features: [
            "Reply to 30 customer requests per month",
            "AI professional quote helper",
            "Stronger business profile",
            "Basic request and quote analytics",
        ],
    },
    {
        id: "pro",
        name: "Pro",
        price: "Rs. 1,000",
        cadence: "/month",
        quoteReplies: "Unlimited replies",
        visibility: "Verified profile",
        aiTools: "Quote helper + templates",
        analytics: "Conversion dashboard",
        bestFor: "Active shops",
        features: [
            "Unlimited quote replies",
            "Verified business profile",
            "AI quote helper and saved templates",
            "Conversion, response speed, and missed request analytics",
        ],
    },
    {
        id: "premium",
        name: "Premium",
        price: "Rs. 2,500",
        cadence: "/month",
        quoteReplies: "Unlimited replies",
        visibility: "Priority visibility",
        aiTools: "Advanced AI tools",
        analytics: "Full analytics",
        bestFor: "Top local shops",
        features: [
            "Priority visibility for matching requests",
            "Unlimited quote replies",
            "Advanced AI quote helper",
            "Full analytics for leads, quotes, chosen offers, and response speed",
        ],
    },
];

export const PHONE_REPAIR_REQUESTS: ServiceRequest[] = [
    {
        id: "NQ-1001",
        title: "iPhone 11 cracked screen",
        location: "New Road, Kathmandu",
        urgency: "Today",
        category: "Phone repair",
        issue: "Screen cracked, touch still works",
        device: "iPhone 11",
        status: "quoted",
        offers: 3,
        firstOfferTime: "12 min",
    },
    {
        id: "NQ-1002",
        title: "Samsung A52 black display",
        location: "Kalanki",
        urgency: "Within 24 hours",
        category: "Phone repair",
        issue: "Sound works, display is black",
        device: "Samsung A52",
        status: "open",
        offers: 1,
        firstOfferTime: "18 min",
    },
    {
        id: "NQ-1003",
        title: "Redmi charging port issue",
        location: "Baneshwor",
        urgency: "This week",
        category: "Phone repair",
        issue: "Phone charges only when cable is angled",
        device: "Redmi Note series",
        status: "chosen",
        offers: 4,
        firstOfferTime: "8 min",
    },
];

export const SAMPLE_OFFERS: BusinessOffer[] = [
    {
        shop: "New Road Mobile Care",
        price: "Rs. 4,500",
        time: "2 hours",
        warranty: "1 month",
        distance: "1.2 km",
        note: "Original-quality display available today.",
    },
    {
        shop: "Kathmandu Phone Fix",
        price: "Rs. 4,200",
        time: "Tomorrow",
        warranty: "No warranty",
        distance: "0.8 km",
        note: "Budget display option. Final price after inspection.",
    },
    {
        shop: "Trusted Repair Hub",
        price: "Rs. 5,000",
        time: "Today",
        warranty: "3 months",
        distance: "2.1 km",
        note: "Warranty included with tested display replacement.",
    },
];

export const NEEDARO_METRICS = [
    { label: "First niche", value: "Phone repair" },
    { label: "Launch city", value: "One city first" },
    { label: "Validation target", value: "50 requests" },
    { label: "Supply target", value: "10 shops" },
];

export function normalizeNeedaroPlan(planId: string | null | undefined) {
    return NEEDARO_PLANS.find((plan) => plan.id === planId) ?? NEEDARO_PLANS[0];
}
