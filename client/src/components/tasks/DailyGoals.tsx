import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, CheckCircle2, Columns3, ListChecks, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebounce } from "@/hooks/useDebounce";
import { useLockedInStore } from "@/store/useLockedInStore";
import type { Task, TaskStatus } from "@/types";
import { formatDate, isOverdue, isToday } from "@/lib/date";
import { cn } from "@/lib/utils";

const filters = [
  ["today", "Today"],
  ["upcoming", "Upcoming"],
  ["overdue", "Overdue"],
  ["completed", "Completed"],
  ["high", "High Priority"],
  ["all", "All"]
] as const;

function useFilteredTasks() {
  const tasks = useLockedInStore((state) => state.tasks);
  const filter = useLockedInStore((state) => state.taskFilter);
  const search = useDebounce(useLockedInStore((state) => state.search));

  return tasks.filter((task) => {
    const matchesSearch = [task.title, task.category, task.description].join(" ").toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === "today") return isToday(task.dueDate);
    if (filter === "upcoming") return new Date(task.dueDate) >= new Date() && !task.completed;
    if (filter === "overdue") return isOverdue(task.dueDate) && !task.completed;
    if (filter === "completed") return task.completed;
    if (filter === "high") return task.priority === "high";
    return true;
  });
}

function TaskRow({ task }: { task: Task }) {
  const updateTask = useLockedInStore((state) => state.updateTask);
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
      <span className={cn("rounded-md px-2 py-1 text-xs capitalize", task.priority === "high" ? "bg-red-400/10 text-red-300" : "bg-white/8 text-muted-foreground")}>
        {task.priority}
      </span>
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

function CalendarView({ tasks }: { tasks: Task[] }) {
  const days = [...new Map(tasks.map((task) => [formatDate(task.dueDate), task.dueDate])).entries()];
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {days.map(([label, date]) => (
        <div key={label} className="rounded-xl border border-white/8 bg-white/[0.035] p-4">
          <p className="mb-3 text-sm font-semibold">{label}</p>
          <div className="space-y-2">
            {tasks.filter((task) => formatDate(task.dueDate) === formatDate(date)).map((task) => (
              <div key={task.id} className="rounded-lg bg-white/[0.05] p-2 text-sm">{task.title}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function DailyGoals() {
  const tasks = useFilteredTasks();
  const taskView = useLockedInStore((state) => state.taskView);
  const setTaskView = useLockedInStore((state) => state.setTaskView);
  const taskFilter = useLockedInStore((state) => state.taskFilter);
  const setTaskFilter = useLockedInStore((state) => state.setTaskFilter);
  const categories = useLockedInStore((state) => state.settings.categories);
  const completed = tasks.filter((task) => task.completed).length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <section className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Daily command center</CardTitle>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setTaskView("list")}><ListChecks className="h-4 w-4" /> List</Button>
            <Button variant="secondary" size="sm" onClick={() => setTaskView("kanban")}><Columns3 className="h-4 w-4" /> Kanban</Button>
            <Button variant="secondary" size="sm" onClick={() => setTaskView("calendar")}><CalendarDays className="h-4 w-4" /> Calendar</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_15rem]">
            <Tabs value={taskFilter} onValueChange={(value) => setTaskFilter(value as typeof taskFilter)}>
              <TabsList className="flex max-w-full flex-wrap">
                {filters.map(([id, label]) => <TabsTrigger key={id} value={id}>{label}</TabsTrigger>)}
              </TabsList>
            </Tabs>
            <Select onChange={(event) => setTaskFilter(event.target.value ? "all" : taskFilter)} aria-label="Category filter">
              <option value="">Categories</option>
              {categories.map((category) => <option key={category}>{category}</option>)}
            </Select>
          </div>
          <div className="mb-5 rounded-lg border border-white/8 bg-white/[0.035] p-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" /> Completion tracking</span>
              <span>{completed}/{tasks.length} done</span>
            </div>
            <Progress value={progress} />
            <div className="mt-3 flex flex-wrap gap-2">
              {categories.slice(0, 5).map((category) => (
                <span key={category} className="flex items-center gap-1 rounded-md bg-white/8 px-2 py-1 text-xs text-muted-foreground">
                  <Tag className="h-3 w-3" /> {category}
                </span>
              ))}
            </div>
          </div>
          {taskView === "list" && <ListView tasks={tasks} />}
          {taskView === "kanban" && <KanbanView tasks={tasks} />}
          {taskView === "calendar" && <CalendarView tasks={tasks} />}
        </CardContent>
      </Card>
    </section>
  );
}
