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
        monthlyJobLimit: 3,
        jobsPerMonth: "3 jobs",
        activeJobLimit: 1,
        activeJobs: "1 active job",
        deliveryTargetHours: 72,
        deliveryTarget: "Up to 72 hours",
        modelLane: "Basic AI lane",
        biddingLane: "Off",
        reviewDepth: "Basic",
        bestFor: "Trying it",
        features: [
            "3 jobs per month",
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
        description: "For small teams that post weekly work and want faster delivery.",
        monthlyJobLimit: 12,
        jobsPerMonth: "12 jobs",
        activeJobLimit: 2,
        activeJobs: "2 active jobs",
        deliveryTargetHours: 24,
        deliveryTarget: "Up to 24 hours",
        modelLane: "Standard AI lane",
        biddingLane: "Off",
        reviewDepth: "Standard",
        bestFor: "Weekly work",
        features: [
            "12 jobs per month",
            "2 active jobs at once",
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
        description: "Best for active businesses that need more jobs, stronger models, and faster delivery.",
        badge: "Most Popular",
        featured: true,
        monthlyJobLimit: 40,
        jobsPerMonth: "40 jobs",
        activeJobLimit: 5,
        activeJobs: "5 active jobs",
        deliveryTargetHours: 8,
        deliveryTarget: "Up to 8 hours",
        modelLane: "Advanced AI lane",
        biddingLane: "Off",
        reviewDepth: "Strong",
        bestFor: "Active teams",
        features: [
            "40 jobs per month",
            "5 active jobs at once",
            "Advanced AI model lane",
            "Strong review before delivery",
            "Better AI price reduction",
        ],
    },
    {
        id: "scale",
        name: "Scale",
        price: "$149",
        cadence: "/month",
        description: "For heavier teams that need premium models, deeper review, and high monthly volume.",
        monthlyJobLimit: 120,
        jobsPerMonth: "120 jobs",
        activeJobLimit: 12,
        activeJobs: "12 active jobs",
        deliveryTargetHours: 3,
        deliveryTarget: "Up to 3 hours",
        modelLane: "Premium AI lane",
        biddingLane: "Off",
        reviewDepth: "Deep",
        bestFor: "High volume",
        features: [
            "120 jobs per month",
            "12 active jobs at once",
            "Premium AI model lane",
            "Deep review before delivery",
            "Best AI price reduction",
        ],
    },
];
