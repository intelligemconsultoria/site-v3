import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ThemeToggle } from "./ThemeToggle";
import { ArrowLeft, Search, Filter, TrendingUp, Building, Calendar, Target } from "lucide-react";
import { casesService, CaseStudy } from "../services/casesServiceCompat";

interface CasesPageProps {
  onBack: () => void;
  onReadCase: (slug: string) => void;
}

export function CasesPage({ onBack, onReadCase }: CasesPageProps) {
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [filteredCases, setFilteredCases] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    filterCases();
  }, [cases, searchQuery, selectedCategory]);

  const loadCases = async () => {
    try {
      setLoading(true);
      const [casesData, categoriesData] = await Promise.all([
        casesService.getPublishedCases(),
        casesService.getCategories()
      ]);
      
      setCases(casesData);
      setCategories(['Todos', ...categoriesData]);
    } catch (error) {
      console.error("Erro ao carregar cases:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterCases = async () => {
    let filtered = cases;

    // Filtrar por categoria
    if (selectedCategory !== "Todos") {
      filtered = await casesService.getCasesByCategory(selectedCategory);
    }

    // Filtrar por busca
    if (searchQuery) {
      filtered = await casesService.searchCases(searchQuery);
      if (selectedCategory !== "Todos") {
        filtered = filtered.filter(c => c.category === selectedCategory);
      }
    }

    setFilteredCases(filtered);
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
          <p className="text-foreground/70">Carregando cases de sucesso...</p>
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
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-foreground/70 hover:text-foreground gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar à Home
            </Button>
            
            <div className="flex items-center gap-3">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-background to-muted/20 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(49,175,157,0.1),transparent_70%)]"></div>
        <div className="container mx-auto px-6 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-6 py-2 mb-6">
              <Target className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Cases de Sucesso</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
              <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                Transformações Reais
              </span>
              <br />
              <span className="text-foreground">
                Resultados Mensuráveis
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-foreground/70 leading-relaxed mb-8 max-w-3xl mx-auto">
              Descubra como empresas líderes estão revolucionando seus negócios com nossas soluções em dados, IA e automação.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="bg-card/30 border border-border rounded-xl p-6">
                <div className="text-2xl font-bold text-emerald-400 mb-1">+400%</div>
                <div className="text-sm text-foreground/60">ROI Médio</div>
              </div>
              <div className="bg-card/30 border border-border rounded-xl p-6">
                <div className="text-2xl font-bold text-blue-400 mb-1">15+</div>
                <div className="text-sm text-foreground/60">Setores Atendidos</div>
              </div>
              <div className="bg-card/30 border border-border rounded-xl p-6">
                <div className="text-2xl font-bold text-purple-400 mb-1">95%</div>
                <div className="text-sm text-foreground/60">Taxa de Sucesso</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-6 py-8">
        <div className="bg-card/30 border border-border rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40 w-4 h-4" />
              <Input
                placeholder="Buscar por cliente, setor, desafio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-input-background border-border focus:border-primary"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-foreground/60" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48 bg-input-background border-border">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-foreground/60">
              {filteredCases.length} case{filteredCases.length !== 1 ? 's' : ''} encontrado{filteredCases.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Cases Grid */}
        {filteredCases.length === 0 ? (
          <div className="text-center py-16">
            <Building className="w-16 h-16 text-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl mb-2">Nenhum case encontrado</h3>
            <p className="text-foreground/70 mb-6">
              Tente ajustar os filtros ou buscar por outros termos.
            </p>
            <Button 
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("Todos");
              }}
              variant="outline"
            >
              Limpar filtros
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredCases.map((caseStudy) => (
              <Card 
                key={caseStudy.id}
                className="bg-card border-border hover:bg-muted hover:border-primary/20 transition-all duration-300 group overflow-hidden cursor-pointer"
                onClick={() => onReadCase(caseStudy.slug)}
              >
                <div className="relative overflow-hidden">
                  <ImageWithFallback
                    src={caseStudy.image_url}
                    alt={caseStudy.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className={`${getCategoryColor(caseStudy.category)} text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm`}>
                      {caseStudy.category}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="bg-background/90 backdrop-blur-sm rounded-full px-3 py-1">
                      <span className="text-emerald-400 font-bold text-sm">{caseStudy.metrics.roi}</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between text-xs text-foreground/60">
                    <div className="flex items-center gap-2">
                      <Building className="w-3 h-3" />
                      <span>{caseStudy.industry}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      <span>{caseStudy.metrics.timeframe}</span>
                    </div>
                  </div>

                  <h3 className="text-foreground text-xl leading-tight group-hover:text-emerald-400 transition-colors">
                    {caseStudy.title}
                  </h3>

                  <p className="text-foreground/60 text-sm leading-relaxed line-clamp-2">
                    {caseStudy.excerpt}
                  </p>

                  {/* Key Results */}
                  <div className="space-y-2">
                    <div className="text-xs text-foreground/50 font-medium">Principais Resultados:</div>
                    <div className="flex flex-wrap gap-1">
                      {caseStudy.results.slice(0, 2).map((result, index) => (
                        <span 
                          key={index}
                          className="text-xs bg-emerald-400/10 text-emerald-400 px-2 py-1 rounded-full"
                        >
                          {result}
                        </span>
                      ))}
                      {caseStudy.results.length > 2 && (
                        <span className="text-xs bg-muted text-foreground/70 px-2 py-1 rounded-full">
                          +{caseStudy.results.length - 2} mais
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-foreground/70 text-sm font-medium">{caseStudy.client}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-emerald-400 hover:text-foreground hover:bg-emerald-400/20 p-0 h-auto gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReadCase(caseStudy.slug);
                      }}
                    >
                      <TrendingUp className="w-3 h-3" />
                      Ver case completo →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-br from-card/50 to-muted/30 border border-border rounded-2xl p-12 text-center backdrop-blur-sm">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-3xl mb-6">
              <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                Próximo case de sucesso: o seu
              </span>
            </h3>
            <p className="text-foreground/70 mb-8 text-lg leading-relaxed">
              Converse com nossos especialistas e descubra como podemos transformar seu negócio com soluções em dados, IA e automação.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button 
                className="bg-gradient-to-r from-emerald-400 to-blue-500 hover:from-emerald-500 hover:to-blue-600 text-white border-0 shadow-lg shadow-emerald-400/25 hover:shadow-emerald-400/40 transition-all px-8 py-3"
              >
                Agendar Conversa
              </Button>
              <Button 
                onClick={onBack} 
                variant="outline"
                className="border-border hover:border-primary hover:text-primary transition-colors px-8 py-3"
              >
                Voltar à Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}