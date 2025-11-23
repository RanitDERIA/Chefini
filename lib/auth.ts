import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import dbConnect from './mongodb';
import User from '@/models/User';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await dbConnect();

        const user = await User.findOne({ 
          email: (credentials.email as string).toLowerCase() 
        }).select('+password');

        if (!user || !user.password) {
          return null;
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password as string, 
          user.password
        );

        if (!isPasswordCorrect) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          avatar: user.avatar, // Fix: Return avatar from DB
        };
      }
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        // @ts-ignore
        token.avatar = user.avatar; // Fix: Persist avatar to token
      }

      // Handle updates (This allows the update() function in ProfilePage to work)
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
        session.user.avatar = token.avatar as string; // Fix: Pass avatar to client
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        await dbConnect();
        
        // Check if user exists
        let existingUser = await User.findOne({ email: user.email });
        
        if (!existingUser) {
          // Create new user from Google profile
          existingUser = await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            avatar: '', // Initialize empty avatar
          });
        }
        
        user.id = existingUser._id.toString();
        // @ts-ignore
        user.avatar = existingUser.avatar; // Fix: Load existing avatar for Google users
      }
      return true;
    },
  },
});