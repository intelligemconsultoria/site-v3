import { getSupabaseClient } from '../utils/supabase/client';

// Settings Service - Conectado ao Supabase
export interface SiteSetting {
  id: string;
  key: string;
  value: string | null;
  type: 'text' | 'json' | 'boolean' | 'number' | 'url';
  category: string | null;
  description: string | null;
  editable: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SettingUpdate {
  value: string;
  description?: string;
  category?: string;
}

class SettingsService {
  private supabase = getSupabaseClient();

  // Buscar todas as configurações
  async getAllSettings(): Promise<SiteSetting[]> {
    try {
      const { data, error } = await this.supabase
        .from('site_settings')
        .select('*')
        .eq('active', true)
        .order('category', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      return [];
    }
  }

  // Buscar configurações por categoria
  async getSettingsByCategory(category: string): Promise<SiteSetting[]> {
    try {
      const { data, error } = await this.supabase
        .from('site_settings')
        .select('*')
        .eq('category', category)
        .eq('active', true)
        .order('key', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar configurações por categoria:', error);
      return [];
    }
  }

  // Buscar configuração por chave
  async getSettingByKey(key: string): Promise<SiteSetting | null> {
    try {
      const { data, error } = await this.supabase
        .from('site_settings')
        .select('*')
        .eq('key', key)
        .eq('active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Erro ao buscar configuração por chave:', error);
      return null;
    }
  }

  // Atualizar configuração
  async updateSetting(key: string, updates: SettingUpdate): Promise<SiteSetting | null> {
    try {
      const { data, error } = await this.supabase
        .from('site_settings')
        .update(updates)
        .eq('key', key)
        .eq('editable', true)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      throw error;
    }
  }

  // Criar nova configuração
  async createSetting(setting: Omit<SiteSetting, 'id' | 'created_at' | 'updated_at'>): Promise<SiteSetting> {
    try {
      const { data, error } = await this.supabase
        .from('site_settings')
        .insert([setting])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar configuração:', error);
      throw error;
    }
  }

  // Deletar configuração (soft delete)
  async deleteSetting(key: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('site_settings')
        .update({ active: false })
        .eq('key', key)
        .eq('editable', true);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar configuração:', error);
      return false;
    }
  }

  // Buscar múltiplas configurações por chaves
  async getSettingsByKeys(keys: string[]): Promise<Record<string, string | null>> {
    try {
      const { data, error } = await this.supabase
        .from('site_settings')
        .select('key, value')
        .in('key', keys)
        .eq('active', true);

      if (error) throw error;

      const result: Record<string, string | null> = {};
      keys.forEach(key => {
        const setting = data?.find(item => item.key === key);
        result[key] = setting?.value || null;
      });

      return result;
    } catch (error) {
      console.error('Erro ao buscar configurações por chaves:', error);
      return {};
    }
  }

  // Atualizar múltiplas configurações de uma vez
  async updateMultipleSettings(updates: Record<string, string>): Promise<boolean> {
    try {
      const updatePromises = Object.entries(updates).map(([key, value]) =>
        this.updateSetting(key, { value })
      );

      await Promise.all(updatePromises);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar múltiplas configurações:', error);
      return false;
    }
  }

  // Resetar configuração para valor padrão
  async resetSetting(key: string): Promise<boolean> {
    try {
      // Busca a configuração atual
      const setting = await this.getSettingByKey(key);
      if (!setting) return false;

      // Aqui você pode definir valores padrão baseados na chave
      const defaultValues: Record<string, string> = {
        'hero_title': 'Transforme Dados em Decisões Inteligentes',
        'hero_subtitle': 'Soluções completas em dados, automação e inteligência artificial para impulsionar o crescimento do seu negócio',
        'hero_cta_text': 'Descubra Nossas Soluções',
        'about_title': 'Sobre a IntelliGem',
        'about_description': 'Somos especialistas em transformação digital, oferecendo soluções inovadoras em dados, automação e IA.',
        'contact_email': 'contato@intelligem.com.br',
        'contact_phone': '+55 (11) 9999-9999',
        'newsletter_enabled': 'true',
        'newsletter_title': 'Receba insights exclusivos sobre dados e IA'
      };

      const defaultValue = defaultValues[key];
      if (!defaultValue) return false;

      const updated = await this.updateSetting(key, { value: defaultValue });
      return !!updated;
    } catch (error) {
      console.error('Erro ao resetar configuração:', error);
      return false;
    }
  }

  // Validar valor baseado no tipo
  validateSettingValue(type: SiteSetting['type'], value: string): boolean {
    switch (type) {
      case 'boolean':
        return value === 'true' || value === 'false';
      case 'number':
        return !isNaN(Number(value));
      case 'url':
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      case 'json':
        try {
          JSON.parse(value);
          return true;
        } catch {
          return false;
        }
      case 'text':
      default:
        return true;
    }
  }

  // Obter estatísticas das configurações
  async getSettingsStats() {
    try {
      const { data, error } = await this.supabase
        .from('site_settings')
        .select('category, type, editable, active');

      if (error) throw error;

      const settings = data || [];

      return {
        total: settings.length,
        active: settings.filter(s => s.active).length,
        editable: settings.filter(s => s.editable).length,
        byCategory: this.groupByField(settings.filter(s => s.active), 'category'),
        byType: this.groupByField(settings.filter(s => s.active), 'type')
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de configurações:', error);
      return {
        total: 0,
        active: 0,
        editable: 0,
        byCategory: {},
        byType: {}
      };
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
}

export const settingsService = new SettingsService();