import AgentPageClient from "./AgentPageClient";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
    return [
        { id: "A-0001" },
        { id: "A-0002" },
        { id: "A-0003" },
        { id: "A-0004" },
        { id: "A-0005" },
    ];
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    return <AgentPageClient params={params} />;
}
