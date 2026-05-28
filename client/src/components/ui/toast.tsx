import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import {useEffect} from "react";
import { Button } from "@/components/ui/button";
import { useLockedInStore } from "@/store/useLockedInStore";

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info
};

export function ToastViewport() {
  const toasts = useLockedInStore((state) => state.toasts);
  const dismiss = useLockedInStore((state) => state.dismissToast);
  useEffect(() => {
    if (!toasts.length) return;

    const latestToast =
      toasts[toasts.length - 1];

    const timer = setTimeout(() => {
      dismiss(latestToast.id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toasts, dismiss]);

  return (
    <div className="fixed bottom-4 right-4 z-[70] w-[min(24rem,calc(100vw-2rem))] space-y-3">
      {toasts.map((toast) => {
        const Icon = icons[toast.tone ?? "info"];
        return (
          <div key={toast.id} className="glass rounded-xl p-4">
            <div className="flex gap-3">
              <Icon className="mt-0.5 h-4 w-4 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.description && <p className="mt-1 text-xs text-muted-foreground">{toast.description}</p>}
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => dismiss(toast.id)}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
