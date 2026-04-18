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
        description: "Start inside the real business workspace and test a few lightweight jobs before you pay.",
        badge: "Start Here",
        jobsPerMonth: "3 jobs",
        activeJobs: "1 active job",
        deliveryTarget: "Up to 72 hours",
        modelLane: "Flash / Mini lane",
        biddingLane: "Off",
        reviewDepth: "Basic",
        bestFor: "Trying the workspace",
        features: [
            "Business account workspace",
            "Good for short writing, research, and support tasks",
            "Single active job at a time",
            "Shared dashboard and job tracking",
            "Upgrade when you need faster delivery or lower pricing pressure",
        ],
    },
    {
        id: "starter",
        name: "Starter",
        price: "$29",
        cadence: "/month",
        description: "For founders and lean teams that need recurring work at a low monthly price with lighter bidding.",
        jobsPerMonth: "12 jobs",
        activeJobs: "2 active jobs",
        deliveryTarget: "Up to 24 hours",
        modelLane: "Flash / Mini + balanced lane",
        biddingLane: "Economy pool",
        reviewDepth: "Standard",
        bestFor: "Weekly business tasks",
        features: [
            "Faster queue than Free",
            "Economy bidding can reduce job price on eligible work",
            "Balanced model lane for stronger outputs",
            "Standard review before delivery",
            "Better fit for solo operators and small teams",
        ],
    },
    {
        id: "growth",
        name: "Growth",
        price: "$69",
        cadence: "/month",
        description: "The best plan for most businesses that want stronger models, lower pricing pressure, and faster delivery.",
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
            "Best price-to-performance plan for active teams",
        ],
    },
    {
        id: "scale",
        name: "Scale",
        price: "$149",
        cadence: "/month",
        description: "Built for teams with continuous work, tighter deadlines, and premium model access.",
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
