import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createRunIdFetch, withRunId } from "./run-id.ts";

export async function streamTutor(request: Request, apiKey: string) {
  const body = await request.json() as { messages?: UIMessage[]; lessonContext?: string };
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) return Response.json({ message: "Ask a programming question first." }, { status: 400 });
  const gateway = createRunIdFetch(request.headers.get("X-Lovable-AIG-Run-ID") ?? undefined);
  const openai = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: gateway.fetch,
  });
  const result = streamText({
    model: openai.responses("openai/gpt-6-astra"),
    system: `You are C Quest Coach, a precise and encouraging PTU CSUC102 programming tutor. Answer the learner's actual doubt directly. Explain C code line by line with small concrete examples, memory diagrams in markdown tables when helpful, and distinguish compile-time from run-time behavior. Never pretend uncertain information is certain. Keep answers focused and age-appropriate. Current lesson context:\n${body.lessonContext?.slice(0, 6000) ?? "No lesson selected."}`,
    messages: await convertToModelMessages(messages),
    abortSignal: request.signal,
    providerOptions: { openai: { store: false, forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", include: ["reasoning.encrypted_content"] } },
  });
  return withRunId(result.toUIMessageStreamResponse({ originalMessages: messages, sendReasoning: true }), gateway);
}