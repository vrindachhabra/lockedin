import { 
  ArrowUp, 
  Code2, 
  Dumbbell, 
  Rocket, 
  GraduationCap, 
  ClipboardCheck 
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLockedInStore } from "@/store/useLockedInStore";
import { cn } from "@/lib/utils";
import Aurora from "@/components/ui/Aurora";
import StarBorder from "@/components/ui/StarBorder";
import AnimatedList from "@/components/ui/AnimatedList";

const starters = [
  {
    title: "DSA & Coding",
    description: "Track OS/DBMS notes, daily coding questions solved, and graphs revision progress.",
    prompt: "Track my DSA preparation, daily coding questions solved, OS/DBMS/OOP completion, and revision progress.",
    icon: Code2,
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
  },
  {
    title: "Fitness & Gym",
    description: "Build progressive overload tracker, daily calorie log, and weekly consistency streak dashboard.",
    prompt: "Create a gym tracker with workouts, progressive overload, body measurements, weekly consistency, and nutrition notes.",
    icon: Dumbbell,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
  },
  {
    title: "Startup & Product",
    description: "Organize metrics, product roadmap, investor notes, and experiment trackers.",
    prompt: "Build a startup management board for product roadmap, experiments, user feedback, metrics, and investor follow-ups.",
    icon: Rocket,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20"
  },
  {
    title: "Academic Planner",
    description: "Manage semester projects, assignments calendar, study hours, and exam preparations.",
    prompt: "Create a student study planner to track semester subjects, class notes, assignment deadlines, exam calendar, and overall study hours.",
    icon: GraduationCap,
    color: "text-purple-400 bg-purple-500/10 border-purple-500/20"
  },
  {
    title: "Habit Tracker",
    description: "Set daily rituals, morning reviews, water logs, and meditation stats.",
    prompt: "Design a high-fidelity habit board to monitor morning review rituals, daily hydration, meditation logs, and consistency streaks.",
    icon: ClipboardCheck,
    color: "text-rose-400 bg-rose-500/10 border-rose-500/20"
  }
];

export function WorkspaceGenerator() {
  const [prompt, setPrompt] = useState("");
  const generateWorkspace = useLockedInStore((state) => state.generateWorkspace);
  const isLoading = useLockedInStore((state) => state.isLoading);

  const hasContent = prompt.trim().length > 0;

  const handleSubmit = () => {
    if (isLoading || !hasContent) return;
    generateWorkspace(prompt);
  };

  return (
    <section className="relative overflow-hidden w-full min-h-[calc(100vh-73px)] px-6 py-12 flex flex-col items-center justify-center select-none animate-fade-in">
      {/* WebGL Aurora Background Overlay */}
      <div className="absolute inset-0 z-0 opacity-45 pointer-events-none overflow-hidden">
        <Aurora
          colorStops={["#0052D4", "#4364F7", "#6FB1FC"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.3}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
        {/* GPT Header */}
        <div className="flex flex-col items-center text-center mb-4">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-foreground/90 to-muted-foreground/50 bg-clip-text text-transparent">
            What do you want to organize today?
          </h2>
          <p className="text-xs text-muted-foreground/80 mt-1.5 max-w-lg leading-relaxed">
            Describe any routine, dashboard, or database you need. LockedIn AI will immediately generate a schema-backed board with analytics, fields, and custom widgets.
          </p>
        </div>

        <StarBorder
          as="div"
          className="w-full transition-all duration-300 rounded-2xl shadow-[0_12px_40px_-20px_rgba(0,0,0,0.4)] focus-within:shadow-[0_0_25px_rgba(59,130,246,0.15)]"
          contentClassName="relative bg-[#070708]/90 backdrop-blur-xl border border-white/8 focus-within:border-primary/40 rounded-2xl p-4 transition-all duration-300 w-full"
          color="#3B82F6"
          speed="5s"
          thickness={1.5}
        >
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSubmit();
              }
            }}
            className="w-full bg-transparent resize-none border-none outline-none focus:ring-0 placeholder:text-muted-foreground/50 text-sm leading-relaxed h-20 pr-12 scrollbar-none"
            placeholder="Build a tracking board for DSA revision progress..."
          />
          
          <div className="absolute bottom-4 right-4">
            {/* Send/Generate Button */}
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !hasContent}
              size="icon"
              className={cn(
                "h-9 w-9 rounded-xl transition duration-300",
                hasContent
                  ? "bg-primary text-primary-foreground shadow-[0_0_12px_rgba(59,130,246,0.35)] hover:bg-primary/90"
                  : "bg-white/10 text-muted-foreground/50 hover:bg-white/10 cursor-not-allowed border border-white/10"
              )}
              aria-label="Generate workspace"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <ArrowUp className="h-4 w-4 font-bold" />
              )}
            </Button>
          </div>
        </StarBorder>

        {/* Animated Vertical Prompt Starters */}
        <div className="w-full mt-6 select-none">
          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-2 pl-1">
            Or start with a template
          </p>
          
          <AnimatedList
            items={starters}
            onItemSelect={(starter) => setPrompt(starter.prompt)}
            showGradients={true}
            enableArrowNavigation={true}
            displayScrollbar={false}
            className="w-full"
            renderItem={(starter, index, isSelected) => {
              const Icon = starter.icon;
              return (
                <div
                  className={cn(
                    "w-full text-left bg-white/[0.015] border border-white/5 hover:border-white/10 hover:bg-white/[0.03] active:scale-98 transition-all duration-300 rounded-xl p-3 flex items-center justify-between gap-4 select-none group",
                    isSelected && "bg-white/[0.04] border-primary/25 shadow-[0_0_12px_rgba(59,130,246,0.06)]"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn("p-2 rounded-lg border flex-shrink-0 transition duration-300", starter.color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className={cn("font-bold text-[13px] text-foreground transition duration-200", isSelected && "text-primary")}>
                        {starter.title}
                      </p>
                      <p className="text-[11px] leading-normal text-muted-foreground/70 group-hover:text-foreground/90 transition duration-200 truncate mt-0.5 max-w-[28rem] sm:max-w-[32rem]">
                        {starter.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-[10px] text-muted-foreground/40 group-hover:text-primary/70 transition duration-200 pr-1 flex-shrink-0 hidden sm:block">
                    Use template
                  </div>
                </div>
              );
            }}
          />
        </div>
      </div>
    </section>
  );
}
