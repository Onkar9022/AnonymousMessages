import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/app/model/User";
import { IUser } from "@/app/model/User";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

  async authorize(credentials) {
        await dbConnect();

        const user = (await UserModel.findOne({
          $or: [
            { email: credentials?.identifier },
            { username: credentials?.identifier },
          ]
        })) as IUser | null;

        if (!user) throw new Error("Account not found.");
        if (!user.isVerified) throw new Error("Email not verified.");
        if (!credentials?.password) throw new Error("Password required.");

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) throw new Error("Incorrect password.");

        return {
          id: String(user._id),    // ✅ NextAuth required
          _id: String(user._id),   // ✅ our app required
          email: user.email,
          username: user.username,
          isVerified: user.isVerified,
          isAcceptingMessages: user.isAcceptingMessage,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token._id = user._id;
        token.email = user.email;
        token.username = user.username;
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user._id = token._id;
      session.user.email = token.email;
      session.user.username = token.username;
      session.user.isVerified = token.isVerified;
      session.user.isAcceptingMessages = token.isAcceptingMessages;
      return session;
    },
  },

  pages: { signIn: "/sign-in" },
  secret: process.env.NEXTAUTH_SECRET,
};
