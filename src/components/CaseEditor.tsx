import { useState, useEffect } from "react";
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
  Building,
  Tag,
  User,
  Target,
  X,
  Check,
  AlertCircle,
  Plus,
  Trash2
} from "lucide-react";
import { casesService, CaseStudy } from "../services/casesServiceCompat";
import { SupabaseImageUploader } from "./SupabaseImageUploader";
import { ThemeToggle } from "./ThemeToggle";
import { toast } from "sonner@2.0.3";

interface CaseEditorProps {
  caseId?: string;
  onBack: () => void;
}

export function CaseEditor({ caseId, onBack }: CaseEditorProps) {
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    client: '',
    industry: '',
    challenge: '',
    solution: '',
    results: [''],
    image_url: '',
    category: 'GemFlow',
    metrics: {
      improvement: '',
      timeframe: '',
      roi: ''
    },
    slug: '',
    published: false,
    featured: false,
    tags: ['']
  });

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [readTime, setReadTime] = useState(0);
  const [isImageUploaderOpen, setIsImageUploaderOpen] = useState(false);
  const [loading, setLoading] = useState(!!caseId);

  // Carregar case se estiver editando
  useEffect(() => {
    if (caseId) {
      loadCase();
    }
  }, [caseId]);

  const loadCase = async () => {
    try {
      setLoading(true);
      const caseStudy = await casesService.getCaseById(caseId!);
      if (caseStudy) {
        setFormData({
          title: caseStudy.title,
          excerpt: caseStudy.excerpt,
          content: caseStudy.content,
          client: caseStudy.client,
          industry: caseStudy.industry,
          challenge: caseStudy.challenge || '',
          solution: caseStudy.solution || '',
          results: caseStudy.results.length > 0 ? caseStudy.results : [''],
          image_url: caseStudy.image_url,
          category: caseStudy.category,
          metrics: caseStudy.metrics,
          slug: caseStudy.slug,
          published: caseStudy.published,
          featured: caseStudy.featured,
          tags: caseStudy.tags.length > 0 ? caseStudy.tags : ['']
        });
      }
    } catch (error) {
      console.error('Erro ao carregar case:', error);
      toast.error('Erro ao carregar case');
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
    const text = contentText + ' ' + formData.title + ' ' + formData.excerpt + ' ' + 
                 formData.challenge + ' ' + formData.solution;
    const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);
    setReadTime(Math.ceil(words / 200)); // 200 palavras por minuto
  }, [formData.content, formData.title, formData.excerpt, formData.challenge, formData.solution]);

  // Autosave a cada 2 segundos
  useEffect(() => {
    if (!hasChanges || !formData.title.trim()) return;

    const timeoutId = setTimeout(() => {
      handleAutoSave();
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [formData, hasChanges]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleAutoSave = async () => {
    if (!formData.title.trim() || !caseId) return; // Só fazer autosave se já existe um caseId

    try {
      setIsSaving(true);
      
      const cleanResults = formData.results.filter(r => r.trim() !== '');
      const cleanTags = formData.tags.filter(t => t.trim() !== '');

      const caseData = {
        ...formData,
        slug: formData.slug || generateSlug(formData.title),
        results: cleanResults.length > 0 ? cleanResults : [''],
        tags: cleanTags.length > 0 ? cleanTags : ['']
      };

      await casesService.updateCase(caseId, caseData);
      setLastSaved(new Date());
      setHasChanges(false);
    } catch (error) {
      console.error('Erro no autosave:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field === 'title') {
      setFormData(prev => ({
        ...prev,
        [field]: value,
        slug: generateSlug(value)
      }));
    } else if (field.startsWith('metrics.')) {
      const metricField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        metrics: {
          ...prev.metrics,
          [metricField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    setHasChanges(true);
  };

  const handleArrayChange = (field: 'results' | 'tags', index: number, value: string) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return {
        ...prev,
        [field]: newArray
      };
    });
    setHasChanges(true);
  };

  const addArrayItem = (field: 'results' | 'tags') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
    setHasChanges(true);
  };

  const removeArrayItem = (field: 'results' | 'tags', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.client.trim()) {
      toast.error('Título e cliente são obrigatórios');
      return;
    }

    try {
      setIsSaving(true);
      
      const cleanResults = formData.results.filter(r => r.trim() !== '');
      const cleanTags = formData.tags.filter(t => t.trim() !== '');

      const caseData = {
        ...formData,
        slug: formData.slug || generateSlug(formData.title),
        results: cleanResults.length > 0 ? cleanResults : [''],
        tags: cleanTags.length > 0 ? cleanTags : ['']
      };

      if (caseId) {
        await casesService.updateCase(caseId, caseData);
        toast.success('Case salvo com sucesso!');
      } else {
        await casesService.createCase(caseData);
        toast.success('Case criado com sucesso!');
      }

      setLastSaved(new Date());
      setHasChanges(false);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar case');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!formData.title.trim() || !formData.excerpt.trim() || !formData.client.trim()) {
      toast.error('Preencha os campos obrigatórios antes de publicar');
      return;
    }

    try {
      setIsSaving(true);
      
      const cleanResults = formData.results.filter(r => r.trim() !== '');
      const cleanTags = formData.tags.filter(t => t.trim() !== '');

      const caseData = {
        ...formData,
        published: true,
        slug: formData.slug || generateSlug(formData.title),
        results: cleanResults.length > 0 ? cleanResults : [''],
        tags: cleanTags.length > 0 ? cleanTags : ['']
      };

      if (caseId) {
        await casesService.updateCase(caseId, caseData);
      } else {
        await casesService.createCase(caseData);
      }

      toast.success('Case publicado com sucesso!');
      setLastSaved(new Date());
      setHasChanges(false);
      
      // Voltar para o admin após publicar
      setTimeout(() => onBack(), 1500);
    } catch (error) {
      console.error('Erro ao publicar:', error);
      toast.error('Erro ao publicar case');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    handleInputChange('image_url', imageUrl);
    setIsImageUploaderOpen(false);
    toast.success('Imagem selecionada!');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'GemFlow':
        return 'bg-emerald-400 hover:bg-emerald-500';
      case 'GemInsights':
        return 'bg-blue-400 hover:bg-blue-500';
      case 'GemMind':
        return 'bg-purple-400 hover:bg-purple-500';
      default:
        return 'bg-gray-400 hover:bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Carregando case...</div>
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
                className="border-blue-400/50 text-blue-400 hover:bg-blue-400/10"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
              
              <Button
                size="sm"
                onClick={handlePublish}
                disabled={isSaving}
                className="bg-blue-400 text-white hover:bg-blue-500"
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
                placeholder="Título do case de sucesso"
                className="text-4xl border-none bg-transparent p-0 h-auto resize-none text-foreground placeholder:text-foreground/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                style={{ fontSize: '2.25rem', fontWeight: '600', lineHeight: '1.2' }}
              />
            </div>

            {/* Cliente & Categoria */}
            <div className="mb-8 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-foreground/60" />
                <Input
                  value={formData.client}
                  onChange={(e) => handleInputChange('client', e.target.value)}
                  placeholder="Nome do cliente"
                  className="text-lg border-none bg-transparent p-0 h-auto text-foreground/80 placeholder:text-foreground/30 focus-visible:ring-0 focus-visible:ring-offset-0"
                  style={{ fontSize: '1.125rem' }}
                />
              </div>
              
              <Badge className={`${getCategoryColor(formData.category)} text-white`}>
                {formData.category}
              </Badge>
            </div>

            {/* Resumo */}
            <div className="mb-8">
              <Textarea
                value={formData.excerpt}
                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                placeholder="Breve resumo do case de sucesso..."
                className="border-none bg-transparent p-0 resize-none text-foreground/80 placeholder:text-foreground/30 focus-visible:ring-0 focus-visible:ring-offset-0"
                rows={3}
                style={{ fontSize: '1.125rem', lineHeight: '1.6' }}
              />
            </div>

            {/* Seções Opcionais */}
            {(formData.challenge || formData.solution) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {formData.challenge && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-foreground/90">Desafio</h3>
                    <Textarea
                      value={formData.challenge}
                      onChange={(e) => handleInputChange('challenge', e.target.value)}
                      placeholder="Principais desafios enfrentados..."
                      className="border border-border bg-card/20 p-4 rounded-lg text-foreground resize-none"
                      rows={4}
                    />
                  </div>
                )}
                
                {formData.solution && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-foreground/90">Solução</h3>
                    <Textarea
                      value={formData.solution}
                      onChange={(e) => handleInputChange('solution', e.target.value)}
                      placeholder="Solução implementada..."
                      className="border border-border bg-card/20 p-4 rounded-lg text-foreground resize-none"
                      rows={4}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Editor de Conteúdo Principal */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-foreground/90">Conteúdo Detalhado</h3>
              <RichTextEditor
                value={formData.content}
                onChange={(content) => handleInputChange('content', content)}
                placeholder="Descreva detalhadamente o case de sucesso..."
                minHeight="400px"
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
                  Status do Case
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
                  <Badge className={`${getCategoryColor(formData.category)} text-white text-xs`}>
                    {formData.category}
                  </Badge>
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

            {/* Detalhes do Case */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Detalhes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="industry" className="text-sm mb-2 block">Setor/Indústria</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    placeholder="Ex: Varejo, Financeiro, Saúde"
                    className="text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="text-sm mb-2 block">Categoria</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GemFlow">GemFlow</SelectItem>
                      <SelectItem value="GemInsights">GemInsights</SelectItem>
                      <SelectItem value="GemMind">GemMind</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="slug" className="text-sm mb-2 block">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="sera-gerado-automaticamente"
                    className="text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Métricas */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Métricas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="roi" className="text-sm mb-1 block">ROI</Label>
                  <Input
                    id="roi"
                    value={formData.metrics.roi}
                    onChange={(e) => handleInputChange('metrics.roi', e.target.value)}
                    placeholder="Ex: +400%"
                    className="text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="improvement" className="text-sm mb-1 block">Melhoria</Label>
                  <Input
                    id="improvement"
                    value={formData.metrics.improvement}
                    onChange={(e) => handleInputChange('metrics.improvement', e.target.value)}
                    placeholder="Ex: 70% redução em falhas"
                    className="text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="timeframe" className="text-sm mb-1 block">Tempo</Label>
                  <Input
                    id="timeframe"
                    value={formData.metrics.timeframe}
                    onChange={(e) => handleInputChange('metrics.timeframe', e.target.value)}
                    placeholder="Ex: 8 meses"
                    className="text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Resultados */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Resultados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {formData.results.map((result, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={result}
                      onChange={(e) => handleArrayChange('results', index, e.target.value)}
                      placeholder="Ex: 400% de ROI em 8 meses"
                      className="text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('results', index)}
                      disabled={formData.results.length <= 1}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem('results')}
                  className="w-full"
                >
                  <Plus className="w-3 h-3 mr-2" />
                  Adicionar
                </Button>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={tag}
                      onChange={(e) => handleArrayChange('tags', index, e.target.value)}
                      placeholder="Ex: automação, varejo"
                      className="text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('tags', index)}
                      disabled={formData.tags.length <= 1}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem('tags')}
                  className="w-full"
                >
                  <Plus className="w-3 h-3 mr-2" />
                  Adicionar
                </Button>
              </CardContent>
            </Card>

            {/* Seções Opcionais */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Seções Opcionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Desafio</Label>
                  <Switch
                    checked={!!formData.challenge}
                    onCheckedChange={(checked) => 
                      handleInputChange('challenge', checked ? ' ' : '')
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Solução</Label>
                  <Switch
                    checked={!!formData.solution}
                    onCheckedChange={(checked) => 
                      handleInputChange('solution', checked ? ' ' : '')
                    }
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
                folder="cases"
              />
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}