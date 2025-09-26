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
    const headers: Record<string, string> = {};
    
    if (requireAuth) {
      // Try to get fresh access token
      const sessionResult = await AuthService.getCurrentSession();
      if (sessionResult.success && sessionResult.accessToken) {
        headers['Authorization'] = `Bearer ${sessionResult.accessToken}`;
      } else {
        throw new Error('Authentication required but no valid session found. Please login again.');
      }
    } else {
      // Use public anon key for public requests
      headers['Authorization'] = `Bearer ${publicAnonKey}`;
    }
    
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
        console.error('Upload API error:', response.status, result);
        throw new Error(result.error || `Upload failed with status ${response.status}`);
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
    try {
      const headers = await this.getHeaders(false); // No auth required for reading
      
      const response = await fetch(`${API_BASE_URL}/site-images`, {
        headers,
      });

      if (!response.ok) {
        console.error('Fetch images API error:', response.status, await response.text());
        throw new Error(`Failed to fetch images: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching site images:', error);
      return [];
    }
  }

  // Get site image by key (public access)
  static async getSiteImage(imageKey: string): Promise<SiteImageMetadata | null> {
    try {
      const headers = await this.getHeaders(false); // No auth required for reading
      
      const response = await fetch(`${API_BASE_URL}/site-images/${imageKey}`, {
        headers,
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        console.error('Fetch image API error:', response.status, await response.text());
        throw new Error(`Failed to fetch image: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching site image:', error);
      return null;
    }
  }

  // Get images by category
  static async getImagesByCategory(category: string): Promise<SiteImageMetadata[]> {
    try {
      const headers = await this.getHeaders(false); // No auth required for reading
      
      const response = await fetch(`${API_BASE_URL}/site-images/category/${category}`, {
        headers,
      });

      if (!response.ok) {
        console.error('Fetch category images API error:', response.status, await response.text());
        throw new Error(`Failed to fetch images by category: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching images by category:', error);
      return [];
    }
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