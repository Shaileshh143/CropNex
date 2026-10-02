import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : [
          // Fallback provider indicator if Google credentials aren't set yet
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || 'dummy-google-client-id',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-google-client-secret',
          }),
        ]),
    CredentialsProvider({
      name: 'Demo Account',
      credentials: {
        role: { label: 'Role', type: 'text' },
        name: { label: 'Name', type: 'text' },
        email: { label: 'Email', type: 'email' },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const role = (credentials.role || 'farmer') as 'farmer' | 'buyer' | 'logistics';
        const name =
          credentials.name ||
          (role === 'farmer'
            ? 'Dnyaneshwar Patil (Farmer)'
            : role === 'buyer'
            ? 'Aarav Agro Mart (Buyer)'
            : 'Suresh Logistics (Transporter)');
        const email =
          credentials.email ||
          (role === 'farmer'
            ? 'farmer@cropnex.agri'
            : role === 'buyer'
            ? 'buyer@cropnex.agri'
            : 'logistics@cropnex.agri');

        try {
          const db = await connectToDatabase();
          if (db) {
            let existingUser = await User.findOne({ email });
            if (!existingUser) {
              existingUser = await User.create({
                name,
                email,
                role,
                image:
                  role === 'farmer'
                    ? 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&q=80'
                    : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                district: role === 'farmer' ? 'Nashik' : 'Pune',
                mandiLocation: role === 'farmer' ? 'Nashik APMC Mandi' : 'Pune Market Yard',
                kycVerified: true,
              });
            }
          }
        } catch (err) {
          console.warn('MongoDB sync skipped during credentials login:', err);
        }

        return {
          id: role === 'farmer' ? 'usr-farmer-01' : 'usr-buyer-01',
          name,
          email,
          image:
            role === 'farmer'
              ? 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&q=80'
              : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' && user.email) {
        try {
          const db = await connectToDatabase();
          if (db) {
            const existingUser = await User.findOne({ email: user.email });
            if (!existingUser) {
              await User.create({
                name: user.name || 'Agri User',
                email: user.email,
                image: user.image,
                role: 'farmer', // default role, user can switch in UI
                kycVerified: true,
              });
            }
          }
        } catch (e) {
          console.warn('Google sign-in MongoDB save notice:', e);
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || 'farmer';
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role || 'farmer';
        (session.user as any).id = token.id || token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'cropnex_secure_jwt_secret_token_production_2026',
};
