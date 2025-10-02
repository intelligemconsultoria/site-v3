import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { 
  Upload, 
  Trash2, 
  Eye, 
  Download, 
  Search,
  Filter,
  Image as ImageIcon
} from "lucide-react";
import { imageService, ImageData, ImageCategories, ImageCategory } from "../services/imageService";
import { toast } from "sonner@2.0.3";

interface ImageManagerProps {
  onImageSelect?: (imageUrl: string) => void;
  onImageUpload?: (file: File) => void;
}

export function ImageManager({ onImageSelect, onImageUpload }: ImageManagerProps) {
  const [images, setImages] = useState<ImageData[]>([]);
  const [filteredImages, setFilteredImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadForm, setUploadForm] = useState({
    category: ImageCategories.GENERAL as ImageCategory,
    file: null as File | null
  });

  useEffect(() => {
    loadImages();
  }, []);

  useEffect(() => {
    filterImages();
  }, [images, selectedCategory, searchTerm]);

  const loadImages = async () => {
    console.log('🖼️ [ImageManager] loadImages() iniciado');
    try {
      setLoading(true);
      console.log('⏳ [ImageManager] Loading state: true');
      
      console.log('📞 [ImageManager] Chamando imageService.getAllImages()...');
      const data = await imageService.getAllImages();
      console.log('📊 [ImageManager] Dados recebidos:', data);
      console.log('📊 [ImageManager] Quantidade de imagens:', data.length);
      
      setImages(data);
      console.log('✅ [ImageManager] Images state atualizado');
    } catch (error) {
      console.error('❌ [ImageManager] Erro ao carregar imagens:', error);
      toast.error('Erro ao carregar imagens');
    } finally {
      setLoading(false);
      console.log('⏳ [ImageManager] Loading state: false');
    }
  };

  const filterImages = () => {
    let filtered = images;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(img => img.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(img => 
        img.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredImages(filtered);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione um arquivo de imagem válido');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo 10MB permitido');
        return;
      }

      setUploadForm({ ...uploadForm, file });
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadForm.file) {
      toast.error('Por favor, selecione um arquivo');
      return;
    }

    try {
      setUploading(true);
      
      if (onImageUpload) {
        // Se há callback de upload, usar ele
        await onImageUpload(uploadForm.file);
      } else {
        // Fallback para o comportamento original
        await imageService.uploadImage(uploadForm.file, uploadForm.category);
        toast.success('Imagem enviada com sucesso!');
      }
      
      // Reset form
      setUploadForm({ category: ImageCategories.GENERAL, file: null });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setIsUploadDialogOpen(false);
      
      // Reload images
      await loadImages();
    } catch (error) {
      toast.error('Erro ao enviar imagem');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta imagem?')) return;
    
    try {
      await imageService.deleteImage(id);
      toast.success('Imagem excluída com sucesso!');
      await loadImages();
    } catch (error) {
      toast.error('Erro ao excluir imagem');
      console.error(error);
    }
  };

  const handleCategoryChange = async (imageId: string, newCategory: string) => {
    try {
      await imageService.updateImageCategory(imageId, newCategory);
      toast.success('Categoria atualizada com sucesso!');
      await loadImages();
    } catch (error) {
      toast.error('Erro ao atualizar categoria');
      console.error(error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      hero: 'Hero',
      blog: 'Blog',
      cases: 'Cases',
      team: 'Equipe',
      solutions: 'Soluções',
      general: 'Geral'
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      hero: 'bg-purple-400/20 text-purple-400',
      blog: 'bg-emerald-400/20 text-emerald-400',
      cases: 'bg-blue-400/20 text-blue-400',
      team: 'bg-yellow-400/20 text-yellow-400',
      solutions: 'bg-pink-400/20 text-pink-400',
      general: 'bg-gray-400/20 text-gray-400'
    };
    return colors[category] || 'bg-gray-400/20 text-gray-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-foreground">Carregando imagens...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 space-y-4 sm:space-y-0 sm:flex sm:gap-4 sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40 w-4 h-4" />
            <Input
              placeholder="Buscar imagens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-input-background border-border text-foreground"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48 bg-input-background border-border text-foreground">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              <SelectItem value={ImageCategories.HERO}>Hero</SelectItem>
              <SelectItem value={ImageCategories.BLOG}>Blog</SelectItem>
              <SelectItem value={ImageCategories.CASES}>Cases</SelectItem>
              <SelectItem value={ImageCategories.TEAM}>Equipe</SelectItem>
              <SelectItem value={ImageCategories.SOLUTIONS}>Soluções</SelectItem>
              <SelectItem value={ImageCategories.GENERAL}>Geral</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-400 text-black hover:bg-emerald-500">
              <Upload className="w-4 h-4 mr-2" />
              Enviar Imagem
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Enviar Nova Imagem</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <Label htmlFor="category" className="text-foreground">Categoria</Label>
                <Select 
                  value={uploadForm.category} 
                  onValueChange={(value) => setUploadForm({...uploadForm, category: value as ImageCategory})}
                >
                  <SelectTrigger className="bg-input-background border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ImageCategories.HERO}>Hero</SelectItem>
                    <SelectItem value={ImageCategories.BLOG}>Blog</SelectItem>
                    <SelectItem value={ImageCategories.CASES}>Cases</SelectItem>
                    <SelectItem value={ImageCategories.TEAM}>Equipe</SelectItem>
                    <SelectItem value={ImageCategories.SOLUTIONS}>Soluções</SelectItem>
                    <SelectItem value={ImageCategories.GENERAL}>Geral</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="file" className="text-foreground">Arquivo</Label>
                <Input
                  id="file"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="bg-input-background border-border text-foreground"
                  required
                />
                <p className="text-xs text-foreground/60 mt-1">
                  Formatos aceitos: JPG, PNG, WebP, GIF. Máximo 10MB.
                </p>
              </div>

              {uploadForm.file && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-foreground">
                    <strong>Arquivo selecionado:</strong> {uploadForm.file.name}
                  </p>
                  <p className="text-xs text-foreground/60">
                    Tamanho: {formatFileSize(uploadForm.file.size)}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsUploadDialogOpen(false)}
                  className="border-border text-foreground hover:bg-muted"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={uploading}
                  className="bg-emerald-400 text-black hover:bg-emerald-500"
                >
                  {uploading ? 'Enviando...' : 'Enviar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <ImageIcon className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <div className="text-2xl text-foreground">{images.length}</div>
            <div className="text-xs text-foreground/60">Total</div>
          </CardContent>
        </Card>
        {Object.values(ImageCategories).map(category => {
          const count = images.filter(img => img.category === category).length;
          if (count === 0) return null;
          return (
            <Card key={category} className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <div className="text-lg text-foreground">{count}</div>
                <div className="text-xs text-foreground/60">{getCategoryLabel(category)}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Images grid */}
      {filteredImages.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <ImageIcon className="w-12 h-12 text-foreground/30 mx-auto mb-4" />
            <p className="text-foreground/60">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Nenhuma imagem encontrada com os filtros aplicados'
                : 'Nenhuma imagem enviada ainda'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredImages.map((image) => (
            <Card key={image.id} className="bg-card border-border overflow-hidden group hover:shadow-lg transition-all">
              <div className="relative aspect-video bg-muted">
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setPreviewImage(image.url)}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                      onClick={() => setPreviewImage(image.url)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {onImageSelect && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                        onClick={() => onImageSelect(image.url)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:bg-red-400/20"
                      onClick={() => handleDelete(image.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="text-foreground text-sm truncate" title={image.name}>
                    {image.name}
                  </h3>
                  <p className="text-xs text-foreground/60">
                    {formatFileSize(image.size)}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <Badge className={getCategoryColor(image.category)}>
                    {getCategoryLabel(image.category)}
                  </Badge>
                  
                  <Select
                    value={image.category}
                    onValueChange={(value) => handleCategoryChange(image.id, value)}
                  >
                    <SelectTrigger className="w-20 h-6 text-xs bg-transparent border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ImageCategories.HERO}>Hero</SelectItem>
                      <SelectItem value={ImageCategories.BLOG}>Blog</SelectItem>
                      <SelectItem value={ImageCategories.CASES}>Cases</SelectItem>
                      <SelectItem value={ImageCategories.TEAM}>Equipe</SelectItem>
                      <SelectItem value={ImageCategories.SOLUTIONS}>Soluções</SelectItem>
                      <SelectItem value={ImageCategories.GENERAL}>Geral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-xs text-foreground/50">
                  {new Date(image.uploadedAt).toLocaleDateString('pt-BR')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      {previewImage && (
        <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
          <DialogContent className="max-w-4xl bg-card border-border">
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}