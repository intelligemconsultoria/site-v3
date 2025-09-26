// Migration Helper - Migrar dados do localStorage para Supabase
import { blogService as newBlogService } from '../services/blogService';
import { casesService as newCasesService } from '../services/casesService';
import { meetingService as newMeetingService } from '../services/meetingService';

interface LegacyBlogArticle {
  id: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  featured: boolean;
  published: boolean;
  slug: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface LegacyCaseStudy {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  client: string;
  industry: string;
  challenge: string;
  solution: string;
  results: string[];
  image: string;
  category: 'GemFlow' | 'GemInsights' | 'GemMind';
  metrics: {
    improvement: string;
    timeframe: string;
    roi: string;
  };
  slug: string;
  published: boolean;
  featured: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface LegacyNewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  active: boolean;
}

interface LegacyMeetingRequest {
  id: string;
  contactName: string;
  email: string;
  company: string;
  phone?: string;
  interestedSolution: 'GemFlow' | 'GemInsights' | 'GemMind' | 'All';
  preferredTime: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  sourceSection: string;
}

export class MigrationHelper {
  private static readonly STORAGE_KEYS = {
    BLOG_ARTICLES: 'intelligem_blog_articles',
    NEWSLETTER: 'intelligem_newsletter_subscribers',
    CASES: 'intelligem_cases',
    MEETINGS: 'meeting-requests'
  };

  // Verificar se há dados no localStorage para migrar
  static hasLocalStorageData(): boolean {
    return Object.values(this.STORAGE_KEYS).some(key => 
      localStorage.getItem(key) !== null
    );
  }

  // Obter dados do localStorage
  static getLocalStorageData() {
    const data = {
      articles: this.getFromLocalStorage<LegacyBlogArticle[]>(this.STORAGE_KEYS.BLOG_ARTICLES, []),
      newsletter: this.getFromLocalStorage<LegacyNewsletterSubscriber[]>(this.STORAGE_KEYS.NEWSLETTER, []),
      cases: this.getFromLocalStorage<LegacyCaseStudy[]>(this.STORAGE_KEYS.CASES, []),
      meetings: this.getFromLocalStorage<LegacyMeetingRequest[]>(this.STORAGE_KEYS.MEETINGS, [])
    };

    return {
      ...data,
      hasData: data.articles.length > 0 || data.newsletter.length > 0 || data.cases.length > 0 || data.meetings.length > 0
    };
  }

  // Migrar artigos do blog
  static async migrateBlogArticles(articles: LegacyBlogArticle[]): Promise<{ success: number; errors: number }> {
    let success = 0;
    let errors = 0;

    for (const article of articles) {
      try {
        await newBlogService.createArticle({
          title: article.title,
          subtitle: article.subtitle,
          excerpt: article.excerpt,
          content: article.content,
          author: article.author,
          date: article.date,
          read_time: article.readTime,
          category: article.category,
          image_url: article.image,
          featured: article.featured,
          published: article.published,
          slug: article.slug,
          tags: article.tags,
          view_count: 0
        });
        success++;
      } catch (error) {
        console.error(`Erro ao migrar artigo ${article.title}:`, error);
        errors++;
      }
    }

    return { success, errors };
  }

  // Migrar cases de sucesso
  static async migrateCaseStudies(cases: LegacyCaseStudy[]): Promise<{ success: number; errors: number }> {
    let success = 0;
    let errors = 0;

    for (const caseStudy of cases) {
      try {
        await newCasesService.createCase({
          title: caseStudy.title,
          excerpt: caseStudy.excerpt,
          content: caseStudy.content,
          client: caseStudy.client,
          industry: caseStudy.industry,
          challenge: caseStudy.challenge,
          solution: caseStudy.solution,
          results: caseStudy.results,
          image_url: caseStudy.image,
          category: caseStudy.category,
          metrics: caseStudy.metrics,
          slug: caseStudy.slug,
          published: caseStudy.published,
          featured: caseStudy.featured,
          tags: caseStudy.tags,
          view_count: 0
        });
        success++;
      } catch (error) {
        console.error(`Erro ao migrar case ${caseStudy.title}:`, error);
        errors++;
      }
    }

    return { success, errors };
  }

  // Migrar assinantes da newsletter
  static async migrateNewsletterSubscribers(subscribers: LegacyNewsletterSubscriber[]): Promise<{ success: number; errors: number }> {
    let success = 0;
    let errors = 0;

    for (const subscriber of subscribers) {
      try {
        await newBlogService.subscribeToNewsletter(subscriber.email, 'localStorage_migration');
        success++;
      } catch (error) {
        console.error(`Erro ao migrar assinante ${subscriber.email}:`, error);
        errors++;
      }
    }

    return { success, errors };
  }

  // Migrar solicitações de reunião
  static async migrateMeetingRequests(meetings: LegacyMeetingRequest[]): Promise<{ success: number; errors: number }> {
    let success = 0;
    let errors = 0;

    for (const meeting of meetings) {
      try {
        await newMeetingService.createMeetingRequest({
          contact_name: meeting.contactName,
          email: meeting.email,
          company: meeting.company,
          phone: meeting.phone || '',
          interested_solution: meeting.interestedSolution,
          meeting_type: 'consultation', // Valor padrão
          preferred_time: meeting.preferredTime,
          specific_challenges: meeting.message || '',
          source_page: meeting.sourceSection || 'migration'
        });
        success++;
      } catch (error) {
        console.error(`Erro ao migrar reunião de ${meeting.contactName}:`, error);
        errors++;
      }
    }

    return { success, errors };
  }

  // Executar migração completa
  static async migrateAllData(): Promise<{
    articles: { success: number; errors: number };
    cases: { success: number; errors: number };
    newsletter: { success: number; errors: number };
    meetings: { success: number; errors: number };
  }> {
    const localData = this.getLocalStorageData();
    
    console.log('Iniciando migração de dados do localStorage para Supabase...');
    console.log('Dados encontrados:', {
      artigos: localData.articles.length,
      cases: localData.cases.length,
      newsletter: localData.newsletter.length,
      reuniões: localData.meetings.length
    });

    const results = {
      articles: await this.migrateBlogArticles(localData.articles),
      cases: await this.migrateCaseStudies(localData.cases),
      newsletter: await this.migrateNewsletterSubscribers(localData.newsletter),
      meetings: await this.migrateMeetingRequests(localData.meetings)
    };

    console.log('Migração concluída:', results);
    return results;
  }

  // Limpar dados do localStorage após migração bem-sucedida
  static clearLocalStorageData(): void {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('Dados do localStorage foram limpos');
  }

  // Criar backup dos dados do localStorage antes da migração
  static createBackup(): string {
    const data = this.getLocalStorageData();
    const backup = {
      timestamp: new Date().toISOString(),
      data
    };
    
    const backupString = JSON.stringify(backup, null, 2);
    
    // Criar e fazer download do backup
    const blob = new Blob([backupString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `intelligem-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return backupString;
  }

  // Utilitário para obter dados do localStorage
  private static getFromLocalStorage<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Erro ao ler ${key} do localStorage:`, error);
      return defaultValue;
    }
  }

  // Verificar se migração é necessária
  static isMigrationNeeded(): boolean {
    return this.hasLocalStorageData();
  }

  // Obter estatísticas dos dados locais
  static getLocalDataStats() {
    const data = this.getLocalStorageData();
    return {
      artigos: {
        total: data.articles.length,
        publicados: data.articles.filter(a => a.published).length,
        destacados: data.articles.filter(a => a.featured).length
      },
      cases: {
        total: data.cases.length,
        publicados: data.cases.filter(c => c.published).length,
        destacados: data.cases.filter(c => c.featured).length
      },
      newsletter: {
        total: data.newsletter.length,
        ativos: data.newsletter.filter(n => n.active).length
      },
      reuniões: {
        total: data.meetings.length,
        pendentes: data.meetings.filter(m => m.status === 'pending').length,
        confirmadas: data.meetings.filter(m => m.status === 'confirmed').length
      }
    };
  }
}