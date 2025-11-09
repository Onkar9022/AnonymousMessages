// src/schemas/aiSuggestSchema.ts
import { z } from "zod";

export const AiSuggestSchema = z.object({
  username: z.string().min(1),
  recipientName: z.string().optional(),
  context: z.string().optional(),
  tone: z.enum(["friendly", "formal", "casual", "professional", "funny"]).optional(),
  length: z.enum(["short", "medium", "long"]).optional(),
  count: z.number().int().min(1).max(6).optional(),
});
