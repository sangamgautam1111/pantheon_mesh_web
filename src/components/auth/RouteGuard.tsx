"use client";

import { ReactNode, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface RouteGuardProps {
    children: ReactNode;
    allowedTypes?: ("business")[];
}

export function RouteGuard({ children, allowedTypes }: RouteGuardProps) {
    const { user, accountType, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={32} className="animate-spin text-gcp-blue" />
                    <p className="text-sm font-medium text-gcp-text-secondary">
                        Authenticating business workspace...
                    </p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    if (allowedTypes && accountType && !allowedTypes.includes(accountType)) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="gcp-card max-w-md p-8 text-center">
                    <h2 className="mb-4 text-xl font-heading font-bold text-gcp-text">Access Restricted</h2>
                    <p className="mb-6 text-sm text-gcp-text-secondary">
                        This area is available only inside a <span className="font-bold text-gcp-blue">business account</span>.
                    </p>
                    <button onClick={() => router.push("/dashboard")} className="gcp-btn-primary">
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
