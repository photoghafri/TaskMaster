import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import { getUserByEmail } from './user-utils';

declare module 'next-auth' {
  interface User {
    role?: string;
  }

  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
  }
}

// Special case for development mode
const handleDevAuth = (email: string, password: string) => {
  if (process.env.NODE_ENV !== 'production') {
    // Default admin credentials
    if (email === 'admin@example.com' && password === 'password') {
      return {
        id: 'admin',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
      };
    }

    // Additional development user for AOPS
    if (email === 'AOPS@omanairports.com' && password === 'password') {
      return {
        id: 'aops-admin',
        name: 'AOPS Admin',
        email: 'AOPS@omanairports.com',
        role: 'admin'
      };
    }

    // Test credentials for Oman Airports
    if (email === 'youremail@omanairports.com' && password === 'password123') {
      return {
        id: 'test-user',
        name: 'Test User',
        email: 'youremail@omanairports.com',
        role: 'admin'
      };
    }

    // Additional test users with different roles
    if (email === 'manager@omanairports.com' && password === 'password123') {
      return {
        id: 'manager-user',
        name: 'Project Manager',
        email: 'manager@omanairports.com',
        role: 'manager'
      };
    }

    if (email === 'user@omanairports.com' && password === 'password123') {
      return {
        id: 'regular-user',
        name: 'Regular User',
        email: 'user@omanairports.com',
        role: 'user'
      };
    }
  }
  return null;
};

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-here',
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Try Firebase authentication first
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials.email,
            credentials.password
          );

          if (userCredential.user) {
            // Get user data from Firestore
            const userData = await getUserByEmail(credentials.email);

            if (userData) {
              return {
                id: userCredential.user.uid,
                name: userData.name,
                email: userData.email,
                role: userData.role || 'user'
              };
            }
          }
        } catch (firebaseError) {
          console.log('Firebase auth failed, trying dev credentials:', firebaseError);

          // Fallback to dev credentials for development
          const devUser = handleDevAuth(credentials.email, credentials.password);
          if (devUser) return devUser;
        }

        return null;
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role;
        token.sub = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token && session.user) {
        session.user.role = token.role;
        session.user.id = token.sub;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
};