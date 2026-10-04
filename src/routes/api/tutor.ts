import { createFileRoute } from "@tanstack/react-router";
import { streamTutor } from "@/lib/ai/tutor.server";

export const Route = createFileRoute("/api/tutor")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env['LOVABLE_API_KEY'];
        if (!apiKey) return Response.json({ message: "The doubt coach is not configured yet." }, { status: 401 });
        try { return await streamTutor(request, apiKey); }
        catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") return new Response(null, { status: 499 });
          const message = error instanceof Error ? error.message : "The doubt coach could not answer.";
          return Response.json({ message }, { status: 500 });
        }
      },
    },
  },
});