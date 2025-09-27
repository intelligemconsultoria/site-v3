import { useState, useEffect, useCallback } from "react";
import { ProtectedRoute } from "./ProtectedRoute";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { RichTextEditor } from "./RichTextEditor";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Upload, 
  Image, 
  Clock,
  Settings,
  FileText,
  Tag,
  User,
  Calendar,
  X,
  Check,
  AlertCircle
} from "lucide-react";
import { blogService, BlogArticle } from "../services/blogServiceCompat";
import { SupabaseImageUploader } from "./SupabaseImageUploader";
import { ThemeToggle } from "./ThemeToggle";
import { toast } from "sonner@2.0.3";

interface ArticleEditorProps {
  articleId?: string;
  onBack: () => void;
}

export function ArticleEditor({ articleId, onBack }: ArticleEditorProps) {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    excerpt: '',
    content: '',
    author: '',
    category: '',
    image_url: '',
    featured: false,
    published: false,
    tags: ''
  });

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [readTime, setReadTime] = useState(0);
  const [isImageUploaderOpen, setIsImageUploaderOpen] = useState(false);
  const [loading, setLoading] = useState(!!articleId);

  // Carregar artigo se estiver editando
  useEffect(() => {
    if (articleId) {
      loadArticle();
    }
  }, [articleId]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const article = await blogService.getArticleById(articleId!);
      if (article) {
        setFormData({
          title: article.title,
          subtitle: article.subtitle || '',
          excerpt: article.excerpt,
          content: article.content,
          author: article.author,
          category: article.category,
          image_url: article.image_url,
          featured: article.featured,
          published: article.published,
          tags: article.tags.join(', ')
        });
      }
    } catch (error) {
      console.error('Erro ao carregar artigo:', error);
      toast.error('Erro ao carregar artigo');
    } finally {
      setLoading(false);
    }
  };

  // Calcular estatísticas do texto
  useEffect(() => {
    // Remove HTML tags para contar palavras
    const stripHtml = (html: string) => {
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || '';
    };
    
    const contentText = stripHtml(formData.content);
    const text = contentText + ' ' + formData.title + ' ' + formData.excerpt;
    const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);
    setReadTime(Math.ceil(words / 200)); // 200 palavras por minuto
  }, [formData.content, formData.title, formData.excerpt]);

  // Autosave a cada 2 segundos
  useEffect(() => {
    if (!hasChanges || !formData.title.trim()) return;

    const timeoutId = setTimeout(() => {
      handleAutoSave();
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [formData, hasChanges]);

  const handleAutoSave = async () => {
    if (!formData.title.trim() || !articleId) return; // Só fazer autosave se já existe um articleId

    try {
      setIsSaving(true);
      
      const articleData = {
        ...formData,
        subtitle: formData.subtitle || undefined,
        slug: formData.title.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim(),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        readTime: `${readTime} min`
      };

      await blogService.updateArticle(articleId, articleData);
      setLastSaved(new Date());
      setHasChanges(false);
    } catch (error) {
      console.error('Erro no autosave:', error);
      // Log detalhado do erro
      if (error && typeof error === 'object' && 'message' in error) {
        console.error('Detalhes do erro:', {
          message: (error as any).message,
          code: (error as any).code,
          details: (error as any).details,
          hint: (error as any).hint,
          status: (error as any).status
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('O título é obrigatório');
      return;
    }

    try {
      setIsSaving(true);
      
      const articleData = {
        ...formData,
        subtitle: formData.subtitle || undefined,
        slug: formData.title.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim(),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        readTime: `${readTime} min`
      };

      if (articleId) {
        await blogService.updateArticle(articleId, articleData);
        toast.success('Artigo salvo com sucesso!');
      } else {
        await blogService.createArticle(articleData);
        toast.success('Artigo criado com sucesso!');
      }

      setLastSaved(new Date());
      setHasChanges(false);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar artigo');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!formData.title.trim() || !formData.excerpt.trim() || !formData.content.trim()) {
      toast.error('Preencha todos os campos obrigatórios antes de publicar');
      return;
    }

    try {
      setIsSaving(true);
      
      const articleData = {
        ...formData,
        subtitle: formData.subtitle || undefined,
        published: true,
        slug: formData.title.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim(),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        readTime: `${readTime} min`
      };

      if (articleId) {
        await blogService.updateArticle(articleId, articleData);
      } else {
        await blogService.createArticle(articleData);
      }

      toast.success('Artigo publicado com sucesso!');
      setLastSaved(new Date());
      setHasChanges(false);
      
      // Voltar para o admin após publicar
      setTimeout(() => onBack(), 1500);
    } catch (error) {
      console.error('Erro ao publicar:', error);
      toast.error('Erro ao publicar artigo');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    handleInputChange('image_url', imageUrl);
    setIsImageUploaderOpen(false);
    toast.success('Imagem selecionada!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Carregando artigo...</div>
      </div>
    );
  }

  return (
    <ProtectedRoute onBack={onBack}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card/30 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-foreground/70 hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              
              <div className="flex items-center gap-2 text-sm text-foreground/60">
                {isSaving ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    Salvando...
                  </>
                ) : lastSaved ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    Salvo {lastSaved.toLocaleTimeString()}
                  </>
                ) : hasChanges ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                    Alterações não salvas
                  </>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                className="border-emerald-400/50 text-emerald-400 hover:bg-emerald-400/10"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
              
              <Button
                size="sm"
                onClick={handlePublish}
                disabled={isSaving}
                className="bg-emerald-400 text-black hover:bg-emerald-500"
              >
                <Eye className="w-4 h-4 mr-2" />
                Publicar
              </Button>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Editor Principal */}
          <div className="flex-1 p-6 max-w-4xl mx-auto">
            {/* Título */}
            <div className="mb-6">
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Título do artigo"
                className="text-4xl border-none bg-transparent p-0 h-auto resize-none text-foreground placeholder:text-foreground/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                style={{ fontSize: '2.25rem', fontWeight: '600', lineHeight: '1.2' }}
              />
            </div>

            {/* Subtítulo */}
            <div className="mb-8">
              <Input
                value={formData.subtitle}
                onChange={(e) => handleInputChange('subtitle', e.target.value)}
                placeholder="Escreva um subtítulo (opcional)"
                className="text-xl border-none bg-transparent p-0 h-auto text-foreground/70 placeholder:text-foreground/30 focus-visible:ring-0 focus-visible:ring-offset-0"
                style={{ fontSize: '1.25rem', lineHeight: '1.4' }}
              />
            </div>

            {/* Editor de Conteúdo */}
            <div className="mb-6">
              <RichTextEditor
                value={formData.content}
                onChange={(content) => handleInputChange('content', content)}
                placeholder="Comece a escrever seu artigo..."
                minHeight="500px"
                className="border-none"
              />
            </div>

            {/* Estatísticas */}
            <div className="flex items-center gap-6 text-sm text-foreground/50 pt-4 border-t border-border">
              <span>{wordCount} palavras</span>
              <span>{readTime} min de leitura</span>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l border-border bg-card/20 p-6 space-y-6">
            {/* Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Status do Artigo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="published" className="text-sm">Publicado</Label>
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => handleInputChange('published', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="featured" className="text-sm">Destaque</Label>
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => handleInputChange('featured', checked)}
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {formData.published && (
                    <Badge className="bg-emerald-400/20 text-emerald-400">
                      Publicado
                    </Badge>
                  )}
                  {formData.featured && (
                    <Badge className="bg-yellow-500/20 text-yellow-400">
                      Destaque
                    </Badge>
                  )}
                  {!formData.published && (
                    <Badge variant="secondary">
                      Rascunho
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Imagem de Destaque */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Imagem de Destaque
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.image_url && (
                  <div className="relative">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => handleInputChange('image_url', '')}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Input
                    value={formData.image_url}
                    onChange={(e) => handleInputChange('image_url', e.target.value)}
                    placeholder="URL da imagem"
                    className="text-sm"
                  />
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsImageUploaderOpen(true)}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload de Mídia
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Detalhes do Artigo */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Detalhes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="author" className="text-sm flex items-center gap-2 mb-2">
                    <User className="w-3 h-3" />
                    Autor
                  </Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => handleInputChange('author', e.target.value)}
                    placeholder="Nome do autor"
                    className="text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="text-sm flex items-center gap-2 mb-2">
                    <Calendar className="w-3 h-3" />
                    Categoria
                  </Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tendências">Tendências</SelectItem>
                      <SelectItem value="Inteligência Artificial">Inteligência Artificial</SelectItem>
                      <SelectItem value="Automação">Automação</SelectItem>
                      <SelectItem value="Business Intelligence">Business Intelligence</SelectItem>
                      <SelectItem value="Analytics">Analytics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="excerpt" className="text-sm mb-2 block">Resumo</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => handleInputChange('excerpt', e.target.value)}
                    placeholder="Breve descrição do artigo..."
                    className="text-sm"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="tags" className="text-sm flex items-center gap-2 mb-2">
                    <Tag className="w-3 h-3" />
                    Tags
                  </Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    placeholder="tag1, tag2, tag3"
                    className="text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Upload de Imagem Modal */}
        {isImageUploaderOpen && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="fixed inset-4 bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Upload de Mídia</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsImageUploaderOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <SupabaseImageUploader
                onImageUploaded={handleImageSelect}
                folder="blog-articles"
              />
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}