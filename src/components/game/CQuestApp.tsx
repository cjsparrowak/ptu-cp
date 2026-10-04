import { useEffect, useMemo, useState } from "react";
import { BookOpen, Brain, Check, ChevronLeft, ChevronRight, CircleHelp, Code2, Flame, Gamepad2, Heart, Home, Lightbulb, LockKeyhole, RotateCcw, Search, Sparkles, Star, Trophy, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { lessons, units, viva, type Lesson } from "@/data/curriculum";
import crest from "@/assets/ptu-crest.png.asset.json";

type View = "map" | "lesson" | "viva";
type SavedProgress = { completed: number[]; xp: number; streak: number };
const defaultProgress: SavedProgress = { completed: [], xp: 0, streak: 1 };

export function CQuestApp() {
  const [view, setView] = useState<View>("map");
  const [activeId, setActiveId] = useState(1);
  const [filter, setFilter] = useState<(typeof units)[number]>("All");
  const [search, setSearch] = useState("");
  const [progress, setProgress] = useState<SavedProgress>(defaultProgress);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("cquest-progress");
      if (saved) setProgress(JSON.parse(saved) as SavedProgress);
    } catch { /* keep a clean first run */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem("cquest-progress", JSON.stringify(progress));
  }, [progress, hydrated]);

  const openLesson = (id: number) => { setActiveId(id); setView("lesson"); window.scrollTo(0, 0); };
  const completeLesson = (id: number) => setProgress((p) => p.completed.includes(id) ? p : { ...p, completed: [...p.completed, id], xp: p.xp + 100, streak: p.streak + 1 });
  const lesson = lessons.find((item) => item.id === activeId) ?? lessons[0];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        <TopBar progress={progress} view={view} onHome={() => setView("map")} onViva={() => setView("viva")} />
        {view === "map" && <QuestMap progress={progress} filter={filter} setFilter={setFilter} search={search} setSearch={setSearch} onOpen={openLesson} />}
        {view === "lesson" && <LessonPlayer lesson={lesson} completed={progress.completed.includes(lesson.id)} onBack={() => setView("map")} onComplete={() => completeLesson(lesson.id)} onNext={() => lesson.id < lessons.length ? openLesson(lesson.id + 1) : setView("map")} />}
        {view === "viva" && <VivaArena onBack={() => setView("map")} />}
        <MobileNav view={view} onHome={() => setView("map")} onViva={() => setView("viva")} />
      </div>
    </TooltipProvider>
  );
}

function TopBar({ progress, view, onHome, onViva }: { progress: SavedProgress; view: View; onHome: () => void; onViva: () => void }) {
  return <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
    <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-3 px-4 sm:px-6 lg:px-8">
      <button onClick={onHome} className="flex min-w-0 items-center gap-3 text-left" aria-label="Open quest map">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-surface-raised ring-1 ring-border"><img src={crest.url} alt="PTU crest" className="h-9 w-9 object-contain" /></span>
        <span className="min-w-0"><span className="block truncate font-display text-base font-bold">C Quest</span><span className="block truncate text-[11px] text-muted-foreground">PTU · CSUC102</span></span>
      </button>
      <div className="ml-auto hidden items-center gap-1 md:flex">
        <Button variant={view === "map" ? "secondary" : "ghost"} size="sm" onClick={onHome}><Home /> Quest map</Button>
        <Button variant={view === "viva" ? "secondary" : "ghost"} size="sm" onClick={onViva}><Brain /> Viva arena</Button>
      </div>
      <div className="ml-auto flex items-center gap-2 md:ml-3">
        <Stat icon={<Flame />} value={String(progress.streak)} label="day streak" tone="warm" />
        <Stat icon={<Zap />} value={String(progress.xp)} label="total XP" tone="blue" />
        <Stat icon={<Heart />} value="5" label="lives" tone="red" compact />
      </div>
    </div>
  </header>;
}

function Stat({ icon, value, label, tone, compact }: { icon: React.ReactNode; value: string; label: string; tone: string; compact?: boolean }) {
  return <Tooltip><TooltipTrigger asChild><div className={cn("flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 text-xs font-bold", compact && "hidden sm:flex", `stat-${tone}`)}>{icon}<span>{value}</span></div></TooltipTrigger><TooltipContent>{label}</TooltipContent></Tooltip>;
}

function QuestMap({ progress, filter, setFilter, search, setSearch, onOpen }: { progress: SavedProgress; filter: (typeof units)[number]; setFilter: (x: (typeof units)[number]) => void; search: string; setSearch: (x: string) => void; onOpen: (id: number) => void }) {
  const filtered = useMemo(() => lessons.filter((l) => (filter === "All" || l.unit === filter) && `${l.title} ${l.concept}`.toLowerCase().includes(search.toLowerCase())), [filter, search]);
  const percent = Math.round(progress.completed.length / lessons.length * 100);
  return <main className="pb-24 md:pb-12">
    <section className="border-b border-border bg-hero-grid">
      <div className="mx-auto grid max-w-[1500px] gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_340px] md:py-14 lg:px-8">
        <div className="max-w-3xl">
          <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase text-primary"><Sparkles className="size-4" /> Computer Programming Laboratory</div>
          <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">Master C.<br/><span className="text-highlight">One line at a time.</span></h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">Turn all 20 PTU lab experiments into short missions. Trace memory, predict output, and make every line click.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button size="lg" onClick={() => onOpen(progress.completed.length < 20 ? progress.completed.length + 1 : 1)}><Gamepad2 /> {progress.completed.length ? "Continue quest" : "Start first mission"}</Button>
            <Button variant="outline" size="lg" onClick={() => document.getElementById("missions")?.scrollIntoView({ behavior: "smooth" })}><BookOpen /> Browse missions</Button>
          </div>
        </div>
        <div className="self-end border-l border-border pl-6">
          <div className="flex items-end justify-between"><div><p className="text-xs font-semibold uppercase text-muted-foreground">Course progress</p><p className="mt-1 font-display text-4xl font-bold">{percent}%</p></div><Trophy className="size-10 text-reward" /></div>
          <Progress value={percent} className="mt-4 h-2.5 bg-surface-raised" />
          <div className="mt-4 grid grid-cols-3 gap-3 text-xs"><div><b className="block text-base">{progress.completed.length}</b><span className="text-muted-foreground">cleared</span></div><div><b className="block text-base">{20-progress.completed.length}</b><span className="text-muted-foreground">remaining</span></div><div><b className="block text-base">4</b><span className="text-muted-foreground">outcomes</span></div></div>
        </div>
      </div>
    </section>
    <section id="missions" className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-xs font-semibold uppercase text-muted-foreground">Your syllabus</p><h2 className="mt-1 font-display text-2xl font-bold">Choose a mission</h2></div><div className="relative w-full lg:w-72"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search a concept" className="h-10 w-full rounded-md border border-input bg-surface pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></div></div>
      <div className="scrollbar-none mt-5 flex gap-2 overflow-x-auto pb-2">{units.map((u)=><Button key={u} variant={filter === u ? "default" : "outline"} size="sm" onClick={()=>setFilter(u)}>{u}</Button>)}</div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filtered.map((lesson)=>{
        const done=progress.completed.includes(lesson.id); const available=lesson.id <= progress.completed.length + 1 || done;
        return <button key={lesson.id} onClick={()=>onOpen(lesson.id)} className={cn("mission-card group relative flex min-h-48 flex-col overflow-hidden rounded-lg border p-5 text-left transition", done ? "border-success/40" : "border-border", !available && "opacity-65")}>
          <div className="flex items-start justify-between"><span className={cn("grid size-10 place-items-center rounded-md font-mono text-sm font-bold", done ? "bg-success/15 text-success" : "bg-primary/15 text-primary")}>{done ? <Check className="size-5"/> : String(lesson.id).padStart(2,"0")}</span><span className="flex items-center gap-1 text-[11px] text-muted-foreground">{available ? <><Star className="size-3"/>100 XP</> : <><LockKeyhole className="size-3"/>Locked</>}</span></div>
          <div className="mt-5"><p className="text-[11px] font-semibold uppercase text-primary">{lesson.unit} · {lesson.difficulty}</p><h3 className="mt-1.5 font-display text-lg font-bold">{lesson.shortTitle}</h3><p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">{lesson.concept}</p></div>
          <div className="mt-auto flex items-center justify-between pt-5 text-xs text-muted-foreground"><span>{lesson.minutes} min</span><span className="flex items-center gap-1 font-semibold text-foreground">Play <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-1"/></span></div>
        </button>})}</div>
      {filtered.length===0 && <div className="py-20 text-center text-muted-foreground">No missions match that search.</div>}
    </section>
  </main>;
}

function LessonPlayer({ lesson, completed, onBack, onComplete, onNext }: { lesson: Lesson; completed: boolean; onBack: () => void; onComplete: () => void; onNext: () => void }) {
  const [line, setLine] = useState(0); const [phase, setPhase] = useState<"learn"|"challenge"|"result">("learn"); const [selected, setSelected] = useState<string | null>(null);
  useEffect(()=>{ setLine(0); setPhase("learn"); setSelected(null); },[lesson.id]);
  const correct=selected===lesson.output;
  const answer=(option:string)=>{ if(selected) return; setSelected(option); setPhase("result"); if(option===lesson.output) onComplete(); };
  return <main className="mx-auto max-w-[1500px] px-4 pb-28 pt-5 sm:px-6 lg:px-8">
    <div className="mb-5 flex items-center gap-3"><Button variant="ghost" size="icon" onClick={onBack} aria-label="Back to quest map"><ChevronLeft/></Button><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3 text-[11px] font-bold uppercase text-muted-foreground"><span className="truncate">Mission {lesson.id} · {lesson.unit}</span><span>{phase==="learn" ? `${line+1}/${lesson.code.length}` : "Final challenge"}</span></div><Progress value={phase==="learn" ? ((line+1)/lesson.code.length)*78 : 100} className="mt-2"/></div></div>
    <div className="mb-6"><div className="flex flex-wrap items-center gap-2"><span className="rounded-md bg-primary/15 px-2 py-1 text-xs font-bold text-primary">{lesson.difficulty}</span><span className="text-xs text-muted-foreground">{lesson.minutes} min · 100 XP</span>{completed&&<span className="flex items-center gap-1 text-xs font-bold text-success"><Check className="size-3.5"/>Cleared</span>}</div><h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">{lesson.shortTitle}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{lesson.aim}</p></div>
    {phase==="learn" ? <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,.8fr)]">
      <section className="overflow-hidden rounded-lg border border-border bg-code"><div className="flex items-center justify-between border-b border-code-border px-4 py-3"><span className="flex items-center gap-2 font-mono text-xs text-code-muted"><Code2 className="size-4"/> mission_{lesson.id}.c</span><span className="text-[10px] uppercase text-code-muted">tap any line</span></div><div className="overflow-x-auto py-3 font-mono text-[13px] leading-7 sm:text-sm">{lesson.code.map((code,i)=><button key={`${code}-${i}`} onClick={()=>setLine(i)} className={cn("code-line flex w-full min-w-max items-center border-l-2 pr-8 text-left",i===line?"border-primary bg-primary/12":"border-transparent hover:bg-code-hover")}><span className="w-11 shrink-0 select-none pr-3 text-right text-code-muted">{i+1}</span><span className={i===line?"text-code-active":"text-code-text"}>{code}</span>{i===line&&<span className="ml-5 inline-flex items-center gap-1 rounded bg-primary/20 px-1.5 text-[10px] font-sans font-bold text-primary"><Zap className="size-3"/>NOW</span>}</button>)}</div></section>
      <aside className="space-y-4"><div className="rounded-lg border border-primary/30 bg-primary/8 p-5"><div className="flex items-center gap-2 text-xs font-bold uppercase text-primary"><Lightbulb className="size-4"/> Line {line+1} decoded</div><p className="mt-3 text-base font-semibold leading-6">{lesson.explanations[line]}</p><p className="mt-3 text-xs leading-5 text-muted-foreground">Follow the active highlight. The program has reached this exact instruction.</p></div>
        <div className="rounded-lg border border-border bg-surface p-5"><div className="flex items-center justify-between"><h2 className="font-display font-bold">Memory snapshot</h2><span className="live-dot text-[10px] font-bold uppercase text-success">Live</span></div><div className="mt-4 grid gap-2">{lesson.memory.map((m,i)=><div key={m.label} className={cn("memory-row flex items-center justify-between rounded-md border p-3",`memory-${m.tone}`,i===line%lesson.memory.length&&"is-active")}><span className="font-mono text-xs text-muted-foreground">{m.label}</span><span className="font-mono text-sm font-bold">{m.value}</span></div>)}</div></div>
        <div className="rounded-lg border border-border bg-terminal p-4 font-mono"><div className="mb-3 flex gap-1.5"><span className="size-2 rounded-full bg-danger"/><span className="size-2 rounded-full bg-reward"/><span className="size-2 rounded-full bg-success"/></div><p className="text-[11px] text-terminal-muted">$ gcc mission_{lesson.id}.c && ./a.out</p><p className="mt-2 text-sm text-terminal-text">{line===lesson.code.length-1 ? lesson.output : <span className="animate-pulse">▌</span>}</p></div>
      </aside>
    </div> : <Challenge lesson={lesson} selected={selected} correct={correct} onAnswer={answer} onRetry={()=>{setSelected(null);setPhase("challenge")}} onNext={onNext}/>} 
    {phase==="learn"&&<div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-background/90 px-4 py-3 backdrop-blur-xl md:bottom-0"><div className="mx-auto flex max-w-[1500px] items-center justify-between"><Button variant="outline" onClick={()=>setLine(Math.max(0,line-1))} disabled={line===0}><ChevronLeft/> Previous</Button><span className="hidden text-xs text-muted-foreground sm:block">Inspect every line, then prove it.</span>{line<lesson.code.length-1?<Button onClick={()=>setLine(line+1)}>Next line <ChevronRight/></Button>:<Button onClick={()=>setPhase("challenge")}><Sparkles/> Start challenge</Button>}</div></div>}
  </main>;
}

function Challenge({lesson,selected,correct,onAnswer,onRetry,onNext}:{lesson:Lesson;selected:string|null;correct:boolean;onAnswer:(x:string)=>void;onRetry:()=>void;onNext:()=>void}) {
  return <section className="mx-auto max-w-3xl rounded-lg border border-border bg-surface p-5 sm:p-8"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-lg bg-reward/15 text-reward"><CircleHelp/></span><div><p className="text-xs font-bold uppercase text-reward">Predict the output</p><h2 className="font-display text-xl font-bold">What does this program produce?</h2></div></div><div className="mt-6 grid gap-3 sm:grid-cols-2">{lesson.options.map(option=><Button key={option} variant="outline" onClick={()=>onAnswer(option)} disabled={!!selected} className={cn("h-auto min-h-14 justify-start whitespace-normal px-4 py-3 text-left font-mono",selected===option&&(option===lesson.output?"border-success bg-success/10 text-success":"border-danger bg-danger/10 text-danger"),selected&&option===lesson.output&&"border-success bg-success/10 text-success")}>{selected&&option===lesson.output?<Check/>:selected===option?<X/>:<span className="size-4 rounded-full border border-current"/>}{option}</Button>)}</div>{selected&&<div className={cn("mt-6 rounded-lg border p-5",correct?"border-success/40 bg-success/10":"border-danger/40 bg-danger/10")}><div className="flex items-start gap-3">{correct?<Trophy className="mt-0.5 text-success"/>:<RotateCcw className="mt-0.5 text-danger"/>}<div><h3 className="font-display text-lg font-bold">{correct?"Brilliant — +100 XP":"Not quite. Trace it once more."}</h3><p className="mt-1 text-sm text-muted-foreground">Expected result: <code className="text-foreground">{lesson.output}</code></p></div></div><div className="mt-4 flex justify-end">{correct?<Button onClick={onNext}>Next mission <ChevronRight/></Button>:<Button onClick={onRetry}>Try again</Button>}</div></div>}</section>;
}

function VivaArena({onBack}:{onBack:()=>void}) { const [index,setIndex]=useState(0); const [revealed,setRevealed]=useState(false); const qa=viva[index]; return <main className="mx-auto flex max-w-4xl flex-col px-4 pb-28 pt-8 sm:px-6"><Button variant="ghost" className="self-start" onClick={onBack}><ChevronLeft/>Quest map</Button><div className="mt-8 text-center"><span className="mx-auto grid size-14 place-items-center rounded-lg bg-accent text-accent-foreground"><Brain/></span><p className="mt-5 text-xs font-bold uppercase text-primary">Rapid recall</p><h1 className="mt-2 font-display text-4xl font-bold">Viva Arena</h1><p className="mt-3 text-muted-foreground">Eight essential questions adapted from your lab manual.</p></div><div className="mt-8 min-h-72 rounded-lg border border-border bg-surface p-6 sm:p-10"><div className="flex justify-between text-xs text-muted-foreground"><span>Question {index+1} of {viva.length}</span><span>Tap to reveal</span></div><h2 className="mt-8 font-display text-2xl font-bold leading-snug">{qa[0]}</h2>{revealed?<div className="mt-8 border-l-2 border-success pl-5"><p className="text-xs font-bold uppercase text-success">Answer</p><p className="mt-2 text-lg leading-7">{qa[1]}</p></div>:<Button className="mt-10" onClick={()=>setRevealed(true)}><Lightbulb/>Reveal answer</Button>}</div><div className="mt-4 flex justify-between"><Button variant="outline" disabled={index===0} onClick={()=>{setIndex(index-1);setRevealed(false)}}><ChevronLeft/>Previous</Button><Button disabled={index===viva.length-1} onClick={()=>{setIndex(index+1);setRevealed(false)}}>Next<ChevronRight/></Button></div></main> }

function MobileNav({view,onHome,onViva}:{view:View;onHome:()=>void;onViva:()=>void}) { return <nav className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-2 border-t border-border bg-background/95 backdrop-blur md:hidden"><Button variant="ghost" className={cn("h-full rounded-none flex-col gap-1 text-[10px]",view==="map"&&"text-primary")} onClick={onHome}><Home/>Missions</Button><Button variant="ghost" className={cn("h-full rounded-none flex-col gap-1 text-[10px]",view==="viva"&&"text-primary")} onClick={onViva}><Brain/>Viva</Button></nav> }
