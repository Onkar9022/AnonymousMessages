// // src/types/next-auth.d.ts
// import NextAuth, { DefaultSession } from "next-auth";

// declare module "next-auth" {
//   interface User {
//     _id?: string;
//     isVerified?: boolean;
//     isAcceptingMessages?: boolean;
//     username?: string;
//   }

//   interface Session {
//     user: {
//       _id?: string;
//       isVerified?: boolean;
//       isAcceptingMessages?: boolean;
//       username?: string;
//     } & DefaultSession["user"];
//   }
// }

// declare module "next-auth/jwt" {
//   interface JWT {
//     _id?: string;
//     isVerified?: boolean;
//     isAcceptingMessages?: boolean;
//     username?: string;
//   }
// }

import { DefaultSession } from "next-auth";

export {};

declare module "next-auth" {
  interface User {
    id: string; // ✅ Required by NextAuth
    _id: string; // ✅ MongoDB Object ID
    email: string;
    username: string;
    isVerified: boolean;
    isAcceptingMessages: boolean;
  }

  interface Session {
    user: {
      id: string;
      _id: string;
      email: string;
      username: string;
      isVerified: boolean;
      isAcceptingMessages: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    _id: string;
    email: string;
    username: string;
    isVerified: boolean;
    isAcceptingMessages: boolean;
  }
}
