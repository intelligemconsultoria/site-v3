import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { AuthService } from "../services/authService";
import { getAuthClient } from "../utils/supabase/client";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { Bug, CheckCircle, XCircle, RefreshCw } from "lucide-react";

export function AuthDebugInfo() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const supabase = getAuthClient();
      
      // Check basic connection
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      
      // Check user status
      const currentUser = AuthService.getCurrentUser();
      const isAuthenticated = AuthService.isAuthenticated();
      const accessToken = AuthService.getAccessToken();
      
      // Check localStorage
      const storedSession = localStorage.getItem('intelligem-auth-session');
      
      const info = {
        timestamp: new Date().toISOString(),
        environment: {
          projectId: projectId,
          hasAnonKey: !!publicAnonKey,
          anonKeyLength: publicAnonKey?.length || 0
        },
        session: {
          hasSession: !!session,
          sessionError: sessionError?.message || null,
          user: session?.user || null
        },
        localStorage: {
          hasStoredSession: !!storedSession,
          storedSessionValid: (() => {
            if (!storedSession) return false;
            try {
              const parsed = JSON.parse(storedSession);
              return !!(parsed.access_token && parsed.user);
            } catch {
              return false;
            }
          })()
        },
        authService: {
          currentUser,
          isAuthenticated,
          hasAccessToken: !!accessToken,
          accessTokenLength: accessToken?.length || 0
        }
      };
      
      setDebugInfo(info);
    } catch (error) {
      console.error('Debug diagnostics error:', error);
      setDebugInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = () => {
    localStorage.removeItem('intelligem-auth-session');
    ['sb-intelligem-auth-token', 'supabase.auth.token', 'sb-auth-token'].forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    setDebugInfo(null);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-card/50 border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Bug className="w-5 h-5" />
          Diagnóstico de Autenticação
        </CardTitle>
        <CardDescription className="text-foreground/60">
          Ferramenta de debug para problemas de login
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={runDiagnostics} 
            disabled={loading}
            className="bg-emerald-400 text-black hover:bg-emerald-500"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Executando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Executar Diagnóstico
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={clearAllData}
            className="border-red-400 text-red-400 hover:bg-red-400/10"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Limpar Dados
          </Button>
        </div>

        {debugInfo && (
          <div className="space-y-4">
            <Separator className="bg-border" />
            
            {debugInfo.error ? (
              <div className="p-4 bg-red-400/10 border border-red-400/20 rounded-lg">
                <p className="text-red-400">Erro: {debugInfo.error}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Environment */}
                <div>
                  <h4 className="text-foreground mb-2">Ambiente</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Project ID:</span>
                      <Badge variant="outline">{debugInfo.environment.projectId}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Anon Key:</span>
                      <Badge variant={debugInfo.environment.hasAnonKey ? "default" : "destructive"}>
                        {debugInfo.environment.hasAnonKey ? 'OK' : 'Missing'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Session */}
                <div>
                  <h4 className="text-foreground mb-2">Sessão Supabase</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Tem Sessão:</span>
                      <Badge variant={debugInfo.session.hasSession ? "default" : "secondary"}>
                        {debugInfo.session.hasSession ? 'Sim' : 'Não'}
                      </Badge>
                    </div>
                    {debugInfo.session.sessionError && (
                      <div className="flex justify-between">
                        <span className="text-foreground/60">Erro:</span>
                        <span className="text-red-400 text-xs">{debugInfo.session.sessionError}</span>
                      </div>
                    )}
                    {debugInfo.session.user && (
                      <div className="flex justify-between">
                        <span className="text-foreground/60">Email:</span>
                        <span className="text-foreground text-xs">{debugInfo.session.user.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Local Storage */}
                <div>
                  <h4 className="text-foreground mb-2">Local Storage</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Sessão Armazenada:</span>
                      <Badge variant={debugInfo.localStorage.hasStoredSession ? "default" : "secondary"}>
                        {debugInfo.localStorage.hasStoredSession ? 'Sim' : 'Não'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Sessão Válida:</span>
                      <Badge variant={debugInfo.localStorage.storedSessionValid ? "default" : "destructive"}>
                        {debugInfo.localStorage.storedSessionValid ? 'Sim' : 'Não'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Auth Service */}
                <div>
                  <h4 className="text-foreground mb-2">Auth Service</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Autenticado:</span>
                      <Badge variant={debugInfo.authService.isAuthenticated ? "default" : "secondary"}>
                        {debugInfo.authService.isAuthenticated ? 'Sim' : 'Não'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Token de Acesso:</span>
                      <Badge variant={debugInfo.authService.hasAccessToken ? "default" : "secondary"}>
                        {debugInfo.authService.hasAccessToken ? 'OK' : 'Missing'}
                      </Badge>
                    </div>
                    {debugInfo.authService.currentUser && (
                      <div className="flex justify-between">
                        <span className="text-foreground/60">Usuário:</span>
                        <span className="text-foreground text-xs">{debugInfo.authService.currentUser.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}