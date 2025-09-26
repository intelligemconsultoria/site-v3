import { getSupabaseClient } from '../utils/supabase/client';
import { logger } from '../utils/logger';

// Blog Service - Conectado ao Supabase
export interface BlogArticle {
  id: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  read_time: string; // Mudança para match com DB
  category: string;
  image_url: string; // Mudança para match com DB
  featured: boolean;
  published: boolean;
  slug: string;
  tags: string[];
  created_at: string; // Mudança para match com DB
  updated_at: string; // Mudança para match com DB
  view_count?: number;
  meta_description?: string;
  meta_keywords?: string[];
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribed_at: string; // Mudança para match com DB
  active: boolean;
  confirmed: boolean;
  interests?: string[];
  source?: string;
  confirmed_at?: string;
  unsubscribed_at?: string;
}

class BlogService {
  private supabase = getSupabaseClient();

  constructor() {
    logger.debug('BLOG_SERVICE', 'BlogService inicializado', {
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
    });
  }

  // Função auxiliar para gerar slug
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplos
      .replace(/^-|-$/g, ''); // Remove hífens do início/fim
  }

  // Função auxiliar para calcular tempo de leitura
  private calculateReadTime(content: string): string {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min`;
  }

  // Métodos para artigos
  async getAllArticles(): Promise<BlogArticle[]> {
    try {
      const { data, error } = await this.supabase
        .from('blog_articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar artigos:', error);
      return [];
    }
  }

  async getPublishedArticles(): Promise<BlogArticle[]> {
    try {
      const { data, error } = await this.supabase
        .from('blog_articles')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar artigos publicados:', error);
      return [];
    }
  }

  async getArticleBySlug(slug: string): Promise<BlogArticle | null> {
    try {
      const { data, error } = await this.supabase
        .from('blog_articles')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      // Incrementar view_count
      await this.supabase
        .from('blog_articles')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id);

      return data;
    } catch (error) {
      console.error('Erro ao buscar artigo por slug:', error);
      return null;
    }
  }

  async getArticleById(id: string): Promise<BlogArticle | null> {
    try {
      const { data, error } = await this.supabase
        .from('blog_articles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Erro ao buscar artigo por ID:', error);
      return null;
    }
  }

  async getArticlesByCategory(category: string): Promise<BlogArticle[]> {
    try {
      let query = this.supabase
        .from('blog_articles')
        .select('*')
        .eq('published', true);

      if (category !== 'Todos') {
        query = query.eq('category', category);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar artigos por categoria:', error);
      return [];
    }
  }

  async searchArticles(query: string): Promise<BlogArticle[]> {
    try {
      const { data, error } = await this.supabase
        .from('blog_articles')
        .select('*')
        .eq('published', true)
        .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao pesquisar artigos:', error);
      return [];
    }
  }

  async getFeaturedArticles(): Promise<BlogArticle[]> {
    try {
      const { data, error } = await this.supabase
        .from('blog_articles')
        .select('*')
        .eq('published', true)
        .eq('featured', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar artigos em destaque:', error);
      return [];
    }
  }

  async createArticle(article: Omit<BlogArticle, 'id' | 'created_at' | 'updated_at'>): Promise<BlogArticle> {
    try {
      logger.debug('BLOG_SERVICE', 'Iniciando criação de artigo', { article: { ...article, content: '[CONTENT_HIDDEN]' } });
      
      // Gerar slug se não fornecido
      const slug = article.slug || this.generateSlug(article.title);
      logger.debug('BLOG_SERVICE', 'Slug gerado', { slug });
      
      // Calcular tempo de leitura se não fornecido
      const read_time = article.read_time || this.calculateReadTime(article.content);
      logger.debug('BLOG_SERVICE', 'Tempo de leitura calculado', { read_time });

      const articleData = {
        ...article,
        slug,
        read_time,
        view_count: 0
      };

      logger.supabaseRequest('createArticle', 'blog_articles', 'INSERT', articleData);

      const { data, error } = await this.supabase
        .from('blog_articles')
        .insert([articleData])
        .select()
        .single();

      if (error) {
        logger.supabaseError('createArticle', error, { articleData });
        throw error;
      }

      logger.supabaseSuccess('createArticle', { articleId: data?.id });
      return data;
    } catch (error) {
      logger.error('BLOG_SERVICE', 'Erro ao criar artigo', error as Error, { article: { ...article, content: '[CONTENT_HIDDEN]' } });
      throw error;
    }
  }

  async updateArticle(id: string, updates: Partial<BlogArticle>): Promise<BlogArticle | null> {
    try {
      // Se título foi alterado, regenerar slug
      const updateData: any = { ...updates };
      if (updates.title && !updates.slug) {
        updateData.slug = this.generateSlug(updates.title);
      }
      
      // Se conteúdo foi alterado, recalcular tempo de leitura
      if (updates.content && !updates.read_time) {
        updateData.read_time = this.calculateReadTime(updates.content);
      }

      const { data, error } = await this.supabase
        .from('blog_articles')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Erro ao atualizar artigo:', error);
      throw error;
    }
  }

  async deleteArticle(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('blog_articles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar artigo:', error);
      return false;
    }
  }

  // Métodos para newsletter
  async subscribeToNewsletter(email: string, source: string = 'website'): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('newsletter_subscribers')
        .insert([{
          email,
          source,
          active: true,
          confirmed: false
        }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('Email já cadastrado');
        }
        throw error;
      }
      return true;
    } catch (error) {
      console.error('Erro ao inscrever no newsletter:', error);
      if (error instanceof Error) {
        throw error;
      }
      return false;
    }
  }

  async getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
    try {
      const { data, error } = await this.supabase
        .from('newsletter_subscribers')
        .select('*')
        .eq('active', true)
        .order('subscribed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar assinantes:', error);
      return [];
    }
  }

  async unsubscribeFromNewsletter(email: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('newsletter_subscribers')
        .update({ 
          active: false,
          unsubscribed_at: new Date().toISOString()
        })
        .eq('email', email);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao descadastrar do newsletter:', error);
      return false;
    }
  }

  // Método para obter categorias únicas
  async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await this.supabase
        .from('blog_articles')
        .select('category')
        .eq('published', true);

      if (error) throw error;
      
      const categories = data?.map(item => item.category) || [];
      return [...new Set(categories)];
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return [];
    }
  }

  // Método para obter estatísticas
  async getStats() {
    try {
      const [articlesResponse, subscribersResponse] = await Promise.all([
        this.supabase.from('blog_articles').select('published, featured, view_count'),
        this.supabase.from('newsletter_subscribers').select('active').eq('active', true)
      ]);

      const articles = articlesResponse.data || [];
      const subscribers = subscribersResponse.data || [];

      return {
        totalArticles: articles.length,
        publishedArticles: articles.filter(a => a.published).length,
        draftArticles: articles.filter(a => !a.published).length,
        featuredArticles: articles.filter(a => a.featured).length,
        totalSubscribers: subscribers.length,
        totalViews: articles.reduce((sum, a) => sum + (a.view_count || 0), 0),
        categories: await this.getCategories()
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        totalArticles: 0,
        publishedArticles: 0,
        draftArticles: 0,
        featuredArticles: 0,
        totalSubscribers: 0,
        totalViews: 0,
        categories: []
      };
    }
  }
}

export const blogService = new BlogService();