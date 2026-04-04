export type AppUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
};

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  tags?: Array<{ name: string; value: string }>;
};

type TemplateKind =
  | 'signup-welcome'
  | 'verify-email'
  | 'password-reset'
  | 'password-reset-success'
  | 'payment-success'
  | 'waitlist-followup'
  | 'account-activity';

function getEnv(name: string): string | null {
  const value = process.env[name];
  if (!value) return null;
  const cleaned = value.trim().replace(/^['"]|['"]$/g, '');
  return cleaned || null;
}

function getAppBaseUrl(): string {
  const url =
    getEnv('FRONTEND_URL') ||
    getEnv('NEXT_PUBLIC_APP_URL') ||
    'http://localhost:3000';
  return url.replace(/\/+$/, '');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderTemplate(input: {
  kind: TemplateKind;
  userName?: string | null;
  actionUrl?: string;
  credits?: number;
}): { subject: string; html: string; text: string } {
  const name = input.userName?.trim() || 'there';
  const safeName = escapeHtml(name);
  const appUrl = getAppBaseUrl();

  const header = `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">`;
  const footer = `<p style="margin-top:24px;color:#555">SmartApply Team<br/><a href="${appUrl}">${appUrl}</a></p></div>`;

  if (input.kind === 'signup-welcome') {
    return {
      subject: 'Welcome to SmartApply',
      html:
        `${header}<p>Hi ${safeName},</p>` +
        '<p>Your account is ready. You can now generate tailored job emails, optimize CVs, and track applications.</p>' +
        `<p><a href="${appUrl}/dashboard">Open your dashboard</a></p>${footer}`,
      text:
        `Hi ${name},\n\n` +
        'Your account is ready. You can now generate tailored job emails, optimize CVs, and track applications.\n\n' +
        `Open your dashboard: ${appUrl}/dashboard`,
    };
  }

  if (input.kind === 'verify-email') {
    const actionUrl = input.actionUrl || `${appUrl}/auth/signin`;
    return {
      subject: 'Verify your SmartApply email',
      html:
        `${header}<p>Hi ${safeName},</p>` +
        '<p>Please verify your email address to keep your account secure.</p>' +
        `<p><a href="${actionUrl}">Verify email</a></p>${footer}`,
      text:
        `Hi ${name},\n\n` +
        'Please verify your email address to keep your account secure.\n\n' +
        `Verify email: ${actionUrl}`,
    };
  }

  if (input.kind === 'password-reset') {
    const actionUrl = input.actionUrl || `${appUrl}/auth/forgot-password`;
    return {
      subject: 'Reset your SmartApply password',
      html:
        `${header}<p>Hi ${safeName},</p>` +
        '<p>We received a request to reset your password.</p>' +
        `<p><a href="${actionUrl}">Reset password</a></p>` +
        '<p>If this was not you, you can ignore this email.</p>' +
        `${footer}`,
      text:
        `Hi ${name},\n\n` +
        'We received a request to reset your password.\n\n' +
        `Reset password: ${actionUrl}\n\n` +
        'If this was not you, you can ignore this email.',
    };
  }

  if (input.kind === 'password-reset-success') {
    return {
      subject: 'Your SmartApply password was updated',
      html:
        `${header}<p>Hi ${safeName},</p>` +
        '<p>Your password was changed successfully.</p>' +
        `<p>If this was not you, reset password immediately from <a href="${appUrl}/auth/forgot-password">here</a>.</p>${footer}`,
      text:
        `Hi ${name},\n\nYour password was changed successfully.\n\n` +
        `If this was not you, reset password immediately: ${appUrl}/auth/forgot-password`,
    };
  }

  if (input.kind === 'payment-success') {
    const credits = Math.max(0, Math.floor(input.credits ?? 0));
    return {
      subject: 'Payment successful: credits added',
      html:
        `${header}<p>Hi ${safeName},</p>` +
        `<p>Payment received successfully. We added <strong>${credits} credits</strong> to your SmartApply wallet.</p>` +
        `<p><a href="${appUrl}/dashboard/settings">View billing settings</a></p>${footer}`,
      text:
        `Hi ${name},\n\nPayment received successfully. We added ${credits} credits to your SmartApply wallet.\n\n` +
        `View billing settings: ${appUrl}/dashboard/settings`,
    };
  }

  if (input.kind === 'waitlist-followup') {
    return {
      subject: 'You are on the SmartApply waitlist',
      html:
        `${header}<p>Hi ${safeName},</p>` +
        '<p>Thanks for joining the SmartApply waitlist. We will notify you about new features and early access updates.</p>' +
        `${footer}`,
      text:
        `Hi ${name},\n\n` +
        'Thanks for joining the SmartApply waitlist. We will notify you about new features and early access updates.',
    };
  }

  return {
    subject: 'New sign-up attempt detected',
    html:
      `${header}<p>Hi ${safeName},</p>` +
      '<p>Someone attempted to sign up with your email address on SmartApply. If this was you, you can ignore this message.</p>' +
      '<p>If this was not you, we recommend resetting your password.</p>' +
      `${footer}`,
    text:
      `Hi ${name},\n\n` +
      'Someone attempted to sign up with your email address on SmartApply. If this was you, you can ignore this message.\n\n' +
      `If this was not you, reset password: ${appUrl}/auth/forgot-password`,
  };
}

export async function sendTransactionalEmail(
  input: SendEmailInput,
): Promise<void> {
  const key = getEnv('RESEND_API_KEY');
  const from = getEnv('MAIL_FROM') || 'SmartApply <no-reply@smartapply.app>';
  if (!key) {
    console.warn(
      '[transactional-email] RESEND_API_KEY missing. Skipping send.',
    );
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
      tags: input.tags,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    console.error(
      '[transactional-email] send failed',
      response.status,
      errText,
    );
  }
}

export async function sendTemplateEmail(params: {
  kind: TemplateKind;
  user: AppUser;
  actionUrl?: string;
  credits?: number;
}) {
  const to = params.user.email?.trim();
  if (!to) return;

  const template = renderTemplate({
    kind: params.kind,
    userName: params.user.name,
    actionUrl: params.actionUrl,
    credits: params.credits,
  });

  await sendTransactionalEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
    tags: [
      { name: 'app', value: 'smartapply' },
      { name: 'template', value: params.kind },
    ],
  });
}
