import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLockedInStore } from "@/store/useLockedInStore";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

const loginSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

type AuthValues = z.infer<typeof loginSchema>;

export function AuthScreen() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const login = useLockedInStore((state) => state.login);
  const signup = useLockedInStore((state) => state.signup);
  const pushToast = useLockedInStore((state) => state.pushToast);
  const [busy, setBusy] = useState(false);
  const { register, handleSubmit, formState, reset } = useForm<AuthValues>({
    resolver: zodResolver(mode === "signup" ? signupSchema : loginSchema)
  });

  const handleModeSwitch = (newMode: "login" | "signup") => {
    reset();
    setMode(newMode);
  };

  const onSubmit = async (values: AuthValues) => {
    setBusy(true);
    try {
      if (mode === "signup") {
        await signup({ name: values.name || "LockedIn User", email: values.email, password: values.password });
      } else {
        await login({ email: values.email, password: values.password });
      }
    } catch (error) {
      pushToast({ title: "Authentication failed", description: error instanceof Error ? error.message : "Try again.", tone: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-background p-4">
      <div className="surface-line pointer-events-none absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute top-0 h-96 w-[44rem] rounded-full bg-primary/14 blur-3xl" />
      <Card className="relative w-full max-w-md p-6">
        <div className="mb-8 flex flex-col items-center text-center gap-3">
          <img src="/logo.png" alt="LockedIn Logo" className="h-28 w-28 object-contain rounded-2xl shadow-xl border border-white/10" />
          <div>
            <p className="text-xl font-bold">LockedIn</p>
            <p className="text-xs text-muted-foreground">Your life. Organized.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-3">
          {mode === "signup" && (
            <div className="space-y-1">
              <Input placeholder="Name" {...register("name")} />
              {formState.errors.name && (
                <p className="text-xs text-red-400 font-medium px-1">{formState.errors.name.message}</p>
              )}
            </div>
          )}
          <div className="space-y-1">
            <Input placeholder="Email" type="email" {...register("email")} />
            {formState.errors.email && (
              <p className="text-xs text-red-400 font-medium px-1">{formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Input placeholder="Password" type="password" {...register("password")} />
            {formState.errors.password && (
              <p className="text-xs text-red-400 font-medium px-1">{formState.errors.password.message}</p>
            )}
          </div>
          <Button className="w-full mt-2" disabled={busy}>
            {busy ? "Checking..." : mode === "login" ? "Log in" : "Sign up"}
          </Button>
        </form>

        <p className="mt-5 text-sm text-muted-foreground">
          {mode === "login" ? (
            <>
              Need an account?{' '}
              <button
                type="button"
                className="font-semibold text-foreground transition hover:text-primary"
                onClick={() => handleModeSwitch('signup')}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                className="font-semibold text-foreground transition hover:text-primary"
                onClick={() => handleModeSwitch('login')}
              >
                Log in
              </button>
            </>
          )}
        </p>
      </Card>
    </main>
  );
}
