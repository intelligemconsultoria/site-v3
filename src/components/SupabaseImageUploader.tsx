import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner@2.0.3";
import { Upload, Image, Loader2, Check, X } from "lucide-react";
import { SupabaseImageService, SiteImageMetadata } from "../services/supabaseImageService";

interface SupabaseImageUploaderProps {
  imageKey: string;
  imageName: string;
  category: string;
  currentUrl?: string;
  onImageUploaded: (url: string, metadata: SiteImageMetadata) => void;
  onImageDeleted?: () => void;
  accept?: string;
  maxSizeMB?: number;
}

export function SupabaseImageUploader({
  imageKey,
  imageName,
  category,
  currentUrl,
  onImageUploaded,
  onImageDeleted,
  accept = "image/*",
  maxSizeMB = 10
}: SupabaseImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasUploadedImage, setHasUploadedImage] = useState(!!currentUrl);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`Arquivo muito grande. Máximo ${maxSizeMB}MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione um arquivo de imagem válido');
      return;
    }

    setIsUploading(true);

    try {
      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Upload to Supabase
      const result = await SupabaseImageService.uploadSiteImage(file, imageKey, category);

      if (result.success) {
        setHasUploadedImage(true);
        setPreviewUrl(result.url);
        onImageUploaded(result.url, result.metadata);
        toast.success(`${imageName} enviada com sucesso!`);
        
        // Clean up object URL
        URL.revokeObjectURL(objectUrl);
      } else {
        setPreviewUrl(currentUrl || null);
        toast.error(result.error || 'Erro ao enviar imagem');
        URL.revokeObjectURL(objectUrl);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setPreviewUrl(currentUrl || null);
      toast.error('Erro inesperado ao enviar imagem');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (!hasUploadedImage) return;

    setIsDeleting(true);

    try {
      const result = await SupabaseImageService.deleteSiteImage(imageKey);

      if (result.success) {
        setHasUploadedImage(false);
        setPreviewUrl(null);
        onImageDeleted?.();
        toast.success(`${imageName} removida com sucesso!`);
      } else {
        toast.error(result.error || 'Erro ao remover imagem');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Erro inesperado ao remover imagem');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`upload-${imageKey}`} className="text-sm">
          {imageName}
        </Label>
        <div className="flex gap-2">
          <Input
            ref={fileInputRef}
            id={`upload-${imageKey}`}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleUploadClick}
            disabled={isUploading || isDeleting}
            className="flex-1"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : hasUploadedImage ? (
              <Check className="w-4 h-4 mr-2 text-green-500" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {isUploading 
              ? 'Enviando...' 
              : hasUploadedImage 
                ? 'Alterar' 
                : 'Enviar'
            }
          </Button>

          {hasUploadedImage && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isUploading || isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Preview */}
      {previewUrl && (
        <div className="relative">
          <div className="w-full h-32 bg-muted rounded-lg overflow-hidden border border-border">
            <img
              src={previewUrl}
              alt={`Preview de ${imageName}`}
              className={`w-full h-full rounded-lg ${
                imageKey?.toLowerCase().includes('logo') 
                  ? 'object-contain bg-white/5 p-3' 
                  : 'object-cover'
              }`}
              onError={() => {
                setPreviewUrl(null);
                setHasUploadedImage(false);
              }}
            />
          </div>
          
          {hasUploadedImage && (
            <div className="absolute -top-2 -right-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            </div>
          )}
        </div>
      )}

      {!previewUrl && !isUploading && (
        <div className="w-full h-32 bg-muted rounded-lg border border-dashed border-border flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <Image className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma imagem</p>
          </div>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        Formatos aceitos: JPG, PNG, GIF, WebP • Máximo: {maxSizeMB}MB
      </div>
    </div>
  );
}