import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Upload, CheckCircle2, XCircle, RefreshCw, Image } from 'lucide-react';
import { SupabaseImageService } from '../services/supabaseImageService';
import { toast } from 'sonner@2.0.3';

interface SiteImage {
  key: string;
  name: string;
  description: string;
  currentUrl: string;
  newUrl?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export function SiteImageUploader() {
  const [images, setImages] = useState<SiteImage[]>([
    {
      key: 'hero-decoration',
      name: 'Hero Section',
      description: 'Imagem principal da seção hero',
      currentUrl: 'https://abfowubusomlibuihqrz.supabase.co/storage/v1/object/public/site-images-a91235ef/HERO.png',
      status: 'pending'
    },
    {
      key: 'case-retail',
      name: 'Case Varejo',
      description: 'Imagem do case de varejo',
      currentUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXRhaWwlMjBhbmFseXRpY3MlMjBkYXNoYm9hcmR8ZW58MXx8fHx8MTc1ODg0OTQ3M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      status: 'pending'
    },
    {
      key: 'case-manufacturing',
      name: 'Case Manufatura',
      description: 'Imagem do case de manufatura',
      currentUrl: 'https://images.unsplash.com/photo-1752802469747-bff685763f3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW51ZmFjdHVyaW5nJTIwaW5kdXN0cnklMjBhdXRvbWF0aW9ufGVufDF8fHx8MTc1ODg4MzYwN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      status: 'pending'
    },
    {
      key: 'case-fintech',
      name: 'Case Fintech',
      description: 'Imagem do case de fintech',
      currentUrl: 'https://images.unsplash.com/photo-1642406415849-a410b5d01a94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdWNjZXNzZnVsJTIwYnVzaW5lc3MlMjB0ZWFtfGVufDF8fHx8MTc1ODg2OTk4NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      status: 'pending'
    }
  ]);

  const [isUploading, setIsUploading] = useState(false);

  const updateImageStatus = (key: string, status: SiteImage['status'], newUrl?: string, error?: string) => {
    setImages(prev => prev.map(img => 
      img.key === key 
        ? { ...img, status, newUrl, error }
        : img
    ));
  };

  const downloadAndUploadImage = async (image: SiteImage): Promise<string> => {
    try {
      // Download da imagem
      const response = await fetch(image.currentUrl);
      if (!response.ok) {
        throw new Error(`Erro ao baixar imagem: ${response.status}`);
      }
      
      const blob = await response.blob();
      const file = new File([blob], `${image.key}.jpg`, { type: blob.type });

      // Upload para o Supabase
      const result = await SupabaseImageService.uploadSiteImage(image.key, file);
      
      if (!result.success || !result.url) {
        throw new Error(result.error || 'Erro no upload');
      }

      return result.url;
    } catch (error) {
      throw error;
    }
  };

  const uploadSingleImage = async (image: SiteImage) => {
    updateImageStatus(image.key, 'uploading');
    
    try {
      const newUrl = await downloadAndUploadImage(image);
      updateImageStatus(image.key, 'success', newUrl);
      
      // Salvar no localStorage para uso nos componentes
      localStorage.setItem(`site-image-${image.key}`, newUrl);
      
      // Disparar evento para atualizar componentes
      window.dispatchEvent(new CustomEvent('site-images-updated', {
        detail: { [image.key]: newUrl }
      }));
      
      toast.success(`Imagem ${image.name} enviada com sucesso!`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      updateImageStatus(image.key, 'error', undefined, errorMessage);
      toast.error(`Erro ao enviar ${image.name}: ${errorMessage}`);
    }
  };

  const uploadAllImages = async () => {
    setIsUploading(true);
    
    for (const image of images) {
      if (image.status !== 'success') {
        await uploadSingleImage(image);
        // Pequena pausa entre uploads
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    setIsUploading(false);
    toast.success('Upload de todas as imagens concluído!');
  };

  const getStatusIcon = (status: SiteImage['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'uploading':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'pending':
        return <Upload className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: SiteImage['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Enviado</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      case 'uploading':
        return <Badge variant="secondary" className="bg-blue-500">Enviando...</Badge>;
      case 'pending':
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  const successCount = images.filter(img => img.status === 'success').length;
  const totalCount = images.length;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Upload de Imagens do Site
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Migre as imagens do Unsplash para o Supabase Storage
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline">
            {successCount}/{totalCount} concluídas
          </Badge>
          <Button 
            onClick={uploadAllImages}
            disabled={isUploading || successCount === totalCount}
            className="bg-emerald-400 text-black hover:bg-emerald-500"
          >
            {isUploading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Enviar Todas
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {images.map((image) => (
          <div key={image.key} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-4">
              {getStatusIcon(image.status)}
              <div className="flex-1">
                <h4 className="font-medium">{image.name}</h4>
                <p className="text-sm text-muted-foreground">{image.description}</p>
                {image.error && (
                  <p className="text-xs text-red-500 mt-1">{image.error}</p>
                )}
                {image.newUrl && (
                  <p className="text-xs text-green-600 mt-1 font-mono break-all">
                    Nova URL: {image.newUrl}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(image.status)}
              <Button
                size="sm"
                variant="outline"
                onClick={() => uploadSingleImage(image)}
                disabled={image.status === 'uploading' || image.status === 'success'}
              >
                {image.status === 'uploading' ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ))}
        
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Como usar:</h4>
          <ol className="text-sm space-y-1 text-muted-foreground">
            <li>1. Clique em "Enviar Todas" para fazer upload de todas as imagens</li>
            <li>2. As imagens serão baixadas do Unsplash e enviadas para o Supabase Storage</li>
            <li>3. Os componentes do site serão automaticamente atualizados com as novas URLs</li>
            <li>4. As URLs antigas do Unsplash serão substituídas pelas do Supabase</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}