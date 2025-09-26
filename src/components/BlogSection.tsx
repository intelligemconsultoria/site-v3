import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Button } from "./ui/button";
import { blogService, BlogArticle } from "../services/blogServiceCompat";

interface BlogSectionProps {
  onNavigateToBlog?: () => void;
  onReadArticle?: (slug: string) => void;
}

export function BlogSection({ onNavigateToBlog, onReadArticle }: BlogSectionProps) {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedArticles();
  }, []);

  const loadFeaturedArticles = async () => {
    try {
      setLoading(true);
      const featuredArticles = await blogService.getFeaturedArticles();
      // Pegar até 3 artigos em destaque, ou os 3 mais recentes se não houver destacados
      const articlesToShow = featuredArticles.length > 0 
        ? featuredArticles.slice(0, 3)
        : (await blogService.getPublishedArticles()).slice(0, 3);
      setArticles(articlesToShow);
    } catch (error) {
      console.error('Erro ao carregar artigos:', error);
      // Em caso de erro, usar dados fallback
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="blog" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl mb-6">
            <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              Insights & Conhecimento
            </span>
          </h2>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            Mantenha-se atualizado com as últimas tendências em dados, IA e automação.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {loading ? (
            // Skeleton loading
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="bg-card border-border overflow-hidden">
                <div className="animate-pulse">
                  <div className="w-full h-48 bg-muted"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-6 bg-muted rounded w-full"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-full"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : articles.length > 0 ? (
            articles.map((article, index) => (
            <Card 
              key={index}
              className="bg-card border-border hover:bg-muted hover:border-primary/20 transition-all duration-300 group overflow-hidden cursor-pointer"
              onClick={() => onReadArticle?.(article.slug)}
            >
              <div className="relative overflow-hidden">
                <ImageWithFallback
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-gradient-to-r from-emerald-400 to-blue-400 text-white px-3 py-1 rounded-full text-sm">
                    {article.category}
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between text-xs text-foreground/60">
                  <span>{article.date}</span>
                  <span>{article.readTime} de leitura</span>
                </div>

                <h3 className="text-foreground text-xl leading-tight group-hover:text-emerald-400 transition-colors">
                  {article.title}
                </h3>

                <p className="text-foreground/60 text-sm leading-relaxed">
                  {article.excerpt}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-foreground/70 text-sm">{article.author}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-emerald-400 hover:text-foreground hover:bg-emerald-400/20 p-0 h-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReadArticle?.(article.slug);
                    }}
                  >
                    Ler mais →
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
          ) : (
            // Fallback quando não há artigos
            <div className="col-span-3 text-center py-12">
              <p className="text-foreground/60">Nenhum artigo disponível no momento.</p>
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg"
            className="border-border text-foreground hover:bg-muted hover:border-foreground/40 px-8"
            onClick={onNavigateToBlog}
          >
            Ver Todos os Artigos
          </Button>
        </div>
      </div>
    </section>
  );
}