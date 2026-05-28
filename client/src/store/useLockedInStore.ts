import { create } from "zustand";
import { persist } from "zustand/middleware";
import { seedDashboard } from "@/data/seed";
import { api, authToken } from "@/services/api";
import type {
  Analytics,
  DashboardPayload,
  Placement,
  Settings,
  Task,
  TaskFilter,
  TaskView,
  User,
  WorkspaceConfig,
  WorkspaceSection
} from "@/types";

type Toast = {
  id: string;
  title: string;
  description?: string;
  tone?: "success" | "error" | "info";
};

type ModalType =
  | null
  | "task"
  | "placement"
  | "workspace"
  | {
      type: "edit-placement";
      placement: Placement;
    };
type ActiveTab = "daily-goals" | "placement-tracker" | "workspace-generator" | `workspace:${string}`;

type LockedInState = {
  user: User | null;
  token: string | null;
  isBootstrapping: boolean;
  isLoading: boolean;
  isOnline: boolean;
  activeTab: ActiveTab;
  activeWorkspaceId: string | null;
  taskView: TaskView;
  taskFilter: TaskFilter;
  search: string;
  modal: ModalType;
  toasts: Toast[];
  tasks: Task[];
  placements: Placement[];
  workspaces: WorkspaceConfig[];
  analytics: Analytics;
  settings: Settings;
  bootstrap: () => Promise<void>;
  login: (payload: { email: string; password: string }) => Promise<void>;
  signup: (payload: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  loadDashboard: () => Promise<void>;
  addTask: (task: Omit<Task, "id">) => Promise<void>;
  updateTask: (id: string, patch: Partial<Task>) => Promise<void>;
  addPlacement: (placement: Omit<Placement, "id">) => Promise<void>;
  updatePlacement: (id: string, patch: Partial<Placement>) => Promise<void>;
  deletePlacement: (id: string) => Promise<void>;
  generateWorkspace: (prompt: string) => Promise<void>;
  refineWorkspace: (id: string, instruction: string) => Promise<void>;
  updateWorkspaceSections: (id: string, sections: WorkspaceSection[]) => Promise<void>;
  setActiveTab: (tab: ActiveTab) => void;
  setTaskView: (view: TaskView) => void;
  setTaskFilter: (filter: TaskFilter) => void;
  setSearch: (search: string) => void;
  setModal: (modal: ModalType) => void;
  setOnline: (online: boolean) => void;
  pushToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
};

const idOf = (item: { id?: string; _id?: string }) => item._id ?? item.id ?? crypto.randomUUID();

const normalizeDashboard = (dashboard: DashboardPayload) => ({
  ...dashboard,
  tasks: dashboard.tasks.map((task) => ({ ...task, id: idOf(task) })),
  placements: dashboard.placements.map((placement) => ({ ...placement, id: idOf(placement) })),
  workspaces: (dashboard.workspaces ?? []).map((workspace) => ({ ...workspace, id: idOf(workspace) }))
});

export const useLockedInStore = create<LockedInState>()(
  persist(
    (set, get) => ({
      ...seedDashboard,
      workspaces: seedDashboard.workspaces ?? [],
      user: null,
      token: authToken.get(),
      isBootstrapping: true,
      isLoading: false,
      isOnline: navigator.onLine,
      activeTab: "daily-goals",
      activeWorkspaceId: null,
      taskView: "list",
      taskFilter: "today",
      search: "",
      modal: null,
      toasts: [],
      bootstrap: async () => {
        const token = authToken.get();
        if (!token) {
          set({ isBootstrapping: false });
          return;
        }
        try {
          const user = await api.me();
          set({ user, token, isBootstrapping: false });
          await get().loadDashboard();
        } catch {
          authToken.clear();
          set({ user: null, token: null, isBootstrapping: false });
        }
      },
      login: async (payload) => {
        const result = await api.login(payload);
        authToken.set(result.token);
        set({ token: result.token, user: result.user });
        await get().loadDashboard();
        get().pushToast({ title: "Welcome back", description: "Your workspace is synced.", tone: "success" });
      },
      signup: async (payload) => {
        const result = await api.signup(payload);
        authToken.set(result.token);
        set({ token: result.token, user: result.user });
        await get().loadDashboard();
        get().pushToast({ title: "Account created", description: "Your LockedIn OS is ready.", tone: "success" });
      },
      logout: () => {
        authToken.clear();
        set({ ...seedDashboard, workspaces: seedDashboard.workspaces ?? [], user: null, token: null });
      },
      loadDashboard: async () => {
        set({ isLoading: true });
        try {
          const dashboard = normalizeDashboard(await api.dashboard());
          set({ ...dashboard, isLoading: false });
        } catch {
          set({ isLoading: false });
          get().pushToast({ title: "Using offline data", description: "Changes are kept locally for now.", tone: "info" });
        }
      },
      addTask: async (task) => {
        const optimistic = { ...task, id: crypto.randomUUID() };
        set((state) => ({ tasks: [optimistic, ...state.tasks] }));
        get().pushToast({ title: "Task added", description: optimistic.title, tone: "success" });
        try {
          const saved = await api.tasks.create(task);
          set((state) => ({
            tasks: state.tasks.map((item) => (item.id === optimistic.id ? { ...saved, id: idOf(saved) } : item))
          }));
        } catch {
          get().pushToast({ title: "Saved locally", description: "The API will sync when available.", tone: "info" });
        }
      },
      updateTask: async (id, patch) => {
        const previous = get().tasks;
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...patch, status: patch.completed ? "done" : (patch.status ?? task.status) } : task
          )
        }));
        try {
          await api.tasks.update(id, patch);
        } catch {
          set({ tasks: previous });
          get().pushToast({ title: "Task update failed", description: "Your previous state was restored.", tone: "error" });
        }
      },
      addPlacement: async (placement) => {
        const optimistic = { ...placement, id: crypto.randomUUID() };
        set((state) => ({ placements: [optimistic, ...state.placements] }));
        get().pushToast({ title: "Company added", description: optimistic.companyName, tone: "success" });
        try {
          const saved = await api.placements.create(placement);
          set((state) => ({
            placements: state.placements.map((item) => (item.id === optimistic.id ? { ...saved, id: idOf(saved) } : item))
          }));
        } catch {
          get().pushToast({ title: "Saved locally", description: "Placement will sync when online.", tone: "info" });
        }
      },
      updatePlacement: async (id, patch) => {
        const previous = get().placements;
        set((state) => ({ placements: state.placements.map((item) => (item.id === id ? { ...item, ...patch } : item)) }));
        try {
          await api.placements.update(id, patch);
        } catch {
          set({ placements: previous });
          get().pushToast({ title: "Placement update failed", description: "Your previous state was restored.", tone: "error" });
        }
      },
      deletePlacement: async (id) => {
        const previous = get().placements;

        const deleted = previous.find(
          (placement) => placement.id === id
        );

        set((state) => ({
          placements: state.placements.filter(
            (placement) => placement.id !== id
          )
        }));

        try {
          await api.placements.remove(id);

          get().pushToast({
            title: "Placement deleted",
            description:
              deleted?.companyName ||
              "Company removed",
            tone: "success"
          });
        } catch {
          set({ placements: previous });

          get().pushToast({
            title: "Delete failed",
            description:
              "Previous data was restored.",
            tone: "error"
          });
        }
      },
      generateWorkspace: async (prompt) => {
        set({ isLoading: true });
        try {
          const workspace = await api.workspaces.create(prompt);
          const normalized = { ...workspace, id: idOf(workspace) };
          set((state) => ({
            workspaces: [normalized, ...state.workspaces],
            activeWorkspaceId: normalized.id,
            activeTab: `workspace:${normalized.id}`,
            modal: null,
            isLoading: false
          }));
          get().pushToast({ title: "Workspace generated", description: normalized.name, tone: "success" });
        } catch (error) {
          set({ isLoading: false });
          get().pushToast({
            title: "Workspace generation failed",
            description: error instanceof Error ? error.message : "Check your API key or network.",
            tone: "error"
          });
        }
      },
      refineWorkspace: async (id, instruction) => {
        const current = get().workspaces.find((workspace) => workspace.id === id);
        if (!current) return;
        set({ isLoading: true });
        try {
          const refined = await api.workspaces.refine(id, instruction, current);
          const normalized = { ...refined, id: idOf(refined) };
          set((state) => ({
            workspaces: state.workspaces.map((workspace) => (workspace.id === id ? normalized : workspace)),
            isLoading: false
          }));
          get().pushToast({ title: "Workspace refined", description: instruction, tone: "success" });
        } catch (error) {
          set({ isLoading: false });
          get().pushToast({
            title: "Refinement failed",
            description: error instanceof Error ? error.message : "Try again.",
            tone: "error"
          });
        }
      },
      updateWorkspaceSections: async (id, sections) => {
        const previous = get().workspaces;
        set((state) => ({
          workspaces: state.workspaces.map((workspace) => (workspace.id === id ? { ...workspace, sections } : workspace))
        }));
        try {
          await api.workspaces.update(id, { sections });
        } catch {
          set({ workspaces: previous });
          get().pushToast({ title: "Workspace update failed", description: "Layout was restored.", tone: "error" });
        }
      },
      setActiveTab: (activeTab) =>
        set({
          activeTab,
          activeWorkspaceId: activeTab.startsWith("workspace:") ? activeTab.replace("workspace:", "") : null
        }),
      setTaskView: (taskView) => set({ taskView }),
      setTaskFilter: (taskFilter) => set({ taskFilter }),
      setSearch: (search) => set({ search }),
      setModal: (modal) => set({ modal }),
      setOnline: (isOnline) => set({ isOnline }),
      pushToast: (toast) =>
        set((state) => ({
          toasts: [{ ...toast, id: crypto.randomUUID() }, ...state.toasts].slice(0, 4)
        })),
      dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }))
    }),
    {
      name: "lockedin.workspace",
      partialize: (state) => ({
        tasks: state.tasks,
        placements: state.placements,
        analytics: state.analytics,
        settings: state.settings,
        user: state.user,
        token: state.token,
        activeTab: state.activeTab,
        activeWorkspaceId: state.activeWorkspaceId,
        taskView: state.taskView,
        workspaces: state.workspaces
      })
    }
  )
);
