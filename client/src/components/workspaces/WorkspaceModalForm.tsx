import { Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLockedInStore } from "@/store/useLockedInStore";

export function WorkspaceModalForm() {
  const [prompt, setPrompt] = useState("");
  const generateWorkspace = useLockedInStore((state) => state.generateWorkspace);
  const isLoading = useLockedInStore((state) => state.isLoading);

  return (
    <div className="space-y-3">
      <Textarea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        className="min-h-40"
        placeholder="Create a tracker for..."
      />
      <div className="flex justify-end">
        <Button disabled={isLoading || prompt.trim().length < 10} onClick={() => generateWorkspace(prompt)}>
          <Sparkles className="h-4 w-4" />
          {isLoading ? "Generating..." : "Generate"}
        </Button>
      </div>
    </div>
  );
}
