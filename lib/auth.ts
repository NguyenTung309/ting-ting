import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { getAppRecordClient } from "@/lib/app-database";
import { getUserAccountType } from "@/lib/user-roles";

async function upsertGoogleUser(profile: { sub?: string; email?: string; name?: string; picture?: string }) {
  if (!profile.sub || !profile.email) return null;
  const cms = await getAppRecordClient();
  if (!cms) return null;
  const existing = await cms.find({ collection: "users", where: { googleSubject: { equals: profile.sub } }, limit: 1, overrideAccess: true });
  const data = { googleSubject: profile.sub, email: profile.email, displayName: profile.name || profile.email.split("@")[0], avatar: profile.picture, accountType: getUserAccountType(profile.email), lastSeenAt: new Date().toISOString() };
  if (existing.docs[0]) {
    if (existing.docs[0].status === "blocked") return null;
    const updated = await cms.update({ collection: "users", id: existing.docs[0].id, data, overrideAccess: true });
    return String(updated.id);
  }
  const created = await cms.create({ collection: "users", data: { ...data, status: "active" }, overrideAccess: true });
  return String(created.id);
}

async function upsertDemoUser() {
  const cms = await getAppRecordClient();
  if (!cms) return null;
  const existing = await cms.find({ collection: "users", where: { googleSubject: { equals: "demo-local" } }, limit: 1, overrideAccess: true });
  const data = { googleSubject: "demo-local", email: "demo@tinhtinhting.local", displayName: "Demo Tình Tính Ting Ting", avatar: "", accountType: "user" as const, lastSeenAt: new Date().toISOString(), status: "active" as const };
  if (existing.docs[0]) {
    const updated = await cms.update({ collection: "users", id: existing.docs[0].id, data, overrideAccess: true });
    return { id: String(updated.id), name: updated.displayName, email: updated.email };
  }
  const created = await cms.create({ collection: "users", data, overrideAccess: true });
  return { id: String(created.id), name: created.displayName, email: created.email };
}

const demoMode = process.env.AUTH_DEMO_MODE === "true";
const providers: NextAuthOptions["providers"] = [
  ...(demoMode ? [CredentialsProvider({ id: "demo", name: "Demo", credentials: {}, async authorize() { return await upsertDemoUser(); } })] : []),
  ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET ? [GoogleProvider({ clientId: process.env.AUTH_GOOGLE_ID, clientSecret: process.env.AUTH_GOOGLE_SECRET })] : []),
];

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || (process.env.NODE_ENV === "development" ? "local-development-auth-secret-change-me" : undefined),
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  providers,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (demoMode && account?.provider === "demo" && user?.id) return true;
      if (!profile) return false;
      try {
        return Boolean(await upsertGoogleUser({ sub: profile.sub, email: profile.email, name: profile.name, picture: (profile as { picture?: string }).picture }));
      } catch {
        return false;
      }
    },
    async jwt({ token, user, account, profile }) {
      if (demoMode && account?.provider === "demo" && user?.id) {
        token.sub = String(user.id);
        token.name = user.name;
        token.email = user.email;
        token.demo = true;
        return token;
      }
      if (profile?.sub) token.googleSubject = profile.sub;
      if (profile?.email) token.email = profile.email;
      if (profile?.name) token.name = profile.name;
      if (profile?.sub && profile.email) {
        try {
          const cmsUserId = await upsertGoogleUser({ sub: profile.sub, email: profile.email, name: profile.name, picture: (profile as { picture?: string }).picture });
          if (cmsUserId) token.sub = cmsUserId;
        } catch {
          // The sign-in callback already rejected unavailable persistence; keep JWT creation safe.
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.sub || "");
        session.user.googleSubject = typeof token.googleSubject === "string" ? token.googleSubject : undefined;
      }
      return session;
    },
  },
};

export async function getCurrentUserId() {
  const { getServerSession } = await import("next-auth");
  const session = await getServerSession(authOptions);
  const id = session?.user?.id || null;
  if (!id) return null;
  const cms = await getAppRecordClient();
  if (!cms) return null;
  const user = await cms.findByID({ collection: "users", id, overrideAccess: true }).catch(() => null);
  return user && user.status === "active" ? id : null;
}

export async function getCurrentSession() {
  const { getServerSession } = await import("next-auth");
  return getServerSession(authOptions);
}
