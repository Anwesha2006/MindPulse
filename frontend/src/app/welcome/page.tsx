"use client";

import { useActionState } from "react";
import { submitWelcome } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function WelcomePage() {
  const [state, formAction, isPending] = useActionState(submitWelcome, null);

  return (
    <main className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Welcome to MindPulse</CardTitle>
          <p className="text-muted-foreground mt-2">What should we call you?</p>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Input
                name="name"
                placeholder="Enter your name"
                required
                className="text-lg py-6 bg-muted/50 border-transparent focus-visible:ring-accent"
                autoFocus
              />
              {state?.error && (
                <p className="text-sm text-destructive">{state.error}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full py-6 text-lg bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isPending}
            >
              {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
