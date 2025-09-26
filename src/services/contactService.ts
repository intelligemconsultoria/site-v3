import { getSupabaseClient } from '../utils/supabase/client';

// Contact Service - Conectado ao Supabase
export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  subject: string;
  message: string;
  interested_solution?: 'GemFlow' | 'GemInsights' | 'GemMind' | 'All';
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'closed';
  ip_address?: string;
  user_agent?: string;
  submitted_at: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  subject: string;
  message: string;
  interested_solution?: 'GemFlow' | 'GemInsights' | 'GemMind' | 'All';
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

class ContactService {
  private supabase = getSupabaseClient();

  // Criar nova submissão de contato
  async createContactSubmission(data: ContactFormData): Promise<ContactSubmission> {
    try {
      // Adicionar metadados do navegador se disponível
      const submissionData = {
        ...data,
        status: 'new' as const,
        ip_address: await this.getClientIP(),
        user_agent: navigator?.userAgent || null
      };

      const { data: newSubmission, error } = await this.supabase
        .from('contact_submissions')
        .insert([submissionData])
        .select()
        .single();

      if (error) throw error;
      return newSubmission;
    } catch (error) {
      console.error('Erro ao criar submissão de contato:', error);
      throw new Error('Não foi possível enviar a mensagem. Tente novamente.');
    }
  }

  // Buscar todas as submissões de contato
  async getAllContactSubmissions(): Promise<ContactSubmission[]> {
    try {
      const { data, error } = await this.supabase
        .from('contact_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar submissões de contato:', error);
      return [];
    }
  }

  // Buscar submissão por ID
  async getContactSubmissionById(id: string): Promise<ContactSubmission | null> {
    try {
      const { data, error } = await this.supabase
        .from('contact_submissions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Erro ao buscar submissão por ID:', error);
      return null;
    }
  }

  // Atualizar status da submissão
  async updateContactStatus(id: string, status: ContactSubmission['status']): Promise<ContactSubmission | null> {
    try {
      const { data, error } = await this.supabase
        .from('contact_submissions')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Erro ao atualizar status da submissão:', error);
      throw error;
    }
  }

  // Buscar submissões por status
  async getContactSubmissionsByStatus(status: ContactSubmission['status']): Promise<ContactSubmission[]> {
    try {
      const { data, error } = await this.supabase
        .from('contact_submissions')
        .select('*')
        .eq('status', status)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar submissões por status:', error);
      return [];
    }
  }

  // Buscar submissões por solução de interesse
  async getContactSubmissionsBySolution(solution: string): Promise<ContactSubmission[]> {
    try {
      const { data, error } = await this.supabase
        .from('contact_submissions')
        .select('*')
        .eq('interested_solution', solution)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar submissões por solução:', error);
      return [];
    }
  }

  // Buscar submissões recentes (últimos 30 dias)
  async getRecentContactSubmissions(): Promise<ContactSubmission[]> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await this.supabase
        .from('contact_submissions')
        .select('*')
        .gte('submitted_at', thirtyDaysAgo.toISOString())
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar submissões recentes:', error);
      return [];
    }
  }

  // Pesquisar submissões
  async searchContactSubmissions(query: string): Promise<ContactSubmission[]> {
    try {
      const { data, error } = await this.supabase
        .from('contact_submissions')
        .select('*')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%,subject.ilike.%${query}%,message.ilike.%${query}%`)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao pesquisar submissões:', error);
      return [];
    }
  }

  // Obter estatísticas das submissões
  async getContactStats() {
    try {
      const { data: submissions, error } = await this.supabase
        .from('contact_submissions')
        .select('status, interested_solution, source, submitted_at');

      if (error) throw error;

      const allSubmissions = submissions || [];
      
      // Submissões dos últimos 30 dias
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentSubmissions = allSubmissions.filter(
        s => new Date(s.submitted_at) >= thirtyDaysAgo
      );

      return {
        total: allSubmissions.length,
        recent: recentSubmissions.length,
        new: allSubmissions.filter(s => s.status === 'new').length,
        contacted: allSubmissions.filter(s => s.status === 'contacted').length,
        qualified: allSubmissions.filter(s => s.status === 'qualified').length,
        converted: allSubmissions.filter(s => s.status === 'converted').length,
        closed: allSubmissions.filter(s => s.status === 'closed').length,
        byStatus: this.groupByField(allSubmissions, 'status'),
        bySolution: this.groupByField(allSubmissions.filter(s => s.interested_solution), 'interested_solution'),
        bySource: this.groupByField(allSubmissions.filter(s => s.source), 'source'),
        conversionRate: allSubmissions.length > 0 
          ? ((allSubmissions.filter(s => s.status === 'converted').length / allSubmissions.length) * 100).toFixed(1)
          : '0'
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de contato:', error);
      return {
        total: 0,
        recent: 0,
        new: 0,
        contacted: 0,
        qualified: 0,
        converted: 0,
        closed: 0,
        byStatus: {},
        bySolution: {},
        bySource: {},
        conversionRate: '0'
      };
    }
  }

  // Marcar múltiplas submissões como lidas
  async markMultipleAsContacted(ids: string[]): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('contact_submissions')
        .update({ status: 'contacted' })
        .in('id', ids);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao marcar submissões como contatadas:', error);
      return false;
    }
  }

  // Deletar submissão
  async deleteContactSubmission(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('contact_submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar submissão:', error);
      return false;
    }
  }

  // Função auxiliar para obter IP do cliente (simplificada)
  private async getClientIP(): Promise<string | null> {
    try {
      // Em produção, você pode usar um serviço como ipapi.co
      // Por enquanto, retorna null
      return null;
    } catch {
      return null;
    }
  }

  // Função auxiliar para agrupar por campo
  private groupByField<T extends Record<string, any>>(
    items: T[], 
    field: keyof T
  ): Record<string, number> {
    return items.reduce((acc, item) => {
      const key = String(item[field] || 'uncategorized');
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  // Validar email
  validateEmail(email: string): boolean {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  }

  // Validar telefone brasileiro
  validatePhone(phone: string): boolean {
    const phoneRegex = /^(?:\+55\s?)?(?:\(?[1-9]{2}\)?\s?)?(?:9\s?)?[0-9]{4}-?[0-9]{4}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }
}

export const contactService = new ContactService();