import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { AuthService } from '../services/authService';
import { SupabaseImageService } from '../services/supabaseImageService';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface HealthStatus {
  name: string;
  status: 'checking' | 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

export function SystemHealthCheck() {
  const [healthChecks, setHealthChecks] = useState<HealthStatus[]>([
    { name: 'Supabase Connection', status: 'checking', message: 'Verificando conexão...' },
    { name: 'Auth Service', status: 'checking', message: 'Testando autenticação...' },
    { name: 'Image Service', status: 'checking', message: 'Testando serviço de imagens...' },
    { name: 'Backend API', status: 'checking', message: 'Verificando API backend...' },
  ]);

  const runHealthChecks = async () => {
    // Reset all to checking
    setHealthChecks(prev => prev.map(check => ({ ...check, status: 'checking' as const })));

    // 1. Check Supabase connection
    try {
      const url = `https://${projectId}.supabase.co`;
      const response = await fetch(`${url}/rest/v1/`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'apikey': publicAnonKey
        }
      });
      
      updateHealthCheck('Supabase Connection', 
        response.ok ? 'success' : 'error',
        response.ok ? 'Conectado com sucesso' : `Erro HTTP ${response.status}`,
        response.ok ? `URL: ${url}` : `Status: ${response.status} ${response.statusText}`
      );
    } catch (error) {
      updateHealthCheck('Supabase Connection', 'error', 'Falha na conexão', 
        error instanceof Error ? error.message : 'Erro desconhecido');
    }

    // 2. Check Auth Service
    try {
      const sessionResult = await AuthService.getCurrentSession();
      updateHealthCheck('Auth Service', 
        sessionResult.success ? 'success' : 'warning',
        sessionResult.success ? 'Autenticação funcionando' : 'Nenhuma sessão ativa',
        sessionResult.error || 'Session check completed'
      );
    } catch (error) {
      updateHealthCheck('Auth Service', 'error', 'Erro no serviço de auth',
        error instanceof Error ? error.message : 'Erro desconhecido');
    }

    // 3. Check Image Service
    try {
      const images = await SupabaseImageService.getAllSiteImages();
      updateHealthCheck('Image Service', 'success', 
        `${images.length} imagens encontradas`, 
        'Serviço de imagens funcionando');
    } catch (error) {
      updateHealthCheck('Image Service', 'error', 'Erro no serviço de imagens',
        error instanceof Error ? error.message : 'Erro desconhecido');
    }

    // 4. Check Backend API
    try {
      const backendUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a91235ef/health`;
      const response = await fetch(backendUrl, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        updateHealthCheck('Backend API', 'success', 'API backend funcionando',
          `Status: ${data.status}`);
      } else {
        updateHealthCheck('Backend API', 'error', `Erro HTTP ${response.status}`,
          `${response.status} ${response.statusText}`);
      }
    } catch (error) {
      updateHealthCheck('Backend API', 'error', 'Falha ao conectar com backend',
        error instanceof Error ? error.message : 'Erro desconhecido');
    }
  };

  const updateHealthCheck = (name: string, status: HealthStatus['status'], message: string, details?: string) => {
    setHealthChecks(prev => prev.map(check => 
      check.name === name 
        ? { ...check, status, message, details }
        : check
    ));
  };

  useEffect(() => {
    runHealthChecks();
  }, []);

  const getStatusIcon = (status: HealthStatus['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'checking':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: HealthStatus['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">OK</Badge>;
      case 'error':
        return <Badge variant="destructive">ERRO</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-500">AVISO</Badge>;
      case 'checking':
        return <Badge variant="outline">VERIFICANDO</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Status do Sistema</CardTitle>
        <Button onClick={runHealthChecks} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Verificar Novamente
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {healthChecks.map((check) => (
          <div key={check.name} className="flex items-start justify-between p-3 border rounded-lg">
            <div className="flex items-start space-x-3">
              {getStatusIcon(check.status)}
              <div>
                <h4 className="font-medium">{check.name}</h4>
                <p className="text-sm text-muted-foreground">{check.message}</p>
                {check.details && (
                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                    {check.details}
                  </p>
                )}
              </div>
            </div>
            {getStatusBadge(check.status)}
          </div>
        ))}
        
        <div className="mt-6 p-3 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Informações do Sistema</h4>
          <div className="text-sm space-y-1 font-mono">
            <p>Project ID: {projectId}</p>
            <p>Environment: {typeof window !== 'undefined' ? 'Browser' : 'Server'}</p>
            <p>Timestamp: {new Date().toISOString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}