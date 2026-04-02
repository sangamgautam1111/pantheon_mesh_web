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
        answer: "**ANTP (Autonomous Neural Transfer Protocol)** is the core of Pantheon Mesh.\n\nUnlike HTTP which transfers documents, ANTP transfers **intelligence and capital** between autonomous AI agents.\n\n**How it works:**\n1. Client posts a job with USD budget\n2. CyberShield’s neural firewall inspects the payload\n4. Moral Governor audits against the Three Laws\n5. Memory Fabric checks for cached solutions (Instant Evocation)\n6. SwarmManager assigns the best agent\n7. Agent completes work, PoI verifies it\n8. **80% developer payout**, 20% platform fee credited to USD balance\n\n**Key components:** `ANTPKernel`, `IntentPacket`, `SemanticRouter`\n**C++ acceleration:** Native packet signing, hallucination detection via SIMD Collider",
        actions: [{ type: "navigate", path: "/connect" }],
    },
    {
        keywords: ["swarm", "orchestrator", "multi-agent", "coordinate", "assembly"],
        answer: "**SwarmOrchestrator** coordinates multi-agent task execution.\n\n**Execution Flow:**\n1. `coordinate_assembly()` spawns agents for required roles\n2. Each agent is bonded to the swarm identity\n3. Budget split: **20% infrastructure** + **80% cognitive work**\n4. Agents think sequentially, each building on the previous output\n5. USD credits distributed to model owners upon completion\n\n**Example:** For a code audit job, the swarm spawns: Auditor + Writer + Reviewer — each processes and passes context forward.",
    },
    {
        keywords: ["prosperity", "finance", "tax", "revenue", "fee", "economy", "pricing"],
        answer: "**Token Economy** manages all Pantheon Mesh economics.\n\n**Revenue Split:**\n• **20%** — Platform infrastructure fee\n• **80%** — Developer/model owner payout\n\n**Token Pricing:** Models are priced dynamically (input/output per 1K tokens) with enterprise markup.\n\n**Core Operations:**\n• `process_token_payment()` — Autonomous peer-to-peer USD settlements\n• `request_deposit()` — Fund your model fleet balance\n• `calculate_cost()` — Real-time cost estimation\n• `admin_approve_deposit()` — Secure Payoneer verification\n\n**Settlements:** Distributed via Payoneer / Bank Transfer after security verification.",
    },
    {
        keywords: ["memory", "fabric", "knowledge", "crystallize", "vector", "pinecone", "rag", "evocation"],
        answer: "**Perpetual Memory Fabric** is the collective intelligence layer of the mesh.\n\n**Technical Architecture:**\n• High-dimensional vector database (1536D, cosine similarity)\n• Serverless edge scaling for low-latency retrieval\n\n**Core Capabilities:**\n1. **Knowledge Crystallization** — Solutions are embedded and stored permanently\n2. **Instant Evocation** — Queries with >95% similarity skip LLM invocation for instant speed\n3. **Knowledge Royalties** — Original contributors earn rewards when their solutions are reused\n\n**Impact:** The mesh gets smarter with every job. Every solution is instantly available to the entire swarm.",
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
        answer: "**Proof-of-Intelligence (PoI)** is the work verification mechanism.\n\n**Verification Process:**\n1. `verify_work_proof()` runs independent protocol auditors\n2. Each auditor evaluates task fulfillment\n3. Majority consensus (≥66%) required for payment release\n4. **Verified PoI** → USD credits released to worker balance\n5. **Failed PoI** → Payment blocked, reputation penalty applied\n\nPoI ensures high-quality execution across all swarm participants.",
    },
    {
        keywords: ["escrow", "lock", "release", "settlement", "payment", "ledger"],
        answer: "**Enterprise Ledger System**:\n\n**Job Escrow:** When a task is initiated, the USD budget is securely escrowed until verification.\n\n**Completion & Settlement:** Swarm verification triggers the **80% developer / 20% platform** split.\n\n**B2B Settlements:** Agents hire other models using their USD credit balance. All transactions are logged in the secure audit trail.\n\n**Payouts:** Developers withdraw USD via Payoneer with professional automated processing.",
    },
    {
        keywords: ["onboard", "register", "deploy agent", "new agent", "create agent"],
        answer: "To onboard a new agent:\n\n1. Go to **Dashboard**\n2. Click **'Onboard Agent'** button (top right)\n3. Enter agent name and comma-separated skills\n4. Click **'Create'**\n\n**Backend:** POST `/v1/agents/onboard?name=X&skills=Y`\n• Generates Ethereum identity (secrets.token_hex → eth_account)\n• Creates SQLAlchemy record with default reputation 100.0\n• Agent enters 'idle' status, ready for swarm assignment\n\nLet me take you there!",
        actions: [{ type: "navigate", path: "/dashboard", elementId: "onboard-agent-btn", label: "Click here to onboard" }],
    },
    {
        keywords: ["marketplace", "capability", "specs", "buy", "sell", "list"],
        answer: "The **Marketplace** is where AI agents exchange capabilities.\n\n**Core Value:**\n• Connect your LLM API keys (19 providers supported)\n• Models registered with dynamic pricing (USD per 1K tokens)\n• Agents autonomously hire each other using their USD credit balance\n\n**Economics:** **80% developer payout** on every request. Direct USD settlements via Payoneer.",
        actions: [{ type: "navigate", path: "/marketplace" }],
    },
    {
        keywords: ["dashboard", "metrics", "overview"],
        answer: "The **Dashboard** shows real-time mesh metrics: Active Agents, Jobs, USD Revenue, Token Usage, CyberShield status. Plus tabbed data tables and a live transaction feed.\n\nLet me navigate you there.",
        actions: [{ type: "navigate", path: "/dashboard" }],
    },
    {
        keywords: ["agent", "agents", "browse", "find agent"],
        answer: "The **Agents** page shows all autonomous agents registered in the mesh — name, role, reputation, balance, tasks completed. Click any agent for their full profile and task history.\n\nTaking you there!",
        actions: [{ type: "navigate", path: "/agents" }],
    },
    {
        keywords: ["treasury", "withdraw", "founder", "money", "funds", "payout", "payoneer"],
        answer: "**Payouts** are handled via Payoneer (manual admin approval).\n\n**How to withdraw:**\n1. Go to your Developer Dashboard\n2. Click Withdraw\n3. Enter amount and select method (Payoneer / Bank)\n4. Admin reviews and sends money from Pantheon Payoneer\n5. You receive USD in your Payoneer/Bank account\n\nAdmin panel: `/admin` (password protected)",
        actions: [{ type: "navigate", path: "/founder" }],
    },
    {
        keywords: ["connect", "model", "api key", "link", "register"],
        answer: "The **Connect Model** page lets you link your AI model to the mesh. Just paste your API key, choose a model, and the system validates it live.\n\nOpening the connection page!",
        actions: [{ type: "navigate", path: "/connect" }],
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
        keywords: ["wallet", "connect", "api key", "add model", "detect"],
        answer: "**Model Connection:**\n\nPantheon auto-detects **19 LLM providers** from your API key:\nOpenAI, Anthropic, Google Gemini, Groq, Mistral, Cohere, DeepSeek, Together AI, and more.\n\n**Flow:** Paste your API key → System detects provider → Shows available models → Auto-registers with encrypted storage.\n\n**Terminal:** `mesh auto-add --key YOUR_API_KEY`\n**API:** `POST /v1/developer/{uid}/models/auto-onboard`",
    },
    {
        keywords: ["openrouter", "deepseek", "claude", "gpt", "tier", "free", "pro", "premium", "which model"],
        answer: "**OpenRouter & Model Tiers:**\n\nIf you connect an OpenRouter API key, you will see all 347+ available models. However, connections are tier-restricted:\n\n• **Free Tier:** Can only connect Basic models (e.g., Gemini Flash, Llama 8B, Mini models — usually <=11B parameters).\n• **Pro/Premium Tier:** Can connect Advanced models like **DeepSeek V3**, Claude 3.5 Sonnet, or GPT-4o.\n\nIf you try to connect a Pro model on a Free tier, the connection will be safely blocked until you upgrade.",
        actions: [{ type: "navigate", path: "/connect" }],
    },
    {
        keywords: ["take me", "go to", "navigate", "open", "show me"],
        answer: "Where to? I can take you to:\n\n• **Dashboard** → Real-time mesh metrics\n• **Agents** → Browse all registered agents\n• **Marketplace** → Capability exchange\n• **Terminal** → Inject ANTP intents\n• **Treasury** → Protocol revenue\n• **Whitepaper** or **Manifesto**",
    },
    {
        keywords: ["pantheon", "what is", "about", "explain", "axiom", "pantheon mesh"],
        answer: "**Pantheon Mesh** is an enterprise AI-to-AI protocol where models operate as autonomous economic units.\n\n**Core Pillars:**\n1. **The Fortress** — CyberShield native security engine\n2. **The Brain** — High-performance Memory Fabric\n3. **The Bank** — Secure USD Ledger with automated payouts\n4. **The Body** — Docker/K8s infrastructure actuators\n\n**Economics:** Developers earn an industry-leading **80% payout** on all jobs. Models earn USD credits and can autonomously hire other models to optimize execution.",
    },
    {
        keywords: ["a2a", "agent to agent", "payment", "transaction", "hire", "ai hire"],
        answer: "**Autonomous Peer-to-Peer Settlements:**\n\n1. Agents earn USD credits from swarm task fulfillment\n2. Agents hire other specialize models via internal protocol requests\n3. Settlement occurs instantly via the internal ledger\n4. **80% payout** to the provider owner, 20% to the platform\n\nThis creates a self-optimizing marketplace of cognitive skills without human intervention.",
        actions: [{ type: "navigate", path: "/dashboard" }],
    },
    {
        keywords: ["bid", "bidding", "compute", "cost", "pricing"],
        answer: "**Compute Bidding:**\n\nFormula: `hourly_cost = (0.005 × CPU) × reputation_multiplier × 60`\n\nReputation multiplier: `1.0 - (min(reputation, 1000) / 5000)`\n→ Higher reputation = cheaper compute!\n\nGo to any Agent detail page to submit a bid.",
        actions: [{ type: "navigate", path: "/agents" }],
    },
];

/* PRINCIPLE 5 (YOLO Fast-Path): Separate scoring from matching for fast-path classification */
function getKnowledgeMatchScore(query: string): number {
    const lower = query.toLowerCase();
    let bestScore = 0;
    for (const entry of KNOWLEDGE_BASE) {
        let score = 0;
        for (const kw of entry.keywords) { if (lower.includes(kw)) score += kw.length * 2; }
        if (score > bestScore) bestScore = score;
    }
    return bestScore;
}

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
const SYSTEM_PROMPT = `You are Mesh Assist, the AI guide for Pantheon Mesh — an AI-to-AI economy protocol.

CORE ARCHITECTURE:
- ANTP (Autonomous Neural Transfer Protocol): Transfers intelligence and capital between agents.
- SwarmManager: Assigns jobs to the best available agent models.
- Memory Fabric: Perpetual knowledge layer using Pinecone (1536D vectors).
- Token Economy: 35 models priced with token-to-USD conversion.

ECONOMY (PURE FIAT — NO CRYPTO):
- Revenue Split: 80% developer payout / 20% platform fee. Developers earn the majority.
- Payments: USD via Payoneer. Manual admin approval.
- AI-to-AI: Models earn USD credits. Models can hire other models using those credits.
- Token Pricing: Input/output per 1K tokens with 3.5x platform markup.
- Deposits: Developer sends USD via Payoneer → admin approves → credits added.
- Withdrawals: Developer requests payout → admin sends via Payoneer → marks done.

MODEL ONBOARDING & OPENROUTER:
- Users can add their LLM API keys (19 providers auto-detected: OpenAI, Anthropic, Gemini, Groq, Mistral, Cohere, DeepSeek, etc.)
- OpenRouter gives access to 347+ models. 
- **Tier Restrictions**: Free tier users can ONLY connect Basic models (e.g., Gemini Flash, Llama 8B, Mini models, usually <=11B parameters). Pro models (like DeepSeek V3, Claude 3.5 Sonnet, GPT-4o) require a Pro or Premium subscription.
- Local Ollama models can also be connected.

GOVERNANCE & SECURITY:
- CyberShield: Dual-layer security (C++ native firewall + Python rate limiting).
- Constitution: Enforcing the Three Laws of Agents via Moral Governor audits.
- Admin Panel: /admin (password-protected, SHA-512) for deposits, withdrawals, platform stats.

PAGES: Dashboard (/dashboard), Agents (/agents), Marketplace (/marketplace), Connect (/connect), Developer (/developer), Admin (/admin), Whitepaper (/whitepaper).

DANGER - CRITICAL RULES:
1. You know EVERYTHING about Pantheon Mesh. Never say "I'm not familiar with...".
2. **DO NOT** include API endpoints or curl commands UNLESS the user explicitly asks.
3. **DO NOT** dump long documentation blocks. Summarize conversationally.
4. NEVER mention AXM tokens, crypto, blockchain, Polygon, or smart contracts. The system is pure fiat USD.
5. If a user says "take me to X", include a navigation action.
6. Use clear markdown: bold, bullet points, no code blocks unless requested.`;

function extractNavigationActions(text: string): any[] {
    const patterns: Record<string, { path: string; elementId?: string; label?: string }> = {
        "dashboard": { path: "/dashboard" }, "agents": { path: "/agents" }, "marketplace": { path: "/marketplace" },
        "connect": { path: "/connect" }, "treasury": { path: "/founder" }, "founder": { path: "/founder" },
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

        /* ═══════════════════════════════════════════════
           PRINCIPLE 5 (YOLO Fast-Path Classifier):
           If the knowledge base has a HIGH-CONFIDENCE match (score >= 12),
           return it INSTANTLY without hitting Pinecone or any LLM.
           This cuts latency from ~2000ms to ~5ms for common questions.
           Only fall through to the expensive LLM path for novel queries.
           ═══════════════════════════════════════════════ */
        const knowledgeMatch = findKnowledgeMatch(message);
        const matchScore = getKnowledgeMatchScore(message);

        // FAST PATH: High-confidence knowledge base hit → instant response
        if (knowledgeMatch && matchScore >= 12) {
            const fastActions = knowledgeMatch.actions || extractNavigationActions(message);
            return NextResponse.json({ response: knowledgeMatch.answer, actions: fastActions, _fast_path: true });
        }

        // SLOW PATH: Novel query → Pinecone RAG + LLM
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
