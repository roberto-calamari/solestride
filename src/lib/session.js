export const SESSION_OPTIONS = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long_for_dev_only',
  cookieName: 'solestride_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
};
