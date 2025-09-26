// Meeting Service Compatibility Layer - Mantém API antiga mas usa Supabase
import { meetingService as newMeetingService } from './meetingService';
import { mapMeetingRequestToLegacy, mapMeetingRequestsToLegacy, mapMeetingRequestToDb } from '../utils/fieldMappers';

// Interface antiga para compatibilidade
export interface MeetingRequest {
  id: string;
  contactName: string; // Nome antigo
  email: string;
  company: string;
  phone?: string;
  interestedSolution: 'GemFlow' | 'GemInsights' | 'GemMind' | 'All'; // Nome antigo
  preferredTime: string; // Nome antigo
  message?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string; // Nome antigo
  sourceSection: string; // Nome antigo
}

// Interface do formulário (compatível com os novos nomes)
export interface MeetingRequestFormData {
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

class MeetingServiceCompat {
  // Criar nova solicitação de reunião
  async createMeetingRequest(data: MeetingRequestFormData): Promise<MeetingRequest> {
    const newRequest = await newMeetingService.createMeetingRequest(data);
    return mapMeetingRequestToLegacy(newRequest);
  }

  // Listar todas as solicitações de reunião
  getAllMeetingRequests(): MeetingRequest[] {
    // Como o novo service é async, vamos simular um retorno síncrono
    // Os componentes que usam este método precisarão ser atualizados para async
    console.warn('getAllMeetingRequests should be async - updating component needed');
    return [];
  }

  // Versão async para componentes atualizados
  async getAllMeetingRequestsAsync(): Promise<MeetingRequest[]> {
    const requests = await newMeetingService.getAllMeetingRequests();
    return mapMeetingRequestsToLegacy(requests);
  }

  // Buscar solicitação por ID
  async getMeetingRequestById(id: string): Promise<MeetingRequest | null> {
    const request = await newMeetingService.getMeetingRequestById(id);
    return request ? mapMeetingRequestToLegacy(request) : null;
  }

  // Atualizar status da reunião
  async updateMeetingStatus(id: string, status: MeetingRequest['status']): Promise<void> {
    await newMeetingService.updateMeetingStatus(id, status);
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
  getMeetingStats() {
    // Versão síncrona simulada
    console.warn('getMeetingStats should be async - updating component needed');
    return {
      total: 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      bySource: {},
      bySolution: {},
      byType: {}
    };
  }

  // Versão async para componentes atualizados
  async getMeetingStatsAsync() {
    return await newMeetingService.getMeetingStats();
  }

  // Filtrar reuniões por status
  async getMeetingsByStatus(status: MeetingRequest['status']): Promise<MeetingRequest[]> {
    const meetings = await newMeetingService.getMeetingsByStatus(status);
    return mapMeetingRequestsToLegacy(meetings);
  }

  // Filtrar reuniões por solução
  async getMeetingsBySolution(solution: MeetingRequest['interestedSolution']): Promise<MeetingRequest[]> {
    const meetings = await newMeetingService.getMeetingsBySolution(solution);
    return mapMeetingRequestsToLegacy(meetings);
  }

  // Obter reuniões recentes (últimos 30 dias)
  async getRecentMeetings(): Promise<MeetingRequest[]> {
    const meetings = await newMeetingService.getRecentMeetings();
    return mapMeetingRequestsToLegacy(meetings);
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
    // Por enquanto, sempre retorna true - pode ser implementado futuramente
    return true;
  }

  // Função auxiliar para agrupar por campo
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
}

export const meetingService = new MeetingServiceCompat();
export type { MeetingRequest, MeetingRequestFormData };