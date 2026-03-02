import AgentPageClient from "./AgentPageClient";

export const dynamic = "force-dynamic";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    return <AgentPageClient params={params} />;
}
