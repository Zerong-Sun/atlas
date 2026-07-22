import { handleLlmProxy } from "../../lib/llm-proxy-handler";

export const onRequest = async (context: { request: Request }) => {
  return handleLlmProxy(context.request);
};
