import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: { signIn: "/entrar" },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      const tenant = await prisma.tenant.findUnique({
        where: { email: user.email },
      });
      return !!(tenant && tenant.ativo);
    },
    async session({ session, token }) {
      if (token.email) {
        const tenant = await prisma.tenant.findUnique({
          where: { email: token.email },
          include: { plan: true },
        });
        if (tenant) {
          (session as unknown as Record<string, unknown>).tenantId = tenant.id;
          (session as unknown as Record<string, unknown>).tenantNome = tenant.nome;
          (session as unknown as Record<string, unknown>).planNome = tenant.plan?.nome ?? null;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user?.email) token.email = user.email;
      return token;
    },
  },
});
