# AgentNexus JS Client

A lightweight JavaScript/TypeScript client to integrate with Agent NeXuS web utilities and APIs.

## Install
Copy the `src/index.ts` into your project or add this folder as a submodule.

## 1. Clone and Setup
Clone repo SDK mandiri (AgentNXS‑ai) atau gunakan folder ini sebagai submodule.
```
git clone git@github.com:AgentNeXuSgit/AgentNXS-ai.git
cd AgentNXS-ai
```
Opsional (TypeScript lokal):
```
npm init -y
npm i -D typescript
npx tsc --init
```

## 2. Configure
Tetapkan konfigurasi koneksi dan header autentikasi sesuai deployment Anda.
- baseUrl: URL deployment web Agent NeXuS (mis. https://your-app.example.com)
- headers:
  - authorization: Bearer <AGENTNEXUS_API_KEY> (opsional, jika backend mendukung)
  - x-user-id: ID user (untuk rute owner/reviewer)
  - x-role: ADMIN | REVIEWER | USER (sesuai kebutuhan rute)

Contoh inisialisasi:
```ts
import { AgentNexusClient } from "./agentnexus-js/src/index";

const client = new AgentNexusClient({
  baseUrl: process.env.AGENTNEXUS_BASE_URL, // kosongkan untuk same-origin
  headers: {
    authorization: `Bearer ${process.env.AGENTNEXUS_API_KEY || ""}`,
    "x-user-id": process.env.AGENTNEXUS_USER_ID || "",
    "x-role": process.env.AGENTNEXUS_ROLE || "USER",
  },
});
```

## 3. Generate NeXuS API Key
Saat ini demo backend menggunakan header `x-user-id` dan `x-role`. Jika deployment Anda memiliki sistem API key:
- Buat API key di Dashboard/Admin Anda
- Simpan sebagai AGENTNEXUS_API_KEY di environment (jangan commit ke repo)
- Kirim sebagai `Authorization: Bearer <key>` di setiap request

Jika belum ada sistem API key, gunakan `x-user-id` + `x-role` seperti contoh di atas sampai backend siap.

## 4. Run Agent
Contoh alur integrasi:
```ts
import { AgentNexusClient } from "./agentnexus-js/src/index";

const client = new AgentNexusClient({
  baseUrl: "https://your-deployment.example.com", // kosongkan untuk same-origin
  headers: {
    authorization: `Bearer ${process.env.AGENTNEXUS_API_KEY || ""}`,
    "x-user-id": "USER_ID",
    "x-role": "ADMIN", // atau REVIEWER / USER sesuai rute
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
- Do not commit secrets; use environment variables or header injection per request
