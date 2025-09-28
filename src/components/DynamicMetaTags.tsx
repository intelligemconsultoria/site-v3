import { useEffect } from 'react';
import { blogService, BlogArticle } from '../services/blogServiceCompat';
import { casesService, CaseStudy } from '../services/casesServiceCompat';

export function DynamicMetaTags() {
  useEffect(() => {
    const updateMetaTagsForCurrentUrl = async () => {
      const path = window.location.pathname;
      
      // Detectar se é um artigo
      if (path.startsWith('/artigo/')) {
        const slug = path.replace('/artigo/', '');
        try {
          const article = await blogService.getArticleBySlug(slug);
          if (article) {
            updateMetaTags({
              title: article.title,
              description: article.excerpt,
              image: article.image_url,
              url: `${window.location.origin}/artigo/${article.slug}`,
              type: 'article'
            });
          }
        } catch (error) {
          console.error('Erro ao carregar artigo para meta tags:', error);
        }
      }
      
      // Detectar se é um case study
      else if (path.startsWith('/case/')) {
        const slug = path.replace('/case/', '');
        try {
          const caseStudy = await casesService.getCaseBySlug(slug);
          if (caseStudy) {
            updateMetaTags({
              title: caseStudy.title,
              description: caseStudy.excerpt,
              image: caseStudy.image_url,
              url: `${window.location.origin}/case/${caseStudy.slug}`,
              type: 'article'
            });
          }
        } catch (error) {
          console.error('Erro ao carregar case study para meta tags:', error);
        }
      }
    };

    updateMetaTagsForCurrentUrl();
  }, []);

  return null;
}

function updateMetaTags({
  title,
  description,
  image,
  url,
  type = 'website'
}: {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: string;
}) {
  // Atualizar título da página
  document.title = `${title} | IntelliGem Consultoria`;

  // Função para atualizar ou criar meta tags
  const updateMetaTag = (property: string, content: string) => {
    let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', property);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  };

  // Função para atualizar meta tags name
  const updateMetaName = (name: string, content: string) => {
    let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', name);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  };

  // Meta tags básicas
  updateMetaName('description', description);

  // Open Graph tags (para LinkedIn, Facebook, etc.)
  updateMetaTag('og:title', `${title} | IntelliGem Consultoria`);
  updateMetaTag('og:description', description);
  updateMetaTag('og:image', image || 'https://intelligemconsultoria.com.br/og-image.jpg');
  updateMetaTag('og:url', url);
  updateMetaTag('og:type', type);
  updateMetaTag('og:site_name', 'IntelliGem Consultoria');
  updateMetaTag('og:locale', 'pt_BR');

  // Twitter Card tags
  updateMetaName('twitter:card', 'summary_large_image');
  updateMetaName('twitter:title', `${title} | IntelliGem Consultoria`);
  updateMetaName('twitter:description', description);
  updateMetaName('twitter:image', image || 'https://intelligemconsultoria.com.br/og-image.jpg');

  // Canonical URL
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', url);
}
