import { z } from "zod";

export const MessagesSchema = z.object({
  content: z
    .string()
    .min(1, { message: "Empty Message not allowed" })
    .max(300, { message: "Message must be no longer than 300 characters" }),
});
