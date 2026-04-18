export type BusinessPlan = {
    id: string;
    name: string;
    price: string;
    cadence: string;
    description: string;
    badge?: string;
    featured?: boolean;
    jobsPerMonth: string;
    activeJobs: string;
    deliveryTarget: string;
    modelLane: string;
    biddingLane: string;
    reviewDepth: string;
    bestFor: string;
    features: string[];
};

export const BUSINESS_PLANS: BusinessPlan[] = [
    {
        id: "free",
        name: "Free",
        price: "$0",
        cadence: "/month",
        description: "Start with a real business workspace and test a few small jobs before you pay.",
        badge: "Start Here",
        jobsPerMonth: "3 jobs",
        activeJobs: "1 active job",
        deliveryTarget: "Up to 72 hours",
        modelLane: "Flash / Mini class",
        biddingLane: "Off",
        reviewDepth: "Basic",
        bestFor: "Trying the workspace",
        features: [
            "Business account workspace",
            "Basic writing, research, and support tasks",
            "Single active job at a time",
            "Shared dashboard and job tracking",
            "Good for testing before upgrading",
        ],
    },
    {
        id: "starter",
        name: "Starter",
        price: "$29",
        cadence: "/month",
        description: "For founders and lean teams that need recurring business work at a low monthly cost.",
        jobsPerMonth: "12 jobs",
        activeJobs: "2 active jobs",
        deliveryTarget: "Up to 24 hours",
        modelLane: "Flash / Mini + balanced",
        biddingLane: "Economy pool",
        reviewDepth: "Standard",
        bestFor: "Weekly business tasks",
        features: [
            "Faster queue than Free",
            "Economy bidding can reduce job price",
            "Balanced model lane for stronger outputs",
            "Standard review before delivery",
            "Better fit for active solo operators",
        ],
    },
    {
        id: "growth",
        name: "Growth",
        price: "$69",
        cadence: "/month",
        description: "The best plan for businesses that want better models, lower pricing pressure, and faster delivery.",
        badge: "Most Popular",
        featured: true,
        jobsPerMonth: "40 jobs",
        activeJobs: "5 active jobs",
        deliveryTarget: "Up to 8 hours",
        modelLane: "Better reasoning lane",
        biddingLane: "Economy + standard pools",
        reviewDepth: "Strong",
        bestFor: "Growing operating teams",
        features: [
            "Priority queue and faster turnarounds",
            "Smart bidding across more AI lanes",
            "Better reasoning and execution models",
            "Stronger review and fallback checks",
            "Best price-to-performance plan",
        ],
    },
    {
        id: "scale",
        name: "Scale",
        price: "$149",
        cadence: "/month",
        description: "Built for teams with continuous work, tighter deadlines, and premium model requirements.",
        jobsPerMonth: "120 jobs",
        activeJobs: "12 active jobs",
        deliveryTarget: "Up to 3 hours",
        modelLane: "Premium execution lane",
        biddingLane: "Full eligible pool",
        reviewDepth: "Deep",
        bestFor: "High-volume business ops",
        features: [
            "Fastest routing and highest concurrency",
            "Premium reasoning and coding lane",
            "Full bidding access for maximum cost pressure",
            "Deep review, fallback, and rescue passes",
            "Best fit for sustained production usage",
        ],
    },
];
