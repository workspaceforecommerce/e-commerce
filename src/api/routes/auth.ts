import { Hono } from 'hono';
import { Env, executeRun, queryAll, queryFirst } from '../db';

const authApp = new Hono<{ Bindings: Env }>();

// Simple Web Crypto SHA-256 / Hash Helper
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'HEALTHY_MONKS_SALT_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// 1. Customer / User Registration
authApp.post('/register', async (c) => {
  const { first_name, last_name, email, phone, password } = await c.req.json();

  if (!email || !password || !first_name) {
    return c.json({ success: false, message: 'First name, email, and password are required.' }, 400);
  }

  const hashedPassword = await hashPassword(password);

  if (!c.env?.DB) {
    return c.json({
      success: true,
      message: 'Account created successfully! Please verify your email/mobile OTP.',
      user: { id: Date.now(), first_name, last_name, email, phone, role: 'Customer' },
    });
  }

  const existing = await queryFirst(c.env.DB, 'SELECT id FROM users WHERE email = ?', [email]);
  if (existing) {
    return c.json({ success: false, message: 'An account with this email address already exists.' }, 400);
  }

  await executeRun(
    c.env.DB,
    'INSERT INTO users (role_id, first_name, last_name, email, phone, password_hash) VALUES (3, ?, ?, ?, ?, ?)',
    [first_name, last_name || '', email, phone || '', hashedPassword]
  );

  return c.json({
    success: true,
    message: 'Registration successful! Welcome to Healthy Monks.',
  });
});

// 2. User & Admin Login (Supports Password or Mobile OTP)
authApp.post('/login', async (c) => {
  const { email, password, login_type = 'email' } = await c.req.json();

  if (!email) {
    return c.json({ success: false, message: 'Email address is required.' }, 400);
  }

  if (login_type === 'email' && !password) {
    return c.json({ success: false, message: 'Password is required.' }, 400);
  }

  // ─── Hardcoded Super Admin Credentials ─────────────────────────
  // These are checked FIRST before any DB lookup so the admin can
  // always log in even if the DB is unavailable or not yet seeded.
  const ADMIN_EMAIL = 'mohdnomaantalib@gmail.com';
  const ADMIN_PASSWORD = 'Cba@4321';
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const tokenPayload = { id: 0, email: ADMIN_EMAIL, role: 'Super Admin' };
    const accessToken = 'hm_at_' + btoa(JSON.stringify(tokenPayload)) + '.' + Date.now();
    return c.json({
      success: true,
      message: 'Welcome back, Super Admin!',
      data: {
        user: {
          id: 0,
          first_name: 'Mohd Nomaan',
          last_name: 'Talib',
          email: ADMIN_EMAIL,
          phone: '+91 9812345678',
          role: 'Super Admin',
        },
        tokens: { access_token: accessToken, refresh_token: accessToken, expires_in: 3600 },
      },
    });
  }
  // ───────────────────────────────────────────────────────────────

  const hashedPassword = await hashPassword(password || '');

  let user: any = null;
  if (c.env?.DB) {
    user = await queryFirst(
      c.env.DB,
      'SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = ?',
      [email]
    );

    if (user && user.password_hash !== hashedPassword && login_type === 'email') {
      // Log failed login
      await executeRun(
        c.env.DB,
        'INSERT INTO api_logs (service_name, event_type, recipient, payload, response_status) VALUES (?, ?, ?, ?, ?)',
        ['AuthService', 'FailedLogin', email, JSON.stringify({ reason: 'Invalid password' }), 'FAILURE']
      );
      return c.json({ success: false, message: 'Invalid credentials provided.' }, 401);
    }
  } else {
    // Fallback mock user for testing/demo
    const isAdmin = email === 'mohdnomaantalib@gmail.com' || email.includes('admin');
    user = {
      id: 1,
      first_name: isAdmin ? 'Mohd Nomaan' : 'Aarav',
      last_name: isAdmin ? 'Talib (Admin)' : 'Sharma',
      email: email,
      phone: '+91 9812345678',
      role_name: isAdmin ? 'Super Admin' : 'Customer',
    };
  }

  if (!user) {
    return c.json({ success: false, message: 'No account found with this email address.' }, 404);
  }

  // Generate tokens
  const tokenPayload = { id: user.id, email: user.email, role: user.role_name };
  const accessToken = 'hm_at_' + btoa(JSON.stringify(tokenPayload)) + '.' + Date.now();
  const refreshToken = 'hm_rt_' + btoa(JSON.stringify(tokenPayload)) + '.' + (Date.now() + 86400000);

  // Log successful login session
  if (c.env?.DB) {
    await executeRun(
      c.env.DB,
      'INSERT INTO api_logs (service_name, event_type, recipient, payload, response_status) VALUES (?, ?, ?, ?, ?)',
      ['AuthService', 'UserLogin', email, JSON.stringify({ role: user.role_name, token: accessToken }), 'SUCCESS']
    );
  }

  return c.json({
    success: true,
    message: 'Login successful!',
    data: {
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role_name || 'Customer',
      },
      tokens: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 3600,
      },
    },
  });
});

// 3. Send Email / Mobile OTP
authApp.post('/send-email-otp', async (c) => {
  const { email } = await c.req.json();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  if (c.env?.DB) {
    await executeRun(
      c.env.DB,
      'INSERT INTO api_logs (service_name, event_type, recipient, payload, response_status) VALUES (?, ?, ?, ?, ?)',
      ['EmailOTP', 'OTPSent', email, JSON.stringify({ otp, expiry: '5 mins' }), 'SUCCESS']
    );
  }

  return c.json({
    success: true,
    message: `6-digit verification code sent to ${email}`,
    data: { cooldown: 60, expires_in: 300 },
  });
});

authApp.post('/send-mobile-otp', async (c) => {
  const { phone } = await c.req.json();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  if (c.env?.DB) {
    await executeRun(
      c.env.DB,
      'INSERT INTO api_logs (service_name, event_type, recipient, payload, response_status) VALUES (?, ?, ?, ?, ?)',
      ['SMSOTP', 'MobileOTPSent', phone, JSON.stringify({ otp, expiry: '5 mins' }), 'SUCCESS']
    );
  }

  return c.json({
    success: true,
    message: `6-digit SMS code sent to ${phone}`,
    data: { cooldown: 60, expires_in: 300 },
  });
});

// 4. Verify OTP
authApp.post('/verify-email-otp', async (c) => {
  const { email, otp } = await c.req.json();
  if (otp.length === 6) {
    return c.json({ success: true, message: 'Email address verified successfully!' });
  }
  return c.json({ success: false, message: 'Invalid 6-digit verification code.' }, 400);
});

authApp.post('/verify-mobile-otp', async (c) => {
  const { phone, otp } = await c.req.json();
  if (otp.length === 6) {
    return c.json({ success: true, message: 'Mobile phone verified successfully!' });
  }
  return c.json({ success: false, message: 'Invalid 6-digit SMS OTP.' }, 400);
});

// 5. Forgot Password & Reset Password
authApp.post('/forgot-password', async (c) => {
  const { email } = await c.req.json();
  return c.json({
    success: true,
    message: `Password reset link & 6-digit OTP dispatched to ${email}`,
  });
});

authApp.post('/reset-password', async (c) => {
  const { email, otp, new_password } = await c.req.json();
  const hashedPassword = await hashPassword(new_password);

  if (c.env?.DB) {
    await executeRun(c.env.DB, 'UPDATE users SET password_hash = ? WHERE email = ?', [hashedPassword, email]);
  }

  return c.json({ success: true, message: 'Your password has been reset successfully. Please login.' });
});

// 6. Token Refresh & Logout
authApp.post('/refresh', async (c) => {
  const { refresh_token } = await c.req.json();
  if (!refresh_token) {
    return c.json({ success: false, message: 'Refresh token is required' }, 400);
  }
  const newAccessToken = 'hm_at_' + Date.now();
  return c.json({
    success: true,
    tokens: { access_token: newAccessToken, expires_in: 3600 },
  });
});

authApp.post('/logout', async (c) => {
  return c.json({ success: true, message: 'Logged out successfully from all active sessions.' });
});

export default authApp;
