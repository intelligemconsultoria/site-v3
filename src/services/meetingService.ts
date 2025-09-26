import { getSupabaseClient } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export interface MeetingRequest {
  id?: string;
  contact_name: string;
  email: string;
  company: string;
  phone?: string;
  interested_solution: 'GemFlow' | 'GemInsights' | 'GemMind' | 'All';
  meeting_type: 'demo' | 'consultation' | 'technical';
  preferred_time: string;
  actual_meeting_time?: string;
  meeting_duration?: number;
  specific_challenges?: string;
  preparation_notes?: string;
  source_page: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  qualification_score?: number;
  lead_quality?: 'hot' | 'warm' | 'cold';
  calendar_event_id?: string;
  meeting_link?: string;
  follow_up_required?: boolean;
  meeting_outcome?: string;
  proposal_value?: number;
  created_at: string;
  updated_at?: string;
  confirmed_at?: string;
  completed_at?: string;
  assigned_to?: string;
  related_case_study_id?: string;
}

interface MeetingRequestFormData {
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

class MeetingService {
  private supabase = getSupabaseClient();
  private readonly API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a91235ef`;

  // Criar nova solicitação de reunião
  async createMeetingRequest(data: MeetingRequestFormData): Promise<MeetingRequest> {
    try {
      // Usar endpoint que envia e-mails automaticamente
      const response = await fetch(`${this.API_BASE}/meeting-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          ...data,
          meeting_duration: 30,
          follow_up_required: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      return result.meeting;
    } catch (error) {
      console.error('Erro ao criar solicitação de reunião (com e-mails):', error);
      
      // Fallback: tentar salvar direto no banco sem e-mails
      try {
        console.log('Tentando fallback sem e-mails...');
        const { data: newRequest, error: dbError } = await this.supabase
          .from('meeting_requests')
          .insert([{
            ...data,
            status: 'pending',
            meeting_duration: 30,
            follow_up_required: true
          }])
          .select()
          .single();

        if (dbError) throw dbError;
        
        console.warn('Reunião salva sem notificações por e-mail');
        return newRequest;
      } catch (fallbackError) {
        console.error('Erro no fallback:', fallbackError);
        throw new Error('Não foi possível agendar a reunião. Tente novamente.');
      }
    }
  }

  // Listar todas as solicitações de reunião
  async getAllMeetingRequests(): Promise<MeetingRequest[]> {
    try {
      const { data, error } = await this.supabase
        .from('meeting_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao carregar solicitações de reunião:', error);
      return [];
    }
  }

  // Buscar solicitação por ID
  async getMeetingRequestById(id: string): Promise<MeetingRequest | null> {
    try {
      const { data, error } = await this.supabase
        .from('meeting_requests')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Erro ao buscar reunião por ID:', error);
      return null;
    }
  }

  // Atualizar status da reunião
  async updateMeetingStatus(id: string, status: MeetingRequest['status']): Promise<void> {
    try {
      const updateData: any = { status };
      
      // Adicionar timestamps específicos baseado no status
      if (status === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString();
      } else if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await this.supabase
        .from('meeting_requests')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao atualizar status da reunião:', error);
      throw error;
    }
  }

  // Cancelar reunião
  async cancelMeetingRequest(id: string): Promise<void> {
    await this.updateMeetingStatus(id, 'cancelled');
  }

  // Confirmar reunião
  async confirmMeetingRequest(id: string): Promise<void> {
    await this.updateMeetingStatus(id, 'confirmed');
  }

  // Obter estatísticas das reuniões
  async getMeetingStats() {
    try {
      const { data: requests, error } = await this.supabase
        .from('meeting_requests')
        .select('status, source_page, interested_solution, meeting_type');

      if (error) throw error;

      const allRequests = requests || [];

      return {
        total: allRequests.length,
        pending: allRequests.filter(r => r.status === 'pending').length,
        confirmed: allRequests.filter(r => r.status === 'confirmed').length,
        completed: allRequests.filter(r => r.status === 'completed').length,
        cancelled: allRequests.filter(r => r.status === 'cancelled').length,
        no_show: allRequests.filter(r => r.status === 'no_show').length,
        bySource: this.groupByField(allRequests, 'source_page'),
        bySolution: this.groupByField(allRequests, 'interested_solution'),
        byType: this.groupByField(allRequests, 'meeting_type')
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de reuniões:', error);
      return {
        total: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        no_show: 0,
        bySource: {},
        bySolution: {},
        byType: {}
      };
    }
  }

  // Agrupar por campo
  private groupByField<T extends Record<string, any>>(
    items: T[], 
    field: keyof T
  ): Record<string, number> {
    return items.reduce((acc, item) => {
      const key = String(item[field]);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  // Simular envio de email de confirmação
  private sendConfirmationEmail(request: MeetingRequest): void {
    console.log('📧 Email de confirmação enviado:', {
      to: request.email,
      subject: 'Reunião agendada com a IntelliGem',
      meeting_time: request.preferred_time,
      meeting_type: request.meeting_type,
      solution: request.interested_solution
    });

    // TODO: Implementar envio real de email via Supabase Edge Functions
  }

  // Obter horários disponíveis (mock)
  getAvailableSlots(): Array<{id: string, date: string, time: string, label: string}> {
    const now = new Date();
    const slots = [];
    
    // Gerar próximos 10 dias úteis com horários disponíveis
    for (let i = 1; i <= 10; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      
      // Pular fins de semana
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('pt-BR', { weekday: 'long' });
      const dayMonth = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      
      // Horários manhã
      slots.push({
        id: `${dateStr}-09`,
        date: dateStr,
        time: '09:00',
        label: `${dayName}, ${dayMonth} - 09:00`
      });
      
      slots.push({
        id: `${dateStr}-10`,
        date: dateStr,
        time: '10:00',
        label: `${dayName}, ${dayMonth} - 10:00`
      });

      // Horários tarde
      slots.push({
        id: `${dateStr}-14`,
        date: dateStr,
        time: '14:00',
        label: `${dayName}, ${dayMonth} - 14:00`
      });
      
      slots.push({
        id: `${dateStr}-15`,
        date: dateStr,
        time: '15:00',
        label: `${dayName}, ${dayMonth} - 15:00`
      });
      
      slots.push({
        id: `${dateStr}-16`,
        date: dateStr,
        time: '16:00',
        label: `${dayName}, ${dayMonth} - 16:00`
      });
    }
    
    return slots.slice(0, 20); // Retornar apenas os primeiros 20 slots
  }

  // Validar horário disponível
  isSlotAvailable(date: string, time: string): boolean {
    const requests = this.getAllMeetingRequests();
    const targetDateTime = `${date} ${time}`;
    
    return !requests.some(
      request => 
        request.preferred_time === targetDateTime && 
        ['pending', 'confirmed'].includes(request.status)
    );
  }

  // Filtrar reuniões por status
  async getMeetingsByStatus(status: MeetingRequest['status']): Promise<MeetingRequest[]> {
    try {
      const { data, error } = await this.supabase
        .from('meeting_requests')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar reuniões por status:', error);
      return [];
    }
  }

  // Filtrar reuniões por solução
  async getMeetingsBySolution(solution: MeetingRequest['interested_solution']): Promise<MeetingRequest[]> {
    try {
      const { data, error } = await this.supabase
        .from('meeting_requests')
        .select('*')
        .eq('interested_solution', solution)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar reuniões por solução:', error);
      return [];
    }
  }

  // Obter reuniões recentes (últimos 30 dias)
  async getRecentMeetings(): Promise<MeetingRequest[]> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await this.supabase
        .from('meeting_requests')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar reuniões recentes:', error);
      return [];
    }
  }
}

export const meetingService = new MeetingService();
export type { MeetingRequest, MeetingRequestFormData };