"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  Copy,
  ExternalLink,
  Loader2,
  LogOut,
  RefreshCcw,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Link2,
  Mail,
  User,
} from "lucide-react";

/** ---------- Local Types (decouple from your ApiResponse typos) ---------- */

type Message = {
  _id?: string;
  content: string;
  createdAt: string | Date;
};

type MeResponse = {
  success: boolean;
  message: string;
  user?: {
    _id: string;
    username: string;
    email: string;
    isVerified: boolean;
    // Your DB field is `isAcceptingMessage` (singular). We normalize to boolean here.
    isAcceptingMessage?: boolean;
    // Some earlier code used plural—handle both, prefer singular if present
    isAcceptingMessages?: boolean;
    messages?: Message[];
  };
};

/** ---------------------------------------------------------------------- */

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(true);
  const [busyToggle, setBusyToggle] = useState(false);

  const [busyDelete, setBusyDelete] = useState<string | null>(null);
  const [me, setMe] = useState<MeResponse["user"] | null>(null);
  const [origin, setOrigin] = useState<string>("");

  // Resolve accepting flag regardless of singular/plural usage
  const accepting = useMemo<boolean>(() => {
    if (!me) return false;
    if (typeof me.isAcceptingMessage === "boolean") return me.isAcceptingMessage;
    if (typeof me.isAcceptingMessages === "boolean") return me.isAcceptingMessages;
    return false;
  }, [me]);

  // Safe public link; only read window on client
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const publicShareUrl = useMemo(() => {
    if (!me?.username || !origin) return "";
    return `${origin}/u/${me.username}`;
  }, [me?.username, origin]);

  /** Load /api/me (SOT) */
  const fetchMe = useCallback(async () => {
    try {
      setLoading(true);
      const identifier = session?.user?.username ?? session?.user?.email;
      const { data } = await axios.get<MeResponse>(`/api/me`, {
        params: { identifier },
      });

      if (!data.success || !data.user) {
        toast.error(data.message || "Unable to load profile");
        setMe(null);
        return;
      }
      setMe(data.user);
    } catch (err) {
      const ax = err as AxiosError<{ message?: string }>;
      toast.error(ax.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [session?.user?.username, session?.user?.email]);

  useEffect(() => {
    if (status === "authenticated") fetchMe();
  }, [status, fetchMe]);

  /** Toggle accept messages */
  const onToggleAccepting = async (value: boolean) => {
    if (!me?._id) return;
    try {
      setBusyToggle(true);
     const { data } = await axios.post("/api/accept-messages", {
  acceptMessages: value,
});

      if (!data.success) {
        toast.error(data.message || "Failed to update");
        return;
      }
      toast.success(value ? "Now accepting messages" : "Stopped accepting messages");
      await fetchMe();
    } catch (err) {
      const ax = err as AxiosError<{ message?: string }>;
      toast.error(ax.response?.data?.message || "Update failed");
    } finally {
      setBusyToggle(false);
    }
  };

  /** Copy public link */
  const copyLink = async () => {
    if (!publicShareUrl) return;
    try {
      await navigator.clipboard.writeText(publicShareUrl);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Could not copy link");
    }
  };

  /** Delete message */
  const deleteMessage = async (messageId: string) => {
    try {
      setBusyDelete(messageId);
      const { data } = await axios.delete<{ success: boolean; message: string }>(
        "/api/delete-message",
        { data: { messageId } }
      );
      if (!data.success) {
        toast.error(data.message || "Delete failed");
        return;
      }
      toast.success("Message deleted");
      // Optimistic update
      setMe((prev) =>
        !prev
          ? prev
          : {
              ...prev,
              messages: (prev.messages || []).filter((m) => (m._id || "") !== messageId),
            }
      );
    } catch (err) {
      const ax = err as AxiosError<{ message?: string }>;
      toast.error(ax.response?.data?.message || "Delete failed");
    } finally {
      setBusyDelete(null);
    }
  };

  /** Refresh */
  const refreshAll = async () => {
    await fetchMe();
    toast.message("Refreshed");
  };

  /** Logout */
  const doLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/sign-in" });
  };

  /** Render */

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-white to-slate-50 p-6">
        <div className="max-w-5xl mx-auto animate-pulse">
          <div className="h-10 w-48 rounded bg-slate-200 mb-4" />
          <div className="h-24 rounded bg-slate-200 mb-6" />
          <div className="h-10 w-40 rounded bg-slate-200 mb-2" />
          <div className="h-64 rounded bg-slate-200" />
        </div>
      </div>
    );
  }

  if (status !== "authenticated" || !me) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-8 max-w-md w-full text-center">
          <p className="text-slate-700 mb-4">You are not signed in.</p>
          <Button className="bg-indigo-900 text-white hover:fade-in" onClick={() => router.replace("/sign-in")}>Go to Sign In</Button>
          
        </Card>
      </div>
    );
  }

  const messages = (me.messages || []) as Message[];
  const total = messages.length;

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-slate-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-slate-500">Welcome back, {me.username}.</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={refreshAll}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" className="bg-red-500" onClick={doLogout}>
              <LogOut className="mr-2 h-4 w-4  text-white" />
                 <p className="text-white">Logout</p>
            </Button>
          </div>
        </div>

        {/* Profile / Controls */}
        <Card className="p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 text-slate-700">
                <User size={18} />
                <span className="font-medium">@{me.username}</span>
                {me.isVerified ? (
                  <Badge className="bg-green-500 hover:bg-green-500/90 flex items-center gap-1">
                    <ShieldCheck size={14} /> Verified
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <ShieldAlert size={14} /> Not verified
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 text-slate-600">
                <Mail size={18} />
                <span>{me.email}</span>
              </div>

              <div className="flex items-center gap-2 text-slate-600">
                <Link2 size={18} />
                <span className="truncate max-w-[60ch]">{publicShareUrl || "…"}</span>
                <Button variant="outline" size="sm" onClick={copyLink}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => publicShareUrl && window.open(publicShareUrl, "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-700">Accepting Messages</span>
              <Switch 
                disabled={busyToggle}
                checked={accepting}
                onCheckedChange={onToggleAccepting}
              />
            </div>
          </div>
        </Card>

        {/* Messages */}
        <Card className="p-0 shadow-sm">
          <div className="flex items-center justify-between p-5">
            <h2 className="text-xl font-semibold">Messages</h2>
            <span className="text-sm text-slate-500">{total} total</span>
          </div>
          <Separator />

          {total === 0 ? (
            <div className="p-10 text-center text-slate-500">
              No messages yet. Share your link to start receiving anonymous messages.
            </div>
          ) : (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {messages.map((msg, idx) => {
                const key = (msg._id ?? idx.toString()) as string;
                const ts =
                  typeof msg.createdAt === "string"
                    ? new Date(msg.createdAt)
                    : (msg.createdAt as Date);
                return (
                  <Card key={key} className="p-4 shadow-sm">
                    <p className="text-slate-800 whitespace-pre-wrap">{msg.content}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span>{!isNaN(ts.getTime()) ? ts.toLocaleString() : ""}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => deleteMessage(String(msg._id || ""))}
                        disabled={busyDelete === String(msg._id || "")}
                      >
                        {busyDelete === String(msg._id || "") ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
