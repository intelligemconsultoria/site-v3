import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Calendar, Clock, User, Building, Mail, Phone, MessageSquare, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { meetingService } from "../services/meetingServiceCompat";

interface MeetingRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledSolution?: 'GemFlow' | 'GemInsights' | 'GemMind' | 'All';
  sourcePage?: string;
}

interface MeetingFormData {
  contact_name: string;
  email: string;
  company: string;
  phone: string;
  interested_solution: 'GemFlow' | 'GemInsights' | 'GemMind' | 'All';
  meeting_type: 'demo' | 'consultation' | 'technical';
  preferred_time: string;
  specific_challenges: string;
  source_page: string;
}

export function MeetingRequestModal({ 
  isOpen, 
  onClose, 
  prefilledSolution = 'All',
  sourcePage = 'website'
}: MeetingRequestModalProps) {
  const [step, setStep] = useState<'form' | 'scheduling' | 'confirmation'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<MeetingFormData>({
    contact_name: '',
    email: '',
    company: '',
    phone: '',
    interested_solution: prefilledSolution,
    meeting_type: 'demo',
    preferred_time: '',
    specific_challenges: '',
    source_page: sourcePage
  });

  // Horários disponíveis carregados do serviço
  const availableSlots = meetingService.getAvailableSlots().slice(0, 8);

  const handleInputChange = (field: keyof MeetingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.contact_name || !formData.email || !formData.company) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setStep('scheduling');
  };

  const handleSchedulingSubmit = async () => {
    if (!formData.preferred_time) {
      toast.error('Por favor, selecione um horário');
      return;
    }

    setIsSubmitting(true);

    try {
      // Usar o serviço para criar a reunião
      await meetingService.createMeetingRequest(formData);
      
      setStep('confirmation');
      toast.success('Reunião agendada com sucesso!');
    } catch (error) {
      console.error('Erro ao agendar reunião:', error);
      toast.error('Erro ao agendar reunião. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSolutionColor = (solution: string) => {
    switch (solution) {
      case 'GemFlow': return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20';
      case 'GemInsights': return 'bg-blue-400/10 text-blue-400 border-blue-400/20';
      case 'GemMind': return 'bg-purple-400/10 text-purple-400 border-purple-400/20';
      default: return 'bg-gradient-to-r from-emerald-400/10 via-blue-400/10 to-purple-400/10 text-foreground border-border';
    }
  };

  const getMeetingTypeLabel = (type: string) => {
    switch (type) {
      case 'demo': return 'Demonstração das Soluções';
      case 'consultation': return 'Consultoria Estratégica';
      case 'technical': return 'Discussão Técnica';
      default: return type;
    }
  };

  const handleClose = () => {
    setStep('form');
    setFormData({
      contact_name: '',
      email: '',
      company: '',
      phone: '',
      interested_solution: prefilledSolution,
      meeting_type: 'demo',
      preferred_time: '',
      specific_challenges: '',
      source_page: sourcePage
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] lg:max-w-[900px] max-h-[95vh] overflow-y-auto">
        <DialogHeader className="space-y-4 pb-6">
          <DialogTitle className="flex items-center gap-3 text-3xl lg:text-4xl">
            <Calendar className="w-8 h-8 text-emerald-400" />
            {step === 'form' && 'Agendar Conversa Gratuita'}
            {step === 'scheduling' && 'Selecionar Horário'}
            {step === 'confirmation' && 'Reunião Agendada!'}
          </DialogTitle>
          <DialogDescription className="text-lg text-foreground/70 leading-relaxed">
            {step === 'form' && 'Preencha seus dados e conte-nos sobre seus desafios. Nossa conversa será de 30-45 minutos e totalmente personalizada para suas necessidades.'}
            {step === 'scheduling' && 'Escolha o melhor horário para nossa conversa. Todas as reuniões são online via Google Meet com nossos especialistas.'}
            {step === 'confirmation' && 'Perfeito! Sua reunião foi agendada com sucesso. Você receberá um email de confirmação em breve com todos os detalhes.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'form' && (
          <form onSubmit={handleFormSubmit} className="space-y-8">
            {/* Informações Pessoais */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-5 h-5 text-emerald-400" />
                <h3 className="text-xl font-semibold">Informações de Contato</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="contact_name" className="text-base">Nome Completo *</Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name}
                    onChange={(e) => handleInputChange('contact_name', e.target.value)}
                    placeholder="Seu nome completo"
                    className="h-12 text-base"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base">Email Corporativo *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="seu.email@empresa.com"
                    className="h-12 text-base"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-base">Empresa *</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Nome da sua empresa"
                    className="h-12 text-base"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-base">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="h-12 text-base"
                  />
                </div>
              </div>
            </div>

            {/* Interesse */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <h3 className="text-xl font-semibold">Área de Interesse</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="interested_solution" className="text-base">Solução de Interesse</Label>
                  <Select 
                    value={formData.interested_solution} 
                    onValueChange={(value) => handleInputChange('interested_solution', value)}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">Todas as Soluções</SelectItem>
                      <SelectItem value="GemFlow">GemFlow - Automação de Processos</SelectItem>
                      <SelectItem value="GemInsights">GemInsights - Business Intelligence</SelectItem>
                      <SelectItem value="GemMind">GemMind - Inteligência Artificial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meeting_type" className="text-base">Tipo de Reunião</Label>
                  <Select 
                    value={formData.meeting_type} 
                    onValueChange={(value) => handleInputChange('meeting_type', value)}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="demo">Demonstração das Soluções</SelectItem>
                      <SelectItem value="consultation">Consultoria Estratégica</SelectItem>
                      <SelectItem value="technical">Discussão Técnica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Desafios */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                <h3 className="text-xl font-semibold">Conte-nos sobre seus Desafios</h3>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="specific_challenges" className="text-base">Principais Desafios (Opcional)</Label>
                <Textarea
                  id="specific_challenges"
                  value={formData.specific_challenges}
                  onChange={(e) => handleInputChange('specific_challenges', e.target.value)}
                  placeholder="Descreva brevemente os principais desafios que sua empresa enfrenta com dados, processos ou análise. Isso nos ajudará a preparar uma conversa mais direcionada..."
                  rows={4}
                  className="text-base resize-none"
                />
                <p className="text-sm text-foreground/60">
                  Exemplo: "Temos dificuldades para visualizar nossos dados de vendas em tempo real" ou "Queremos automatizar nosso processo de aprovação de orçamentos"
                </p>
              </div>
            </div>

            <div className="flex gap-4 pt-8">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose} 
                className="flex-1 h-12 text-base"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="flex-1 h-12 text-base bg-emerald-400 hover:bg-emerald-500 text-black font-semibold"
              >
                Continuar para Agendamento
              </Button>
            </div>
          </form>
        )}

        {step === 'scheduling' && (
          <div className="space-y-8">
            {/* Resumo dos dados */}
            <div className="p-6 bg-card/30 rounded-lg border border-border">
              <h3 className="text-lg font-semibold mb-4">Resumo da Reunião</h3>
              <div className="space-y-3 text-base">
                <div className="flex justify-between">
                  <span className="text-foreground/70">Contato:</span>
                  <span>{formData.contact_name} - {formData.company}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Interesse:</span>
                  <Badge className={getSolutionColor(formData.interested_solution)}>
                    {formData.interested_solution === 'All' ? 'Todas as Soluções' : formData.interested_solution}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Tipo:</span>
                  <span>{getMeetingTypeLabel(formData.meeting_type)}</span>
                </div>
              </div>
            </div>

            {/* Seleção de horários */}
            <div>
              <Label className="text-lg font-semibold mb-6 block">Selecione o melhor horário:</Label>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => handleInputChange('preferred_time', `${slot.date} ${slot.time}`)}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      formData.preferred_time === `${slot.date} ${slot.time}`
                        ? 'border-emerald-400 bg-emerald-400/10 text-emerald-400'
                        : 'border-border hover:border-emerald-400/50 hover:bg-card/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-5 h-5" />
                      <span className="font-semibold text-base">{slot.label}</span>
                    </div>
                    <div className="text-sm text-foreground/60">
                      Duração: 30-45 minutos • Online
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-8">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setStep('form')}
                className="flex-1 h-12 text-base"
              >
                Voltar
              </Button>
              <Button 
                onClick={handleSchedulingSubmit}
                disabled={!formData.preferred_time || isSubmitting}
                className="flex-1 h-12 text-base bg-emerald-400 hover:bg-emerald-500 text-black font-semibold"
              >
                {isSubmitting ? 'Agendando...' : 'Confirmar Agendamento'}
              </Button>
            </div>
          </div>
        )}

        {step === 'confirmation' && (
          <div className="text-center space-y-8">
            <div className="w-20 h-20 bg-emerald-400/10 rounded-full flex items-center justify-center mx-auto">
              <Calendar className="w-10 h-10 text-emerald-400" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-emerald-400">Reunião Confirmada!</h3>
              <p className="text-foreground/70">
                Sua reunião foi agendada para{' '}
                <span className="font-semibold text-foreground">
                  {formData.preferred_time && new Date(formData.preferred_time.split(' ')[0]).toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}{' '}
                  às {formData.preferred_time?.split(' ')[1]}
                </span>
              </p>
            </div>

            <div className="p-4 bg-card/30 rounded-lg border border-border text-left">
              <h4 className="font-semibold mb-2">Próximos Passos:</h4>
              <ul className="space-y-1 text-sm text-foreground/70">
                <li>✅ Email de confirmação enviado para {formData.email}</li>
                <li>✅ Link do Google Meet será enviado 24h antes</li>
                <li>✅ Lembrete automático 1h antes da reunião</li>
                <li>✅ Material preparatório será compartilhado</li>
              </ul>
            </div>

            <div className="text-sm text-foreground/60">
              <p>Precisa reagendar ou cancelar?</p>
              <p>Entre em contato: <span className="text-emerald-400">contato@intelligem.com.br</span></p>
            </div>

            <Button 
              onClick={handleClose} 
              className="w-full h-12 text-base bg-emerald-400 hover:bg-emerald-500 text-black font-semibold"
            >
              Fechar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}