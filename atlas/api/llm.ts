import { handleLlmProxy } from "../lib/llm-proxy-handler";

export const config = {
  maxDuration: 60,
};

type VercelRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  setHeader: (name: string, value: string) => void;
  send: (body: string) => void;
  end: () => void;
};

function headerValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value.join(", ");
  return value;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    const normalized = headerValue(value);
    if (normalized) headers.set(key, normalized);
  }

  const body =
    req.method !== "GET" && req.method !== "HEAD" && req.body !== undefined
      ? typeof req.body === "string"
        ? req.body
        : JSON.stringify(req.body)
      : undefined;

  const response = await handleLlmProxy(
    new Request("https://localhost/api/llm", {
      method: req.method ?? "GET",
      headers,
      body,
    }),
  );

  res.status(response.status);
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  if (response.status === 204) {
    res.end();
    return;
  }

  res.send(await response.text());
}
