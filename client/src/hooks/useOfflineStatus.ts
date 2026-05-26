import { useEffect } from "react";
import { useLockedInStore } from "@/store/useLockedInStore";

export function useOfflineStatus() {
  const setOnline = useLockedInStore((state) => state.setOnline);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    update();
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, [setOnline]);
}
