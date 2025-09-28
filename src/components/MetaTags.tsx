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
  type = 'website' 
}: MetaTagsProps) {
  useEffect(() => {
    // Valores padrão
    const defaultTitle = 'IntelliGem Consultoria - Soluções Inteligentes em Tecnologia';
    const defaultDescription = 'IntelliGem Consultoria oferece soluções inteligentes em tecnologia, automação de processos e análise de dados para empresas que buscam inovação e eficiência.';
    const defaultImage = 'https://intelligemconsultoria.com.br/og-image.jpg';
    const defaultUrl = 'https://intelligemconsultoria.com.br/';

    // Usar valores fornecidos ou padrões
    const finalTitle = title || defaultTitle;
    const finalDescription = description || defaultDescription;
    const finalImage = image || defaultImage;
    const finalUrl = url || defaultUrl;

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

    // Atualizar título da página apenas se necessário
    if (document.title !== finalTitle) {
      document.title = finalTitle;
    }

    // Meta tags básicas
    updateMetaName('description', finalDescription);

    // Open Graph tags (para LinkedIn, Facebook, etc.)
    updateMetaTag('og:title', finalTitle);
    updateMetaTag('og:description', finalDescription);
    updateMetaTag('og:image', finalImage);
    updateMetaTag('og:url', finalUrl);
    updateMetaTag('og:type', type);
    updateMetaTag('og:site_name', 'IntelliGem Consultoria');
    updateMetaTag('og:locale', 'pt_BR');

    // Twitter Card tags
    updateMetaName('twitter:card', 'summary_large_image');
    updateMetaName('twitter:title', finalTitle);
    updateMetaName('twitter:description', finalDescription);
    updateMetaName('twitter:image', finalImage);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', finalUrl);

  }, [title, description, image, url, type]);

  return null; // Este componente não renderiza nada visível
}
