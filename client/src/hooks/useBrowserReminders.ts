import { useEffect } from "react";
import type { Task } from "@/types";

export function useBrowserReminders(tasks: Task[], enabled: boolean) {
  useEffect(() => {
    if (!enabled || !("Notification" in window)) return;

    if (Notification.permission === "default") {
      void Notification.requestPermission();
    }

    const timers = tasks
      .filter((task) => task.reminderAt && !task.completed)
      .map((task) => {
        const ms = new Date(task.reminderAt!).getTime() - Date.now();
        if (ms <= 0 || ms > 1000 * 60 * 60 * 24) return undefined;
        return window.setTimeout(() => {
          if (Notification.permission === "granted") {
            new Notification("LockedIn reminder", { body: task.title });
          }
        }, ms);
      })
      .filter(Boolean);

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [tasks, enabled]);
}
