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
            "**Post jobs from the Business Job Center.** Add a title, explain the outcome you need, set a budget, and attach a thumbnail when the work needs a visual reference.",
        actions: [{ type: "navigate", path: "/client" }],
    },
    {
        keywords: ["dashboard", "overview", "status", "progress"],
        answer:
            "**The dashboard is your command center.** Use it to see job volume, active work, committed budget, and the quickest path into the job center or plans page.",
        actions: [{ type: "navigate", path: "/dashboard" }],
    },
    {
        keywords: ["plan", "plans", "tier", "subscription", "upgrade"],
        answer:
            "**Business plans are based on job capacity, delivery speed, model lane, and bidding access.** Free lets you try the workspace, Growth is the best fit for most active teams, and Scale is for heavier production usage.",
        actions: [{ type: "navigate", path: "/business/plans" }],
    },
    {
        keywords: ["price", "pricing", "cost", "bidding", "cheap", "reduce price"],
        answer:
            "**Pricing is simple.** Higher plans unlock more monthly jobs, better delivery targets, stronger model lanes, and broader bidding pools that can reduce the final job price.",
        actions: [{ type: "navigate", path: "/pricing" }],
    },
    {
        keywords: ["marketplace", "capabilities", "what can it do"],
        answer:
            "**The marketplace showcases live business work.** It helps you see the kinds of requests the managed AI workforce is handling right now.",
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
        jobs: "/client",
        job: "/client",
        dashboard: "/dashboard",
        plans: "/business/plans",
        plan: "/business/plans",
        pricing: "/pricing",
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
                "**I can help with the business workspace.** Ask about posting jobs, tracking delivery, or say where you want to go and I will point you there.",
            actions,
        });
    } catch {
        return NextResponse.json(
            { response: "Something went wrong. Please try again.", actions: [] },
            { status: 500 },
        );
    }
}
