import { betterAuth } from 'better-auth';
import { dbPool } from './db';
import { getAllowedOrigins } from './origins';
import { sendTemplateEmail } from './transactional-email';

function cleanEnv(value?: string): string | null {
  if (!value) return null;
  const cleaned = value.trim().replace(/^['"]|['"]$/g, '');
  return cleaned || null;
}

function resolveAuthBaseUrl(): string {
  const frontendUrl = cleanEnv(process.env.FRONTEND_URL);
  const frontendUrlsFirst = cleanEnv(process.env.FRONTEND_URLS?.split(',')[0]);
  const betterAuthPublic = cleanEnv(process.env.BETTER_AUTH_PUBLIC_URL);
  const betterAuthUrl = cleanEnv(process.env.BETTER_AUTH_URL);

  return (
    betterAuthPublic ||
    frontendUrl ||
    frontendUrlsFirst ||
    betterAuthUrl ||
    'http://localhost:3000'
  );
}

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
  baseURL: resolveAuthBaseUrl(),
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
    session: {
      create: {
        after: async (session) => {
          const userId =
            typeof session.userId === 'string' ? session.userId : null;
          if (!userId) return;

          const result = await dbPool.query(
            `
            SELECT id, email, name
            FROM "user"
            WHERE id = $1
            LIMIT 1
            `,
            [userId],
          );

          const user = result.rows[0] as
            | { id?: string; email?: string; name?: string }
            | undefined;
          if (!user?.email) return;

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
    },
  },
  socialProviders,
});
