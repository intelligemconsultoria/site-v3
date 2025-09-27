import { useState, useEffect } from "react";
import { ProtectedRoute } from "./ProtectedRoute";
import { AuthStatus } from "./AuthStatus";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  BarChart3, 
  BookOpen, 
  TrendingUp,
  ArrowLeft,
  Image,
  Settings,
  Activity,
  Building,
  Calendar
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { blogService, BlogArticle } from "../services/blogServiceCompat";
import { casesService, CaseStudy } from "../services/casesServiceCompat";
import { ImageManager } from "./ImageManager";
import { SiteImageManager } from "./SiteImageManager";
import { SystemHealthCheck } from "./SystemHealthCheck";
import { toast } from "sonner@2.0.3";

interface BlogAdminProps {
  onBack: () => void;
  onEditArticle: (articleId?: string) => void;
  onEditCase: (caseId?: string) => void;
  onMeetings?: () => void;
}

export function BlogAdmin({ onBack, onEditArticle, onEditCase, onMeetings }: BlogAdminProps) {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [casesStats, setCasesStats] = useState<any>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [articlesData, statsData, casesData, casesStatsData] = await Promise.all([
        blogService.getAllArticles(),
        blogService.getStats(),
        casesService.getAllCases(),
        casesService.getStats()
      ]);
      setArticles(articlesData);
      setStats(statsData);
      setCases(casesData);
      setCasesStats(casesStatsData);
    } catch (error) {
      toast.error('Erro ao carregar dados');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este artigo?')) return;
    
    try {
      await blogService.deleteArticle(id);
      toast.success('Artigo excluído com sucesso!');
      await loadData();
    } catch (error) {
      toast.error('Erro ao excluir artigo');
      console.error(error);
    }
  };

  const togglePublished = async (article: BlogArticle) => {
    try {
      await blogService.updateArticle(article.id, { 
        published: !article.published 
      });
      toast.success(`Artigo ${!article.published ? 'publicado' : 'despublicado'} com sucesso!`);
      await loadData();
    } catch (error) {
      toast.error('Erro ao alterar status do artigo');
      console.error(error);
    }
  };

  const handleCaseDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este case?')) return;
    
    try {
      await casesService.deleteCase(id);
      toast.success('Case excluído com sucesso!');
      await loadData();
    } catch (error) {
      console.error("Erro ao excluir case:", error);
      toast.error("Erro ao excluir case");
    }
  };

  const toggleCasePublished = async (caseStudy: CaseStudy) => {
    try {
      await casesService.updateCase(caseStudy.id, { published: !caseStudy.published });
      toast.success(`Case ${!caseStudy.published ? 'publicado' : 'despublicado'} com sucesso!`);
      await loadData();
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast.error("Erro ao alterar status");
    }
  };

  const toggleCaseFeatured = async (caseStudy: CaseStudy) => {
    try {
      await casesService.updateCase(caseStudy.id, { featured: !caseStudy.featured });
      toast.success(`Case ${!caseStudy.featured ? 'destacado' : 'removido dos destaques'}!`);
      await loadData();
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
        <div className="text-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <ProtectedRoute 
      onBack={onBack}
      customLoginTitle="Painel Administrativo"
      customLoginDescription="Entre com suas credenciais para acessar o painel de administração"
    >
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-to-b from-muted/30 to-transparent py-8 border-b border-border">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-foreground hover:text-emerald-400 hover:bg-muted gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              
              <h1 className="text-3xl">
                <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent hover:from-emerald-300 hover:to-blue-300 transition-all duration-300 inline-block">
                  Painel Administrativo
                </span>
              </h1>

              <div className="flex items-center gap-4">
                <AuthStatus showFullInfo={false} />
                <ThemeToggle />
                
                <Button 
                  className="bg-blue-400 text-white hover:bg-blue-500"
                  onClick={() => onEditCase()}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Case
                </Button>
              
                <Button 
                  className="bg-emerald-400 text-black hover:bg-emerald-500"
                  onClick={() => onEditArticle()}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Artigo
                </Button>
            </div>
          </div>
          </div>
        </div>
        
        <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="articles" className="w-full">
          <TabsList className="grid w-full grid-cols-7 bg-muted">
            <TabsTrigger value="articles" className="data-[state=active]:bg-emerald-400 data-[state=active]:text-black">
              <BookOpen className="w-4 h-4 mr-2" />
              Artigos
            </TabsTrigger>
            <TabsTrigger value="cases" className="data-[state=active]:bg-emerald-400 data-[state=active]:text-black">
              <Building className="w-4 h-4 mr-2" />
              Cases
            </TabsTrigger>
            <TabsTrigger value="images" className="data-[state=active]:bg-emerald-400 data-[state=active]:text-black">
              <Image className="w-4 h-4 mr-2" />
              Galeria
            </TabsTrigger>
            <TabsTrigger value="site-images" className="data-[state=active]:bg-emerald-400 data-[state=active]:text-black">
              <Settings className="w-4 h-4 mr-2" />
              Site
            </TabsTrigger>
            <TabsTrigger value="health" className="data-[state=active]:bg-emerald-400 data-[state=active]:text-black">
              <Activity className="w-4 h-4 mr-2" />
              Sistema
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-emerald-400 data-[state=active]:text-black">
              <BarChart3 className="w-4 h-4 mr-2" />
              Estatísticas
            </TabsTrigger>
            <TabsTrigger 
              value="meetings" 
              className="data-[state=active]:bg-emerald-400 data-[state=active]:text-black"
              onClick={onMeetings}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Reuniões
            </TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="space-y-6">
            <div className="grid gap-4">
              {articles.map((article) => (
                <Card key={article.id} className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-foreground text-lg">{article.title}</h3>
                          <Badge variant={article.published ? "default" : "secondary"}>
                            {article.published ? "Publicado" : "Rascunho"}
                          </Badge>
                          {article.featured && (
                            <Badge className="bg-yellow-500 text-black">Destaque</Badge>
                          )}
                        </div>
                        <p className="text-foreground/60 text-sm mb-2">{article.excerpt}</p>
                        <div className="flex items-center gap-4 text-xs text-foreground/50">
                          <span>Por {article.author}</span>
                          <span>{article.date}</span>
                          <span>{article.category}</span>
                          <span>{article.readTime}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => togglePublished(article)}
                          className="text-foreground/70 hover:text-foreground"
                        >
                          {article.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEditArticle(article.id)}
                          className="text-emerald-400 hover:text-emerald-300"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(article.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="cases" className="space-y-6">
            <div className="grid gap-4">
              {cases.map((caseStudy) => (
                <Card key={caseStudy.id} className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-foreground text-lg">{caseStudy.title}</h3>
                          <Badge className={`${getCategoryColor(caseStudy.category)} text-white text-xs`}>
                            {caseStudy.category}
                          </Badge>
                          <Badge variant={caseStudy.published ? "default" : "secondary"}>
                            {caseStudy.published ? "Publicado" : "Rascunho"}
                          </Badge>
                          {caseStudy.featured && (
                            <Badge className="bg-yellow-500 text-black">Destaque</Badge>
                          )}
                        </div>
                        <p className="text-foreground/60 text-sm mb-2">{caseStudy.excerpt}</p>
                        <div className="flex items-center gap-4 text-xs text-foreground/50">
                          <span>Cliente: {caseStudy.client}</span>
                          <span>Setor: {caseStudy.industry}</span>
                          <span>ROI: {caseStudy.metrics.roi}</span>
                          <span>{new Date(caseStudy.updatedAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleCasePublished(caseStudy)}
                          className="text-foreground/70 hover:text-foreground"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleCaseFeatured(caseStudy)}
                          className={`${caseStudy.featured === true ? 'text-yellow-500' : 'text-foreground/60'} hover:text-yellow-400`}
                        >
                          <TrendingUp className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEditCase(caseStudy.id)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCaseDelete(caseStudy.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="images" className="space-y-6">
            <ImageManager />
          </TabsContent>

          <TabsContent value="site-images" className="space-y-6">
            <SiteImageManager />
          </TabsContent>

          <TabsContent value="health" className="space-y-6">
            <SystemHealthCheck />
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm text-foreground/70">Total de Artigos</CardTitle>
                  <BookOpen className="h-4 w-4 text-emerald-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-foreground">{stats.totalArticles}</div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm text-foreground/70">Publicados</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-foreground">{stats.publishedArticles}</div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm text-foreground/70">Rascunhos</CardTitle>
                  <Edit className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-foreground">{stats.draftArticles}</div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm text-foreground/70">Total de Cases</CardTitle>
                  <Building className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-foreground">{casesStats.totalCases || 0}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Categorias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {stats.categories?.map((category: string) => (
                    <Badge key={category} className="bg-emerald-400/20 text-emerald-400">
                      {category}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}