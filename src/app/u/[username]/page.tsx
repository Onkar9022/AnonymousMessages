"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { suggestions } from "@/data/suggestions";
import { RefreshCcw, Sparkles } from "lucide-react";

export default function PublicUserPage() {
  const { username } = useParams() as { username: string };

  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [message, setMessage] = useState("");
  const [randomSuggestions, setRandomSuggestions] = useState<string[]>([]);
  const [fetchingAI, setFetchingAI] = useState(false);

  // ✅ Load user data and initial suggestions
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(`/api/profile?username=${username}`);
        if (!data.success) throw new Error(data.message);
        setAccepting(Boolean(data.user.isAcceptingMessage));
        shuffleSuggestions();
      } catch {
        toast.error("User not found");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [username]);

  // ✅ Local suggestions shuffle
  const shuffleSuggestions = () => {
    const newSet = [...suggestions].sort(() => Math.random() - 0.5).slice(0, 4);
    setRandomSuggestions(newSet);
  };

  // ✅ Fetch AI-powered suggestions
  const fetchAISuggestions = async () => {
    setFetchingAI(true);
    try {
      const { data } = await axios.post("/api/suggest-messages", { username });
      if (data.success && data.suggestions.length > 0) {
        setRandomSuggestions(data.suggestions);
        toast.success("✨ AI suggestions updated!");
      } else {
        toast.error("Could not load suggestions");
      }
    } catch {
      toast.error("AI suggestion failed");
    } finally {
      setFetchingAI(false);
    }
  };

  // ✅ Send anonymous message
  const sendMessage = async () => {
    if (!message.trim()) return toast.error("Message cannot be empty");

    try {
      const { data } = await axios.post("/api/send-message", {
        username,
        content: message,
      });

      if (!data.success) return toast.error(data.message);

      toast.success("Message sent anonymously!");
      setMessage("");
    } catch {
      toast.error("Something went wrong");
    }
  };

  // ✅ Apply suggestion to text area
  const applySuggestion = (text: string) => {
    setMessage(text);
  };

  if (loading)
    return <div className="p-8 text-center text-slate-500">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-white to-slate-100">
      <Card className="max-w-lg w-full p-6 shadow-md border border-slate-200">
        <h1 className="text-2xl font-semibold text-center mb-2">@{username}</h1>

        {!accepting ? (
          <p className="text-center text-slate-500">
            This user is not accepting messages right now.
          </p>
        ) : (
          <>
            <p className="text-slate-600 text-center mb-3">
              Send an anonymous message 👇
            </p>

            {/* ✅ Suggestions Section */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-slate-600">
                  Message Suggestions
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={shuffleSuggestions}
                    className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                  >
                    <RefreshCcw size={14} /> Shuffle
                  </button>
                  <button
                    onClick={fetchAISuggestions}
                    disabled={fetchingAI}
                    className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                  >
                    <Sparkles size={14} />
                    {fetchingAI ? "Loading..." : "AI Suggestions"}
                  </button>
                </div>
              </div>

              {/* ✅ Render suggestions */}
              <div className="grid grid-cols-1 gap-2">
                {randomSuggestions.map((text, i) => (
                  <div
                    key={i}
                    onClick={() => applySuggestion(text)}
                    className="cursor-pointer bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm p-3 rounded-lg border border-slate-200 transition"
                  >
                    {text}
                  </div>
                ))}
              </div>
            </div>

            <Textarea
              placeholder="Type your message…"
              className="min-h-[120px]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <Button className="w-full mt-3" onClick={sendMessage}>
              Send Message
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
