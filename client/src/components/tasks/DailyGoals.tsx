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
import { formatDate, isOverdue, isToday, isTaskOnDate, isTaskCompletedOnDate, toInputDate } from "@/lib/date";
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

  const isDateFilter = !["today", "upcoming", "some-time"].includes(rawFilter);
  const filter = isDateFilter ? "date" : rawFilter;

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = [task.title, task.category, task.description].join(" ").toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (activeCategory !== "All") {
      const taskCategory = (task.category || "Personal").toLowerCase();
      if (taskCategory !== activeCategory.toLowerCase()) return false;
    }

    if (filter === "today") return isTaskOnDate(task, new Date());
    if (filter === "upcoming") {
      if (!task.dueDate) return false;
      if (task.recurrence && task.recurrence !== "none") {
        if (task.deadline) {
          const dl = new Date(task.deadline);
          dl.setHours(23, 59, 59, 999);
          return dl > new Date();
        }
        return true;
      }
      return new Date(task.dueDate) > new Date() && !isToday(task.dueDate);
    }
    if (filter === "some-time") return (!task.dueDate && !task.completed) || (task.dueDate ? (isOverdue(task.dueDate) && !isTaskOnDate(task, new Date()) && !task.completed) : false);
    if (filter === "date") {
      return isTaskOnDate(task, new Date(rawFilter));
    }
    return true;
  });

  return filteredTasks.sort((a, b) => {
    const aCompleted = isTaskCompletedOnDate(a, filter === "date" ? rawFilter : new Date());
    const bCompleted = isTaskCompletedOnDate(b, filter === "date" ? rawFilter : new Date());
    if (aCompleted && !bCompleted) return 1;
    if (!aCompleted && bCompleted) return -1;
    return 0;
  });
}

function TaskRow({ task }: { task: Task }) {
  const updateTask = useLockedInStore((state) => state.updateTask);
  const deleteTask = useLockedInStore((state) => state.deleteTask);
  const setModal = useLockedInStore((state) => state.setModal);
  const taskFilter = useLockedInStore((state) => state.taskFilter);
  
  const isDateFilter = !["today", "upcoming", "some-time"].includes(taskFilter);
  const activeDate = isDateFilter ? new Date(taskFilter) : new Date();
  const activeDateStr = toInputDate(activeDate);

  const isCompleted = isTaskCompletedOnDate(task, activeDate);

  const handleToggle = () => {
    if (task.recurrence && task.recurrence !== "none") {
      const dates = new Set(task.completedDates || []);
      if (isCompleted) {
        dates.delete(activeDateStr);
      } else {
        dates.add(activeDateStr);
      }
      updateTask(task.id, { completedDates: Array.from(dates) }, { silent: true });
    } else {
      updateTask(task.id, { completed: !task.completed }, { silent: true });
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/[0.035] p-3"
    >
      <Checkbox checked={isCompleted} onCheckedChange={handleToggle} />
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm font-semibold", isCompleted && "text-muted-foreground line-through")}>{task.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {task.category} {task.dueDate ? `/ ${formatDate(task.dueDate)}` : "/ Someday"}
          {task.deadline ? ` / Till ${formatDate(task.deadline)}` : ""}
          {task.recurrence && task.recurrence !== "none" ? ` / ${task.recurrence}` : ""}
        </p>
      </div>

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
    <div className="space-y-3 max-h-64 overflow-y-auto pr-2 visible-scrollbar">
      <AnimatePresence>
        {tasks.map((task) => <TaskRow key={task.id} task={task} />)}
      </AnimatePresence>
    </div>
  );
}

function KanbanView({ tasks, interactive = false }: { tasks: Task[]; interactive?: boolean }) {
  const updateTask = useLockedInStore((state) => state.updateTask);
  const taskFilter = useLockedInStore((state) => state.taskFilter);
  const isDateFilter = !["today", "upcoming", "some-time"].includes(taskFilter);
  const activeDate = isDateFilter ? new Date(taskFilter) : new Date();
  const activeDateStr = toInputDate(activeDate);

  const columns: Array<[TaskStatus, string]> = [["todo", "To do"], ["done", "Done"]];
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {columns.map(([status, label]) => (
        <div key={status} className="rounded-xl border border-white/8 bg-white/[0.025] p-3">
          <p className="mb-3 text-sm font-semibold">{label}</p>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2 visible-scrollbar">
            {tasks.filter((task) => {
              const isCompleted = isTaskCompletedOnDate(task, activeDate);
              return (status === "todo" && !isCompleted) || (status === "done" && isCompleted);
            }).map((task) => {
              const isCompleted = isTaskCompletedOnDate(task, activeDate);
              return (
              interactive ? (
                <button
                  key={task.id}
                  onClick={() => {
                    if (task.recurrence && task.recurrence !== "none") {
                      const dates = new Set(task.completedDates || []);
                      if (isCompleted) {
                        dates.delete(activeDateStr);
                      } else {
                        dates.add(activeDateStr);
                      }
                      updateTask(task.id, { completedDates: Array.from(dates) });
                    } else {
                      const newStatus: TaskStatus = status === "done" ? "todo" : "done";
                      updateTask(task.id, { status: newStatus, completed: newStatus === "done" });
                    }
                  }}
                  className="w-full rounded-lg border border-white/8 bg-white/[0.04] p-3 text-left"
                >
                  <p className="text-sm font-semibold">{task.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{task.dueDate ? formatDate(task.dueDate) : "Someday"} / {task.category}</p>
                </button>
              ) : (
                <div key={task.id} className="w-full rounded-lg border border-white/8 bg-white/[0.02] p-3 text-left opacity-80 cursor-default">
                  <p className="text-sm font-semibold">{task.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{task.dueDate ? formatDate(task.dueDate) : "Someday"} / {task.category}</p>
                </div>
              )
            ); })}
          </div>
        </div>
      ))}
    </div>
  );
}




export function DailyGoals() {
  const [activeCategory, setActiveCategory] = useState<"All" | "Personal" | "Routine">("All");
  const tasks = useFilteredTasks(activeCategory);
  const allTasks = useLockedInStore((state) => state.tasks);
  const search = useDebounce(useLockedInStore((state) => state.search));

  // Kanban should show all matching tasks (by search/category), not be restricted by the date filter
  const kanbanTasks = allTasks.filter((task) => {
    const matchesSearch = [task.title, task.category, task.description].join(" ").toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (activeCategory !== "All") {
      const taskCategory = (task.category || "Personal").toLowerCase();
      if (taskCategory !== activeCategory.toLowerCase()) return false;
    }
    return true;
  });
  
  const taskView = useLockedInStore((state) => state.taskView);
  const activeTaskView = taskView === "calendar" ? "list" : taskView;
  const isKanban = activeTaskView === "kanban";
  const setTaskView = useLockedInStore((state) => state.setTaskView);
  const rawFilter = useLockedInStore((state) => state.taskFilter);
  const setTaskFilter = useLockedInStore((state) => state.setTaskFilter);
  const setModal = useLockedInStore((state) => state.setModal);
  const updateTask = useLockedInStore((state) => state.updateTask);

  const isDateFilter = !["today", "upcoming", "some-time"].includes(rawFilter);
  const activeFilter = rawFilter;
  const activeDate = isDateFilter ? new Date(rawFilter) : new Date();

  const rollOverTodayTasks = () => {
    const todayUncompleted = tasks.filter(t => !isTaskCompletedOnDate(t, activeDate));
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString();
    
    todayUncompleted.forEach(task => {
      updateTask(task.id, { dueDate: tomorrowStr });
    });
  };
  

  const completed = tasks.filter((task) => isTaskCompletedOnDate(task, activeDate)).length;
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
                <TabsList className={cn("flex bg-white/5 border border-white/8 p-1", isKanban ? "opacity-50 pointer-events-none" : "") }>
                  {filters.map(([id, label]) => (
                    <TabsTrigger key={id} value={id} disabled={isKanban}>
                      {label}
                    </TabsTrigger>
                  ))}
                  {isDateFilter && (
                    <TabsTrigger value={rawFilter} disabled={isKanban}>
                      {new Date(rawFilter).toLocaleDateString("en", { month: "short", day: "numeric" })}
                    </TabsTrigger>
                  )}
                </TabsList>
              </Tabs>
              
              <div className={cn("flex items-center gap-2 border-l border-white/8 pl-4", isKanban ? "opacity-50 pointer-events-none" : "")}>
                <button
                  onClick={() => setActiveCategory("All")}
                  disabled={isKanban}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-semibold border transition-all duration-200",
                    activeCategory === "All"
                      ? "bg-primary/15 border-primary/40 text-primary shadow-[0_0_12px_rgba(255,255,255,0.05)]"
                      : "bg-white/[0.03] border-white/8 text-muted-foreground hover:bg-white/[0.06] hover:text-foreground",
                    isKanban ? "opacity-50 pointer-events-none" : ""
                  )}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveCategory("Personal")}
                  disabled={isKanban}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-semibold border transition-all duration-200",
                    activeCategory === "Personal"
                      ? "bg-primary/15 border-primary/40 text-primary shadow-[0_0_12px_rgba(255,255,255,0.05)]"
                      : "bg-white/[0.03] border-white/8 text-muted-foreground hover:bg-white/[0.06] hover:text-foreground",
                    isKanban ? "opacity-50 pointer-events-none" : ""
                  )}
                >
                  Personal
                </button>
                <button
                  onClick={() => setActiveCategory("Routine")}
                  disabled={isKanban}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-semibold border transition-all duration-200",
                    activeCategory === "Routine"
                      ? "bg-primary/15 border-primary/40 text-primary shadow-[0_0_12px_rgba(255,255,255,0.05)]"
                      : "bg-white/[0.03] border-white/8 text-muted-foreground hover:bg-white/[0.06] hover:text-foreground",
                    isKanban ? "opacity-50 pointer-events-none" : ""
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
                  disabled={activeTaskView === "kanban"}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-semibold border border-primary/25 text-primary hover:bg-primary/10 hover:border-primary/40 transition-all duration-200 shadow-[0_0_12px_rgba(var(--primary-rgb),0.02)]",
                    activeTaskView === "kanban" ? "opacity-50 pointer-events-none" : ""
                  )}
                >
                  Move undone to tomorrow
                </Button>
              )}
            </div>

            {/* Right: Inline Sleek Progress Bar & Plus Button */}
              <div className={cn("flex items-center gap-3", isKanban ? "opacity-50 pointer-events-none" : "")}>
              <div className="flex min-w-[220px] flex-col gap-1.5 lg:w-72">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground capitalize">
                    {activeFilter === "some-time" ? "Progress" : isDateFilter ? `${new Date(rawFilter).toLocaleDateString("en", { month: "short", day: "numeric" })} Progress` : `${activeFilter} Progress`}
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
                disabled={isKanban}
                className={cn("shrink-0", isKanban ? "opacity-50 pointer-events-none" : "")}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {activeTaskView === "list" && <ListView tasks={tasks} />}
          {activeTaskView === "kanban" && <KanbanView tasks={kanbanTasks} />}
        </CardContent>
      </Card>
    </section>
  );
}
