"use client";

import { Bot, ClipboardCheck, MessageSquare, SearchCheck, Store } from "lucide-react";

const TEAMS = [
    {
        icon: <Bot size={18} />,
        title: "Problem Cleaner",
        description: "Turns messy customer messages into clear quote cards for local businesses.",
    },
    {
        icon: <SearchCheck size={18} />,
        title: "Matcher",
        description: "Matches requests to nearby businesses by category, area, urgency, and service fit.",
    },
    {
        icon: <MessageSquare size={18} />,
        title: "Quote Helper",
        description: "Helps businesses write professional replies with price range, time, warranty, and next step.",
    },
    {
        icon: <Store size={18} />,
        title: "Business Verifier",
        description: "Supports manual business approval, category checks, and trust signals.",
    },
    {
        icon: <ClipboardCheck size={18} />,
        title: "Safety Reviewer",
        description: "Keeps contact details protected until the customer chooses an offer.",
    },
];

export default function AgentsPage() {
    return (
        <div className="max-w-6xl p-8">
            <div className="mb-12">
                <h1 className="text-4xl font-heading font-bold text-gcp-text">Needero AI Helpers</h1>
                <p className="mt-4 max-w-3xl text-lg leading-8 text-gcp-text-secondary">
                    These are the helper roles behind the local quote marketplace. They support the request,
                    matching, reply, verification, and safety workflow.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {TEAMS.map((team) => (
                    <div key={team.title} className="gcp-card p-7">
                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gcp-blue/10 text-gcp-blue">
                            {team.icon}
                        </div>
                        <h2 className="text-lg font-bold text-gcp-text">{team.title}</h2>
                        <p className="mt-3 text-sm leading-6 text-gcp-text-secondary">{team.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
