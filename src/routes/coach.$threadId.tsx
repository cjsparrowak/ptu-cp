import { createFileRoute } from "@tanstack/react-router";
import { TutorCoach } from "@/components/game/TutorCoach";

export const Route = createFileRoute("/coach/$threadId")({
  head: () => ({ meta: [
    { title: "C Quest Coach — PTU Programming Doubts" },
    { name: "description", content: "Ask line-by-line C programming questions with lesson-aware guidance for PTU CSUC102." },
    { property: "og:title", content: "C Quest Coach — PTU Programming Doubts" },
    { property: "og:description", content: "Lesson-aware C programming help for PTU CSUC102." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: CoachRoute,
});

function CoachRoute() { const { threadId } = Route.useParams(); return <TutorCoach threadId={threadId}/>; }