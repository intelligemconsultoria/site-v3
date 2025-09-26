import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthService, User, AuthState } from '../services/authService';
import { toast } from 'sonner@2.0.3';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    authenticated: false,
  });

  // Initialize auth state
  const initializeAuth = async () => {
    setAuthState(prev => ({ ...prev, loading: true }));

    try {
      const result = await AuthService.getCurrentSession();
      
      if (result.success && result.user) {
        setAuthState({
          user: result.user,
          loading: false,
          authenticated: true,
        });
      } else {
        setAuthState({
          user: null,
          loading: false,
          authenticated: false,
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setAuthState({
        user: null,
        loading: false,
        authenticated: false,
      });
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, loading: true }));

    try {
      const result = await AuthService.signIn(email, password);
      
      if (result.success && result.user) {
        setAuthState({
          user: result.user,
          loading: false,
          authenticated: true,
        });
        
        toast.success(`Bem-vindo, ${result.user.name || result.user.email}!`);
        return true;
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
        toast.error(result.error || 'Erro no login');
        return false;
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
      toast.error('Erro inesperado durante o login');
      return false;
    }
  };

  // Sign out function
  const signOut = async (): Promise<void> => {
    setAuthState(prev => ({ ...prev, loading: true }));

    try {
      await AuthService.signOut();
      setAuthState({
        user: null,
        loading: false,
        authenticated: false,
      });
      
      toast.success('Logout realizado com sucesso');
    } catch (error) {
      console.error('Sign out error:', error);
      // Still update state even if there was an error
      setAuthState({
        user: null,
        loading: false,
        authenticated: false,
      });
      toast.error('Erro durante logout, mas sessão foi limpa');
    }
  };

  // Refresh auth state
  const refreshAuth = async (): Promise<void> => {
    await initializeAuth();
  };

  // Initialize on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Simplified auto-refresh (only when needed)
  useEffect(() => {
    if (!authState.authenticated) return;

    // Only refresh on critical operations, not on intervals
    const handleBeforeUnload = () => {
      // Save state before page unload
      if (authState.user) {
        localStorage.setItem('intelligem-last-auth-check', Date.now().toString());
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [authState.authenticated, authState.user]);

  // Listen for storage changes (multi-tab support)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'intelligem-auth-session') {
        if (e.newValue === null) {
          // Session was cleared in another tab
          setAuthState({
            user: null,
            loading: false,
            authenticated: false,
          });
        } else if (e.newValue !== e.oldValue) {
          // Session was updated in another tab
          refreshAuth();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const contextValue: AuthContextType = {
    ...authState,
    signIn,
    signOut,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}