import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import bcryptjs from "bcryptjs";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.profile.findUnique({
          where: {
            email: credentials.email as string,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcryptjs.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      console.log('[JWT CALLBACK]', {
        hasUser: !!user,
        userId: user?.id,
        userRole: (user as any)?.role,
        trigger,
        currentTokenRole: token.role,
      })

      // Only runs on first login — user object only exists then
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;

        if ((user as any).role === 'superadmin') {
          token.onboarding_completed = true;
        } else {
          // Only query DB once — on first login
          const company = await prisma.company.findFirst({
            where: { owner_id: user.id },
            select: { onboarding_completed: true }
          });
          token.onboarding_completed = company?.onboarding_completed ?? false;
        }
      }

      // Token update triggered by unstable_update()
      if (trigger === 'update' && session?.user?.onboarding_completed !== undefined) {
        token.onboarding_completed = session.user.onboarding_completed;
      }

      // Every subsequent request — just return existing token, no DB query
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).onboarding_completed = token.onboarding_completed as boolean;
      }
      return session;
    },
  },
});
