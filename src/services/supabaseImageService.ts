import { projectId, publicAnonKey } from '../utils/supabase/info';
import { AuthService } from './authService';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a91235ef`;

export interface SiteImageMetadata {
  key: string;
  filename: string;
  originalName: string;
  category: string;
  size: number;
  type: string;
  uploadedAt: string;
  updatedAt?: string;
  publicUrl: string;
}

export class SupabaseImageService {
  private static async getHeaders(requireAuth: boolean = false): Promise<Record<string, string>> {
    console.log('🔑 [supabaseImageService] getHeaders() iniciado, requireAuth:', requireAuth);
    
    const headers: Record<string, string> = {};
    
    if (requireAuth) {
      console.log('🔐 [supabaseImageService] Requer autenticação, buscando sessão...');
      // Try to get fresh access token
      const sessionResult = await AuthService.getCurrentSession();
      console.log('🔐 [supabaseImageService] Session result:', sessionResult);
      
      if (sessionResult.success && sessionResult.accessToken) {
        headers['Authorization'] = `Bearer ${sessionResult.accessToken}`;
        console.log('✅ [supabaseImageService] Token de autenticação obtido');
      } else {
        console.error('❌ [supabaseImageService] Falha na autenticação:', sessionResult);
        throw new Error('Authentication required but no valid session found. Please login again.');
      }
    } else {
      console.log('🌐 [supabaseImageService] Usando chave pública anônima');
      // Use public anon key for public requests
      headers['Authorization'] = `Bearer ${publicAnonKey}`;
      console.log('🔑 [supabaseImageService] Public key (primeiros 20 chars):', publicAnonKey.substring(0, 20) + '...');
    }
    
    console.log('📋 [supabaseImageService] Headers finais:', headers);
    return headers;
  }

  // Upload a new site image
  static async uploadSiteImage(
    file: File, 
    imageKey: string, 
    category: string = 'uncategorized'
  ): Promise<{ success: boolean; url: string; metadata: SiteImageMetadata; error?: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('imageKey', imageKey);
      formData.append('category', category);

      const headers = await this.getHeaders(true); // Require authentication
      
      const response = await fetch(`${API_BASE_URL}/site-images/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        console.warn('Edge Function não disponível, usando fallback:', response.status);
        
        // Fallback: simular upload e salvar no localStorage
        const fallbackMetadata: SiteImageMetadata = {
          key: imageKey,
          filename: `${imageKey}-${Date.now()}.${file.name.split('.').pop()}`,
          originalName: file.name,
          category: category || 'uncategorized',
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
          publicUrl: URL.createObjectURL(file) // URL temporária do arquivo
        };

        // Salvar no localStorage
        try {
          const storedImages = localStorage.getItem('intelligem_site_images');
          const images = storedImages ? JSON.parse(storedImages) : [];
          images.push(fallbackMetadata);
          localStorage.setItem('intelligem_site_images', JSON.stringify(images));
        } catch (error) {
          console.warn('Erro ao salvar no localStorage:', error);
        }

        return {
          success: true,
          url: fallbackMetadata.publicUrl,
          metadata: fallbackMetadata,
        };
      }

      return {
        success: true,
        url: result.url,
        metadata: result.metadata,
      };
    } catch (error) {
      console.error('Error uploading site image:', error);
      return {
        success: false,
        url: '',
        metadata: {} as SiteImageMetadata,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  // Get all site images (public access)
  static async getAllSiteImages(): Promise<SiteImageMetadata[]> {
    console.log('🏠 [supabaseImageService] getAllSiteImages() iniciado');
    
    try {
      console.log('🔄 [supabaseImageService] Tentando Edge Function...');
      const headers = await this.getHeaders(false);
      console.log('🔑 [supabaseImageService] Headers:', headers);
      
      const url = `${API_BASE_URL}/site-images`;
      console.log('📡 [supabaseImageService] URL:', url);
      
      const response = await fetch(url, {
        headers,
      });

      console.log('📊 [supabaseImageService] Response status:', response.status);
      console.log('📊 [supabaseImageService] Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ [supabaseImageService] Edge Function sucesso, dados:', data);
        return data;
      } else {
        const errorText = await response.text();
        console.error('❌ [supabaseImageService] Edge Function erro:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ [supabaseImageService] Edge Function exception:', error);
    }

    console.log('🔄 [supabaseImageService] Tentando localStorage fallback...');
    try {
      const storedImages = localStorage.getItem('intelligem_site_images');
      console.log('💾 [supabaseImageService] localStorage data:', storedImages ? 'existe' : 'não existe');
      
      if (storedImages) {
        const parsed = JSON.parse(storedImages);
        console.log('✅ [supabaseImageService] localStorage sucesso, imagens:', parsed.length);
        return parsed;
      } else {
        console.log('⚠️ [supabaseImageService] localStorage vazio');
      }
    } catch (error) {
      console.error('❌ [supabaseImageService] localStorage erro:', error);
    }

    console.log('🔄 [supabaseImageService] Retornando array vazio');
    return [];
  }

  // Get site image by key (public access)
  static async getSiteImage(imageKey: string): Promise<SiteImageMetadata | null> {
    try {
      const headers = await this.getHeaders(false); // No auth required for reading
      
      const response = await fetch(`${API_BASE_URL}/site-images/${imageKey}`, {
        headers,
      });

      if (response.ok) {
        return await response.json();
      } else if (response.status === 404) {
        return null;
      } else {
        console.warn('Edge Function não disponível, usando fallback:', response.status);
      }
    } catch (error) {
      console.warn('Edge Function não disponível, usando fallback:', error);
    }

    // Fallback: buscar do localStorage
    try {
      const storedImages = localStorage.getItem('intelligem_site_images');
      if (storedImages) {
        const images = JSON.parse(storedImages);
        return images.find((img: SiteImageMetadata) => img.key === imageKey) || null;
      }
    } catch (error) {
      console.warn('Erro ao carregar site image do localStorage:', error);
    }

    return null;
  }

  // Get images by category
  static async getImagesByCategory(category: string): Promise<SiteImageMetadata[]> {
    try {
      const headers = await this.getHeaders(false); // No auth required for reading
      
      const response = await fetch(`${API_BASE_URL}/site-images/category/${category}`, {
        headers,
      });

      if (response.ok) {
        return await response.json();
      } else {
        console.warn('Edge Function não disponível, usando fallback:', response.status);
      }
    } catch (error) {
      console.warn('Edge Function não disponível, usando fallback:', error);
    }

    // Fallback: filtrar do localStorage
    try {
      const storedImages = localStorage.getItem('intelligem_site_images');
      if (storedImages) {
        const images = JSON.parse(storedImages);
        return images.filter((img: SiteImageMetadata) => img.category === category);
      }
    } catch (error) {
      console.warn('Erro ao carregar site images do localStorage:', error);
    }

    return [];
  }

  // Update site image metadata
  static async updateSiteImage(
    imageKey: string, 
    updates: Partial<Omit<SiteImageMetadata, 'key' | 'filename' | 'uploadedAt'>>
  ): Promise<{ success: boolean; metadata?: SiteImageMetadata; error?: string }> {
    try {
      const authHeaders = await this.getHeaders(true); // Require authentication
      
      const response = await fetch(`${API_BASE_URL}/site-images/${imageKey}`, {
        method: 'PUT',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Update image API error:', response.status, result);
        throw new Error(result.error || `Update failed with status ${response.status}`);
      }

      return {
        success: true,
        metadata: result.metadata,
      };
    } catch (error) {
      console.error('Error updating site image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Update failed',
      };
    }
  }

  // Delete site image
  static async deleteSiteImage(imageKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      const headers = await this.getHeaders(true); // Require authentication
      
      const response = await fetch(`${API_BASE_URL}/site-images/${imageKey}`, {
        method: 'DELETE',
        headers,
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Delete image API error:', response.status, result);
        throw new Error(result.error || `Delete failed with status ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting site image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed',
      };
    }
  }

  // Check if image exists and get URL
  static async getImageUrl(imageKey: string): Promise<string | null> {
    const metadata = await this.getSiteImage(imageKey);
    return metadata?.publicUrl || null;
  }

  // Helper to check if an image key has an uploaded image
  static async hasUploadedImage(imageKey: string): Promise<boolean> {
    const metadata = await this.getSiteImage(imageKey);
    return metadata !== null;
  }
}