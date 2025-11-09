// import { Resend } from "resend";

// export const resend = new Resend(process.env.RESEND_API_KEY);

import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("Missing RESEND_API_KEY in environment variables");
}

export const resend = new Resend(process.env.RESEND_API_KEY);
