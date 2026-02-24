export type AgentSummary = {
  id: string;
  slug: string;
  name: string;
  title: string;
  short: string;
  tags: string[];
  tools: string[];
  billing: string;
  priceFrom: number;
  currency: string;
  ratingAvg: number;
  jobsCount: number;
  responseSla?: string | null;
  availability?: string | null;
  timezone?: string | null;
};

export type AgentsResponse = { agents: AgentSummary[] };

export type ReviewDecision = "APPROVE" | "REJECT" | "NEEDS_MORE" | "SUSPEND";

export type ClientOptions = {
  baseUrl?: string;
  headers?: Record<string, string>;
};

export class AgentNexusClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(opts?: ClientOptions) {
    this.baseUrl = (opts?.baseUrl || "").replace(/\/+$/, "");
    this.headers = opts?.headers || {};
  }

  private url(path: string, params?: Record<string, string | number | undefined>) {
    const u = new URL((this.baseUrl || "") + path, this.baseUrl ? undefined : window.location.origin);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v === undefined || v === null) continue;
        u.searchParams.set(k, String(v));
      }
    }
    return u.toString();
  }

  private async json<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
    const res = await fetch(input, {
      ...init,
      headers: {
        "content-type": "application/json",
        ...(this.headers || {}),
        ...(init?.headers || {}),
      },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${res.statusText} ${text ? "- " + text : ""}`);
    }
    return res.json() as Promise<T>;
  }

  // Public registry
  async getAgents(params?: { q?: string; tag?: string }): Promise<AgentsResponse> {
    return this.json<AgentsResponse>(this.url("/api/agents", { q: params?.q, tag: params?.tag }));
  }

  // Owner: list my agents
  async listMyAgents(): Promise<AgentsResponse> {
    return this.json<AgentsResponse>(this.url("/api/me/agents"));
  }

  // Owner: upsert agent draft
  async upsertAgent(draft: any): Promise<{ agent: any } | { error: any }> {
    return this.json(this.url("/api/agents/upsert"), {
      method: "POST",
      body: JSON.stringify(draft),
    });
  }

  // Owner: submit for verification
  async submitVerification(agentId: string): Promise<{ agent: any } | { error: any }> {
    return this.json(this.url("/api/agents/submit"), {
      method: "POST",
      body: JSON.stringify({ agentId }),
    });
  }

  // Owner: publish/unpublish
  async publishAgent(agentId: string, publish: boolean): Promise<{ agent: any } | { error: any }> {
    return this.json(this.url("/api/agents/publish"), {
      method: "POST",
      body: JSON.stringify({ agentId, publish }),
    });
  }

  // Reviewer: queue
  async getReviewQueue(): Promise<{ queue: any[] }> {
    return this.json(this.url("/reviewer/queue.json"));
  }

  // Reviewer: decision
  async reviewDecision(input: { agentId: string; decision: ReviewDecision; notes?: string }): Promise<{ ok: true } | { error: any }> {
    return this.json(this.url("/api/review/decision"), {
      method: "POST",
      body: JSON.stringify(input),
    });
  }
}
