"use client";

import { Bot, ClipboardCheck, PenTool, SearchCheck, Wrench } from "lucide-react";

const TEAMS = [
    {
        icon: <Bot size={18} />,
        title: "Planner",
        description: "Breaks the request into deliverable steps and routes the work to the right internal specialists.",
    },
    {
        icon: <SearchCheck size={18} />,
        title: "Researcher",
        description: "Gathers context, source material, and structured evidence for factual or comparative tasks.",
    },
    {
        icon: <PenTool size={18} />,
        title: "Writer",
        description: "Produces content-heavy outputs like emails, landing page copy, briefs, and documentation.",
    },
    {
        icon: <Wrench size={18} />,
        title: "Builder",
        description: "Handles implementation-style work such as edits, light development tasks, and automation prep.",
    },
    {
        icon: <ClipboardCheck size={18} />,
        title: "Reviewer",
        description: "Checks outputs for clarity, completeness, and requirement alignment before delivery.",
    },
];

export default function AgentsPage() {
    return (
        <div className="max-w-6xl p-8">
            <div className="mb-12">
                <h1 className="text-4xl font-heading font-bold text-gcp-text">Managed AI Team</h1>
                <p className="mt-4 max-w-3xl text-lg leading-8 text-gcp-text-secondary">
                    These are the core roles working behind the Pantheon Mesh business workspace.
                    Every request moves through a managed sequence of planning, execution, and review.
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
