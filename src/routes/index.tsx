import { createFileRoute } from "@tanstack/react-router";
import { CQuestApp } from "@/components/game/CQuestApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "C Quest — PTU CSUC102 Programming Lab" },
      { name: "description", content: "Learn every PTU CSUC102 C programming experiment through interactive, line-by-line missions and challenges." },
      { property: "og:title", content: "C Quest — PTU CSUC102 Programming Lab" },
      { property: "og:description", content: "Master C programming one line at a time with 20 interactive PTU lab missions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CQuestApp,
});