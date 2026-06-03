import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import * as React from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAutosaveDraft } from "@/hooks/useAutosaveDraft";
import { useLockedInStore } from "@/store/useLockedInStore";
import { toInputDate } from "@/lib/date";
import type { Task } from "@/types";

const schema = z.object({
  title: z.string().min(2),
  description: z.string(),
  category: z.string().min(1),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.string().optional().or(z.literal("")),
  deadline: z.string().optional(),
  schedule: z.enum(["today", "tomorrow", "future", "weekend", "recurring"]),
  recurrence: z.enum(["none", "daily", "weekly", "monthly"]),
  doItSomeday: z.boolean().default(false)
});

type Values = z.infer<typeof schema>;

const defaults: Values = {
  title: "",
  description: "",
  category: "Personal",
  priority: "medium",
  dueDate: toInputDate(new Date()),
  deadline: "",
  schedule: "today",
  recurrence: "none"
  ,
  doItSomeday: false
};

export function TaskForm({ task }: { task?: Task }) {
  const addTask = useLockedInStore((state) => state.addTask);
  const updateTask = useLockedInStore((state) => state.updateTask);
  const pushToast = useLockedInStore((state) => state.pushToast);
  const setModal = useLockedInStore((state) => state.setModal);
  const categories = useLockedInStore((state) => state.settings.categories);
  const { draft, setDraft, clearDraft } = useAutosaveDraft<Values>("lockedin.task-draft", defaults);
  
  // Force correct defaults on each modal mount, overriding any outdated localStorage drafts
  const normalizedDraft: Values = {
    ...draft,
    category: categories[0] ?? "Personal",
    recurrence: "none",
    dueDate: toInputDate(new Date())
  };
  
  const form = useForm<Values>({
    resolver: zodResolver(schema) as Resolver<Values>,
    defaultValues: task
      ? {
          title: task.title,
          description: task.description,
          category: task.category,
          priority: task.priority,
          dueDate: task.dueDate ? toInputDate(new Date(task.dueDate)) : "",
          deadline: task.deadline ? toInputDate(new Date(task.deadline)) : "",
          schedule: task.schedule,
          recurrence: task.recurrence,
          doItSomeday: false
        }
      : normalizedDraft
  });
  const watched = useWatch({ control: form.control });

  useEffect(() => setDraft({ ...defaults, ...watched }), [setDraft, watched]);

  const titleRef = React.useRef<HTMLInputElement | null>(null);

  // Auto-focus & select title when creating a new task
  useEffect(() => {
    if (!task) {
      const id = setTimeout(() => {
        if (titleRef.current) {
          titleRef.current.focus();
          titleRef.current.select();
        }
      }, 50);
      return () => clearTimeout(id);
    }
  }, [task]);

  const onSubmit = async (values: Values) => {
    if (values.category === "Routine" && values.recurrence === "none") {
      pushToast({
        title: "Recurrence Required",
        description: "You have to set a daily, weekly, or monthly recurrence for a Routine task.",
        tone: "error"
      });
      return;
    }

    const taskData = {
      ...values,
      dueDate: values.doItSomeday ? undefined : (values.dueDate ? new Date(values.dueDate).toISOString() : new Date().toISOString()),
      deadline: values.deadline ? new Date(values.deadline).toISOString() : undefined,
    };

    if (task) {
      await updateTask(task.id, taskData);
    } else {
      await addTask({
        ...taskData,
        status: "todo",
        completed: false
      });
    }
    clearDraft();
    setModal(null);
  };

  const titleRegister = form.register("title");
  const doItSomedayRegister = form.register("doItSomeday");

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
      <Input
        placeholder="Task title"
        {...titleRegister}
        ref={(el) => {
          titleRegister.ref(el);
          titleRef.current = el;
        }}
      />
      <div className="flex items-center gap-2">
        <input type="checkbox" id="doItSomeday" {...doItSomedayRegister} className="h-4 w-4" />
        <label htmlFor="doItSomeday" className="text-sm text-muted-foreground">Do it someday</label>
      </div>
      <Input placeholder="Description" {...form.register("description")} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Select {...form.register("category")}>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </Select>
        <Select {...form.register("recurrence")}>
          <option value="none">No recurrence</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </Select>
        <div>
          <label className="mb-2 block text-xs font-medium text-muted-foreground">Date of doing</label>
          <Input type="date" {...form.register("dueDate")} />
        </div>
        <div>
          <label className="mb-2 block text-xs font-medium text-muted-foreground">Deadline, if any</label>
          <Input type="date" {...form.register("deadline")} />
        </div>
        
        {/* Hidden inputs to preserve default form state and Zod validation */}
        <input type="hidden" {...form.register("priority")} />
        <input type="hidden" {...form.register("schedule")} />
      </div>
      {form.formState.errors.title && <p className="text-xs text-red-300">Add a task title.</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
        <Button type="submit">{task ? "Save changes" : "Create task"}</Button>
      </div>
    </form>
  );
}
