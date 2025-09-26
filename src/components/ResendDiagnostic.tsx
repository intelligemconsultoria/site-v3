import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  CheckCircle, 
  AlertTriangle, 
  X, 
  RefreshCw,
  Mail,
  Key,
  Globe,
  Settings
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ResendDiagnosticProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DiagnosticResult {
  name: string;
  status: 'success' | 'warning' | 'error' | 'pending';
  message: string;
  details?: string;
  solution?: string;
}

export function ResendDiagnostic({ isOpen, onClose }: ResendDiagnosticProps) {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  if (!isOpen) return null;

  const runDiagnostics = async () => {
    setIsRunning(true);
    setDiagnostics([]);
    
    const results: DiagnosticResult[] = [];

    // 1. Verificar se a API key está configurada
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a91235ef/health`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (response.ok) {
        results.push({
          name: "Conexão com Backend",
          status: "success",
          message: "Backend está funcionando",
          details: "O servidor está respondendo corretamente"
        });
      } else {
        results.push({
          name: "Conexão com Backend",
          status: "error",
          message: "Backend não está respondendo",
          details: `Status: ${response.status}`,
          solution: "Verifique se as edge functions estão ativas no Supabase"
        });
      }
    } catch (error) {
      results.push({
        name: "Conexão com Backend",
        status: "error",
        message: "Erro de conexão",
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        solution: "Verifique sua conexão com a internet e configurações do Supabase"
      });
    }

    // 2. Testar endpoint de envio de e-mail simples
    try {
      const testEmail = {
        to: "teste@exemplo.com",
        subject: "Teste de Configuração Resend",
        html: "<p>Este é um teste de configuração.</p>",
        from: "IntelliGem <noreply@intelligem.com.br>"
      };

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a91235ef/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(testEmail)
      });

      const result = await response.json();

      if (response.ok) {
        results.push({
          name: "API do Resend",
          status: "success",
          message: "API key funcionando",
          details: `Message ID: ${result.messageId || 'Gerado'}`
        });
      } else {
        results.push({
          name: "API do Resend",
          status: "error",
          message: "Problema com a API",
          details: result.error || result.details || 'Erro desconhecido',
          solution: "Verifique a configuração da RESEND_API_KEY no Supabase"
        });
      }
    } catch (error) {
      results.push({
        name: "API do Resend",
        status: "error",
        message: "Erro ao testar API",
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        solution: "Verifique se a RESEND_API_KEY está configurada corretamente"
      });
    }

    // 3. Verificar configuração de domínio
    results.push({
      name: "Verificação de Domínio",
      status: "warning",
      message: "Verificação manual necessária",
      details: "O domínio intelligem.com.br precisa ser verificado no Resend",
      solution: "Acesse o painel do Resend e adicione os registros DNS necessários"
    });

    // 4. Verificar modo sandbox
    results.push({
      name: "Modo Sandbox",
      status: "warning",
      message: "Possível restrição de sandbox",
      details: "Por padrão, o Resend opera em modo sandbox",
      solution: "Verifique se sua conta Resend foi ativada para produção"
    });

    setDiagnostics(results);
    setIsRunning(false);
    
    const hasErrors = results.some(r => r.status === 'error');
    if (hasErrors) {
      toast.error("Problemas encontrados na configuração");
    } else {
      toast.success("Diagnóstico concluído");
    }
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case 'error':
        return <X className="h-5 w-5 text-red-400" />;
      default:
        return <RefreshCw className="h-5 w-5 text-blue-400 animate-spin" />;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-400 border-green-400';
      case 'warning':
        return 'text-yellow-400 border-yellow-400';
      case 'error':
        return 'text-red-400 border-red-400';
      default:
        return 'text-blue-400 border-blue-400';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Diagnóstico do Resend</h2>
            <p className="text-foreground/60 mt-1">Verificando configurações de e-mail</p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações Necessárias
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Globe className="h-4 w-4" />
                <AlertDescription>
                  <strong>Passo 1 - Configurar Domínio no Resend:</strong><br/>
                  1. Acesse <a href="https://resend.com/domains" target="_blank" className="text-primary underline">resend.com/domains</a><br/>
                  2. Adicione o domínio: <code>intelligem.com.br</code><br/>
                  3. Configure os registros DNS fornecidos pelo Resend
                </AlertDescription>
              </Alert>

              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  <strong>Passo 2 - Variável de Ambiente:</strong><br/>
                  Verifique se a <code>RESEND_API_KEY</code> está configurada corretamente no Supabase Dashboard → Edge Functions → Environment Variables
                </AlertDescription>
              </Alert>

              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  <strong>Passo 3 - Ativação da Conta:</strong><br/>
                  Contas Resend gratuitas operam em modo sandbox. Para produção, você pode precisar verificar sua conta ou upgradar o plano.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button 
              onClick={runDiagnostics}
              disabled={isRunning}
              className="bg-primary text-primary-foreground"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Executando...
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  Executar Diagnóstico
                </>
              )}
            </Button>
          </div>

          {diagnostics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Resultados do Diagnóstico</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {diagnostics.map((diagnostic, index) => (
                  <div key={index} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(diagnostic.status)}
                        <span className="font-medium">{diagnostic.name}</span>
                      </div>
                      <Badge variant="outline" className={getStatusColor(diagnostic.status)}>
                        {diagnostic.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <p className="text-foreground/80">{diagnostic.message}</p>
                    
                    {diagnostic.details && (
                      <p className="text-sm text-foreground/60 mt-1">
                        <strong>Detalhes:</strong> {diagnostic.details}
                      </p>
                    )}
                    
                    {diagnostic.solution && (
                      <div className="mt-2 p-2 bg-muted rounded text-sm">
                        <strong>Solução:</strong> {diagnostic.solution}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Links Úteis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <a 
                  href="https://resend.com/domains" 
                  target="_blank" 
                  className="text-primary hover:underline flex items-center gap-2"
                >
                  <Globe className="h-4 w-4" />
                  Configurar Domínios
                </a>
                <a 
                  href="https://resend.com/api-keys" 
                  target="_blank" 
                  className="text-primary hover:underline flex items-center gap-2"
                >
                  <Key className="h-4 w-4" />
                  Gerenciar API Keys
                </a>
                <a 
                  href="https://resend.com/docs/send-with-nodejs" 
                  target="_blank" 
                  className="text-primary hover:underline flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Documentação
                </a>
                <a 
                  href="https://resend.com/logs" 
                  target="_blank" 
                  className="text-primary hover:underline flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Logs de E-mail
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}