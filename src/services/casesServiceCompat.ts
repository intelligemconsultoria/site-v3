// Cases Service Compatibility Layer - Mantém API antiga mas usa Supabase
import { casesService as newCasesService } from './casesService';
import { mapCaseStudyToLegacy, mapCaseStudiesToLegacy, mapCaseStudyToDb } from '../utils/fieldMappers';

// Interface antiga para compatibilidade
export interface CaseStudy {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  client: string;
  industry: string;
  challenge: string;
  solution: string;
  results: string[];
  image_url: string; // Nome antigo
  category: 'GemFlow' | 'GemInsights' | 'GemMind';
  metrics: {
    improvement: string;
    timeframe: string;
    roi: string;
  };
  showMetrics?: boolean; // Controla se a seção de métricas deve ser exibida
  showChallenge?: boolean; // Controla se o card Desafio deve ser exibido
  showSolution?: boolean; // Controla se o card Solução deve ser exibido
  showResults?: boolean; // Controla se o card Principais Resultados deve ser exibido
  slug: string;
  published: boolean;
  featured: boolean;
  tags: string[];
  createdAt: string; // Nome antigo
  updatedAt: string; // Nome antigo
}

class CasesServiceCompat {
  // Métodos para cases
  async getAllCases(): Promise<CaseStudy[]> {
    const cases = await newCasesService.getAllCases();
    const mappedCases = mapCaseStudiesToLegacy(cases);
    return mappedCases;
  }

  async getPublishedCases(): Promise<CaseStudy[]> {
    const cases = await newCasesService.getPublishedCases();
    return mapCaseStudiesToLegacy(cases);
  }

  async getCaseBySlug(slug: string): Promise<CaseStudy | null> {
    const caseStudy = await newCasesService.getCaseBySlug(slug);
    return caseStudy ? mapCaseStudyToLegacy(caseStudy) : null;
  }

  async getCaseById(id: string): Promise<CaseStudy | null> {
    const caseStudy = await newCasesService.getCaseById(id);
    return caseStudy ? mapCaseStudyToLegacy(caseStudy) : null;
  }

  async getCasesByCategory(category: string): Promise<CaseStudy[]> {
    const cases = await newCasesService.getCasesByCategory(category);
    return mapCaseStudiesToLegacy(cases);
  }

  async searchCases(query: string): Promise<CaseStudy[]> {
    const cases = await newCasesService.searchCases(query);
    return mapCaseStudiesToLegacy(cases);
  }

  async getFeaturedCases(): Promise<CaseStudy[]> {
    const cases = await newCasesService.getFeaturedCases();
    return mapCaseStudiesToLegacy(cases);
  }

  async createCase(caseStudy: Omit<CaseStudy, 'id' | 'createdAt' | 'updatedAt'>): Promise<CaseStudy> {
    const mappedCase = mapCaseStudyToDb(caseStudy);
    const newCase = await newCasesService.createCase(mappedCase as any);
    return mapCaseStudyToLegacy(newCase);
  }

  async updateCase(id: string, updates: Partial<CaseStudy>): Promise<CaseStudy | null> {
    const mappedUpdates = mapCaseStudyToDb(updates);
    const updatedCase = await newCasesService.updateCase(id, mappedUpdates);
    return updatedCase ? mapCaseStudyToLegacy(updatedCase) : null;
  }

  async deleteCase(id: string): Promise<boolean> {
    return await newCasesService.deleteCase(id);
  }

  // Método para obter categorias únicas
  async getCategories(): Promise<string[]> {
    return await newCasesService.getCategories();
  }

  // Método para obter estatísticas
  async getStats() {
    return await newCasesService.getStats();
  }
}

export const casesService = new CasesServiceCompat();