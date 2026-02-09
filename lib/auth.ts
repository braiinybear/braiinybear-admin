// // lib/auth.ts
// import CredentialsProvider from "next-auth/providers/credentials";
// import { AuthOptions } from "next-auth";

// export const authOptions: AuthOptions = {
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         username: { label: "Username", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (
//           credentials?.username === process.env.ADMIN_USERNAME &&
//           credentials?.password === process.env.ADMIN_PASSWORD
//         ) {
//           return { id: "admin", name: "Admin" };
//         }
//         return null;
//       },
//     }),
//   ],
//   session: {
//     strategy: "jwt",
//   },
//   pages: {
//     signIn: "/login",
//   },
// };

// // Utility for server components
// import { getServerSession } from "next-auth";

// export function getAuthSession() {
//   return getServerSession(authOptions);
// }



// lib/auth.ts
// lib/auth.ts

import { DefaultSession, AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";


// 🔥 NextAuth type extension
declare module "next-auth" {
  interface User {
    id: string;
    role: string;
  }

  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}


// ✅ Auth config
export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        name: { label: "name", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.name || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await db.mangement.findUnique({
          where: { name: credentials.name },
        });

        if (!user) throw new Error("User not found");

        const valid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!valid) throw new Error("Invalid password");

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token.role) {
        session.user.role = token.role;
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
};


// Utility for server components
import { getServerSession } from "next-auth";

export function getAuthSession() {
  return getServerSession(authOptions);
}


// ✅ helper to get user
export async function getCurrentUser() {
  const session = await getAuthSession();
  return session?.user ?? null;
}