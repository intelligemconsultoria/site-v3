import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  ArrowLeft,
  Users, 
  FileText, 
  FolderOpen, 
  Mail, 
  Calendar,
  Settings,
  TrendingUp,
  Eye,
  Save,
  RefreshCw
} from "lucide-react";
import { blogService } from "../services/blogServiceCompat";
import { casesService } from "../services/casesServiceCompat";
import { meetingService } from "../services/meetingServiceCompat";
import { settingsService, SiteSetting } from "../services/settingsService";
import { contactService } from "../services/contactService";
import { toast } from "sonner";
import { EmailTestModal } from "./EmailTestModal";
import { ResendDiagnostic } from "./ResendDiagnostic";

interface AdminDashboardProps {
  onBack: () => void;
  onNavigateToEditor: (type: 'blog' | 'cases' | 'meetings') => void;
}

export function AdminDashboard({ onBack, onNavigateToEditor }: AdminDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [settingsForm, setSettingsForm] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('overview');
  const [showEmailTest, setShowEmailTest] = useState(false);
  const [showResendDiagnostic, setShowResendDiagnostic] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [
        blogStats,
        casesStats,
        meetingStats,
        contactStats,
        siteSettings
      ] = await Promise.all([
        blogService.getStats(),
        casesService.getStats(),
        meetingService.getMeetingStatsAsync(),
        contactService.getContactStats(),
        settingsService.getAllSettings()
      ]);

      setStats({
        blog: blogStats,
        cases: casesStats,
        meetings: meetingStats,
        contacts: contactStats
      });

      setSettings(siteSettings);
      
      // Inicializar formulário de configurações
      const formData: Record<string, string> = {};
      siteSettings.forEach(setting => {
        formData[setting.key] = setting.value || '';
      });
      setSettingsForm(formData);

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: string, value: string) => {
    setSettingsForm(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSetting = async (key: string) => {
    try {
      await settingsService.updateSetting(key, { value: settingsForm[key] });
      toast.success('Configuração salva com sucesso!');
      await loadDashboardData(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast.error('Erro ao salvar configuração');
    }
  };

  const saveAllSettings = async () => {
    try {
      await settingsService.updateMultipleSettings(settingsForm);
      toast.success('Todas as configurações foram salvas!');
      await loadDashboardData();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-foreground/60">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  const overviewCards = [
    {
      title: "Artigos",
      value: stats.blog?.totalArticles || 0,
      subtitle: `${stats.blog?.publishedArticles || 0} publicados`,
      icon: FileText,
      color: "text-emerald-400",
      onClick: () => onNavigateToEditor('blog')
    },
    {
      title: "Cases",
      value: stats.cases?.totalCases || 0,
      subtitle: `${stats.cases?.publishedCases || 0} publicados`,
      icon: FolderOpen,
      color: "text-blue-400",
      onClick: () => onNavigateToEditor('cases')
    },
    {
      title: "Reuniões",
      value: stats.meetings?.total || 0,
      subtitle: `${stats.meetings?.pending || 0} pendentes`,
      icon: Calendar,
      color: "text-purple-400",
      onClick: () => onNavigateToEditor('meetings')
    },
    {
      title: "Contatos",
      value: stats.contacts?.total || 0,
      subtitle: `${stats.contacts?.new || 0} novos`,
      icon: Mail,
      color: "text-orange-400"
    }
  ];

  const pieData = [
    { name: 'Blog', value: stats.blog?.totalViews || 0, color: '#31af9d' },
    { name: 'Cases', value: stats.cases?.totalViews || 0, color: '#136eae' },
    { name: 'Reuniões', value: stats.meetings?.total || 0, color: '#512f82' }
  ];

  const settingsByCategory = settings.reduce((acc, setting) => {
    const category = setting.category || 'geral';
    if (!acc[category]) acc[category] = [];
    acc[category].push(setting);
    return acc;
  }, {} as Record<string, SiteSetting[]>);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="text-foreground/70 hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard Administrativo</h1>
              <p className="text-foreground/60 mt-1">Gerencie todo o conteúdo e configurações do site</p>
            </div>
          </div>
          <Button onClick={loadDashboardData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
            <TabsTrigger value="email">E-mails</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Cards de Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {overviewCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <Card 
                    key={index} 
                    className={`bg-card border-border hover:bg-muted transition-colors ${card.onClick ? 'cursor-pointer' : ''}`}
                    onClick={card.onClick}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-foreground/60">{card.title}</p>
                          <p className="text-2xl font-bold text-foreground">{card.value}</p>
                          <p className="text-xs text-foreground/50 mt-1">{card.subtitle}</p>
                        </div>
                        <Icon className={`h-8 w-8 ${card.color}`} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Status das Reuniões */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Status das Reuniões</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.meetings || {}).map(([status, count]) => {
                      if (typeof count !== 'number' || ['total', 'bySource', 'bySolution', 'byType'].includes(status)) return null;
                      const colors: Record<string, string> = {
                        pending: 'bg-orange-500',
                        confirmed: 'bg-green-500',
                        completed: 'bg-blue-500',
                        cancelled: 'bg-red-500',
                        no_show: 'bg-gray-500'
                      };
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${colors[status] || 'bg-gray-500'}`}></div>
                            <span className="text-sm text-foreground/70 capitalize">{status.replace('_', ' ')}</span>
                          </div>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Atividade Recente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-emerald-400" />
                      <span className="text-sm text-foreground/70">{stats.blog?.totalViews || 0} visualizações no blog</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FolderOpen className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-foreground/70">{stats.cases?.totalViews || 0} visualizações nos cases</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-purple-400" />
                      <span className="text-sm text-foreground/70">{stats.contacts?.recent || 0} contatos recentes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Visualizações por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Taxa de Conversão</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-foreground/70">Contatos → Reuniões</span>
                        <span className="text-sm font-medium">{stats.contacts?.conversionRate || '0'}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-emerald-400 h-2 rounded-full" 
                          style={{ width: `${stats.contacts?.conversionRate || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-foreground">Configurações do Site</h2>
              <Button onClick={saveAllSettings} className="bg-primary text-primary-foreground">
                <Save className="h-4 w-4 mr-2" />
                Salvar Todas
              </Button>
            </div>

            <div className="grid gap-6">
              {Object.entries(settingsByCategory).map(([category, categorySettings]) => (
                <Card key={category} className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground capitalize">{category}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {categorySettings.map((setting) => (
                      <div key={setting.key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={setting.key} className="text-sm font-medium">
                            {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Label>
                          {setting.editable && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => saveSetting(setting.key)}
                            >
                              Salvar
                            </Button>
                          )}
                        </div>
                        {setting.description && (
                          <p className="text-xs text-foreground/60">{setting.description}</p>
                        )}
                        {setting.type === 'text' || setting.type === 'url' ? (
                          <Input
                            id={setting.key}
                            value={settingsForm[setting.key] || ''}
                            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                            disabled={!setting.editable}
                            placeholder={setting.description}
                          />
                        ) : setting.type === 'boolean' ? (
                          <select
                            id={setting.key}
                            value={settingsForm[setting.key] || 'false'}
                            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                            disabled={!setting.editable}
                            className="w-full p-2 border border-border rounded bg-input-background text-foreground"
                          >
                            <option value="true">Ativado</option>
                            <option value="false">Desativado</option>
                          </select>
                        ) : (
                          <Textarea
                            id={setting.key}
                            value={settingsForm[setting.key] || ''}
                            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                            disabled={!setting.editable}
                            placeholder={setting.description}
                            rows={3}
                          />
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-foreground">Sistema de E-mails</h2>
              <div className="flex gap-2">
                <Button onClick={() => setShowResendDiagnostic(true)} variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Diagnóstico
                </Button>
                <Button onClick={() => setShowEmailTest(true)} className="bg-primary text-primary-foreground">
                  <Mail className="h-4 w-4 mr-2" />
                  Testar E-mails
                </Button>
              </div>
            </div>

            <div className="grid gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Configuração de E-mails</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">E-mail da Empresa</h4>
                      <p className="text-foreground/70">intelligemconsultoria@gmail.com</p>
                      <p className="text-xs text-foreground/50">Recebe notificações de novas reuniões</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Provedor de E-mail</h4>
                      <p className="text-foreground/70">Resend.com</p>
                      <p className="text-xs text-foreground/50">Serviço de envio configurado</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Remetente</h4>
                      <p className="text-foreground/70">IntelliGem &lt;noreply@intelligem.com.br&gt;</p>
                      <p className="text-xs text-foreground/50">Nome e e-mail que aparece para os clientes</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Status</h4>
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        ✅ Configurado
                      </Badge>
                      <p className="text-xs text-foreground/50">Sistema pronto para envio</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Templates de E-mail</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">📧 E-mail Interno (Empresa)</h4>
                    <p className="text-foreground/70 mb-2">
                      Enviado para intelligemconsultoria@gmail.com quando uma nova reunião é agendada
                    </p>
                    <ul className="text-sm text-foreground/60 space-y-1">
                      <li>• Dados completos do cliente</li>
                      <li>• Detalhes da reunião solicitada</li>
                      <li>• Desafios específicos mencionados</li>
                      <li>• Página de origem do agendamento</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-foreground mb-2">📧 E-mail de Confirmação (Cliente)</h4>
                    <p className="text-foreground/70 mb-2">
                      Enviado automaticamente para o cliente após o agendamento
                    </p>
                    <ul className="text-sm text-foreground/60 space-y-1">
                      <li>• Confirmação do agendamento</li>
                      <li>• Resumo da reunião solicitada</li>
                      <li>• Informações sobre a solução de interesse</li>
                      <li>• Próximos passos esperados</li>
                      <li>• Contato para reagendamento</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Fluxo de E-mails</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">1</div>
                      <div>
                        <h4 className="font-medium text-foreground">Cliente agenda reunião</h4>
                        <p className="text-sm text-foreground/60">Preenchimento do formulário no site</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-medium">2</div>
                      <div>
                        <h4 className="font-medium text-foreground">Sistema salva no banco</h4>
                        <p className="text-sm text-foreground/60">Dados salvos na tabela meeting_requests</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-medium">3</div>
                      <div>
                        <h4 className="font-medium text-foreground">E-mails enviados automaticamente</h4>
                        <p className="text-sm text-foreground/60">Notificação interna + confirmação para cliente</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-medium">4</div>
                      <div>
                        <h4 className="font-medium text-foreground">Equipe responde em 24h</h4>
                        <p className="text-sm text-foreground/60">Confirmação final e envio do link da reunião</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Email Test Modal */}
        <EmailTestModal 
          isOpen={showEmailTest} 
          onClose={() => setShowEmailTest(false)} 
        />

        {/* Resend Diagnostic Modal */}
        <ResendDiagnostic 
          isOpen={showResendDiagnostic} 
          onClose={() => setShowResendDiagnostic(false)} 
        />
      </div>
    </div>
  );
}