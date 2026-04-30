export type NeederoPlan = {
    id: "free" | "pro" | "premium";
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

export type NeedStatus = "draft" | "open" | "quoting" | "quoted" | "quote_chosen" | "booked" | "in_progress" | "solved" | "chosen" | "closed";

export type NeedCard = {
    category: string;
    title: string;
    problem: string;
    knownDetails: string;
    missingInfo: string[];
    questions: string[];
    summaryForBusinesses: string;
    tags: string[];
    fallback?: boolean;
    model?: string;
    customerAvatar?: string | null;
    serviceMode?: string;
    preferredTime?: string;
    warrantyImportant?: string;
};

export type ServiceRequest = {
    id: string;
    title: string;
    location: string;
    urgency: string;
    category: string;
    issue: string;
    budget?: string;
    status: NeedStatus;
    offers: number;
    firstOfferTime: string;
    customerId?: string;
    customerName?: string;
    customerAvatar?: string | null;
    createdAt?: number;
    photoPreview?: string | null;
};

export type BusinessOffer = {
    id?: string;
    businessId?: string;
    businessName: string;
    price: string;
    time: string;
    warranty: string;
    distance: string;
    note: string;
    createdAt?: number;
};

export const NEED_CATEGORIES = [
    "Food & grocery",
    "Local products",
    "Electronics & accessories",
    "Repair & maintenance",
    "Home services",
    "Beauty & wellness",
    "Lessons & tutoring",
    "Events & photography",
    "Design & printing",
    "Business services",
    "Transport & moving",
    "Local shopping",
    "Other",
];

export const URGENCY_OPTIONS = ["ASAP", "Today", "Tomorrow", "This week", "Flexible"];

export const BUDGET_OPTIONS = [
    "No budget yet",
    "Under $50",
    "$50 - $200",
    "$200+",
    "Custom",
];

export const NEEDARO_PLANS: NeederoPlan[] = [
    {
        id: "free",
        name: "Free",
        price: "$0",
        cadence: "/month",
        quoteReplies: "5 offer replies/month",
        visibility: "Basic visibility",
        aiTools: "Simple quote templates",
        analytics: "Not included",
        bestFor: "New businesses testing Needero",
        features: [
            "Basic business profile",
            "5 offer replies each month",
            "Appear in relevant local Needs",
            "Manual quote replies",
        ],
    },
    {
        id: "pro",
        name: "Pro",
        price: "$19",
        cadence: "/month",
        quoteReplies: "Unlimited offer replies",
        visibility: "Higher placement",
        aiTools: "AI quote helper",
        analytics: "Basic analytics",
        bestFor: "Active businesses that want more customers",
        features: [
            "Unlimited offer replies",
            "AI quote helper",
            "Verified business profile",
            "Basic analytics",
            "Higher placement in relevant offer lists",
        ],
    },
    {
        id: "premium",
        name: "Premium",
        price: "$49",
        cadence: "/month",
        quoteReplies: "Unlimited offer replies",
        visibility: "Priority placement",
        aiTools: "AI quote helper + alerts",
        analytics: "Advanced analytics",
        bestFor: "Serious businesses that want maximum visibility",
        features: [
            "Everything in Pro",
            "Priority placement",
            "Featured business profile",
            "Instant lead alerts",
            "Advanced analytics",
            "Top Rated badge eligibility",
            "Stronger recommendation boost",
        ],
    },
];

export const NEEDARO_METRICS = [
    { label: "Customer price", value: "Free" },
    { label: "Business model", value: "SaaS plans" },
    { label: "Core object", value: "Need" },
    { label: "Main action", value: "Send offer" },
];

export function normalizeNeedaroPlan(planId: string | null | undefined) {
    return NEEDARO_PLANS.find((plan) => plan.id === planId) ?? NEEDARO_PLANS[0];
}

export function makeCategorySlug(category: string) {
    return category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "other";
}

export function createFallbackNeedCard(description: string, category = "Other"): NeedCard {
    const clean = description.trim();
    return {
        category,
        title: clean.length > 70 ? `${clean.slice(0, 67)}...` : clean || "New local Need",
        problem: clean || "Customer needs help from a nearby business.",
        knownDetails: clean || "No details added yet.",
        missingInfo: ["Area", "Urgency", "Budget if available"].filter(Boolean),
        questions: ["Where should businesses be near?", "When do you need this done?"],
        summaryForBusinesses: clean || "Please send a clear price, time, warranty or service details, and your availability.",
        tags: [category],
        fallback: true,
    };
}
