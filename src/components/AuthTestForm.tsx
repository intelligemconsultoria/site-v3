import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { getAuthClient } from "../utils/supabase/client";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { CheckCircle, XCircle, User, Key } from "lucide-react";

export function AuthTestForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const testCredentials = async () => {
    if (!email.trim() || !password.trim()) return;
    
    setTesting(true);
    setTestResult(null);
    
    try {
      const supabase = getAuthClient();
      
      // Test connection first
      console.log('Testing connection to:', `https://${projectId}.supabase.co`);
      console.log('Using anon key length:', publicAnonKey?.length);
      
      // Try to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      const result = {
        timestamp: new Date().toISOString(),
        success: !error && !!data.user,
        error: error?.message || null,
        user: data.user ? {
          id: data.user.id,
          email: data.user.email,
          emailConfirmed: data.user.email_confirmed_at !== null,
          lastSignIn: data.user.last_sign_in_at,
          createdAt: data.user.created_at
        } : null,
        session: data.session ? {
          hasAccessToken: !!data.session.access_token,
          hasRefreshToken: !!data.session.refresh_token,
          expiresAt: data.session.expires_at
        } : null
      };

      setTestResult(result);

      // If successful, sign out immediately (this is just a test)
      if (result.success) {
        await supabase.auth.signOut();
      }

    } catch (error) {
      console.error('Test error:', error);
      setTestResult({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-card/50 border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Key className="w-5 h-5" />
          Teste de Credenciais
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-email" className="text-foreground">Email</Label>
          <Input
            id="test-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="bg-input-background border-border text-foreground"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="test-password" className="text-foreground">Senha</Label>
          <Input
            id="test-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Sua senha"
            className="bg-input-background border-border text-foreground"
          />
        </div>
        
        <Button 
          onClick={testCredentials}
          disabled={testing || !email.trim() || !password.trim()}
          className="w-full bg-emerald-400 text-black hover:bg-emerald-500"
        >
          {testing ? 'Testando...' : 'Testar Credenciais'}
        </Button>

        {testResult && (
          <div className="space-y-3 mt-4 p-3 bg-muted/20 rounded-lg border border-border">
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
              <Badge variant={testResult.success ? "default" : "destructive"}>
                {testResult.success ? 'SUCESSO' : 'FALHA'}
              </Badge>
            </div>

            {testResult.error && (
              <div className="text-sm text-red-400 bg-red-400/10 p-2 rounded">
                <strong>Erro:</strong> {testResult.error}
              </div>
            )}

            {testResult.user && (
              <div className="text-sm text-foreground/80 space-y-1">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <strong>Usuário encontrado:</strong>
                </div>
                <div className="ml-4 space-y-1">
                  <div>Email: {testResult.user.email}</div>
                  <div>ID: {testResult.user.id.substring(0, 8)}...</div>
                  <div>Email confirmado: {testResult.user.emailConfirmed ? 'Sim' : 'Não'}</div>
                  {testResult.user.lastSignIn && (
                    <div>Último acesso: {new Date(testResult.user.lastSignIn).toLocaleString('pt-BR')}</div>
                  )}
                </div>
              </div>
            )}

            {testResult.session && (
              <div className="text-sm text-foreground/60">
                <div>✅ Sessão criada com sucesso</div>
                <div>✅ Tokens gerados</div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}