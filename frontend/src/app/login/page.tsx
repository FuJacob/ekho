"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Client-side wrapper for login action
  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const supabase = await createClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      })
      if (error) {
        throw error;
      }
      
      if (data) router.push("/");

    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to sign in");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-900">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 pt-8">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Image
              src="/ekho-logo.png"
              alt="Ekho Logo"
              width={36}
              height={36}
              className="rounded-sm"
              onError={(e) => {
                e.currentTarget.src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m12 19 4-4'/%3E%3Cpath d='m5 8 4-4'/%3E%3Cpath d='M5 8v8'/%3E%3Cpath d='M5 16h.01'/%3E%3Cpath d='M12 19h7a2 2 0 0 0 2-2v-1.5'/%3E%3Cpath d='M9 4h7a2 2 0 0 1 2 2v1.5'/%3E%3C/svg%3E";
              }}
            />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Welcome to Ekho
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <Button
            variant="outline"
            size="lg"
            className="w-full py-6 flex items-center justify-center gap-2 mt-4"
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <GoogleIcon className="h-5 w-5" />
            )}
            <span className="ml-2">
              {isLoading ? "Signing in..." : "Continue with Google"}
            </span>
          </Button>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              By continuing, you agree to Ekho's{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Better Google icon component
function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
      <path d="M1 1h22v22H1z" fill="none" />
    </svg>
  );
}
