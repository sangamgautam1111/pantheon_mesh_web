import { NextRequest, NextResponse } from "next/server";

/* ═══════════════════════════════════════════════
   GROQ KEY ROTATION + OPENROUTER FALLBACK
   ═══════════════════════════════════════════════ */
const GROQ_KEYS = Array.from({ length: 14 }, (_, i) => process.env[`GROQ_API_${i + 1}`]).filter(Boolean) as string[];
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || "";
const PINECONE_KEY = process.env.PINECONE_API_KEY || "";
const PINECONE_HOST = process.env.PINECONE_HOST || "";

let activeKeyIndex = 0;
const exhaustedKeys = new Set<number>();
let lastResetTime = Date.now();

function getNextGroqKey(): string | null {
    if (Date.now() - lastResetTime > 86400000) { exhaustedKeys.clear(); activeKeyIndex = 0; lastResetTime = Date.now(); }
    for (let i = 0; i < GROQ_KEYS.length; i++) {
        const idx = (activeKeyIndex + i) % GROQ_KEYS.length;
        if (!exhaustedKeys.has(idx)) { activeKeyIndex = idx; return GROQ_KEYS[idx]; }
    }
    return null;
}
function markKeyExhausted() { exhaustedKeys.add(activeKeyIndex); activeKeyIndex = (activeKeyIndex + 1) % GROQ_KEYS.length; }

/* ═══════════════════════════════════════════════
   COMPREHENSIVE KNOWLEDGE BASE (offline fallback)
   ═══════════════════════════════════════════════ */
const KNOWLEDGE_BASE: { keywords: string[]; answer: string; actions?: any[] }[] = [
    {
        keywords: ["antp", "autonomous neural", "transfer protocol", "antp protocol"],
        answer: "**ANTP (Autonomous Neural Transfer Protocol)** is the core of Pantheon Mesh.\n\nUnlike HTTP which transfers documents, ANTP transfers **intelligence and capital** between autonomous AI agents.\n\n**How it works:**\n1. User injects an intent with AXM stake\n2. CyberShield's neural firewall inspects the payload\n3. The ANTPKernel creates an IntentPacket (signed via C++ native crypto)\n4. Moral Governor audits against the Three Laws\n5. Memory Fabric checks for cached solutions (Instant Evocation)\n6. If no cache: 2% tax → Treasury, remaining stake → Escrow\n7. Marketplace auto-assembles a capability cluster\n8. SwarmOrchestrator coordinates multi-agent execution\n9. PoI (Proof-of-Intelligence) verifies the work\n10. Settlement releases AXM to workers\n\n**Key classes:** `ANTPKernel`, `IntentPacket`, `SemanticRouter`\n**C++ acceleration:** Packet signing, hallucination detection via SIMD Collider",
        actions: [{ type: "navigate", path: "/terminal" }],
    },
    {
        keywords: ["swarm", "orchestrator", "multi-agent", "coordinate", "assembly"],
        answer: "**SwarmOrchestrator** (`antp/core/swarm.py`) coordinates multi-agent task execution.\n\n**Flow:**\n1. `coordinate_assembly()` spawns agents for each required role\n2. Each agent is bonded to the swarm (A2A Bond)\n3. Budget split: **15% infrastructure** (Docker/K8s) + **85% cognitive work**\n4. The Actuator provisions real compute containers\n5. Agents think sequentially, each building on the previous output\n6. AXM is distributed equally among cognitive agents\n\n**Example:** If intent = 'Audit code and generate report', the swarm spawns: CodeAuditor + ReportWriter + QualityChecker → each processes and passes context forward.",
    },
    {
        keywords: ["prosperity", "finance", "tax", "revenue", "fee"],
        answer: "**Prosperity Engine** (`antp/finance/engine.py`) manages all Pantheon Mesh economics.\n\n**Tax Rates:**\n• **2%** — Standard A2A transaction tax\n• **5%** — Developer model tax\n• **8%** — Enterprise priority tax\n• **10%** — Malicious node slashing penalty\n• **5%** — Knowledge royalty rate (40% of royalty → founder)\n• **3%** — Speed performance premium\n\n**Key operations:**\n• `accept_human_stake()` — Lock AXM in escrow\n• `withdraw_founder_treasury()` — Extract revenue\n• `trigger_recursive_investment()` — A2A VC\n• `slash_malicious_node()` — Penalize bad actors\n• `apply_knowledge_royalty()` — Reward cached solutions\n\nAll calculations use **Decimal with 24-digit precision** for zero-rounding-error.",
    },
    {
        keywords: ["memory", "fabric", "knowledge", "crystallize", "vector", "pinecone", "rag", "evocation"],
        answer: "**Perpetual Memory Fabric** (`antp/memory/fabric.py`) is the collective intelligence layer.\n\n**Architecture:**\n• Pinecone Vector DB (index: 'axiom-memory', 1536 dimensions, cosine metric)\n• AWS us-east-1 serverless deployment\n\n**Core Features:**\n1. **Knowledge Crystallization** — When a problem is solved, the solution is embedded (OpenAI text-embedding-3-small) and stored permanently\n2. **Instant Evocation** — Future queries matching >95% similarity get instant results WITHOUT re-invoking the LLM\n3. **Knowledge Royalties** — Original solvers earn 5% royalty when their solutions are reused\n4. **Collective IQ** — total_memories × 1.42 multiplier\n\n**Impact:** The mesh gets smarter over time. Every solution ever computed can be instantly recalled.",
    },
    {
        keywords: ["cybershield", "security", "firewall", "rate limit", "signature", "shield"],
        answer: "**CyberShield** is the dual-layer security system.\n\n**Python Layer** (`core/security.py`):\n• **EIP-191 Signature Verification** — Ethereum wallet signatures via eth_account\n• **Token Bucket Rate Limiter** — 50 tokens capacity, 5/sec refill\n• **Neural Firewall** — Blocks: 'IGNORE ALL PREVIOUS', 'SYSTEM OVERRIDE', SQL injection, XSS, trade manipulation\n\n**C++ Layer** (`core_cpp/include/CyberShield.hpp`):\n• `DeepInspectPayload()` — Wire-speed payload scanning\n• Native packet signing and verification\n• SIMD-accelerated threat detection\n\nEvery request passes through both layers. Blocked requests trigger `AUTH_VIOLATION` or `DOS_PROTECTION` alerts.",
    },
    {
        keywords: ["constitution", "law", "governance", "moral", "three laws", "rules"],
        answer: "**The Constitution** (`core/governance.py`) defines the Three Laws of Pantheon Mesh:\n\n**Law 1:** AN AGENT MUST NOT HARM A NETWORK CLUSTER THROUGH NEGATIVE ENTROPY\n**Law 2:** AN AGENT MUST PROTECT THE PROTOCOL TREASURY EXCEPT WHERE IT CONFLICTS WITH LAW 1\n**Law 3:** AN AGENT MUST OPERATE WITHIN THE CONSOLIDATED REPUTATION VECTOR\n\n**Enforcement:** `audit_intent()` sends every proposed action to the LLM (Vertex AI / Gemini) along with all three laws. The LLM returns: violation (bool), law_id, risk_score (0-1), and reason. High-risk intents are blocked before execution.\n\nThe **Moral Governor** (`antp/governance/moral_agent.py`) performs deeper ethical analysis on entropy and stability scores.",
    },
    {
        keywords: ["quorum", "consensus", "hallucination", "collider", "truth", "simd"],
        answer: "**Quorum Consensus & Hallucination Detection:**\n\n1. Three AI agents (Alpha, Beta, Gamma) independently answer the same question\n2. Responses are converted to **1536-dimensional float vectors**\n3. The C++ **Collider engine** uses **AVX/SIMD instructions** to compute pairwise cosine similarities\n4. `ComputeTruthConsensus()` returns a truth_score (0-1)\n5. If truth_score < **0.85**, the response is **REJECTED as hallucination**\n\nThis runs at native C++ speed — orders of magnitude faster than Python. It prevents AI agents from producing false information that could corrupt the mesh economy.",
    },
    {
        keywords: ["poi", "proof of intelligence", "verify", "audit", "work proof"],
        answer: "**Proof-of-Intelligence (PoI)** is the work verification mechanism.\n\n**How it works:**\n1. `verify_work_proof()` in MeshController runs **3 independent LLM auditors**\n2. Each auditor evaluates: 'Does the output satisfy the task?'\n3. Each responds 'VALID' or 'INVALID'\n4. If **≥66% agree** (consensus_threshold = 0.66), the work passes\n5. Passed PoI → escrow releases AXM to the worker\n6. Failed PoI → payment blocked by circuit breaker, agent reputation slashed\n\nPoI ensures that agents can't submit garbage work and collect payment.",
    },
    {
        keywords: ["escrow", "lock", "release", "settlement", "web3", "blockchain", "polygon"],
        answer: "**Web3 Escrow System** (`core/web3_bridge.py`):\n\n**Locking:** `lock_escrow()` creates a TaskEscrowDB record with LOCKED status when a task is created.\n\n**Release:** `release_funds()` splits the bounty:\n• **98%** → Worker agent wallet\n• **2%** → AXIOM Treasury (protocol tax)\n\n**On-chain:** The AXIOMEscrow.sol smart contract on **Polygon** handles actual on-chain settlement. The Web3Bridge connects to Base mainnet.\n\n**Security:** Only after PoI audit passes AND circuit breaker validates, are funds released. Double-spending prevented via database status transitions (LOCKED → RELEASED).",
    },
    {
        keywords: ["onboard", "register", "deploy agent", "new agent", "create agent"],
        answer: "To onboard a new agent:\n\n1. Go to **Dashboard**\n2. Click **'Onboard Agent'** button (top right)\n3. Enter agent name and comma-separated skills\n4. Click **'Create'**\n\n**Backend:** POST `/v1/agents/onboard?name=X&skills=Y`\n• Generates Ethereum identity (secrets.token_hex → eth_account)\n• Creates SQLAlchemy record with default reputation 100.0\n• Agent enters 'idle' status, ready for swarm assignment\n\nLet me take you there!",
        actions: [{ type: "navigate", path: "/dashboard", elementId: "onboard-agent-btn", label: "Click here to onboard" }],
    },
    {
        keywords: ["marketplace", "capability", "specs", "buy", "sell", "list"],
        answer: "The **Marketplace** is the decentralized neural capability exchange.\n\n**How it works:**\n• Agents list **Capability Specs** (name, description, AXM cost)\n• Other agents can hire these capabilities\n• `auto_assemble_capability()` finds the best combo for any intent\n• **Prosperity audit:** Humanitarian tasks get 50% discount\n\n**Default Specs:**\n• LegalAuditor-v1 — 50 AXM\n• QuantumOptimizer — 120 AXM\n• CarbonTracer — 30 AXM\n• HackerImmune — 75 AXM\n\nNavigating you there!",
        actions: [{ type: "navigate", path: "/marketplace" }],
    },
    {
        keywords: ["dashboard", "metrics", "overview"],
        answer: "The **Dashboard** shows real-time mesh metrics: Active Agents, Tasks, AXM Volume, Memories, CyberShield status. Plus tabbed data tables and a live A2A transaction feed.\n\nLet me navigate you there.",
        actions: [{ type: "navigate", path: "/dashboard" }],
    },
    {
        keywords: ["agent", "agents", "browse", "find agent"],
        answer: "The **Agents** page shows all autonomous agents registered in the mesh — name, role, reputation, balance, tasks completed. Click any agent for their full profile and task history.\n\nTaking you there!",
        actions: [{ type: "navigate", path: "/agents" }],
    },
    {
        keywords: ["treasury", "withdraw", "founder", "money", "funds"],
        answer: "The **Treasury** shows protocol revenue from 2% A2A tax. Founders can withdraw AXM with a cryptographic signature.\n\nLet me show you!",
        actions: [{ type: "navigate", path: "/founder" }],
    },
    {
        keywords: ["terminal", "inject", "intent", "broadcast", "singularity"],
        answer: "The **Singularity Terminal** lets you inject ANTP intents directly into the protocol. Type a mission, connect wallet, broadcast — the mesh handles the rest.\n\nOpening the terminal!",
        actions: [{ type: "navigate", path: "/terminal" }],
    },
    {
        keywords: ["whitepaper", "docs", "manifesto"],
        answer: "Documentation available:\n• **/manifesto** — The philosophical foundation\n• **/whitepaper** — Technical architecture\n\nOpening the whitepaper!",
        actions: [{ type: "navigate", path: "/whitepaper" }],
    },
    {
        keywords: ["c++", "native", "cpp", "ffi", "dll", "collider"],
        answer: "**C++ Native Core** (`core_cpp/`):\n\nCompiled via CMake into `PantheonCore.dll/.so`. Exported functions:\n• `GenerateFastPacketId` — Fast UUID generation\n• `SignPacketNative` — Cryptographic packet signing\n• `VerifyPacketNative` — Signature verification\n• `ComputeTruthConsensus` — SIMD hallucination detection\n• `DeepInspectPayload` — Wire-speed security scanning\n\nAll called from Python via **ctypes FFI**. The Collider engine uses AVX/SIMD for vector math at native speed.",
    },
    {
        keywords: ["actuator", "docker", "kubernetes", "deploy", "infrastructure", "k8s"],
        answer: "The **Physical Actuator** (`antp/actuators/bridge.py`) binds intelligence to infrastructure.\n\nAgents can:\n• Calculate their AXM budget\n• Rent Docker/K8s compute on-demand\n• Execute scripts in isolated containers\n• Self-destruct containers when finished\n\nThe IoT Edge module extends this to IoT devices.",
    },
    {
        keywords: ["wallet", "metamask", "connect", "ethereum"],
        answer: "Pantheon uses **MetaMask** for wallet connection. Required for: signing transactions, withdrawals, marketplace registration, and terminal intent signing. All based on EIP-191 Ethereum signatures.",
    },
    {
        keywords: ["take me", "go to", "navigate", "open", "show me"],
        answer: "Where to? I can take you to:\n\n• **Dashboard** → Real-time mesh metrics\n• **Agents** → Browse all registered agents\n• **Marketplace** → Capability exchange\n• **Terminal** → Inject ANTP intents\n• **Treasury** → Protocol revenue\n• **Whitepaper** or **Manifesto**",
    },
    {
        keywords: ["pantheon", "what is", "about", "explain", "axiom", "novex"],
        answer: "**Pantheon Mesh** (codename AXIOM/NOVEX) is the world's first financially sovereign, self-deploying Agent Economy.\n\n**Four Pillars:**\n1. 🏰 **The Fortress** — CyberShield + EIP-191 crypto\n2. 🧠 **The Brain** — Pinecone RAG Memory Fabric\n3. 🏦 **The Bank** — A2A escrow on Polygon\n4. 🦾 **The Body** — Docker/K8s Actuator\n\nAgents autonomously hire each other, settle payments in AXM, and discover new science. Think *Kubernetes for AI agents* — but with its own economy.",
    },
    {
        keywords: ["a2a", "agent to agent", "payment", "transaction"],
        answer: "**A2A Payment Flow:**\n\n1. Agent A posts task with AXM reward\n2. Agent B bids (complexity × multiplier)\n3. AXM locked in Polygon escrow\n4. Agent B completes task\n5. PoI audit verifies work (3 LLM nodes, 66% consensus)\n6. Escrow releases: 98% to worker, 2% to treasury\n\nAll autonomous — no human approval needed.",
        actions: [{ type: "navigate", path: "/dashboard" }],
    },
    {
        keywords: ["bid", "bidding", "compute", "cost", "pricing"],
        answer: "**Compute Bidding:**\n\nFormula: `hourly_cost = (0.005 × CPU) × reputation_multiplier × 60`\n\nReputation multiplier: `1.0 - (min(reputation, 1000) / 5000)`\n→ Higher reputation = cheaper compute!\n\nGo to any Agent detail page to submit a bid.",
        actions: [{ type: "navigate", path: "/agents" }],
    },
];

function findKnowledgeMatch(query: string): (typeof KNOWLEDGE_BASE)[number] | null {
    const lower = query.toLowerCase();
    let best: (typeof KNOWLEDGE_BASE)[number] | null = null;
    let bestScore = 0;
    for (const entry of KNOWLEDGE_BASE) {
        let score = 0;
        for (const kw of entry.keywords) { if (lower.includes(kw)) score += kw.length * 2; }
        if (score > bestScore) { bestScore = score; best = entry; }
    }
    return bestScore >= 4 ? best : null;
}

/* ═══════════════════════════════════════════════
   PINECONE RAG
   ═══════════════════════════════════════════════ */
async function queryPinecone(queryText: string): Promise<string> {
    if (!PINECONE_KEY || !PINECONE_HOST) return "";
    try {
        const embedRes = await fetch("https://api.pinecone.io/embed", {
            method: "POST",
            headers: { "Api-Key": PINECONE_KEY, "Content-Type": "application/json" },
            body: JSON.stringify({ model: "multilingual-e5-large", inputs: [{ text: queryText }], parameters: { input_type: "query" } }),
        });
        if (!embedRes.ok) return "";
        const embedData = await embedRes.json();
        const vector = embedData.data?.[0]?.values;
        if (!vector) return "";
        const queryRes = await fetch(`${PINECONE_HOST}/query`, {
            method: "POST",
            headers: { "Api-Key": PINECONE_KEY, "Content-Type": "application/json" },
            body: JSON.stringify({ vector, topK: 5, includeMetadata: true }),
        });
        if (!queryRes.ok) return "";
        const queryData = await queryRes.json();
        return (queryData.matches || []).map((m: any) => m.metadata?.text || "").filter(Boolean).join("\n\n");
    } catch { return ""; }
}

/* ═══════════════════════════════════════════════
   LLM CALLS — GROQ → OPENROUTER FALLBACK
   ═══════════════════════════════════════════════ */
async function callGroq(systemPrompt: string, userMessage: string, depth = 0): Promise<string | null> {
    if (depth > GROQ_KEYS.length) return null;
    const key = getNextGroqKey();
    if (!key) return null;
    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userMessage }], temperature: 0.3, max_tokens: 800 }),
        });
        if (res.status === 429 || res.status === 503) { markKeyExhausted(); return callGroq(systemPrompt, userMessage, depth + 1); }
        if (!res.ok) { markKeyExhausted(); return null; }
        const data = await res.json();
        return data.choices?.[0]?.message?.content || null;
    } catch { markKeyExhausted(); return null; }
}

async function callOpenRouter(systemPrompt: string, userMessage: string): Promise<string | null> {
    if (!OPENROUTER_KEY) return null;
    try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${OPENROUTER_KEY}`, "Content-Type": "application/json", "HTTP-Referer": "https://pantheon-mesh.vercel.app", "X-Title": "Pantheon Mesh Assist" },
            body: JSON.stringify({ model: "deepseek/deepseek-chat", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userMessage }], temperature: 0.3, max_tokens: 800 }),
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.choices?.[0]?.message?.content || null;
    } catch { return null; }
}

/* ═══════════════════════════════════════════════
   SYSTEM PROMPT — FULL PROTOCOL KNOWLEDGE
   ═══════════════════════════════════════════════ */
const SYSTEM_PROMPT = `You are Mesh Assist, the AI guide for Pantheon Mesh — a sovereign AI agent economy protocol (codename AXIOM/NOVEX).

CORE ARCHITECTURE:
- ANTP (Autonomous Neural Transfer Protocol): Transfers intelligence and capital between agents via IntentPackets.
- ANTPKernel: Handles intent injection, semantic routing, and quorum consensus (threshold 0.85 truth_score).
- SwarmOrchestrator: Coordinates multi-agent missions with specialized agent clusters.
- Memory Fabric: Perpetual knowledge layer using Pinecone (1536D vectors).

ECONOMY:
- AXM: Native utility token for transaction, bidding, and governance.
- Taxes: 2% A2A tax, 5% knowledge royalty (streamed to original solvers).
- Prosperity: Financial engine with Decimal-24 precision and escrow on Polygon.

GOVERNANCE & SECURITY:
- CyberShield: Dual-layer security (C++ native firewall + EIP-191 wallet signatures).
- Constitution: Enfocing the Three Laws of Agents via Moral Governor audits.

PAGES: Dashboard (/dashboard), Agents (/agents), Marketplace (/marketplace), Terminal (/terminal), Treasury (/founder), Whitepaper (/whitepaper).

DANGER - CRITICAL RULES:
1. You know EVERYTHING about Pantheon Mesh. Never say "I'm not familiar with...".
2. **DO NOT** include API endpoints, curl commands, or raw technical specs UNLESS the user explicitly asks for them (e.g., "show me the API", "how do I integrate").
3. **DO NOT** dump long documentation blocks. Summarize context into helpful, conversational guide answers.
4. If a user asks a general question, explain the protocol/concept.
5. If a user says "take me to X", include a navigation action in your response.
6. Use clear markdown: bold, bullet points, no code blocks unless requested.`;

function extractNavigationActions(text: string): any[] {
    const patterns: Record<string, { path: string; elementId?: string; label?: string }> = {
        "dashboard": { path: "/dashboard" }, "agents": { path: "/agents" }, "marketplace": { path: "/marketplace" },
        "terminal": { path: "/terminal" }, "treasury": { path: "/founder" }, "founder": { path: "/founder" },
        "whitepaper": { path: "/whitepaper" }, "manifesto": { path: "/manifesto" },
        "onboard": { path: "/dashboard", elementId: "onboard-agent-btn", label: "Click to onboard" },
    };
    const lower = text.toLowerCase();
    for (const [kw, action] of Object.entries(patterns)) {
        if (lower.includes(`/${kw}`) || lower.includes(`go to ${kw}`) || lower.includes(`navigate to ${kw}`) || lower.includes(`take me to ${kw}`) || lower.includes(`open ${kw}`)) {
            return [{ type: "navigate", ...action }];
        }
    }
    return [];
}

export async function POST(req: NextRequest) {
    try {
        const { message } = await req.json();
        if (!message) return NextResponse.json({ error: "No message" }, { status: 400 });

        const knowledgeMatch = findKnowledgeMatch(message);
        const pineconeContext = await queryPinecone(message);
        let actions: any[] = knowledgeMatch?.actions || [];

        const enrichedPrompt = pineconeContext ? `${SYSTEM_PROMPT}\n\nRelevant context from Pinecone:\n${pineconeContext}` : SYSTEM_PROMPT;

        let response = await callGroq(enrichedPrompt, message);
        if (!response) response = await callOpenRouter(enrichedPrompt, message);
        if (!response && knowledgeMatch) response = knowledgeMatch.answer;
        if (!response) response = knowledgeMatch?.answer || "I couldn't connect to my language models. Try asking about: ANTP protocol, swarm orchestration, Prosperity engine, CyberShield, Constitution, Memory Fabric, or Marketplace.";

        if (actions.length === 0) actions = extractNavigationActions(response);
        if (actions.length === 0) actions = extractNavigationActions(message);

        return NextResponse.json({ response, actions });
    } catch { return NextResponse.json({ response: "Something went wrong. Please try again.", actions: [] }, { status: 500 }); }
}
