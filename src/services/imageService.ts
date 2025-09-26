import { getSupabaseClient } from '../utils/supabase/client';

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
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a91235ef/images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ id, ...imageData })
    });

    if (!response.ok) {
      throw new Error('Erro ao salvar metadados da imagem');
    }
  },

  async getAllImages(): Promise<ImageData[]> {
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a91235ef/images`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao carregar imagens');
    }

    return response.json();
  },

  async getImagesByCategory(category: string): Promise<ImageData[]> {
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a91235ef/images/category/${category}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao carregar imagens da categoria');
    }

    return response.json();
  },

  async deleteImage(id: string): Promise<void> {
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a91235ef/images/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao deletar imagem');
    }
  },

  async updateImageCategory(id: string, category: string): Promise<void> {
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a91235ef/images/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ category })
    });

    if (!response.ok) {
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