// Blog Service Compatibility Layer - Mantém API antiga mas usa Supabase
import { blogService as newBlogService } from './blogService';
import { mapBlogArticleToLegacy, mapBlogArticlesToLegacy, mapBlogArticleToDb } from '../utils/fieldMappers';

// Interface antiga para compatibilidade
export interface BlogArticle {
  id: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string; // Nome antigo
  category: string;
  image: string; // Nome antigo
  featured: boolean;
  published: boolean;
  slug: string;
  tags: string[];
  createdAt: string; // Nome antigo
  updatedAt: string; // Nome antigo
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string; // Nome antigo
  active: boolean;
}

class BlogServiceCompat {
  // Métodos para artigos
  async getAllArticles(): Promise<BlogArticle[]> {
    const articles = await newBlogService.getAllArticles();
    return mapBlogArticlesToLegacy(articles);
  }

  async getPublishedArticles(): Promise<BlogArticle[]> {
    const articles = await newBlogService.getPublishedArticles();
    return mapBlogArticlesToLegacy(articles);
  }

  async getArticleBySlug(slug: string): Promise<BlogArticle | null> {
    const article = await newBlogService.getArticleBySlug(slug);
    return article ? mapBlogArticleToLegacy(article) : null;
  }

  async getArticleById(id: string): Promise<BlogArticle | null> {
    const article = await newBlogService.getArticleById(id);
    return article ? mapBlogArticleToLegacy(article) : null;
  }

  async getArticlesByCategory(category: string): Promise<BlogArticle[]> {
    const articles = await newBlogService.getArticlesByCategory(category);
    return mapBlogArticlesToLegacy(articles);
  }

  async searchArticles(query: string): Promise<BlogArticle[]> {
    const articles = await newBlogService.searchArticles(query);
    return mapBlogArticlesToLegacy(articles);
  }

  async getFeaturedArticles(): Promise<BlogArticle[]> {
    const articles = await newBlogService.getFeaturedArticles();
    return mapBlogArticlesToLegacy(articles);
  }

  async createArticle(article: Omit<BlogArticle, 'id' | 'createdAt' | 'updatedAt'>): Promise<BlogArticle> {
    const mappedArticle = mapBlogArticleToDb(article);
    const newArticle = await newBlogService.createArticle(mappedArticle as any);
    return mapBlogArticleToLegacy(newArticle);
  }

  async updateArticle(id: string, updates: Partial<BlogArticle>): Promise<BlogArticle | null> {
    const mappedUpdates = mapBlogArticleToDb(updates);
    const updatedArticle = await newBlogService.updateArticle(id, mappedUpdates);
    return updatedArticle ? mapBlogArticleToLegacy(updatedArticle) : null;
  }

  async deleteArticle(id: string): Promise<boolean> {
    return await newBlogService.deleteArticle(id);
  }

  // Métodos para newsletter
  async subscribeToNewsletter(email: string): Promise<boolean> {
    try {
      await newBlogService.subscribeToNewsletter(email);
      return true;
    } catch (error) {
      console.error('Erro ao inscrever no newsletter:', error);
      return false;
    }
  }

  async getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
    const subscribers = await newBlogService.getNewsletterSubscribers();
    return subscribers.map(sub => ({
      id: sub.id,
      email: sub.email,
      subscribedAt: sub.subscribed_at,
      active: sub.active
    }));
  }

  async unsubscribeFromNewsletter(email: string): Promise<boolean> {
    return await newBlogService.unsubscribeFromNewsletter(email);
  }

  // Método para obter categorias únicas
  async getCategories(): Promise<string[]> {
    return await newBlogService.getCategories();
  }

  // Método para obter estatísticas
  async getStats() {
    return await newBlogService.getStats();
  }
}

export const blogService = new BlogServiceCompat();