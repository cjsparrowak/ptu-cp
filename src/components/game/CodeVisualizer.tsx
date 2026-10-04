import { ArrowDown, Box, Braces, CheckCircle2, Cpu, GitBranch, Library, MonitorUp, Play, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { explainLineVisually, type Lesson } from "@/data/curriculum";

const stageIcons = {
  prepare: Library,
  execute: Cpu,
  memory: Box,
  decision: GitBranch,
  output: MonitorUp,
  finish: CheckCircle2,
};

export function CodeVisualizer({ lesson, line }: { lesson: Lesson; line: number }) {
  const visual = explainLineVisually(lesson, line);
  const StageIcon = stageIcons[visual.stage];
  const activeMemory = line % lesson.memory.length;
  const flow = ["Source", "Processor", "Memory", "Output"];
  const activeFlow = visual.stage === "prepare" ? 0 : visual.stage === "output" ? 3 : visual.stage === "memory" ? 2 : 1;

  return (
    <section className="execution-stage overflow-hidden rounded-lg border border-border bg-surface" aria-live="polite">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2"><Play className="size-4 text-success"/><h2 className="font-display text-sm font-bold">Visual execution</h2></div>
        <span className="live-dot text-[10px] font-bold uppercase text-success">Running line {line + 1}</span>
      </div>
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center gap-1">
          {flow.map((item, index) => <div className="contents" key={item}>
            <div className={cn("flow-node grid min-h-16 place-items-center rounded-md border px-1 text-center text-[10px] font-bold sm:text-xs", index === activeFlow ? "is-active border-primary bg-primary/15 text-primary" : "border-border bg-background text-muted-foreground")}>
              {index === 0 ? <Braces/> : index === 1 ? <Cpu/> : index === 2 ? <Box/> : <MonitorUp/>}<span>{item}</span>
            </div>
            {index < flow.length - 1 && <ArrowDown className="size-4 -rotate-90 text-muted-foreground"/>}
          </div>)}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_1.1fr]">
          <div className="rounded-md border border-primary/30 bg-primary/8 p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-primary"><StageIcon className="size-4"/>{visual.action}</div>
            <code className="mt-3 block overflow-x-auto rounded bg-code px-3 py-2 font-mono text-xs text-code-active">{lesson.code[line]}</code>
            <p className="mt-3 text-sm font-semibold leading-5">{visual.purpose}</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Result: {visual.effect}</p>
          </div>
          <div className="memory-scene relative min-h-48 overflow-hidden rounded-md border border-border bg-background p-4">
            <div className="absolute right-3 top-3 flex items-center gap-1 text-[10px] font-bold uppercase text-muted-foreground"><RotateCw className="size-3"/> live state</div>
            <p className="text-xs font-bold uppercase text-muted-foreground">Memory workbench</p>
            <div className="mt-7 flex flex-wrap items-end justify-center gap-4 [perspective:700px]">
              {lesson.memory.map((item, index) => <div key={item.label} className={cn("memory-cube relative flex h-24 w-24 flex-col justify-between rounded-md border p-3 shadow-xl transition-all", index === activeMemory ? "is-active border-reward bg-reward/15" : "border-border bg-surface-raised")}>
                <span className="font-mono text-[10px] text-muted-foreground">{item.label}</span>
                <strong className="break-words font-mono text-xs">{item.value}</strong>
              </div>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}