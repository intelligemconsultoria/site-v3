import { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { LoginForm } from "./LoginForm";
import { Card, CardContent } from "./ui/card";
import { Shield, Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  onBack?: () => void;
  requireAuth?: boolean;
  customLoginTitle?: string;
  customLoginDescription?: string;
}

export function ProtectedRoute({ 
  children, 
  fallback, 
  onBack,
  requireAuth = true,
  customLoginTitle,
  customLoginDescription
}: ProtectedRouteProps) {
  const { authenticated, loading, user } = useAuth();

  // If auth is not required, always show children
  if (!requireAuth) {
    return <>{children}</>;
  }

  // Show loading state
  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen bg-gradient-to-br from-background to-blue-900/20 flex items-center justify-center">
          <Card className="bg-card/80 backdrop-blur-sm border-border p-8">
            <CardContent className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div className="text-center space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mx-auto" />
                <h3 className="text-foreground">Verificando autenticação...</h3>
                <p className="text-foreground/60 text-sm">
                  Aguarde enquanto validamos suas credenciais
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    );
  }

  // Show login form if not authenticated
  if (!authenticated || !user) {
    return (
      <LoginForm 
        onBack={onBack}
        title={customLoginTitle}
        description={customLoginDescription}
      />
    );
  }

  // User is authenticated, show protected content
  return <>{children}</>;
}

// Hook for checking auth status in components
export function useRequireAuth() {
  const { authenticated, loading, user } = useAuth();
  
  return {
    isAuthenticated: authenticated,
    isLoading: loading,
    user,
    requiresLogin: !loading && !authenticated
  };
}