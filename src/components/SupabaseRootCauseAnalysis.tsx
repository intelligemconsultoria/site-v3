import { useState } from 'react';
import { getSupabaseClient } from '../utils/supabase/client';
import { logger } from '../utils/logger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { 
  Database, 
  Shield, 
  User, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw 
} from 'lucide-react';

interface DiagnosticResult {
  category: string;
  status: 'success' | 'warning' | 'error' | 'info';
  message: string;
  details?: any;
}

export function SupabaseRootCauseAnalysis() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');

  const supabase = getSupabaseClient();

  const runDiagnostic = async () => {
    setIsLoading(true);
    setResults([]);
    logger.debug('SUPABASE_DIAGNOSTIC', 'Iniciando análise de causa raiz');

    const diagnosticResults: DiagnosticResult[] = [];

    try {
      // 1. Verificar se a tabela existe
      setCurrentTest('Verificando existência da tabela...');
      try {
        const { data: tableData, error: tableError } = await supabase
          .from('information_schema.tables')
          .select('table_name, table_type')
          .eq('table_name', 'case_studies')
          .eq('table_schema', 'public')
          .single();

        if (tableError || !tableData) {
          diagnosticResults.push({
            category: 'Estrutura da Tabela',
            status: 'error',
            message: 'Tabela case_studies não encontrada no schema público',
            details: tableError
          });
        } else {
          diagnosticResults.push({
            category: 'Estrutura da Tabela',
            status: 'success',
            message: 'Tabela case_studies existe no schema público',
            details: tableData
          });
        }
      } catch (error) {
        diagnosticResults.push({
          category: 'Estrutura da Tabela',
          status: 'error',
          message: 'Erro ao verificar existência da tabela',
          details: error
        });
      }

      // 2. Verificar estrutura da tabela
      setCurrentTest('Verificando estrutura da tabela...');
      try {
        const { data: columnsData, error: columnsError } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable, column_default')
          .eq('table_name', 'case_studies')
          .eq('table_schema', 'public')
          .order('ordinal_position');

        if (columnsError) {
          diagnosticResults.push({
            category: 'Estrutura da Tabela',
            status: 'error',
            message: 'Erro ao verificar estrutura da tabela',
            details: columnsError
          });
        } else {
          diagnosticResults.push({
            category: 'Estrutura da Tabela',
            status: 'success',
            message: `Tabela possui ${columnsData?.length || 0} colunas`,
            details: columnsData
          });
        }
      } catch (error) {
        diagnosticResults.push({
          category: 'Estrutura da Tabela',
          status: 'error',
          message: 'Erro ao verificar colunas da tabela',
          details: error
        });
      }

      // 3. Verificar RLS status
      setCurrentTest('Verificando status RLS...');
      try {
        const { data: rlsData, error: rlsError } = await supabase
          .rpc('check_rls_status', { table_name: 'case_studies' });

        if (rlsError) {
          // Fallback: tentar query direta
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('pg_class')
            .select('relname, relrowsecurity')
            .eq('relname', 'case_studies');

          if (fallbackError) {
            diagnosticResults.push({
              category: 'RLS Status',
              status: 'warning',
              message: 'Não foi possível verificar status RLS diretamente',
              details: fallbackError
            });
          } else {
            diagnosticResults.push({
              category: 'RLS Status',
              status: 'info',
              message: 'Status RLS verificado via fallback',
              details: fallbackData
            });
          }
        } else {
          diagnosticResults.push({
            category: 'RLS Status',
            status: 'success',
            message: 'Status RLS verificado',
            details: rlsData
          });
        }
      } catch (error) {
        diagnosticResults.push({
          category: 'RLS Status',
          status: 'error',
          message: 'Erro ao verificar status RLS',
          details: error
        });
      }

      // 4. Verificar políticas existentes
      setCurrentTest('Verificando políticas RLS...');
      try {
        const { data: policiesData, error: policiesError } = await supabase
          .from('pg_policies')
          .select('policyname, cmd, roles, qual, with_check')
          .eq('tablename', 'case_studies');

        if (policiesError) {
          diagnosticResults.push({
            category: 'Políticas RLS',
            status: 'error',
            message: 'Erro ao verificar políticas RLS',
            details: policiesError
          });
        } else if (!policiesData || policiesData.length === 0) {
          diagnosticResults.push({
            category: 'Políticas RLS',
            status: 'error',
            message: 'Nenhuma política RLS encontrada para case_studies',
            details: policiesData
          });
        } else {
          diagnosticResults.push({
            category: 'Políticas RLS',
            status: 'success',
            message: `${policiesData.length} políticas RLS encontradas`,
            details: policiesData
          });
        }
      } catch (error) {
        diagnosticResults.push({
          category: 'Políticas RLS',
          status: 'error',
          message: 'Erro ao verificar políticas RLS',
          details: error
        });
      }

      // 5. Verificar autenticação atual
      setCurrentTest('Verificando autenticação...');
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          diagnosticResults.push({
            category: 'Autenticação',
            status: 'error',
            message: 'Erro ao verificar sessão',
            details: sessionError
          });
        } else if (!session?.user) {
          diagnosticResults.push({
            category: 'Autenticação',
            status: 'error',
            message: 'Usuário não autenticado',
            details: session
          });
        } else {
          diagnosticResults.push({
            category: 'Autenticação',
            status: 'success',
            message: 'Usuário autenticado',
            details: {
              userId: session.user.id,
              email: session.user.email,
              role: session.user.role
            }
          });
        }
      } catch (error) {
        diagnosticResults.push({
          category: 'Autenticação',
          status: 'error',
          message: 'Erro ao verificar autenticação',
          details: error
        });
      }

      // 6. Teste de permissão de leitura
      setCurrentTest('Testando permissão de leitura...');
      try {
        const { data: readData, error: readError } = await supabase
          .from('case_studies')
          .select('id')
          .limit(1);

        if (readError) {
          diagnosticResults.push({
            category: 'Permissões',
            status: 'error',
            message: 'Erro ao ler dados da tabela',
            details: readError
          });
        } else {
          diagnosticResults.push({
            category: 'Permissões',
            status: 'success',
            message: 'Leitura da tabela funcionando',
            details: { recordsFound: readData?.length || 0 }
          });
        }
      } catch (error) {
        diagnosticResults.push({
          category: 'Permissões',
          status: 'error',
          message: 'Erro no teste de leitura',
          details: error
        });
      }

      // 7. Teste de permissão de inserção
      setCurrentTest('Testando permissão de inserção...');
      try {
        const testData = {
          title: 'Teste Diagnóstico',
          excerpt: 'Teste de diagnóstico',
          content: 'Conteúdo de teste',
          client: 'Cliente Teste',
          industry: 'Tecnologia',
          challenge: 'Desafio teste',
          solution: 'Solução teste',
          results: 'Resultados teste',
          category: 'teste',
          metrics: 'Métricas teste',
          slug: 'teste-diagnostico-' + Date.now(),
          published: false,
          featured: false,
          tags: ['teste'],
          image_url: '',
          view_count: 0
        };

        const { data: insertData, error: insertError } = await supabase
          .from('case_studies')
          .insert([testData])
          .select()
          .single();

        if (insertError) {
          diagnosticResults.push({
            category: 'Permissões',
            status: 'error',
            message: 'Erro ao inserir dados na tabela',
            details: {
              error: insertError,
              errorCode: insertError.code,
              errorMessage: insertError.message,
              errorDetails: insertError.details,
              errorHint: insertError.hint
            }
          });
        } else {
          diagnosticResults.push({
            category: 'Permissões',
            status: 'success',
            message: 'Inserção na tabela funcionando',
            details: { insertedId: insertData?.id }
          });

          // Limpar dados de teste
          await supabase
            .from('case_studies')
            .delete()
            .eq('id', insertData.id);
        }
      } catch (error) {
        diagnosticResults.push({
          category: 'Permissões',
          status: 'error',
          message: 'Erro no teste de inserção',
          details: error
        });
      }

    } catch (error) {
      diagnosticResults.push({
        category: 'Sistema',
        status: 'error',
        message: 'Erro geral no diagnóstico',
        details: error
      });
    } finally {
      setResults(diagnosticResults);
      setIsLoading(false);
      setCurrentTest('');
      logger.info('SUPABASE_DIAGNOSTIC', 'Diagnóstico concluído', { resultsCount: diagnosticResults.length });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Settings className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Sucesso</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-500">Aviso</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return <Badge variant="outline">Info</Badge>;
    }
  };

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Análise de Causa Raiz - Erro 403
          </CardTitle>
          <CardDescription>
            Diagnóstico completo para identificar a causa raiz do erro 403 na tabela case_studies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={runDiagnostic} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Executar Diagnóstico
            </Button>
          </div>

          {isLoading && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {currentTest}
              </AlertDescription>
            </Alert>
          )}

          {results.length > 0 && (
            <div className="space-y-4">
              <Separator />
              <h3 className="text-lg font-semibold">Resultados do Diagnóstico</h3>
              
              {results.map((result, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        <span className="font-medium">{result.category}</span>
                        {getStatusBadge(result.status)}
                      </div>
                    </div>
                    
                    <p className="mt-2 text-sm text-muted-foreground">
                      {result.message}
                    </p>
                    
                    {result.details && (
                      <details className="mt-2">
                        <summary className="text-sm cursor-pointer text-blue-600 hover:text-blue-800">
                          Ver detalhes técnicos
                        </summary>
                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
