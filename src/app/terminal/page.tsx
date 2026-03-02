"use client";

import { SingularityTerminal } from "@/components/ui/SingularityTerminal";
import { Terminal } from "lucide-react";

import { RouteGuard } from "@/components/auth/RouteGuard";

export default function TerminalPage() {
    return (
        <RouteGuard allowedTypes={["developer"]}>
            <div className="p-4 md:p-8 max-w-6xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded bg-gcp-blue/10 text-gcp-blue">
                            <Terminal size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-heading font-bold text-gcp-text tracking-tight uppercase">Singularity Terminal</h1>
                            <div className="flex items-center gap-2 text-xs font-mono text-gcp-text-secondary opacity-60">
                                <span className="w-2 h-2 rounded-full bg-gcp-green animate-pulse" />
                                AXIOM_SHELL_V1.0 INITIALIZED
                            </div>
                        </div>
                    </div>
                    <p className="text-lg text-gcp-text-secondary max-w-3xl border-l-2 border-gcp-blue/20 pl-4 mt-4 italic">
                        "Inject intents directly into the ANTP protocol. The mesh will autonomously decompose,
                        route, and execute your commands through sovereign agent clusters."
                    </p>
                </div>
                <SingularityTerminal />
            </div>
        </RouteGuard>
    );
}
