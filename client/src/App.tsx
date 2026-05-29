import { useEffect } from "react";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { SummaryDashboard } from "@/components/dashboard/SummaryDashboard";
import { AppShell } from "@/components/layout/AppShell";
import { PlacementForm } from "@/components/placements/PlacementForm";
import { PlacementTracker } from "@/components/placements/PlacementTracker";
import { DailyGoals } from "@/components/tasks/DailyGoals";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { ToastViewport } from "@/components/ui/toast";
import { WorkspaceGenerator } from "@/components/workspaces/WorkspaceGenerator";
import { WorkspaceModalForm } from "@/components/workspaces/WorkspaceModalForm";
import { WorkspaceRenderer } from "@/components/workspaces/WorkspaceRenderer";
import { useBrowserReminders } from "@/hooks/useBrowserReminders";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { useLockedInStore } from "@/store/useLockedInStore";

export function App() {
  const user = useLockedInStore((state) => state.user);
  const bootstrap = useLockedInStore((state) => state.bootstrap);
  const isBootstrapping = useLockedInStore((state) => state.isBootstrapping);
  const activeTab = useLockedInStore((state) => state.activeTab);
  const modal = useLockedInStore((state) => state.modal);
  const setModal = useLockedInStore((state) => state.setModal);
  const tasks = useLockedInStore((state) => state.tasks);
  const settings = useLockedInStore((state) => state.settings);
  const workspaces = useLockedInStore((state) => state.workspaces);
  const activeWorkspace = activeTab.startsWith("workspace:")
    ? workspaces.find((workspace) => activeTab === `workspace:${workspace.id}`)
    : null;

  useOfflineStatus();
  useBrowserReminders(tasks, settings.browserReminders);

  useEffect(() => {
    void bootstrap();
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, [bootstrap]);

  if (isBootstrapping) {
    return (
      <main className="grid min-h-screen place-items-center bg-background p-6">
        <div className="w-full max-w-lg space-y-4">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <>
        <AuthScreen />
        <ToastViewport />
      </>
    );
  }

  return (
    <>
      <AppShell>
        <SummaryDashboard />
        {activeTab === "daily-goals" && <DailyGoals />}
        {activeTab === "placement-tracker" && <PlacementTracker />}
        {activeTab === "workspace-generator" && <WorkspaceGenerator />}
        {activeWorkspace && <WorkspaceRenderer workspace={activeWorkspace} />}
      </AppShell>
      <Modal open={modal === "task"} title="Quick add task" onClose={() => setModal(null)}>
        <TaskForm />
      </Modal>
      <Modal
        open={Boolean(
          modal &&
          typeof modal === "object" &&
          modal.type === "edit-task"
        )}
        title="Edit task"
        onClose={() => setModal(null)}
      >
        {modal &&
          typeof modal === "object" &&
          modal.type === "edit-task" && (
            <TaskForm
              task={modal.task}
            />
        )}
      </Modal>
      <Modal open={modal === "placement"} title="Add company application" onClose={() => setModal(null)}>
        <PlacementForm />
      </Modal>
      <Modal
        open={Boolean(
          modal &&
          typeof modal === "object" &&
          modal.type === "edit-placement"
        )}
        title="Edit company application"
        onClose={() => setModal(null)}
      >
        {modal &&
          typeof modal === "object" &&
          modal.type === "edit-placement" && (
            <PlacementForm
              placement={modal.placement}
            />
        )}
      </Modal>
      <ToastViewport />
    </>
  );
}
