import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.onboarding_completed = (user as any).onboarding_completed;
        token.emailVerified = (user as any).emailVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).onboarding_completed = token.onboarding_completed as boolean;
        (session.user as any).emailVerified = token.emailVerified;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
