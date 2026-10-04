import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, Bot, ChevronLeft, Plus, Trash2, X } from "lucide-react";
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import logo from "@/assets/ptu-logo.png.asset.json";

export type TutorThread = { id: string; title: string; updatedAt: number; lessonContext: string; messages: UIMessage[] };
const STORAGE_KEY = "cquest-tutor-threads";

function readThreads(): TutorThread[] {
  try { const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]") as TutorThread[]; return Array.isArray(parsed) ? parsed : []; }
  catch { return []; }
}

export function createTutorThread(lessonContext: string, title: string) {
  const id = crypto.randomUUID();
  const threads = readThreads();
  const thread: TutorThread = { id, title, updatedAt: Date.now(), lessonContext, messages: [] };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([thread, ...threads]));
  return id;
}

export function TutorCoach({ threadId, mode = "page", onClose }: { threadId: string; mode?: "page" | "widget"; onClose?: () => void }) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [threads, setThreads] = useState<TutorThread[]>([]);
  const [loaded, setLoaded] = useState(false);
  const current = threads.find((thread) => thread.id === threadId);
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/tutor", body: { lessonContext: current?.lessonContext ?? "General C programming doubts for PTU CSUC102." } }), [current?.lessonContext]);
  const { messages, setMessages, sendMessage, status, stop, error } = useChat({ id: threadId, transport });

  useEffect(() => {
    let stored = readThreads();
    let active = stored.find((thread) => thread.id === threadId);
    if (!active) {
      active = { id: threadId, title: "New C doubt", updatedAt: Date.now(), lessonContext: "General C programming doubts for PTU CSUC102.", messages: [] };
      stored = [active, ...stored];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    }
    setThreads(stored);
    setMessages(active.messages);
    setLoaded(true);
    queueMicrotask(() => inputRef.current?.focus());
  }, [threadId, setMessages]);

  useEffect(() => {
    if (!loaded) return;
    setThreads((existing) => {
      const next = existing.map((thread) => thread.id === threadId ? { ...thread, messages, updatedAt: Date.now(), title: thread.title === "New C doubt" && messages[0] ? messageText(messages[0]).slice(0, 42) || thread.title : thread.title } : thread);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    if (status === "ready") queueMicrotask(() => inputRef.current?.focus());
  }, [messages, status, threadId, loaded]);

  const newThread = () => {
    const id = createTutorThread(current?.lessonContext ?? "General C programming doubts for PTU CSUC102.", "New C doubt");
    void navigate({ to: "/coach/$threadId", params: { threadId: id } });
  };
  const removeThread = (id: string) => {
    const remaining = threads.filter((thread) => thread.id !== id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
    if (id === threadId) {
      const next = remaining[0]?.id ?? createTutorThread("General C programming doubts for PTU CSUC102.", "New C doubt");
      void navigate({ to: "/coach/$threadId", params: { threadId: next } });
    } else setThreads(remaining);
  };
  const busy = status === "submitted" || status === "streaming";

  if (mode === "widget") return <aside aria-label="Doubt coach" className="fixed inset-x-3 bottom-20 z-50 flex h-[min(650px,calc(100dvh-6rem))] flex-col overflow-hidden rounded-lg border border-border bg-background shadow-2xl sm:left-auto sm:right-5 sm:w-[430px] md:bottom-6">
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface px-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/15 text-primary"><Bot className="size-5" /></span>
      <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{current?.title ?? "C Quest Coach"}</p><p className="truncate text-[10px] text-muted-foreground">Lesson-aware programming help</p></div>
      <Button variant="ghost" size="icon-sm" onClick={newThread} aria-label="Start a new doubt"><Plus /></Button>
      <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close doubt coach"><X /></Button>
    </header>
    <Conversation className="min-h-0 flex-1"><ConversationContent className="px-4 py-5">
      {messages.length === 0 ? <ConversationEmptyState icon={<div className="grid size-14 place-items-center rounded-lg bg-primary/15"><BookOpen className="size-7 text-primary"/></div>} title="Ask any C programming doubt" description="Ask why a line runs, what changes in memory, or request a simple example."/> : messages.map((message) => <Message from={message.role} key={message.id}><MessageContent>{message.parts.map((part, index) => part.type === "text" ? <MessageResponse key={index}>{part.text}</MessageResponse> : null)}</MessageContent></Message>)}
      {status === "submitted" && <Shimmer className="text-sm">Tracing the program...</Shimmer>}
      {error && <p role="alert" className="rounded-md border border-danger/40 bg-danger/10 p-3 text-sm text-danger">{error.message}</p>}
    </ConversationContent><ConversationScrollButton/></Conversation>
    <div className="shrink-0 border-t border-border bg-background p-3"><PromptInput onSubmit={({ text }) => { const value = text.trim(); if (!value || busy) return; void sendMessage({ text: value }); }}>
      <PromptInputTextarea ref={inputRef} placeholder="Ask your doubt..." disabled={busy} className="min-h-20"/><PromptInputFooter className="justify-end"><PromptInputSubmit status={status} onStop={stop} disabled={!loaded}/></PromptInputFooter>
    </PromptInput><p className="mt-1.5 text-center text-[9px] text-muted-foreground">Verify important answers with your lab manual.</p></div>
  </aside>;

  return <main className="grid min-h-screen bg-background text-foreground md:grid-cols-[280px_1fr]">
    <aside className="border-b border-border bg-surface md:border-b-0 md:border-r">
      <div className="flex h-16 items-center gap-3 border-b border-border px-4"><img src={logo.url} alt="PTU crest" className="size-10 object-contain"/><div><p className="font-display text-sm font-bold">C Quest Coach</p><p className="text-[10px] text-muted-foreground">PTU · CSUC102</p></div></div>
      <div className="flex gap-2 p-3"><Button variant="outline" size="icon" asChild><Link to="/" aria-label="Back to missions"><ChevronLeft/></Link></Button><Button className="flex-1" onClick={newThread}><Plus/>New doubt</Button></div>
      <div className="scrollbar-none flex gap-2 overflow-x-auto px-3 pb-3 md:block md:max-h-[calc(100vh-132px)] md:space-y-1 md:overflow-y-auto">
        {threads.map((thread) => <div key={thread.id} className="group flex min-w-56 items-center rounded-md border border-transparent hover:border-border hover:bg-background md:min-w-0">
          <Link to="/coach/$threadId" params={{ threadId: thread.id }} className="min-w-0 flex-1 px-3 py-2"><span className="block truncate text-xs font-semibold">{thread.title}</span><span className="block truncate text-[10px] text-muted-foreground">{thread.lessonContext.split("\n")[0]}</span></Link>
          <Button variant="ghost" size="icon-sm" className="mr-1 opacity-70" onClick={() => removeThread(thread.id)} aria-label={`Delete ${thread.title}`}><Trash2/></Button>
        </div>)}
      </div>
    </aside>
    <section className="flex min-h-[calc(100vh-132px)] flex-col md:h-screen md:min-h-0">
      <header className="flex h-16 items-center justify-between border-b border-border px-4 sm:px-6"><div className="min-w-0"><p className="truncate font-display text-sm font-bold">{current?.title ?? "New C doubt"}</p><p className="truncate text-[10px] text-muted-foreground">Answers use your current lesson as context</p></div><Bot className="size-6 text-primary"/></header>
      <Conversation className="min-h-0"><ConversationContent className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        {messages.length === 0 ? <ConversationEmptyState icon={<div className="grid size-16 place-items-center rounded-lg bg-primary/15"><BookOpen className="size-8 text-primary"/></div>} title="Ask any C programming doubt" description="Try: Why does this line run now? What changed in memory? Show me with an example."/> : messages.map((message) => <Message from={message.role} key={message.id}><MessageContent>{message.parts.map((part, index) => part.type === "text" ? <MessageResponse key={index}>{part.text}</MessageResponse> : null)}</MessageContent></Message>)}
        {status === "submitted" && <Shimmer className="text-sm">Tracing the program...</Shimmer>}
        {error && <p role="alert" className="rounded-md border border-danger/40 bg-danger/10 p-3 text-sm text-danger">{error.message}</p>}
      </ConversationContent><ConversationScrollButton/></Conversation>
      <div className="border-t border-border bg-background p-3 sm:p-4"><div className="mx-auto max-w-3xl"><PromptInput onSubmit={({ text }) => { const value = text.trim(); if (!value || busy) return; void sendMessage({ text: value }); }}>
        <PromptInputTextarea ref={inputRef} placeholder="Ask why, how, or what changes in this line..." disabled={busy}/><PromptInputFooter className="justify-end"><PromptInputSubmit status={status} onStop={stop} disabled={!loaded}/></PromptInputFooter>
      </PromptInput><p className="mt-2 text-center text-[10px] text-muted-foreground">Check important answers against your lab manual and instructor guidance.</p></div></div>
    </section>
  </main>;
}

function messageText(message: UIMessage) { return message.parts.filter((part) => part.type === "text").map((part) => part.text).join(" "); }