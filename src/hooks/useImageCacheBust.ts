import { useState, useEffect } from 'react';

/**
 * Hook para gerenciar imagens com cache-busting automático
 * Resolve problemas de cache em mobile e desktop
 */
export function useImageCacheBust(imageKey: string, defaultValue: string = '') {
  const [imageUrl, setImageUrl] = useState(defaultValue);
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  const addCacheBust = (url: string): string => {
    if (!url) return url;
    
    const timestamp = new Date().getTime();
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}cb=${timestamp}&v=${lastUpdate}`;
  };

  const loadImage = () => {
    const savedImage = localStorage.getItem(`site-image-${imageKey}`);
    const imageToUse = savedImage || defaultValue;
    
    if (imageToUse) {
      setImageUrl(addCacheBust(imageToUse));
    }
  };

  useEffect(() => {
    loadImage();

    // Listener para atualizações de imagem
    const handleImageUpdate = (event: CustomEvent) => {
      const newImage = event.detail[imageKey];
      if (newImage !== undefined) {
        setLastUpdate(Date.now());
        setImageUrl(addCacheBust(newImage));
      }
    };

    // Listener para atualizações gerais
    const handleGeneralUpdate = () => {
      setLastUpdate(Date.now());
      loadImage();
    };

    window.addEventListener('site-images-updated', handleImageUpdate as EventListener);
    window.addEventListener('site-images-refresh', handleGeneralUpdate as EventListener);
    
    return () => {
      window.removeEventListener('site-images-updated', handleImageUpdate as EventListener);
      window.removeEventListener('site-images-refresh', handleGeneralUpdate as EventListener);
    };
  }, [imageKey, defaultValue]);

  return imageUrl;
}

/**
 * Hook para forçar refresh de todas as imagens
 */
export function useImageRefresh() {
  const refreshAllImages = () => {
    const event = new CustomEvent('site-images-refresh');
    window.dispatchEvent(event);
  };

  return { refreshAllImages };
}


