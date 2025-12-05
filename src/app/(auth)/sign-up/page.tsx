"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { useDebounceValue } from "usehooks-ts";

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

import { Loader2, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { signUpSchema } from "@/schemas/signUpSchema";
import type { ApiResponse } from "@/types/ApiResponse";

const otpSchema = z.object({
  otp: z.string().min(5, "Enter the 5-digit code"),
});

export default function SignUpPage() {
  const router = useRouter();

  // UI state
  const [showOtp, setShowOtp] = useState(false);
  const [currentUsername, setCurrentUsername] = useState("");
  const [resendTimer, setResendTimer] = useState(30);

  // Password visibility toggle
  const [showPassword, setShowPassword] = useState(false);

  // Sign-Up Form
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { username: "", email: "", password: "" },
  });

  // OTP Form
  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  // Username availability check
  const username = form.watch("username");
  const [debouncedUsername] = useDebounceValue(username, 400);
  const [checking, setChecking] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<string | null>(null);

  useEffect(() => {
    const checkUsername = async () => {
      if (!debouncedUsername) return setUsernameStatus(null);
      setChecking(true);
      try {
        const res = await axios.get(`/api/check-username-unique?username=${debouncedUsername}`);
        setUsernameStatus(res.data.message);
      } catch (err) {
        const axiosError = err as AxiosError<ApiResponse>;
        setUsernameStatus(axiosError.response?.data?.message || "Error checking username");
      } finally {
        setChecking(false);
      }
    };
    checkUsername();
  }, [debouncedUsername]);

  // Resend Timer
  useEffect(() => {
    if (!showOtp) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [showOtp]);

  // Handle Sign-Up
  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    try {
      await axios.post<ApiResponse>("/api/sign-up", data);
      toast.success("OTP sent to your email!");
      setCurrentUsername(data.username);
      setShowOtp(true);
      setResendTimer(30);
    } catch (err) {
      const axiosError = err as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data?.message || "Sign up failed");
    }
  };

  // Verify OTP
  const verifyOtp = async (data: z.infer<typeof otpSchema>) => {
    try {
      await axios.post("/api/verify-code", {
        username: currentUsername,
        code: data.otp,
      });
      toast.success("Account verified! You can now log in.");
      router.push("/sign-in");
    } catch (err) {
      const axiosError = err as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data?.message || "Invalid OTP");
    }
  };

  // Resend OTP
  const resendOtp = async () => {
    try {
      await axios.post("/api/resend-code", { username: currentUsername });
      toast.success("New OTP sent!");
      setResendTimer(30);
    } catch {
      toast.error("Failed to resend OTP.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-white to-slate-100 p-6">
      <div className="w-full max-w-md bg-white border border-slate-200 shadow-lg rounded-2xl p-8 space-y-6">
        
        {/* SIGN UP FORM */}
        {!showOtp ? (
          <>
            <h1 className="text-2xl font-semibold text-center">Create an account</h1>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Username */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><User size={16}/> Username</FormLabel>
                      <FormControl><Input placeholder="choose a username" {...field} /></FormControl>
                      {checking ? <p className="text-xs text-blue-500">Checking...</p> : usernameStatus && (
                        <p className={`text-xs ${usernameStatus.includes("unique") ? "text-green-600" : "text-red-600"}`}>{usernameStatus}</p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Mail size={16}/> Email</FormLabel>
                      <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password with Eye Toggle */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Lock size={16}/> Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700"
                          >
                            {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit */}
                <Button type="submit" className="w-full h-11 flex justify-center">
                  {form.formState.isSubmitting ? <Loader2 className="animate-spin"/> : "Sign Up"}
                </Button>
                <p className="text-center text-sm text-slate-600 pt-2">
              Already have an account?{" "}
              <a href="/sign-in" className="text-sky-600 hover:underline">
                Sign in
              </a>
            </p>

              </form>
            </Form>
          </>
        ) : (
          
          /* OTP VERIFICATION */
          <>
            <h1 className="text-2xl font-semibold text-center">Verify your email</h1>
            <p className="text-center text-slate-500 text-sm">Enter the 5-digit code sent to your email.</p>

            <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(verifyOtp)} className="space-y-6">

                <FormField
                  control={otpForm.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Code</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="numeric"
                          maxLength={5}
                          placeholder="12345"
                          {...field}
                          className="text-center tracking-widest text-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full h-11 flex justify-center">
                  {otpForm.formState.isSubmitting ? <Loader2 className="animate-spin"/> : "Verify"}
                </Button>

                <Button variant="ghost" disabled={resendTimer > 0} onClick={resendOtp} className="w-full">
                  {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend Code"}
                </Button>

              </form>
            </Form>
          </>
        )}

      </div>
    </div>
  );
}

