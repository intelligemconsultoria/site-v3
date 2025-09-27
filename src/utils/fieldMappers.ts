// Utilitários para conversão entre nomes de campos antigos e novos

import { BlogArticle } from '../services/blogService';
import { CaseStudy } from '../services/casesService';
import { MeetingRequest } from '../services/meetingService';

// Mapear BlogArticle do DB para formato antigo usado pelos componentes
export function mapBlogArticleToLegacy(article: BlogArticle): any {
  return {
    ...article,
    readTime: article.read_time,
    image: article.image_url,
    createdAt: article.created_at,
    updatedAt: article.updated_at
  };
}

// Mapear dados do componente para formato do DB
export function mapBlogArticleToDb(article: any): Partial<BlogArticle> {
  const mapped: any = { ...article };
  
  // Converter nomes de campos
  if (article.readTime) {
    mapped.read_time = article.readTime;
    delete mapped.readTime;
  }
  if (article.image) {
    mapped.image_url = article.image;
    delete mapped.image;
  }
  if (article.createdAt) {
    mapped.created_at = article.createdAt;
    delete mapped.createdAt;
  }
  if (article.updatedAt) {
    mapped.updated_at = article.updatedAt;
    delete mapped.updatedAt;
  }
  
  return mapped;
}

// Mapear CaseStudy do DB para formato antigo
export function mapCaseStudyToLegacy(caseStudy: CaseStudy): any {
  return {
    ...caseStudy,
    image_url: caseStudy.image_url,
    createdAt: caseStudy.created_at,
    updatedAt: caseStudy.updated_at
  };
}

// Mapear dados do componente para formato do DB
export function mapCaseStudyToDb(caseStudy: any): Partial<CaseStudy> {
  const mapped: any = { ...caseStudy };
  
  if (caseStudy.image) {
    mapped.image_url = caseStudy.image;
    delete mapped.image;
  }
  if (caseStudy.createdAt) {
    mapped.created_at = caseStudy.createdAt;
    delete mapped.createdAt;
  }
  if (caseStudy.updatedAt) {
    mapped.updated_at = caseStudy.updatedAt;
    delete mapped.updatedAt;
  }
  
  return mapped;
}

// Mapear MeetingRequest do DB para formato antigo
export function mapMeetingRequestToLegacy(meeting: MeetingRequest): any {
  return {
    ...meeting,
    contactName: meeting.contact_name,
    interestedSolution: meeting.interested_solution,
    preferredTime: meeting.preferred_time,
    sourceSection: meeting.source_page,
    createdAt: meeting.created_at,
    updatedAt: meeting.updated_at
  };
}

// Mapear dados do componente para formato do DB
export function mapMeetingRequestToDb(meeting: any): Partial<MeetingRequest> {
  const mapped: any = { ...meeting };
  
  if (meeting.contactName) {
    mapped.contact_name = meeting.contactName;
    delete mapped.contactName;
  }
  if (meeting.interestedSolution) {
    mapped.interested_solution = meeting.interestedSolution;
    delete mapped.interestedSolution;
  }
  if (meeting.preferredTime) {
    mapped.preferred_time = meeting.preferredTime;
    delete mapped.preferredTime;
  }
  if (meeting.sourceSection) {
    mapped.source_page = meeting.sourceSection;
    delete mapped.sourceSection;
  }
  if (meeting.createdAt) {
    mapped.created_at = meeting.createdAt;
    delete mapped.createdAt;
  }
  if (meeting.updatedAt) {
    mapped.updated_at = meeting.updatedAt;
    delete mapped.updatedAt;
  }
  
  return mapped;
}

// Mapear array de artigos
export function mapBlogArticlesToLegacy(articles: BlogArticle[]): any[] {
  return articles.map(mapBlogArticleToLegacy);
}

// Mapear array de cases
export function mapCaseStudiesToLegacy(cases: CaseStudy[]): any[] {
  return cases.map(mapCaseStudyToLegacy);
}

// Mapear array de reuniões
export function mapMeetingRequestsToLegacy(meetings: MeetingRequest[]): any[] {
  return meetings.map(mapMeetingRequestToLegacy);
}