import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  X, 
  Send, 
  CheckCircle, 
  AlertTriangle,
  Mail,
  Clock,
  Users
} from "lucide-react";
import { EmailService } from "../services/emailService";
import { toast } from "sonner@2.0.3";

interface EmailTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmailTestModal({ isOpen, onClose }: EmailTestModalProps) {
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState({
    contact_name: 'João Silva',
    email: 'joao.silva@empresa.com.br',
    company: 'Empresa Exemplo Ltda',
    phone: '+55 11 99999-9999',
    interested_solution: 'GemFlow' as 'GemFlow' | 'GemInsights' | 'GemMind' | 'All',
    meeting_type: 'consultation' as 'consultation' | 'demonstration' | 'poc' | 'implementation' | 'support',
    preferred_time: 'Próxima terça-feira, 14:00',
    specific_challenges: 'Precisamos automatizar nossos processos de vendas e reduzir tempo de resposta para clientes. Atualmente tudo é feito manualmente.',
    source_page: 'Teste de E-mail'
  });
  const [results, setResults] = useState<any>(null);

  if (!isOpen) return null;

  const handleFieldChange = (field: string, value: string) => {
    setTestData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const sendTestEmails = async () => {
    try {
      setLoading(true);
      setResults(null);

      console.log('Enviando e-mails de teste...');
      const emailResults = await EmailService.sendMeetingNotifications(testData);
      
      setResults(emailResults);
      
      if (emailResults.internal.success && emailResults.client.success) {
        toast.success('E-mails de teste enviados com sucesso!');
      } else if (emailResults.internal.success || emailResults.client.success) {
        toast.warning('Alguns e-mails foram enviados, outros falharam');
      } else {
        toast.error('Falha ao enviar e-mails de teste');
      }
    } catch (error) {
      console.error('Erro ao enviar e-mails de teste:', error);
      toast.error('Erro ao enviar e-mails de teste');
    } finally {
      setLoading(false);
    }
  };

  const previewInternalEmail = () => {
    const template = EmailService.generateInternalNotificationTemplate(testData);
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(template.html);
    }
  };

  const previewClientEmail = () => {
    const template = EmailService.generateClientConfirmationTemplate(testData);
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(template.html);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Teste de Sistema de E-mails</h2>
            <p className="text-foreground/60 mt-1">Teste os templates e envio de e-mails de notificação</p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Dados de Teste */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Dados para Teste</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_name">Nome do Contato</Label>
                  <Input
                    id="contact_name"
                    value={testData.contact_name}
                    onChange={(e) => handleFieldChange('contact_name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={testData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="company">Empresa</Label>
                  <Input
                    id="company"
                    value={testData.company}
                    onChange={(e) => handleFieldChange('company', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={testData.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="interested_solution">Solução de Interesse</Label>
                  <Select 
                    value={testData.interested_solution} 
                    onValueChange={(value) => handleFieldChange('interested_solution', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GemFlow">GemFlow</SelectItem>
                      <SelectItem value="GemInsights">GemInsights</SelectItem>
                      <SelectItem value="GemMind">GemMind</SelectItem>
                      <SelectItem value="All">Todas as Soluções</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="meeting_type">Tipo de Reunião</Label>
                  <Select 
                    value={testData.meeting_type} 
                    onValueChange={(value) => handleFieldChange('meeting_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultoria</SelectItem>
                      <SelectItem value="demonstration">Demonstração</SelectItem>
                      <SelectItem value="poc">Prova de Conceito</SelectItem>
                      <SelectItem value="implementation">Implementação</SelectItem>
                      <SelectItem value="support">Suporte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="preferred_time">Horário Preferido</Label>
                <Input
                  id="preferred_time"
                  value={testData.preferred_time}
                  onChange={(e) => handleFieldChange('preferred_time', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="specific_challenges">Desafios Específicos</Label>
                <Textarea
                  id="specific_challenges"
                  value={testData.specific_challenges}
                  onChange={(e) => handleFieldChange('specific_challenges', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Ações de Teste */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Ações de Teste</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={previewInternalEmail}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Preview E-mail Interno
                </Button>
                
                <Button 
                  onClick={previewClientEmail}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Preview E-mail Cliente
                </Button>
                
                <Button 
                  onClick={sendTestEmails}
                  disabled={loading}
                  className="bg-primary text-primary-foreground flex items-center gap-2"
                >
                  {loading ? (
                    <Clock className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {loading ? 'Enviando...' : 'Enviar E-mails de Teste'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resultados do Teste */}
          {results && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Resultados do Teste</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground">E-mail Interno</h4>
                    <div className="flex items-center gap-2">
                      {results.internal.success ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <Badge variant="outline" className="text-green-400 border-green-400">
                            Enviado com Sucesso
                          </Badge>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 text-red-400" />
                          <Badge variant="outline" className="text-red-400 border-red-400">
                            Falhou
                          </Badge>
                        </>
                      )}
                    </div>
                    {results.internal.messageId && (
                      <p className="text-xs text-foreground/60">
                        ID: {results.internal.messageId}
                      </p>
                    )}
                    {results.internal.error && (
                      <Alert className="border-red-500 bg-red-500/10">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-red-400">
                          {results.internal.error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground">E-mail Cliente</h4>
                    <div className="flex items-center gap-2">
                      {results.client.success ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <Badge variant="outline" className="text-green-400 border-green-400">
                            Enviado com Sucesso
                          </Badge>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 text-red-400" />
                          <Badge variant="outline" className="text-red-400 border-red-400">
                            Falhou
                          </Badge>
                        </>
                      )}
                    </div>
                    {results.client.messageId && (
                      <p className="text-xs text-foreground/60">
                        ID: {results.client.messageId}
                      </p>
                    )}
                    {results.client.error && (
                      <Alert className="border-red-500 bg-red-500/10">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-red-400">
                          {results.client.error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informações de Configuração */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Configuração do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-foreground/70">E-mail da Empresa:</span>
                  <span className="font-medium">intelligemconsultoria@gmail.com</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground/70">Provedor de E-mail:</span>
                  <span className="font-medium">Resend.com</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground/70">Remetente:</span>
                  <span className="font-medium">IntelliGem &lt;noreply@intelligem.com.br&gt;</span>
                </div>
              </div>

              <Alert className="mt-4">
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  Os e-mails são enviados automaticamente quando uma nova reunião é agendada através do formulário do site.
                </AlertDescription>
              </Alert>
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