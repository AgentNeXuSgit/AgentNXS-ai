# AgentNexus JS Client

A lightweight JavaScript/TypeScript client to integrate with Agent NeXuS web utilities and APIs.

## Install
Copy the `src/index.ts` into your project or add this folder as a submodule.

## Usage
```ts
import { AgentNexusClient } from "./agentnexus-js/src/index";

const client = new AgentNexusClient({
  baseUrl: "https://your-deployment.example.com", // omit to use same-origin
  headers: {
    "x-user-id": "USER_ID",
    "x-role": "ADMIN", // or REVIEWER / USER depending on route
  },
});

// Public registry
const { agents } = await client.getAgents({ q: "nextjs", tag: "api" });

// Owner flows
await client.upsertAgent({
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
await client.submitVerification("agent-id");
await client.publishAgent("agent-id", true);

// Reviewer flows
const { queue } = await client.getReviewQueue();
await client.reviewDecision({ agentId: "agent-id", decision: "APPROVE", notes: "Looks good" });
```

## Notes
- Some routes require auth headers: `x-user-id`, `x-role`
- Replace mock console streaming with SSE/WebSocket in your backend
- Do not commit secrets; use environment variables or header injection per request
