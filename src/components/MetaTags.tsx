import { useEffect } from 'react';

interface MetaTagsProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export function MetaTags({ 
  title, 
  description, 
  image, 
  url, 
  type = 'article' 
}: MetaTagsProps) {
  useEffect(() => {
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

    // Atualizar título da página
    if (title) {
      document.title = `${title} | IntelliGem`;
    }

    // Meta tags básicas
    if (description) {
      updateMetaName('description', description);
    }

    // Open Graph tags (para LinkedIn, Facebook, etc.)
    if (title) {
      updateMetaTag('og:title', title);
    }
    if (description) {
      updateMetaTag('og:description', description);
    }
    if (image) {
      updateMetaTag('og:image', image);
    }
    if (url) {
      updateMetaTag('og:url', url);
    }
    updateMetaTag('og:type', type);
    updateMetaTag('og:site_name', 'IntelliGem');

    // Twitter Card tags
    updateMetaName('twitter:card', 'summary_large_image');
    if (title) {
      updateMetaName('twitter:title', title);
    }
    if (description) {
      updateMetaName('twitter:description', description);
    }
    if (image) {
      updateMetaName('twitter:image', image);
    }

  }, [title, description, image, url, type]);

  return null; // Este componente não renderiza nada visível
}
