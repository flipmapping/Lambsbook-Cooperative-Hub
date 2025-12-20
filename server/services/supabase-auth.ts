import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not configured. Auth features will be disabled.');
}

export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export interface AuthResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export async function sendMagicLink(email: string): Promise<AuthResult> {
  if (!supabase) {
    return { success: false, message: 'Supabase not configured', error: 'SUPABASE_NOT_CONFIGURED' };
  }

  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${process.env.APP_URL || 'http://localhost:5000'}/auth/callback`,
      },
    });

    if (error) {
      console.error('Magic link error:', error.message);
      return { success: false, message: error.message, error: error.code };
    }

    return { 
      success: true, 
      message: 'Magic link sent! Check your email to sign in.',
      data 
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, message: errorMsg, error: 'UNKNOWN_ERROR' };
  }
}

export async function sendEmailOTP(email: string): Promise<AuthResult> {
  if (!supabase) {
    return { success: false, message: 'Supabase not configured', error: 'SUPABASE_NOT_CONFIGURED' };
  }

  try {
    console.log('Sending OTP to:', email);
    console.log('Supabase URL:', supabaseUrl);
    
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      console.error('Email OTP error details:', {
        message: error.message,
        status: error.status,
        code: error.code,
        name: error.name,
      });
      return { success: false, message: error.message, error: error.code || 'OTP_ERROR' };
    }

    console.log('OTP sent successfully:', data);
    return { 
      success: true, 
      message: 'Verification code sent! Check your email.',
      data 
    };
  } catch (err) {
    console.error('OTP exception:', err);
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, message: errorMsg, error: 'UNKNOWN_ERROR' };
  }
}

export async function verifyEmailOTP(email: string, token: string): Promise<AuthResult> {
  if (!supabase) {
    return { success: false, message: 'Supabase not configured', error: 'SUPABASE_NOT_CONFIGURED' };
  }

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) {
      console.error('OTP verification error:', error.message);
      return { success: false, message: error.message, error: error.code };
    }

    return { 
      success: true, 
      message: 'Email verified successfully!',
      data: {
        user: data.user,
        session: data.session,
      }
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, message: errorMsg, error: 'UNKNOWN_ERROR' };
  }
}

export async function signUpWithPassword(email: string, password: string, metadata?: Record<string, any>): Promise<AuthResult> {
  if (!supabase) {
    return { success: false, message: 'Supabase not configured', error: 'SUPABASE_NOT_CONFIGURED' };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${process.env.APP_URL || 'http://localhost:5000'}/auth/callback`,
      },
    });

    if (error) {
      console.error('Signup error:', error.message);
      return { success: false, message: error.message, error: error.code };
    }

    return { 
      success: true, 
      message: 'Account created! Please check your email to verify.',
      data: {
        user: data.user,
        session: data.session,
      }
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, message: errorMsg, error: 'UNKNOWN_ERROR' };
  }
}

export async function signInWithPassword(email: string, password: string): Promise<AuthResult> {
  if (!supabase) {
    return { success: false, message: 'Supabase not configured', error: 'SUPABASE_NOT_CONFIGURED' };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign in error:', error.message);
      return { success: false, message: error.message, error: error.code };
    }

    return { 
      success: true, 
      message: 'Signed in successfully!',
      data: {
        user: data.user,
        session: data.session,
      }
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, message: errorMsg, error: 'UNKNOWN_ERROR' };
  }
}

export async function signOut(accessToken?: string): Promise<AuthResult> {
  if (!supabase) {
    return { success: false, message: 'Supabase not configured', error: 'SUPABASE_NOT_CONFIGURED' };
  }

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Sign out error:', error.message);
      return { success: false, message: error.message, error: error.code };
    }

    return { success: true, message: 'Signed out successfully!' };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, message: errorMsg, error: 'UNKNOWN_ERROR' };
  }
}

export async function getUser(accessToken: string): Promise<AuthResult> {
  if (!supabase) {
    return { success: false, message: 'Supabase not configured', error: 'SUPABASE_NOT_CONFIGURED' };
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error) {
      return { success: false, message: error.message, error: error.code };
    }

    if (!user) {
      return { success: false, message: 'User not found', error: 'USER_NOT_FOUND' };
    }

    return { 
      success: true, 
      message: 'User retrieved',
      data: { user }
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, message: errorMsg, error: 'UNKNOWN_ERROR' };
  }
}

export async function resetPassword(email: string): Promise<AuthResult> {
  if (!supabase) {
    return { success: false, message: 'Supabase not configured', error: 'SUPABASE_NOT_CONFIGURED' };
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.APP_URL || 'http://localhost:5000'}/auth/reset-password`,
    });

    if (error) {
      console.error('Password reset error:', error.message);
      return { success: false, message: error.message, error: error.code };
    }

    return { 
      success: true, 
      message: 'Password reset email sent! Check your inbox.'
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, message: errorMsg, error: 'UNKNOWN_ERROR' };
  }
}
