"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, ArrowRight } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();

      // Authenticate with Google
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });

      if (error) {
        router.push("/error");
      }

      toast.success("Signed in successfully");

      // Redirect to dashboard after "authentication"
      router.push("/");
    } catch (error) {
      console.error("Error signing in:", error);
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
            onClick={handleGoogleSignIn}
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

// Custom Google icon component
function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12 h8" />
      <path d="M12 8 v8" />
    </svg>
  );
}
