import NextAuth from "next-auth";
import Kakao from "next-auth/providers/kakao";
import Naver from "next-auth/providers/naver";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

// Intercept Kakao fetch calls to log raw request/response
const _origFetch = globalThis.fetch;
globalThis.fetch = async function (...args: Parameters<typeof fetch>) {
  const url =
    typeof args[0] === "string"
      ? args[0]
      : args[0] instanceof URL
      ? args[0].href
      : (args[0] as Request).url;
  if (url?.includes("kakao")) {
    const body = (args[1] as RequestInit | undefined)?.body;
    console.log("[KAKAO_REQ]", url, typeof body === "string" ? body : String(body ?? ""));
    const res = await _origFetch(...args);
    const clone = res.clone();
    const text = await clone.text();
    console.log("[KAKAO_RES]", res.status, text.slice(0, 800));
    return res;
  }
  return _origFetch(...args);
} as typeof fetch;

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  logger: {
    error(error: Error) {
      const cause = (error as unknown as Record<string, unknown>).cause;
      console.error("[AUTH_ERROR]", error.name, ":", error.message, "| cause:", JSON.stringify(cause ?? null));
    },
  },
  providers: [
    Kakao({
      clientId: process.env.KAKAO_CLIENT_ID ?? "",
      clientSecret: process.env.KAKAO_CLIENT_SECRET ?? "",
      authorization: {
        url: "https://kauth.kakao.com/oauth/authorize",
        params: {
          scope: "profile_nickname profile_image account_email",
        },
      },
      client: {
        token_endpoint_auth_method: "client_secret_post",
      },
      profile(profile: Record<string, unknown>) {
        const account = profile.kakao_account as Record<string, unknown> | undefined;
        const kakaoProfile = account?.profile as Record<string, unknown> | undefined;
        return {
          id: String(profile.id ?? ""),
          name: (kakaoProfile?.nickname as string) ?? null,
          email: (account?.email as string) ?? null,
          image: (kakaoProfile?.profile_image_url as string) ?? null,
        };
      },
    }),
    Naver({
      clientId: process.env.NAVER_CLIENT_ID ?? "",
      clientSecret: process.env.NAVER_CLIENT_SECRET ?? "",
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    Credentials({
      id: "emailcreds",
      name: "이메일",
      credentials: {
        email: { label: "이메일", type: "email" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string | undefined)?.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) return null;
        return { id: email, email, name: email.split("@")[0] };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
    jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
  },
  pages: { signIn: "/login", error: "/auth-debug" },
});
