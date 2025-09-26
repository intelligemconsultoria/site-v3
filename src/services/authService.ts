import { getAuthClient } from '../utils/supabase/client';

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  last_sign_in_at?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  authenticated: boolean;
}

export class AuthService {
  
  // Sign in with email and password
  static async signIn(email: string, password: string): Promise<{
    success: boolean;
    user?: User;
    error?: string;
  }> {
    try {
      const supabase = getAuthClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        
        // Provide more specific error messages
        let userFriendlyError = error.message;
        if (error.message.includes('Invalid login credentials')) {
          userFriendlyError = 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.';
        } else if (error.message.includes('Email not confirmed')) {
          userFriendlyError = 'Email não confirmado. Verifique sua caixa de entrada.';
        } else if (error.message.includes('User not found')) {
          userFriendlyError = 'Usuário não encontrado. Verifique o email digitado.';
        }
        
        return {
          success: false,
          error: userFriendlyError
        };
      }

      if (data.user && data.session) {
        const user: User = {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
          role: data.user.user_metadata?.role || 'admin',
          last_sign_in_at: data.user.last_sign_in_at
        };

        // Store session info in localStorage for persistence
        localStorage.setItem('intelligem-auth-session', JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          user: user,
          expires_at: data.session.expires_at
        }));

        return {
          success: true,
          user
        };
      }

      return {
        success: false,
        error: 'Falha na autenticação'
      };
    } catch (error) {
      console.error('Sign in exception:', error);
      return {
        success: false,
        error: 'Erro inesperado durante o login'
      };
    }
  }

  // Sign out
  static async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = getAuthClient();
      const { error } = await supabase.auth.signOut();
      
      // Clear local storage regardless of Supabase response
      localStorage.removeItem('intelligem-auth-session');
      
      // Clear any potential auth state in localStorage that might cause conflicts
      const authKeys = [
        'sb-intelligem-auth-token',
        'supabase.auth.token',
        'sb-auth-token'
      ];
      authKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        } catch (e) {
          // Ignore errors for non-existent keys
        }
      });
      
      if (error) {
        console.error('Sign out error:', error);
        // Don't return error since we cleared local storage
      }

      return { success: true };
    } catch (error) {
      console.error('Sign out exception:', error);
      // Clear local storage even on exception
      localStorage.removeItem('intelligem-auth-session');
      return { success: true };
    }
  }

  // Get current session
  static async getCurrentSession(): Promise<{
    success: boolean;
    user?: User;
    accessToken?: string;
    error?: string;
  }> {
    try {
      // Always check Supabase session first (most reliable)
      const supabase = getAuthClient();
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Get session error:', error);
        // Clear any stale local session
        localStorage.removeItem('intelligem-auth-session');
        return {
          success: false,
          error: error.message
        };
      }

      if (data.session && data.session.user) {
        const user: User = {
          id: data.session.user.id,
          email: data.session.user.email || '',
          name: data.session.user.user_metadata?.name || data.session.user.email?.split('@')[0],
          role: data.session.user.user_metadata?.role || 'admin',
          last_sign_in_at: data.session.user.last_sign_in_at
        };

        // Update localStorage with fresh session data
        localStorage.setItem('intelligem-auth-session', JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          user: user,
          expires_at: data.session.expires_at
        }));

        return {
          success: true,
          user,
          accessToken: data.session.access_token
        };
      }

      // No valid session
      localStorage.removeItem('intelligem-auth-session');
      return {
        success: false,
        error: 'Nenhuma sessão ativa encontrada'
      };
    } catch (error) {
      console.error('Get session exception:', error);
      localStorage.removeItem('intelligem-auth-session');
      return {
        success: false,
        error: 'Erro ao verificar sessão'
      };
    }
  }

  // Refresh access token
  static async refreshToken(): Promise<{
    success: boolean;
    accessToken?: string;
    error?: string;
  }> {
    try {
      const supabase = getAuthClient();
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error('Refresh token error:', error);
        localStorage.removeItem('intelligem-auth-session');
        return {
          success: false,
          error: error.message
        };
      }

      if (data.session) {
        // Update localStorage
        const storedSession = localStorage.getItem('intelligem-auth-session');
        if (storedSession) {
          const sessionData = JSON.parse(storedSession);
          sessionData.access_token = data.session.access_token;
          sessionData.expires_at = data.session.expires_at;
          localStorage.setItem('intelligem-auth-session', JSON.stringify(sessionData));
        }

        return {
          success: true,
          accessToken: data.session.access_token
        };
      }

      return {
        success: false,
        error: 'Falha ao renovar token'
      };
    } catch (error) {
      console.error('Refresh token exception:', error);
      return {
        success: false,
        error: 'Erro ao renovar token'
      };
    }
  }

  // Check if user is authenticated (quick check using localStorage)
  static isAuthenticated(): boolean {
    const storedSession = localStorage.getItem('intelligem-auth-session');
    if (!storedSession) return false;

    try {
      const sessionData = JSON.parse(storedSession);
      const expiresAt = new Date(sessionData.expires_at * 1000);
      const now = new Date();
      
      return expiresAt.getTime() > now.getTime();
    } catch {
      localStorage.removeItem('intelligem-auth-session');
      return false;
    }
  }

  // Get access token for API calls
  static getAccessToken(): string | null {
    const storedSession = localStorage.getItem('intelligem-auth-session');
    if (!storedSession) return null;

    try {
      const sessionData = JSON.parse(storedSession);
      return sessionData.access_token || null;
    } catch {
      return null;
    }
  }

  // Get current user from localStorage (quick access)
  static getCurrentUser(): User | null {
    const storedSession = localStorage.getItem('intelligem-auth-session');
    if (!storedSession) return null;

    try {
      const sessionData = JSON.parse(storedSession);
      return sessionData.user || null;
    } catch {
      return null;
    }
  }
}