import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { ThemeToggle } from "./ThemeToggle";
import { AuthStatus } from "./AuthStatus";
import { SystemHealthCheck } from "./SystemHealthCheck";
import { SiteImageUploader } from "./SiteImageUploader";
import { ArrowLeft, Plus, Edit, Trash2, Eye, EyeOff, Building, TrendingUp, BarChart, Award, Calendar, Search, Filter } from "lucide-react";
import { casesService, CaseStudy } from "../services/casesServiceCompat";
import { toast } from "sonner@2.0.3";

interface CasesAdminProps {
  onBack: () => void;
}

export function CasesAdmin({ onBack }: CasesAdminProps) {
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [filteredCases, setFilteredCases] = useState<CaseStudy[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [editingCase, setEditingCase] = useState<CaseStudy | null>(null);
  const [isNewCase, setIsNewCase] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<CaseStudy>>({
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

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterCases();
  }, [cases, searchQuery, filterStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [casesData, statsData] = await Promise.all([
        casesService.getAllCases(),
        casesService.getStats()
      ]);
      
      setCases(casesData.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ));
      setStats(statsData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const filterCases = () => {
    let filtered = cases;

    // Filtrar por status
    if (filterStatus === "published") {
      filtered = filtered.filter(c => c.published);
    } else if (filterStatus === "draft") {
      filtered = filtered.filter(c => !c.published);
    } else if (filterStatus === "featured") {
      filtered = filtered.filter(c => c.featured);
    }

    // Filtrar por busca
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(query) ||
        c.client.toLowerCase().includes(query) ||
        c.industry.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query)
      );
    }

    setFilteredCases(filtered);
  };

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
          ...prev.metrics!,
          [metricField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleArrayChange = (field: 'results' | 'tags', index: number, value: string) => {
    setFormData(prev => {
      const newArray = [...(prev[field] || [''])];
      newArray[index] = value;
      return {
        ...prev,
        [field]: newArray
      };
    });
  };

  const addArrayItem = (field: 'results' | 'tags') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] || ['']), '']
    }));
  };

  const removeArrayItem = (field: 'results' | 'tags', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] || ['']).filter((_, i) => i !== index)
    }));
  };

  const openNewCaseForm = () => {
    setIsNewCase(true);
    setEditingCase(null);
    setFormData({
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
    setShowForm(true);
  };

  const openEditForm = (caseStudy: CaseStudy) => {
    setIsNewCase(false);
    setEditingCase(caseStudy);
    setFormData({
      ...caseStudy,
      results: caseStudy.results.length > 0 ? caseStudy.results : [''],
      tags: caseStudy.tags.length > 0 ? caseStudy.tags : ['']
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    try {
      // Validação básica
      if (!formData.title || !formData.excerpt || !formData.client) {
        toast.error("Preencha os campos obrigatórios");
        return;
      }

      // Limpar arrays vazios
      const cleanResults = (formData.results || ['']).filter(r => r.trim() !== '');
      const cleanTags = (formData.tags || ['']).filter(t => t.trim() !== '');

      const caseData = {
        ...formData,
        results: cleanResults.length > 0 ? cleanResults : [''],
        tags: cleanTags.length > 0 ? cleanTags : ['']
      } as Omit<CaseStudy, 'id' | 'createdAt' | 'updatedAt'>;

      if (isNewCase) {
        await casesService.createCase(caseData);
        toast.success("Case criado com sucesso!");
      } else if (editingCase) {
        await casesService.updateCase(editingCase.id, caseData);
        toast.success("Case atualizado com sucesso!");
      }

      setShowForm(false);
      loadData();
    } catch (error) {
      console.error("Erro ao salvar case:", error);
      toast.error("Erro ao salvar case");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await casesService.deleteCase(id);
      toast.success("Case excluído com sucesso!");
      loadData();
    } catch (error) {
      console.error("Erro ao excluir case:", error);
      toast.error("Erro ao excluir case");
    }
  };

  const togglePublished = async (caseStudy: CaseStudy) => {
    try {
      await casesService.updateCase(caseStudy.id, { published: !caseStudy.published });
      toast.success(`Case ${!caseStudy.published ? 'publicado' : 'despublicado'} com sucesso!`);
      loadData();
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast.error("Erro ao alterar status");
    }
  };

  const toggleFeatured = async (caseStudy: CaseStudy) => {
    try {
      await casesService.updateCase(caseStudy.id, { featured: !caseStudy.featured });
      toast.success(`Case ${!caseStudy.featured ? 'destacado' : 'removido dos destaques'}!`);
      loadData();
    } catch (error) {
      console.error("Erro ao alterar destaque:", error);
      toast.error("Erro ao alterar destaque");
    }
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/70">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-foreground/70 hover:text-foreground gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Gerenciar Cases de Sucesso</h1>
                <p className="text-foreground/60 text-sm">Administração de cases da IntelliGem</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <AuthStatus showFullInfo={false} />
              <ThemeToggle />
              <Button 
                onClick={openNewCaseForm}
                className="bg-gradient-to-r from-emerald-400 to-blue-500 hover:from-emerald-500 hover:to-blue-600 text-white gap-2"
              >
                <Plus className="w-4 h-4" />
                Novo Case
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="cases" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cases" className="gap-2">
              <Building className="w-4 h-4" />
              Cases
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="sistema" className="gap-2">
              <Award className="w-4 h-4" />
              Sistema
            </TabsTrigger>
            <TabsTrigger value="imagens" className="gap-2">
              <Calendar className="w-4 h-4" />
              Imagens
            </TabsTrigger>
          </TabsList>

          {/* Tab Cases */}
          <TabsContent value="cases" className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40 w-4 h-4" />
                      <Input
                        placeholder="Buscar por título, cliente, indústria..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-foreground/60" />
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os cases</SelectItem>
                        <SelectItem value="published">Publicados</SelectItem>
                        <SelectItem value="draft">Rascunhos</SelectItem>
                        <SelectItem value="featured">Destacados</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-4 text-sm text-foreground/60">
                  {filteredCases.length} case{filteredCases.length !== 1 ? 's' : ''} encontrado{filteredCases.length !== 1 ? 's' : ''}
                </div>
              </CardContent>
            </Card>

            {/* Lista de Cases */}
            <div className="space-y-4">
              {filteredCases.map((caseStudy) => (
                <Card key={caseStudy.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium">{caseStudy.title}</h3>
                          <Badge className={`${getCategoryColor(caseStudy.category)} text-white text-xs`}>
                            {caseStudy.category}
                          </Badge>
                          {caseStudy.featured && (
                            <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                              Destaque
                            </Badge>
                          )}
                          <div className="flex items-center gap-1">
                            {caseStudy.published ? (
                              <Eye className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-foreground/40" />
                            )}
                            <span className="text-xs text-foreground/60">
                              {caseStudy.published ? 'Publicado' : 'Rascunho'}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-foreground/70 text-sm mb-3 line-clamp-2">
                          {caseStudy.excerpt}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-foreground/60">
                          <span>Cliente: {caseStudy.client}</span>
                          <span>Setor: {caseStudy.industry}</span>
                          <span>ROI: {caseStudy.metrics.roi}</span>
                          <span>Atualizado: {new Date(caseStudy.updatedAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePublished(caseStudy)}
                          className="text-foreground/60 hover:text-foreground"
                        >
                          {caseStudy.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFeatured(caseStudy)}
                          className={`${caseStudy.featured ? 'text-yellow-500' : 'text-foreground/60'} hover:text-yellow-400`}
                        >
                          <Award className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditForm(caseStudy)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o case "{caseStudy.title}"? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(caseStudy.id)}
                                className="bg-red-500 hover:bg-red-600 text-white"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tab Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-foreground/70">Total de Cases</CardTitle>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="text-2xl font-bold text-emerald-400">{stats.totalCases}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-foreground/70">Cases Publicados</CardTitle>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="text-2xl font-bold text-blue-400">{stats.publishedCases}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-foreground/70">Cases Destacados</CardTitle>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="text-2xl font-bold text-purple-400">{stats.featuredCases}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-foreground/70">Rascunhos</CardTitle>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="text-2xl font-bold text-orange-400">{stats.draftCases}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Cases por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.byCategory && Object.entries(stats.byCategory).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={`${getCategoryColor(category)} text-white`}>
                          {category}
                        </Badge>
                      </div>
                      <span className="text-foreground/70">{count as number} cases</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Sistema */}
          <TabsContent value="sistema">
            <SystemHealthCheck />
          </TabsContent>

          {/* Tab Imagens */}
          <TabsContent value="imagens">
            <SiteImageUploader />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de Formulário */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isNewCase ? 'Novo Case de Sucesso' : 'Editar Case de Sucesso'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ex: Transformação Digital no Varejo: +400% ROI"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="client">Cliente *</Label>
                <Input
                  id="client"
                  value={formData.client || ''}
                  onChange={(e) => handleInputChange('client', e.target.value)}
                  placeholder="Ex: RetailCorp"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">Setor/Indústria</Label>
                <Input
                  id="industry"
                  value={formData.industry || ''}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  placeholder="Ex: Varejo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select 
                  value={formData.category || 'GemFlow'} 
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GemFlow">GemFlow</SelectItem>
                    <SelectItem value="GemInsights">GemInsights</SelectItem>
                    <SelectItem value="GemMind">GemMind</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug || ''}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="sera-gerado-automaticamente"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Resumo *</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt || ''}
                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                placeholder="Breve descrição do case de sucesso..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">URL da Imagem</Label>
              <Input
                id="image"
                value={formData.image_url || ''}
                onChange={(e) => handleInputChange('image_url', e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>

            {/* Desafio e Solução */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="challenge">Desafio</Label>
                <Textarea
                  id="challenge"
                  value={formData.challenge || ''}
                  onChange={(e) => handleInputChange('challenge', e.target.value)}
                  placeholder="Principais desafios enfrentados pelo cliente..."
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="solution">Solução</Label>
                <Textarea
                  id="solution"
                  value={formData.solution || ''}
                  onChange={(e) => handleInputChange('solution', e.target.value)}
                  placeholder="Solução implementada pela IntelliGem..."
                  rows={4}
                />
              </div>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="improvement">Melhoria Principal</Label>
                <Input
                  id="improvement"
                  value={formData.metrics?.improvement || ''}
                  onChange={(e) => handleInputChange('metrics.improvement', e.target.value)}
                  placeholder="Ex: 70% redução em falhas"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timeframe">Tempo de Implementação</Label>
                <Input
                  id="timeframe"
                  value={formData.metrics?.timeframe || ''}
                  onChange={(e) => handleInputChange('metrics.timeframe', e.target.value)}
                  placeholder="Ex: 8 meses"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="roi">ROI</Label>
                <Input
                  id="roi"
                  value={formData.metrics?.roi || ''}
                  onChange={(e) => handleInputChange('metrics.roi', e.target.value)}
                  placeholder="Ex: +400%"
                />
              </div>
            </div>

            {/* Resultados */}
            <div className="space-y-2">
              <Label>Resultados</Label>
              {(formData.results || ['']).map((result, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={result}
                    onChange={(e) => handleArrayChange('results', index, e.target.value)}
                    placeholder="Ex: 400% de ROI em 8 meses"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem('results', index)}
                    disabled={(formData.results || []).length <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('results')}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Resultado
              </Button>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              {(formData.tags || ['']).map((tag, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={tag}
                    onChange={(e) => handleArrayChange('tags', index, e.target.value)}
                    placeholder="Ex: varejo, automação, bi"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem('tags', index)}
                    disabled={(formData.tags || []).length <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('tags')}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Tag
              </Button>
            </div>

            {/* Conteúdo */}
            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo Completo</Label>
              <Textarea
                id="content"
                value={formData.content || ''}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Conteúdo detalhado do case em markdown..."
                rows={10}
              />
            </div>

            {/* Configurações */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="published"
                  checked={formData.published || false}
                  onCheckedChange={(checked) => handleInputChange('published', checked)}
                />
                <Label htmlFor="published">Publicado</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  id="featured"
                  checked={formData.featured || false}
                  onCheckedChange={(checked) => handleInputChange('featured', checked)}
                />
                <Label htmlFor="featured">Destacado</Label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleSubmit}
                className="bg-gradient-to-r from-emerald-400 to-blue-500 hover:from-emerald-500 hover:to-blue-600 text-white"
              >
                {isNewCase ? 'Criar Case' : 'Salvar Alterações'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}