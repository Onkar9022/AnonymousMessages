import dbConnect from "@/lib/dbConnect";
import UserModel from "@/app/model/User";
import type { Document } from "mongoose";

type MockUser = {
  username: string;
  email: string;
  password: string;
  verifyCode: string;
  verifyCodeExpiry: Date;
  isVerified: boolean;
  isAcceptingMessage: boolean;
  messages: unknown[];
};

function getMockUsers(): MockUser[] {
  const g = global as unknown as Record<string, unknown>;
  if (!Array.isArray(g.__mockUsers)) g.__mockUsers = [];
  return g.__mockUsers as MockUser[];
}
type MongooseUserDoc = Document & { save: () => Promise<unknown> };
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

// Handle CORS preflight explicitly so clients (browser / Hoppscotch) receive
// Access-Control-Allow-* headers and can send the POST request.
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  } as Record<string, string>;
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

export async function POST(request: Request) {
  const useMockDb = process.env.DEV_SKIP_DB === "true";
  if (!useMockDb) {
    await dbConnect();
  }

  try {
  const { username, email, password } = await request.json();

    // check if username already taken by a verified user
    let existingUserVerifiedByUsername = null;
    if (useMockDb) {
      // simple in-memory check
      existingUserVerifiedByUsername = getMockUsers().find(
        (u) => u.username === username && u.isVerified === true
      );
    } else {
      existingUserVerifiedByUsername = await UserModel.findOne({
        username,
        isVerified: true,
      });
    }

    if (existingUserVerifiedByUsername) {
      return Response.json(
        { success: false, message: "Username is already taken" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // check if email exists
    let existingUserByEmail = null;
    if (useMockDb) {
      existingUserByEmail = getMockUsers().find((u) => u.email === email) ?? null;
    } else {
      existingUserByEmail = await UserModel.findOne({ email });
    }

    // generate verification code (5 digits)
    const verifyCode = Math.floor(10000 + Math.random() * 90000).toString();

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          { success: false, message: "User already exists with this email" },
          { status: 400, headers: corsHeaders() }
        );
      }

      // update unverified user
      if (useMockDb) {
        existingUserByEmail.password = await bcrypt.hash(password, 10);
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
      } else {
        existingUserByEmail.password = await bcrypt.hash(password, 10);
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000); // 1 hour
  // existingUserByEmail is a Mongoose document in this branch; narrow with an unknown cast for TypeScript
  const mongooseUser = existingUserByEmail as unknown as MongooseUserDoc;
  await mongooseUser.save();
      }
    } else {
      // register new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date(Date.now() + 3600000);

      if (useMockDb) {
        getMockUsers().push({
          username,
          email,
          password: hashedPassword,
          verifyCode,
          verifyCodeExpiry: expiryDate,
          isVerified: false,
          isAcceptingMessage: true,
          messages: [],
        });
      } else {
        const newUser = new UserModel({
          username,
          email,
          password: hashedPassword,
          verifyCode,
          verifyCodeExpiry: expiryDate,
          isVerified: false,
          isAcceptingMessage: true,
          messages: [],
        });

        await newUser.save();
      }
    }

    // send verification email
    const emailResponse = await sendVerificationEmail(email, username, verifyCode);

    if (!emailResponse.success) {
      return Response.json(
        { success: false, message: emailResponse.message },
        { status: 500, headers: corsHeaders() }
      );
    }

    return Response.json(
      {
        success: true,
        message: "User registered successfully. Please verify your email.",
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Error registering user:", error);
    return Response.json(
      { success: false, message: "Error registering user" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
