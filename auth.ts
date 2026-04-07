import NextAuth from "next-auth";
import Kakao from "next-auth/providers/kakao";
import Naver from "next-auth/providers/naver";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { Provider } from "next-auth/providers";

const providers: Provider[] = [];

if (process.env.KAKAO_CLIENT_ID && process.env.KAKAO_CLIENT_SECRET) {
  providers.push(
    Kakao({
      clientId: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
    })
  );
}

if (process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET) {
  providers.push(
    Naver({
      clientId: process.env.NAVER_CLIENT_ID,
      clientSecret: process.env.NAVER_CLIENT_SECRET,
    })
  );
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

// 이메일 로그인 (별도 서버 불필요 - 이메일을 식별자로만 사용)
providers.push(
  Credentials({
    id: "email",
    name: "Email",
    credentials: {
      email: { label: "이메일", type: "email", placeholder: "example@email.com" },
    },
    async authorize(credentials) {
      const email = credentials?.email as string | undefined;
      if (!email || !email.includes("@")) return null;
      return {
        id: email,
        email,
        name: email.split("@")[0],
      };
    },
  })
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  secret: process.env.NEXTAUTH_SECRET ?? "dev-fallback-secret-set-in-production",
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
});
