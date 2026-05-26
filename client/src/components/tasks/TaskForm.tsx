import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAutosaveDraft } from "@/hooks/useAutosaveDraft";
import { useLockedInStore } from "@/store/useLockedInStore";
import { toInputDate } from "@/lib/date";

const schema = z.object({
  title: z.string().min(2),
  description: z.string(),
  category: z.string().min(1),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.string().min(1),
  schedule: z.enum(["today", "tomorrow", "future", "weekend", "recurring"]),
  recurrence: z.enum(["none", "daily", "weekly", "monthly"]),
  reminderAt: z.string().optional(),
  notes: z.string()
});

type Values = z.infer<typeof schema>;

const defaults: Values = {
  title: "",
  description: "",
  category: "DSA",
  priority: "medium",
  dueDate: toInputDate(new Date()),
  schedule: "today",
  recurrence: "none",
  reminderAt: "",
  notes: ""
};

export function TaskForm() {
  const addTask = useLockedInStore((state) => state.addTask);
  const setModal = useLockedInStore((state) => state.setModal);
  const categories = useLockedInStore((state) => state.settings.categories);
  const { draft, setDraft, clearDraft } = useAutosaveDraft<Values>("lockedin.task-draft", defaults);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: draft });
  const watched = useWatch({ control: form.control });

  useEffect(() => setDraft({ ...defaults, ...watched }), [setDraft, watched]);

  const onSubmit = async (values: Values) => {
    await addTask({
      ...values,
      dueDate: new Date(values.dueDate).toISOString(),
      reminderAt: values.reminderAt ? new Date(values.reminderAt).toISOString() : undefined,
      status: "todo",
      completed: false
    });
    clearDraft();
    setModal(null);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
      <Input placeholder="Task title" {...form.register("title")} />
      <Textarea placeholder="Description" {...form.register("description")} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Select {...form.register("category")}>
          {categories.map((category) => <option key={category}>{category}</option>)}
        </Select>
        <Select {...form.register("priority")}>
          <option value="low">Low priority</option>
          <option value="medium">Medium priority</option>
          <option value="high">High priority</option>
        </Select>
        <Input type="date" {...form.register("dueDate")} />
        <Select {...form.register("schedule")}>
          <option value="today">Today</option>
          <option value="tomorrow">Tomorrow</option>
          <option value="future">Specific future date</option>
          <option value="weekend">Weekend</option>
          <option value="recurring">Recurring schedule</option>
        </Select>
        <Select {...form.register("recurrence")}>
          <option value="none">No recurrence</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </Select>
        <Input type="datetime-local" {...form.register("reminderAt")} />
      </div>
      <Textarea placeholder="Notes" {...form.register("notes")} />
      {form.formState.errors.title && <p className="text-xs text-red-300">Add a task title.</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
        <Button type="submit">Create task</Button>
      </div>
    </form>
  );
}
