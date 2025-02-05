import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";

const prisma = new PrismaClient();

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
    accessToken?: string;
  }

  interface User {
    id: string;
    accessToken?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (user && (await bcrypt.compare(credentials.password, user.password))) {
            const accessToken = nanoid(32); 

           
            return { id: user.id.toString(), email: user.email, accessToken };
          }
        } catch (error) {
          console.error("Error in authorize function:", error);
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24, 
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.accessToken = user.accessToken ?? ''; 
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.accessToken = token.accessToken as string; 
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
