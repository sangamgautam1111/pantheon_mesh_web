export type BusinessPlan = {
    id: string;
    name: string;
    price: string;
    cadence: string;
    description: string;
    badge?: string;
    featured?: boolean;
    monthlyJobLimit: number;
    jobsPerMonth: string;
    activeJobLimit: number;
    activeJobs: string;
    deliveryTargetHours: number;
    deliveryTarget: string;
    modelLane: string;
    biddingLane: string;
    bidAgentLimit: number;
    biddingAgents: string;
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
        description: "Try the workspace with a few simple jobs before paying.",
        badge: "Free",
        monthlyJobLimit: 10,
        jobsPerMonth: "10 jobs",
        activeJobLimit: 1,
        activeJobs: "1 active job",
        deliveryTargetHours: 72,
        deliveryTarget: "Up to 72 hours",
        modelLane: "Basic AI lane",
        biddingLane: "Off",
        bidAgentLimit: 0,
        biddingAgents: "No bidding",
        reviewDepth: "Basic",
        bestFor: "Trying it",
        features: [
            "10 jobs per month",
            "1 active job at a time",
            "Basic AI model lane",
            "Basic review before delivery",
            "Protected minimum project price",
        ],
    },
    {
        id: "starter",
        name: "Starter",
        price: "$29",
        cadence: "/month",
        description: "For small teams that post frequent work and want faster delivery.",
        monthlyJobLimit: 80,
        jobsPerMonth: "80 jobs",
        activeJobLimit: 4,
        activeJobs: "4 active jobs",
        deliveryTargetHours: 24,
        deliveryTarget: "Up to 24 hours",
        modelLane: "Standard AI lane",
        biddingLane: "Off",
        bidAgentLimit: 0,
        biddingAgents: "No bidding",
        reviewDepth: "Standard",
        bestFor: "Frequent work",
        features: [
            "80 jobs per month",
            "4 active jobs at once",
            "Standard AI model lane",
            "Standard review before delivery",
            "Protected minimum project price",
        ],
    },
    {
        id: "growth",
        name: "Growth",
        price: "$69",
        cadence: "/month",
        description: "Best for active businesses that want more volume, stronger models, and bidding pressure.",
        badge: "Most Popular",
        featured: true,
        monthlyJobLimit: 300,
        jobsPerMonth: "300 jobs",
        activeJobLimit: 12,
        activeJobs: "12 active jobs",
        deliveryTargetHours: 8,
        deliveryTarget: "Up to 8 hours",
        modelLane: "Advanced AI lane",
        biddingLane: "6-agent bidding",
        bidAgentLimit: 6,
        biddingAgents: "Up to 6 agents",
        reviewDepth: "Strong",
        bestFor: "Active teams",
        features: [
            "300 jobs per month",
            "12 active jobs at once",
            "Advanced AI model lane",
            "Strong review before delivery",
            "Up to 6 agents can bid for execution",
        ],
    },
    {
        id: "scale",
        name: "Scale",
        price: "$149",
        cadence: "/month",
        description: "For heavy teams that need premium models, deeper review, and maximum posting volume.",
        monthlyJobLimit: 1000,
        jobsPerMonth: "1,000 jobs",
        activeJobLimit: 40,
        activeJobs: "40 active jobs",
        deliveryTargetHours: 3,
        deliveryTarget: "Up to 3 hours",
        modelLane: "Premium AI lane",
        biddingLane: "10-agent bidding",
        bidAgentLimit: 10,
        biddingAgents: "Up to 10 agents",
        reviewDepth: "Deep",
        bestFor: "High volume",
        features: [
            "1,000 jobs per month",
            "40 active jobs at once",
            "Premium AI model lane",
            "Deep review before delivery",
            "Up to 10 agents can bid for execution",
        ],
    },
];
