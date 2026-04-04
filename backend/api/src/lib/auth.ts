import { betterAuth } from 'better-auth';
import { dbPool } from './db';
import { getAllowedOrigins } from './origins';
import { sendTemplateEmail } from './transactional-email';

const socialProviders = {
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
      }
    : {}),
  ...(process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET
    ? {
        reddit: {
          clientId: process.env.REDDIT_CLIENT_ID,
          clientSecret: process.env.REDDIT_CLIENT_SECRET,
        },
      }
    : {}),
  ...(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET
    ? {
        twitter: {
          clientId: process.env.TWITTER_CLIENT_ID,
          clientSecret: process.env.TWITTER_CLIENT_SECRET,
        },
      }
    : {}),
};

export const auth = betterAuth({
  database: dbPool,
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3001',
  basePath: '/api/auth',
  trustedOrigins: getAllowedOrigins(),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendTemplateEmail({
        kind: 'password-reset',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        actionUrl: url,
      });
    },
    onPasswordReset: async ({ user }) => {
      await sendTemplateEmail({
        kind: 'password-reset-success',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    },
    onExistingUserSignUp: async ({ user }) => {
      await sendTemplateEmail({
        kind: 'account-activity',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendTemplateEmail({
        kind: 'verify-email',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        actionUrl: url,
      });
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const email =
            typeof user.email === 'string' ? user.email.trim() : undefined;
          await sendTemplateEmail({
            kind: 'signup-welcome',
            user: {
              id: String(user.id ?? ''),
              email,
              name: typeof user.name === 'string' ? user.name : undefined,
            },
          });
        },
      },
    },
  },
  socialProviders,
});
