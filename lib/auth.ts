import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "./db";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    // Google OAuth Provider (diaktifkan otomatis jika Client ID & Secret tersedia di env)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan kata sandi wajib diisi");
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("Akun dengan email tersebut tidak ditemukan");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        );

        if (!isValid) {
          throw new Error("Kata sandi yang dimasukkan salah");
        }

        return {
          id: user.id,
          name: user.nama,
          email: user.email,
          is_pro: user.is_pro,
          pro_plan: user.pro_plan,
        } as any;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;

        try {
          // Cek apakah user sudah terdaftar dengan email ini di database
          let existingUser = await db.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            // Buat akun baru secara otomatis dari profil Google
            const randomPassword = Math.random().toString(36).slice(-10) + Date.now();
            const password_hash = await bcrypt.hash(randomPassword, 10);

            existingUser = await db.user.create({
              data: {
                email: user.email,
                nama: user.name || user.email.split("@")[0],
                password_hash,
                avatar_url: user.image || null,
              },
            });
          } else if (user.image && !existingUser.avatar_url) {
            // Update avatar bila akun lama belum memiliki avatar
            await db.user.update({
              where: { id: existingUser.id },
              data: { avatar_url: user.image },
            });
          }

          // Hubungkan ID database ke sesi user & pastikan workspace terisolasi siap
          user.id = existingUser.id;
          (user as any).is_pro = existingUser.is_pro;
          (user as any).pro_plan = existingUser.pro_plan;

          const { ensureUserWorkspace } = await import("./workspace");
          await ensureUserWorkspace(existingUser.id);

          return true;
        } catch (error) {
          console.error("Error signing in with Google:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.is_pro = (user as any).is_pro ?? false;
        token.pro_plan = (user as any).pro_plan ?? "free";
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).is_pro = (token.is_pro as boolean) ?? false;
        (session.user as any).pro_plan = (token.pro_plan as string) ?? "free";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "semestr-secret-super-key-2026",
};
