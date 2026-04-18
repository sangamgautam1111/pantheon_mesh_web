import { NextRequest, NextResponse } from "next/server";

type GuideEntry = {
    keywords: string[];
    answer: string;
    actions?: { type: "navigate"; path: string }[];
};

const KNOWLEDGE_BASE: GuideEntry[] = [
    {
        keywords: ["job", "post", "submit", "task", "gig"],
        answer:
            "**Post jobs from the Business Job Center.** Add a title, explain the outcome you need, set a budget, and the request is tracked inside your workspace.",
        actions: [{ type: "navigate", path: "/client" }],
    },
    {
        keywords: ["dashboard", "overview", "status", "progress"],
        answer:
            "**The dashboard is your command center.** It shows submitted jobs, active work, completed deliveries, and your committed budget at a glance.",
        actions: [{ type: "navigate", path: "/dashboard" }],
    },
    {
        keywords: ["plan", "pricing", "subscription", "29", "69", "149"],
        answer:
            "**Pantheon Mesh now has business-only plans.** Use the pricing pages to compare included workflow volume, review depth, and turnaround speed.",
        actions: [{ type: "navigate", path: "/pricing" }],
    },
    {
        keywords: ["business plans", "elite", "growth", "scale"],
        answer:
            "**Business Plans** highlight the managed packages for growing teams, including faster queues and stronger review coverage.",
        actions: [{ type: "navigate", path: "/business/plans" }],
    },
    {
        keywords: ["marketplace", "capabilities", "what can it do"],
        answer:
            "**The marketplace showcases available work categories.** It helps you see the kinds of outcomes the managed AI workforce can deliver today.",
        actions: [{ type: "navigate", path: "/marketplace" }],
    },
    {
        keywords: ["quality", "review", "accuracy", "fallback"],
        answer:
            "**Each request goes through a managed workflow.** The platform plans the work, executes it, reviews the output, and uses fallback passes when the first attempt is not strong enough.",
    },
    {
        keywords: ["login", "sign in", "google", "github", "email", "account"],
        answer:
            "**Every sign-in method creates the same business account type.** Email, Google, and GitHub all lead into the business workspace.",
        actions: [{ type: "navigate", path: "/login" }],
    },
    {
        keywords: ["whitepaper", "docs", "manifesto"],
        answer:
            "**Documentation is still available.** Use the whitepaper for the product architecture or the manifesto for the broader vision.",
        actions: [{ type: "navigate", path: "/whitepaper" }],
    },
];

function findMatch(message: string) {
    const query = message.toLowerCase();
    let best: GuideEntry | null = null;
    let bestScore = 0;

    for (const entry of KNOWLEDGE_BASE) {
        let score = 0;
        for (const keyword of entry.keywords) {
            if (query.includes(keyword)) {
                score += keyword.length;
            }
        }
        if (score > bestScore) {
            bestScore = score;
            best = entry;
        }
    }

    return best;
}

function extractNavigationActions(message: string) {
    const query = message.toLowerCase();
    const patterns: Record<string, string> = {
        dashboard: "/dashboard",
        jobs: "/client",
        pricing: "/pricing",
        plans: "/business/plans",
        marketplace: "/marketplace",
        whitepaper: "/whitepaper",
        manifesto: "/manifesto",
        login: "/login",
    };

    for (const [keyword, path] of Object.entries(patterns)) {
        if (
            query.includes(`/${keyword}`) ||
            query.includes(`open ${keyword}`) ||
            query.includes(`take me to ${keyword}`) ||
            query.includes(`go to ${keyword}`)
        ) {
            return [{ type: "navigate" as const, path }];
        }
    }

    return [];
}

export async function POST(req: NextRequest) {
    try {
        const { message } = await req.json();
        if (!message) {
            return NextResponse.json({ error: "No message provided." }, { status: 400 });
        }

        const match = findMatch(message);
        const actions = match?.actions || extractNavigationActions(message);

        if (match) {
            return NextResponse.json({ response: match.answer, actions });
        }

        return NextResponse.json({
            response:
                "**I can help with the business workspace.** Ask about posting jobs, tracking delivery, pricing, plans, or say where you want to go and I will point you there.",
            actions,
        });
    } catch {
        return NextResponse.json(
            { response: "Something went wrong. Please try again.", actions: [] },
            { status: 500 },
        );
    }
}
