// src/hooks/useMessageSuggestions.ts
import { useState } from "react";
import { generateSuggestions } from "@/lib/aiClient";

export function useMessageSuggestions() {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = async (prompt: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await generateSuggestions(prompt);
      setSuggestions(result);
    } catch (error: unknown) {        // ✅ FIXED
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to generate suggestions");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    suggestions,
    error,
    fetchSuggestions,
  };
}
