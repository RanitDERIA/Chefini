import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;

            // Protect dashboard and profile routes
            // Note: We check /dashboard and /profile specifically as they seem to correspond to protected areas
            const isProtectedRoute =
                nextUrl.pathname.startsWith('/dashboard') ||
                nextUrl.pathname.startsWith('/profile');

            if (isProtectedRoute) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            }

            return true;
        },
        async jwt({ token, user, trigger, session }) {
            // Initial sign in
            if (user) {
                token.id = user.id;
                // @ts-ignore
                token.avatar = user.avatar;
            }

            // Handle updates
            if (trigger === "update" && session?.user) {
                token.avatar = session.user.avatar;
                token.name = session.user.name;
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                // @ts-ignore
                session.user.avatar = token.avatar as string;
            }
            return session;
        },
    },
    providers: [], // Configured in lib/auth.ts
} satisfies NextAuthConfig;
