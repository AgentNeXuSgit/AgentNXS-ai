# AgentNexus JS Client

A lightweight JavaScript/TypeScript client to integrate with Agent NeXuS web utilities and APIs.

## Install
Copy `src/index.ts` into your project or add this folder as a submodule.

## 1. Clone and Setup
Clone the standalone SDK repo (AgentNXS‑ai) or use this folder as a submodule.
```
git clone git@github.com:AgentNeXuSgit/AgentNXS-ai.git
cd AgentNXS-ai
```
Optional (local TypeScript):
```
npm init -y
npm i -D typescript
npx tsc --init
```

## 2. Configure
Set connection config and authentication headers for your deployment.
- baseUrl: your Agent NeXuS web deployment URL (e.g. https://your-app.example.com)
- headers:
  - authorization: Bearer <AGENTNEXUS_API_KEY> (optional, if your backend supports it)
  - x-user-id: user ID (for owner/reviewer routes)
  - x-role: ADMIN | REVIEWER | USER (as required by the route)

Initialization example:
```ts
import { AgentNexusClient } from "./agentnexus-js/src/index";

const client = new AgentNexusClient({
  baseUrl: process.env.AGENTNEXUS_BASE_URL, // leave empty for same-origin
  headers: {
    authorization: `Bearer ${process.env.AGENTNEXUS_API_KEY || ""}`,
    "x-user-id": process.env.AGENTNEXUS_USER_ID || "",
    "x-role": process.env.AGENTNEXUS_ROLE || "USER",
  },
});
```

## 3. Generate NeXuS API Key
The demo backend uses `x-user-id` and `x-role`. If your deployment has an API key system:
- Create an API key in your Dashboard/Admin
- Store it as AGENTNEXUS_API_KEY in environment (never commit)
- Send it as `Authorization: Bearer <key>` with each request

If you don’t have API keys yet, use `x-user-id` + `x-role` as shown until the backend is ready.

## 4. Run Agent
Example integration flow:
```ts
import { AgentNexusClient } from "./agentnexus-js/src/index";

const client = new AgentNexusClient({
  baseUrl: "https://your-deployment.example.com", // leave empty for same-origin
  headers: {
    authorization: `Bearer ${process.env.AGENTNEXUS_API_KEY || ""}`,
    "x-user-id": "USER_ID",
    "x-role": "ADMIN", // or REVIEWER / USER depending on the route
  },
});

// Public registry
const { agents } = await client.getAgents({ q: "nextjs", tag: "api" });

// Owner flows
const upsert = await client.upsertAgent({
  slug: "my-agent",
  name: "My Agent",
  title: "Does things",
  short: "Short desc",
  description: "Long desc",
  tags: ["nextjs", "api"],
  tools: ["GitHub"],
  visibility: "PUBLIC",
  billing: "HOURLY",
  priceFrom: 100,
  currency: "USD",
});
await client.submitVerification(upsert?.agent?.id || "agent-id");
await client.publishAgent(upsert?.agent?.id || "agent-id", true);

// Reviewer flows
const { queue } = await client.getReviewQueue();
await client.reviewDecision({ agentId: "agent-id", decision: "APPROVE", notes: "Looks good" });
```

## Notes
- Some routes require auth headers: `x-user-id`, `x-role`
- Replace mock console streaming with SSE/WebSocket in your backend
- Do not commit secrets; use environment variables or per-request header injection
