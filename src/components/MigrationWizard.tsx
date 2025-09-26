import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { EmailTestModal } from "./EmailTestModal";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  Database, 
  Download, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  FileText,
  FolderOpen,
  Mail,
  Calendar,
  Trash2
} from "lucide-react";
import { MigrationHelper } from "../utils/migrationHelper";
import { toast } from "sonner";

export function MigrationWizard() {
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'backing-up' | 'migrating' | 'completed' | 'error'>('idle');
  const [migrationResults, setMigrationResults] = useState<any>(null);
  const [localDataStats, setLocalDataStats] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showEmailTest, setShowEmailTest] = useState(false);

  // Verificar dados locais ao montar o componente
  useState(() => {
    if (MigrationHelper.isMigrationNeeded()) {
      setLocalDataStats(MigrationHelper.getLocalDataStats());
    }
  });

  const steps = [
    {
      title: "Verificar Dados",
      description: "Analisar dados existentes no localStorage",
      icon: Database
    },
    {
      title: "Criar Backup",
      description: "Fazer backup dos dados antes da migração",
      icon: Download
    },
    {
      title: "Migrar Dados",
      description: "Transferir dados para o Supabase",
      icon: Upload
    },
    {
      title: "Verificar Migração",
      description: "Confirmar que tudo foi migrado corretamente",
      icon: CheckCircle
    }
  ];

  const handleCreateBackup = async () => {
    try {
      setMigrationStatus('backing-up');
      MigrationHelper.createBackup();
      toast.success('Backup criado com sucesso!');
      setCurrentStep(2);
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      toast.error('Erro ao criar backup');
      setMigrationStatus('error');
    }
  };

  const handleMigration = async () => {
    try {
      setMigrationStatus('migrating');
      const results = await MigrationHelper.migrateAllData();
      setMigrationResults(results);
      
      // Verificar se houve erros
      const totalErrors = Object.values(results).reduce((sum: number, result: any) => sum + result.errors, 0);
      const totalSuccess = Object.values(results).reduce((sum: number, result: any) => sum + result.success, 0);
      
      if (totalErrors === 0 && totalSuccess > 0) {
        setMigrationStatus('completed');
        setCurrentStep(3);
        toast.success(`Migração concluída! ${totalSuccess} itens migrados com sucesso.`);
      } else if (totalSuccess > 0) {
        setMigrationStatus('completed');
        setCurrentStep(3);
        toast.warning(`Migração parcial: ${totalSuccess} sucessos, ${totalErrors} erros.`);
      } else {
        setMigrationStatus('error');
        toast.error('Falha na migração. Verifique os logs.');
      }
    } catch (error) {
      console.error('Erro durante migração:', error);
      setMigrationStatus('error');
      toast.error('Erro durante a migração');
    }
  };

  const handleClearLocalStorage = () => {
    if (confirm('Tem certeza que deseja limpar os dados do localStorage? Esta ação não pode ser desfeita.')) {
      MigrationHelper.clearLocalStorageData();
      toast.success('Dados locais removidos com sucesso!');
      setLocalDataStats(null);
    }
  };

  // Se não há dados para migrar
  if (!MigrationHelper.isMigrationNeeded()) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Nenhuma Migração Necessária
          </h3>
          <p className="text-foreground/60">
            Não foram encontrados dados no localStorage que precisem ser migrados para o Supabase.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Database className="h-5 w-5" />
            Assistente de Migração
          </CardTitle>
          <p className="text-foreground/60">
            Migre seus dados do localStorage para o Supabase de forma segura
          </p>
        </CardHeader>
      </Card>

      {/* Progress Steps */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center mb-2
                    ${isCompleted ? 'bg-green-500 text-white' : 
                      isActive ? 'bg-primary text-primary-foreground' : 
                      'bg-muted text-foreground/50'}
                  `}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="max-w-20">
                    <p className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-foreground/60'}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-foreground/50">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <Progress value={(currentStep / (steps.length - 1)) * 100} className="w-full" />
        </CardContent>
      </Card>

      {/* Dados Encontrados */}
      {localDataStats && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Dados Encontrados no localStorage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <FileText className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{localDataStats.artigos.total}</p>
                <p className="text-sm text-foreground/60">Artigos</p>
                <Badge variant="outline" className="mt-1">
                  {localDataStats.artigos.publicados} publicados
                </Badge>
              </div>
              <div className="text-center">
                <FolderOpen className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{localDataStats.cases.total}</p>
                <p className="text-sm text-foreground/60">Cases</p>
                <Badge variant="outline" className="mt-1">
                  {localDataStats.cases.publicados} publicados
                </Badge>
              </div>
              <div className="text-center">
                <Mail className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{localDataStats.newsletter.total}</p>
                <p className="text-sm text-foreground/60">Newsletter</p>
                <Badge variant="outline" className="mt-1">
                  {localDataStats.newsletter.ativos} ativos
                </Badge>
              </div>
              <div className="text-center">
                <Calendar className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{localDataStats.reuniões.total}</p>
                <p className="text-sm text-foreground/60">Reuniões</p>
                <Badge variant="outline" className="mt-1">
                  {localDataStats.reuniões.pendentes} pendentes
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações */}
      <Card className="bg-card border-border">
        <CardContent className="p-6 space-y-4">
          {currentStep === 0 && (
            <div className="text-center">
              <p className="text-foreground/70 mb-4">
                Dados encontrados e prontos para migração. Prossiga para criar um backup de segurança.
              </p>
              <Button onClick={() => setCurrentStep(1)} className="bg-primary text-primary-foreground">
                Continuar para Backup
              </Button>
            </div>
          )}

          {currentStep === 1 && (
            <div className="text-center">
              <Alert className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Recomendamos criar um backup antes de prosseguir com a migração.
                </AlertDescription>
              </Alert>
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={handleCreateBackup}
                  disabled={migrationStatus === 'backing-up'}
                  className="bg-blue-500 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {migrationStatus === 'backing-up' ? 'Criando Backup...' : 'Criar Backup'}
                </Button>
                <Button 
                  onClick={() => setCurrentStep(2)} 
                  variant="outline"
                >
                  Pular Backup
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="text-center">
              <p className="text-foreground/70 mb-4">
                Pronto para migrar os dados para o Supabase. Este processo pode levar alguns minutos.
              </p>
              <Button 
                onClick={handleMigration}
                disabled={migrationStatus === 'migrating'}
                className="bg-green-500 text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                {migrationStatus === 'migrating' ? 'Migrando...' : 'Iniciar Migração'}
              </Button>
            </div>
          )}

          {currentStep === 3 && migrationResults && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground text-center">
                Resultados da Migração
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-foreground/60">Artigos</p>
                  <p className="text-green-400 font-medium">✓ {migrationResults.articles.success}</p>
                  {migrationResults.articles.errors > 0 && (
                    <p className="text-red-400 font-medium">✗ {migrationResults.articles.errors}</p>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm text-foreground/60">Cases</p>
                  <p className="text-green-400 font-medium">✓ {migrationResults.cases.success}</p>
                  {migrationResults.cases.errors > 0 && (
                    <p className="text-red-400 font-medium">✗ {migrationResults.cases.errors}</p>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm text-foreground/60">Newsletter</p>
                  <p className="text-green-400 font-medium">✓ {migrationResults.newsletter.success}</p>
                  {migrationResults.newsletter.errors > 0 && (
                    <p className="text-red-400 font-medium">✗ {migrationResults.newsletter.errors}</p>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm text-foreground/60">Reuniões</p>
                  <p className="text-green-400 font-medium">✓ {migrationResults.meetings.success}</p>
                  {migrationResults.meetings.errors > 0 && (
                    <p className="text-red-400 font-medium">✗ {migrationResults.meetings.errors}</p>
                  )}
                </div>
              </div>

              <div className="text-center mt-6">
                <Button 
                  onClick={handleClearLocalStorage}
                  variant="destructive"
                  className="mr-4"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Dados Locais
                </Button>
                <Button 
                  onClick={() => setShowEmailTest(true)}
                  variant="outline"
                  className="mr-4"
                >
                  Testar E-mails
                </Button>
                <Button 
                  onClick={() => window.location.reload()}
                  className="bg-primary text-primary-foreground"
                >
                  Finalizar e Recarregar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {migrationStatus === 'error' && (
        <Alert className="border-red-500 bg-red-500/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Ocorreu um erro durante a migração. Verifique o console para mais detalhes.
          </AlertDescription>
        </Alert>
      )}

      {/* Email Test Modal */}
      <EmailTestModal 
        isOpen={showEmailTest} 
        onClose={() => setShowEmailTest(false)} 
      />
    </div>
  );
}