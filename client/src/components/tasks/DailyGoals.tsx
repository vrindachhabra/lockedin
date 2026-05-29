import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Columns3, ListChecks, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebounce } from "@/hooks/useDebounce";
import { useLockedInStore } from "@/store/useLockedInStore";
import type { Task, TaskStatus } from "@/types";
import { formatDate, isOverdue, isToday } from "@/lib/date";
import { cn } from "@/lib/utils";

const filters = [
  ["today", "Today"],
  ["upcoming", "Upcoming"],
  ["some-time", "Someday"]
] as const;

function useFilteredTasks(activeCategory: "All" | "Personal" | "Routine") {
  const tasks = useLockedInStore((state) => state.tasks);
  const rawFilter = useLockedInStore((state) => state.taskFilter);
  const search = useDebounce(useLockedInStore((state) => state.search));

  const filter = ["today", "upcoming", "some-time"].includes(rawFilter) ? rawFilter : "today";

  return tasks.filter((task) => {
    const matchesSearch = [task.title, task.category, task.description].join(" ").toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    // Filter by mutually exclusive category filter
    if (activeCategory !== "All") {
      const taskCategory = (task.category || "Personal").toLowerCase();
      if (taskCategory !== activeCategory.toLowerCase()) return false;
    }

    if (filter === "today") return isToday(task.dueDate);
    if (filter === "upcoming") return new Date(task.dueDate) > new Date() && !isToday(task.dueDate);
    if (filter === "some-time") return isOverdue(task.dueDate) && !isToday(task.dueDate) && !task.completed;
    return true;
  });
}

function TaskRow({ task }: { task: Task }) {
  const updateTask = useLockedInStore((state) => state.updateTask);
  const deleteTask = useLockedInStore((state) => state.deleteTask);
  const setModal = useLockedInStore((state) => state.setModal);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/[0.035] p-3"
    >
      <Checkbox checked={task.completed} onCheckedChange={() => updateTask(task.id, { completed: !task.completed })} />
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm font-semibold", task.completed && "text-muted-foreground line-through")}>{task.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {task.category} / Doing {formatDate(task.dueDate)}
          {task.deadline ? ` / Deadline ${formatDate(task.deadline)}` : ""} / {task.recurrence}
        </p>
      </div>
      
      {/* Edit and Delete Buttons on the right-hand side */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          className="rounded-lg border border-white/10 bg-white/[0.04] p-2 text-muted-foreground transition hover:bg-white/[0.08] hover:text-foreground"
          onClick={() =>
            setModal({
              type: "edit-task",
              task
            })
          }
          aria-label="Edit task"
        >
          <Pencil className="h-4 w-4" />
        </button>

        <button
          className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-400 transition hover:bg-red-500/25 hover:text-red-300"
          onClick={() => deleteTask(task.id)}
          aria-label="Delete task"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

function ListView({ tasks }: { tasks: Task[] }) {
  return (
    <div className="space-y-3">
      <AnimatePresence>
        {tasks.map((task) => <TaskRow key={task.id} task={task} />)}
      </AnimatePresence>
    </div>
  );
}

function KanbanView({ tasks }: { tasks: Task[] }) {
  const updateTask = useLockedInStore((state) => state.updateTask);
  const columns: Array<[TaskStatus, string]> = [["todo", "To do"], ["in-progress", "In progress"], ["done", "Done"]];
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {columns.map(([status, label]) => (
        <div key={status} className="rounded-xl border border-white/8 bg-white/[0.025] p-3">
          <p className="mb-3 text-sm font-semibold">{label}</p>
          <div className="space-y-3">
            {tasks.filter((task) => task.status === status || (status === "done" && task.completed)).map((task) => (
              <button
                key={task.id}
                onClick={() => updateTask(task.id, { status: status === "done" ? "todo" : "in-progress", completed: false })}
                className="w-full rounded-lg border border-white/8 bg-white/[0.04] p-3 text-left"
              >
                <p className="text-sm font-semibold">{task.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(task.dueDate)} / {task.category}</p>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}



export function DailyGoals() {
  const [activeCategory, setActiveCategory] = useState<"All" | "Personal" | "Routine">("All");
  const tasks = useFilteredTasks(activeCategory);
  
  const taskView = useLockedInStore((state) => state.taskView);
  const activeTaskView = taskView === "calendar" ? "list" : taskView;
  const setTaskView = useLockedInStore((state) => state.setTaskView);
  const rawFilter = useLockedInStore((state) => state.taskFilter);
  const setTaskFilter = useLockedInStore((state) => state.setTaskFilter);
  const setModal = useLockedInStore((state) => state.setModal);
  const updateTask = useLockedInStore((state) => state.updateTask);

  const rollOverTodayTasks = () => {
    const todayUncompleted = tasks.filter(t => !t.completed);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString();
    
    todayUncompleted.forEach(task => {
      updateTask(task.id, { dueDate: tomorrowStr });
    });
  };
  
  const activeFilter = ["today", "upcoming", "some-time"].includes(rawFilter) ? rawFilter : "today";
  
  const completed = tasks.filter((task) => task.completed).length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <section className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setTaskView("list")}><ListChecks className="h-4 w-4" /> List</Button>
            <Button variant="secondary" size="sm" onClick={() => setTaskView("kanban")}><Columns3 className="h-4 w-4" /> Action Board</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 border-b border-white/8 pb-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Left: Tab selectors & Category Toggles */}
            <div className="flex flex-wrap items-center gap-4">
              <Tabs value={activeFilter} onValueChange={(value) => setTaskFilter(value as any)}>
                <TabsList className="flex bg-white/5 border border-white/8 p-1">
                  {filters.map(([id, label]) => (
                    <TabsTrigger key={id} value={id}>
                      {label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              
              <div className="flex items-center gap-2 border-l border-white/8 pl-4">
                <button
                  onClick={() => setActiveCategory("All")}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-semibold border transition-all duration-200",
                    activeCategory === "All"
                      ? "bg-primary/15 border-primary/40 text-primary shadow-[0_0_12px_rgba(255,255,255,0.05)]"
                      : "bg-white/[0.03] border-white/8 text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
                  )}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveCategory("Personal")}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-semibold border transition-all duration-200",
                    activeCategory === "Personal"
                      ? "bg-primary/15 border-primary/40 text-primary shadow-[0_0_12px_rgba(255,255,255,0.05)]"
                      : "bg-white/[0.03] border-white/8 text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
                  )}
                >
                  Personal
                </button>
                <button
                  onClick={() => setActiveCategory("Routine")}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-semibold border transition-all duration-200",
                    activeCategory === "Routine"
                      ? "bg-primary/15 border-primary/40 text-primary shadow-[0_0_12px_rgba(255,255,255,0.05)]"
                      : "bg-white/[0.03] border-white/8 text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
                  )}
                >
                  Routine
                </button>
              </div>

              {activeFilter === "today" && tasks.some(t => !t.completed) && (
                <Button
                  onClick={rollOverTodayTasks}
                  variant="ghost"
                  size="sm"
                  className="rounded-full px-4 py-1.5 text-xs font-semibold border border-primary/25 text-primary hover:bg-primary/10 hover:border-primary/40 transition-all duration-200 shadow-[0_0_12px_rgba(var(--primary-rgb),0.02)]"
                >
                  Move undone to tomorrow
                </Button>
              )}
            </div>

            {/* Right: Inline Sleek Progress Bar & Plus Button */}
            <div className="flex items-center gap-3">
              <div className="flex min-w-[220px] flex-col gap-1.5 lg:w-72">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground capitalize">
                    {activeFilter === "some-time" ? "Progress" : `${activeFilter} Progress`}
                  </span>
                  <span className="text-foreground font-semibold">{completed}/{tasks.length} done ({progress}%)</span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/5 border border-white/8">
                  <div 
                    className="h-full bg-primary transition-all duration-500 ease-out shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
              </div>
              <Button
                onClick={() => setModal("task")}
                size="icon"
                aria-label="Quick add task"
                className="shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {activeTaskView === "list" && <ListView tasks={tasks} />}
          {activeTaskView === "kanban" && <KanbanView tasks={tasks} />}
        </CardContent>
      </Card>
    </section>
  );
}
