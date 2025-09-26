import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../utils/supabase/client';
import { logger } from '../utils/logger';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface SupabaseStatus {
  connected: boolean;
  authenticated: boolean;
  user: any;
  error: string | null;
  tables: string[];
  rlsStatus: Record<string, boolean>;
}

export function SupabaseDebugPanel() {
  const [status, setStatus] = useState<SupabaseStatus>({
    connected: false,
    authenticated: false,
    user: null,
    error: null,
    tables: [],
    rlsStatus: {}
  });
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string>('');

  const supabase = getSupabaseClient();

  const checkSupabaseStatus = async () => {
    setIsLoading(true);
    logger.debug('SUPABASE_DEBUG', 'Iniciando verificação de status do Supabase');
    
    try {
      // Verificar conexão básica
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      // Verificar se consegue fazer uma query simples
      const { data: tablesData, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .in('table_name', ['blog_articles', 'newsletter_subscribers', 'site_images', 'meetings', 'cases']);

      // Verificar RLS status
      const rlsStatus: Record<string, boolean> = {};
      if (tablesData) {
        for (const table of tablesData) {
          try {
            const { error: rlsError } = await supabase
              .from(table.table_name)
              .select('*')
              .limit(1);
            rlsStatus[table.table_name] = !rlsError;
          } catch (e) {
            rlsStatus[table.table_name] = false;
          }
        }
      }

      setStatus({
        connected: !tablesError,
        authenticated: !!session?.user,
        user: session?.user || null,
        error: sessionError?.message || tablesError?.message || null,
        tables: tablesData?.map(t => t.table_name) || [],
        rlsStatus
      });

      logger.info('SUPABASE_DEBUG', 'Status verificado', {
        connected: !tablesError,
        authenticated: !!session?.user,
        tablesCount: tablesData?.length || 0
      });

    } catch (error) {
      logger.error('SUPABASE_DEBUG', 'Erro ao verificar status', error as Error);
      setStatus(prev => ({
        ...prev,
        connected: false,
        error: (error as Error).message
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const testBlogInsert = async () => {
    logger.debug('SUPABASE_DEBUG', 'Testando inserção de artigo');
    
    try {
      const testArticle = {
        title: 'Artigo de Teste',
        subtitle: 'Teste de inserção',
        excerpt: 'Este é um artigo de teste para verificar permissões',
        content: 'Conteúdo de teste',
        author: 'Sistema',
        category: 'teste',
        featured: false,
        published: false,
        tags: ['teste'],
        slug: 'artigo-teste-' + Date.now(),
        read_time: '1 min',
        image_url: '',
        view_count: 0
      };

      const { data, error } = await supabase
        .from('blog_articles')
        .insert([testArticle])
        .select()
        .single();

      if (error) {
        logger.supabaseError('testBlogInsert', error, { testArticle });
        alert(`Erro ao inserir artigo: ${error.message}`);
      } else {
        logger.supabaseSuccess('testBlogInsert', { articleId: data?.id });
        alert('Artigo de teste inserido com sucesso!');
      }
    } catch (error) {
      logger.error('SUPABASE_DEBUG', 'Erro no teste de inserção', error as Error);
      alert(`Erro: ${(error as Error).message}`);
    }
  };

  const exportLogs = () => {
    const logsString = logger.getLogsAsString();
    setLogs(logsString);
    
    // Copiar para clipboard
    navigator.clipboard.writeText(logsString).then(() => {
      alert('Logs copiados para a área de transferência!');
    });
  };

  useEffect(() => {
    checkSupabaseStatus();
  }, []);

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            Status do Supabase
          </CardTitle>
          <CardDescription>
            Painel de debug para verificar conexão e permissões
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">Conexão:</span>
              {status.connected ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Conectado
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  Desconectado
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">Autenticação:</span>
              {status.authenticated ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Autenticado
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Não autenticado
                </Badge>
              )}
            </div>
          </div>

          {status.user && (
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Usuário Atual:</h4>
              <p className="text-sm text-muted-foreground">
                ID: {status.user.id}
              </p>
              <p className="text-sm text-muted-foreground">
                Email: {status.user.email}
              </p>
            </div>
          )}

          {status.error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {status.error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <h4 className="font-medium">Tabelas Encontradas:</h4>
            <div className="flex flex-wrap gap-2">
              {status.tables.map(table => (
                <Badge 
                  key={table} 
                  variant={status.rlsStatus[table] ? "default" : "destructive"}
                >
                  {table}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={checkSupabaseStatus} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Verificar Status
            </Button>
            
            <Button onClick={testBlogInsert} variant="outline">
              Testar Inserção
            </Button>
            
            <Button onClick={exportLogs} variant="outline">
              Exportar Logs
            </Button>
          </div>

          {logs && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Logs de Debug:</h4>
              <pre className="bg-muted p-3 rounded-lg text-xs overflow-auto max-h-64">
                {logs}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
