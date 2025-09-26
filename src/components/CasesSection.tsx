import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { casesService, CaseStudy } from "../services/casesServiceCompat";

interface CasesSectionProps {
  onNavigateToCases?: () => void;
  onReadCase?: (slug: string) => void;
}

export function CasesSection({ onNavigateToCases, onReadCase }: CasesSectionProps) {
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedCases();
  }, []);

  const loadFeaturedCases = async () => {
    try {
      setLoading(true);
      const featuredCases = await casesService.getFeaturedCases();
      setCases(featuredCases.slice(0, 3)); // Mostrar até 3 cases em destaque
    } catch (error) {
      console.error("Erro ao carregar cases:", error);
      // Em caso de erro, usar dados padrão vazios
      setCases([]);
    } finally {
      setLoading(false);
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
      <section id="cases" className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl mb-6">
              <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                Cases de Sucesso
              </span>
            </h2>
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
              Conheça como transformamos dados em resultados concretos para nossos clientes.
            </p>
          </div>
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="cases" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl mb-6">
            <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              Cases de Sucesso
            </span>
          </h2>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            Conheça como transformamos dados em resultados concretos para nossos clientes.
          </p>
        </div>

        {cases.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-foreground/60 mb-6">Nenhum case em destaque disponível no momento.</p>
            <Button 
              onClick={onNavigateToCases}
              variant="outline" 
              size="lg"
              className="border-border text-foreground hover:bg-muted hover:border-foreground/40 px-8"
            >
              Ver Todos os Cases
            </Button>
          </div>
        ) : (
          <>
            <div className="grid lg:grid-cols-3 gap-8">
              {cases.map((caseStudy, index) => (
                <Card 
                  key={caseStudy.id}
                  className="bg-card border-border hover:bg-muted hover:border-primary/20 transition-all duration-300 group overflow-hidden cursor-pointer"
                  onClick={() => onReadCase?.(caseStudy.slug)}
                >
                  <div className="relative overflow-hidden">
                    <ImageWithFallback
                      src={caseStudy.image}
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
                    <div>
                      <h3 className="text-foreground text-xl mb-2 group-hover:text-emerald-400 transition-colors">{caseStudy.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-foreground/60">
                        <span>{caseStudy.client}</span>
                        <span>•</span>
                        <span>{caseStudy.industry}</span>
                      </div>
                    </div>

                    <p className="text-foreground/60 text-sm leading-relaxed line-clamp-3">
                      {caseStudy.excerpt}
                    </p>

                    <div className="space-y-3">
                      <div>
                        <h4 className="text-foreground/80 text-sm mb-2">Principais Resultados:</h4>
                        <div className="flex flex-wrap gap-1">
                          {caseStudy.results.slice(0, 2).map((result, idx) => (
                            <span 
                              key={idx} 
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
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReadCase?.(caseStudy.slug);
                      }}
                    >
                      Ver Case Completo
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button 
                onClick={onNavigateToCases}
                variant="outline" 
                size="lg"
                className="border-border text-foreground hover:bg-muted hover:border-foreground/40 px-8"
              >
                Ver Todos os Cases
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}