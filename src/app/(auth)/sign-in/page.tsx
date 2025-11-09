"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema } from "@/schemas/signInSchema";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Lock } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    setLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      identifier: data.identifier,
      password: data.password,
    });

    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
      return;
    }

    toast.success("Signed in successfully!");
    router.replace("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-slate-100 px-4 sm:px-6 md:px-8 py-8">
      <div className="w-full max-w-md bg-white border border-slate-200 shadow-lg rounded-2xl p-6 sm:p-8 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-center text-slate-900">
          Sign in
        </h1>
        <p className="text-center text-slate-500 text-sm sm:text-base">
          Welcome back 👋
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm sm:text-base">
                    <Mail size={16} /> Username or Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="yourname or you@example.com"
                      className="w-full text-sm sm:text-base"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm sm:text-base">
                    <Lock size={16} /> Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="w-full text-sm sm:text-base"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-11 flex items-center justify-center text-sm sm:text-base"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Sign In"
              )}
            </Button>

            <p className="text-center text-xs sm:text-sm text-slate-600 pt-2">
              Do not have an account?{" "}
              <a
                href="/sign-up"
                className="text-sky-600 hover:underline font-medium"
              >
                Sign up
              </a>
            </p>
          </form>
        </Form>
      </div>
    </div>
  );
}  
