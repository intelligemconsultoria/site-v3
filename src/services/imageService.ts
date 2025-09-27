import { getSupabaseClient } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const supabase = getSupabaseClient();

export interface ImageData {
  id: string;
  name: string;
  url: string;
  category: string;
  size: number;
  uploadedAt: string;
}

export const imageService = {
  async uploadImage(file: File, category: string): Promise<string> {
    const fileName = `${category}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    const { data, error } = await supabase.storage
      .from('blog-images')
      .upload(fileName, file);

    if (error) {
      throw new Error(`Erro no upload: ${error.message}`);
    }

    // Get signed URL
    const { data: urlData } = await supabase.storage
      .from('blog-images')
      .createSignedUrl(data.path, 31536000); // 1 year

    if (!urlData?.signedUrl) {
      throw new Error('Erro ao gerar URL da imagem');
    }

    // Save metadata to KV store
    const imageData: Omit<ImageData, 'id'> = {
      name: file.name,
      url: urlData.signedUrl,
      category,
      size: file.size,
      uploadedAt: new Date().toISOString()
    };

    const imageId = `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await this.saveImageMetadata(imageId, imageData);

    return urlData.signedUrl;
  },

  async saveImageMetadata(id: string, imageData: Omit<ImageData, 'id'>) {
    try {
      // Tentar usar a Edge Function primeiro
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a91235ef/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ id, ...imageData })
      });

      if (response.ok) {
        return;
      }
    } catch (error) {
      console.warn('Edge Function não disponível, usando fallback:', error);
    }

    // Fallback: salvar no localStorage
    try {
      const storedImages = localStorage.getItem('intelligem_images');
      const images = storedImages ? JSON.parse(storedImages) : [];
      
      const newImage: ImageData = { id, ...imageData };
      images.push(newImage);
      
      localStorage.setItem('intelligem_images', JSON.stringify(images));
    } catch (error) {
      console.warn('Erro ao salvar imagem no localStorage:', error);
      throw new Error('Erro ao salvar metadados da imagem');
    }
  },

  async getAllImages(): Promise<ImageData[]> {
    console.log('🖼️ [imageService] getAllImages() iniciado');
    
    // Solução imediata: usar Supabase Storage diretamente
    try {
      console.log('🔄 [imageService] Listando arquivos do Supabase Storage...');
      
      const { data: files, error } = await supabase.storage
        .from('blog-images')
        .list('', {
          limit: 100,
          offset: 0,
        });

      if (error) {
        console.error('❌ [imageService] Erro ao listar arquivos:', error);
        throw error;
      }

      console.log('📊 [imageService] Arquivos encontrados:', files?.length || 0);

      if (!files || files.length === 0) {
        console.log('⚠️ [imageService] Nenhum arquivo encontrado no storage');
        return [];
      }

      // Converter arquivos para formato ImageData
      const images: ImageData[] = await Promise.all(
        files.map(async (file) => {
          try {
            // Gerar URL assinada
            const { data: signedData } = await supabase.storage
              .from('blog-images')
              .createSignedUrl(file.name, 3600); // 1 hora

            return {
              id: file.id || file.name,
              name: file.name,
              url: signedData?.signedUrl || '',
              category: this.extractCategoryFromPath(file.name),
              size: file.metadata?.size || 0,
              uploadedAt: file.created_at || new Date().toISOString()
            };
          } catch (error) {
            console.error('❌ [imageService] Erro ao processar arquivo:', file.name, error);
            return null;
          }
        })
      );

      const validImages = images.filter(img => img !== null) as ImageData[];
      console.log('✅ [imageService] Imagens processadas:', validImages.length);
      return validImages;

    } catch (error) {
      console.error('❌ [imageService] Erro ao acessar Supabase Storage:', error);
    }

    // Fallback: localStorage
    console.log('🔄 [imageService] Tentando localStorage fallback...');
    try {
      const storedImages = localStorage.getItem('intelligem_images');
      console.log('💾 [imageService] localStorage data:', storedImages ? 'existe' : 'não existe');
      
      if (storedImages) {
        const parsed = JSON.parse(storedImages);
        console.log('✅ [imageService] localStorage sucesso, imagens:', parsed.length);
        return parsed;
      } else {
        console.log('⚠️ [imageService] localStorage vazio');
      }
    } catch (error) {
      console.error('❌ [imageService] localStorage erro:', error);
    }

    console.log('🔄 [imageService] Retornando array vazio');
    return [];
  },

  // Helper para extrair categoria do nome do arquivo
  extractCategoryFromPath(fileName: string): string {
    const parts = fileName.split('/');
    if (parts.length > 1) {
      return parts[0]; // Primeira parte do path é a categoria
    }
    return 'general';
  },

  async getImagesByCategory(category: string): Promise<ImageData[]> {
    console.log('🖼️ [imageService] getImagesByCategory() iniciado, categoria:', category);
    
    try {
      console.log('🔄 [imageService] Listando arquivos do Supabase Storage por categoria...');
      
      const { data: files, error } = await supabase.storage
        .from('blog-images')
        .list(category, {
          limit: 100,
          offset: 0,
        });

      if (error) {
        console.error('❌ [imageService] Erro ao listar arquivos da categoria:', error);
        throw error;
      }

      console.log('📊 [imageService] Arquivos encontrados na categoria:', files?.length || 0);

      if (!files || files.length === 0) {
        console.log('⚠️ [imageService] Nenhum arquivo encontrado na categoria');
        return [];
      }

      // Converter arquivos para formato ImageData
      const images: ImageData[] = await Promise.all(
        files.map(async (file) => {
          try {
            // Gerar URL assinada
            const { data: signedData } = await supabase.storage
              .from('blog-images')
              .createSignedUrl(`${category}/${file.name}`, 3600);

            return {
              id: file.id || file.name,
              name: file.name,
              url: signedData?.signedUrl || '',
              category: category,
              size: file.metadata?.size || 0,
              uploadedAt: file.created_at || new Date().toISOString()
            };
          } catch (error) {
            console.error('❌ [imageService] Erro ao processar arquivo:', file.name, error);
            return null;
          }
        })
      );

      const validImages = images.filter(img => img !== null) as ImageData[];
      console.log('✅ [imageService] Imagens da categoria processadas:', validImages.length);
      return validImages;

    } catch (error) {
      console.error('❌ [imageService] Erro ao acessar Supabase Storage:', error);
    }

    // Fallback: filtrar imagens do localStorage
    console.log('🔄 [imageService] Tentando localStorage fallback...');
    try {
      const storedImages = localStorage.getItem('intelligem_images');
      if (storedImages) {
        const allImages = JSON.parse(storedImages);
        const filtered = allImages.filter((img: ImageData) => img.category === category);
        console.log('✅ [imageService] localStorage fallback, imagens filtradas:', filtered.length);
        return filtered;
      }
    } catch (error) {
      console.warn('❌ [imageService] Erro ao carregar imagens do localStorage:', error);
    }

    console.log('🔄 [imageService] Retornando array vazio');
    return [];
  },

  async deleteImage(id: string): Promise<void> {
    try {
      // Tentar usar a Edge Function primeiro
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a91235ef/images/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (response.ok) {
        return;
      }
    } catch (error) {
      console.warn('Edge Function não disponível, usando fallback:', error);
    }

    // Fallback: deletar do localStorage
    try {
      const storedImages = localStorage.getItem('intelligem_images');
      if (storedImages) {
        const images = JSON.parse(storedImages);
        const filteredImages = images.filter((img: ImageData) => img.id !== id);
        localStorage.setItem('intelligem_images', JSON.stringify(filteredImages));
      }
    } catch (error) {
      console.warn('Erro ao deletar imagem do localStorage:', error);
      throw new Error('Erro ao deletar imagem');
    }
  },

  async updateImageCategory(id: string, category: string): Promise<void> {
    try {
      // Tentar usar a Edge Function primeiro
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a91235ef/images/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ category })
      });

      if (response.ok) {
        return;
      }
    } catch (error) {
      console.warn('Edge Function não disponível, usando fallback:', error);
    }

    // Fallback: atualizar no localStorage
    try {
      const storedImages = localStorage.getItem('intelligem_images');
      if (storedImages) {
        const images = JSON.parse(storedImages);
        const updatedImages = images.map((img: ImageData) => 
          img.id === id ? { ...img, category } : img
        );
        localStorage.setItem('intelligem_images', JSON.stringify(updatedImages));
      }
    } catch (error) {
      console.warn('Erro ao atualizar categoria no localStorage:', error);
      throw new Error('Erro ao atualizar categoria da imagem');
    }
  }
};

export const ImageCategories = {
  HERO: 'hero',
  BLOG: 'blog',
  CASES: 'cases',
  TEAM: 'team',
  SOLUTIONS: 'solutions',
  GENERAL: 'general'
} as const;

export type ImageCategory = typeof ImageCategories[keyof typeof ImageCategories];