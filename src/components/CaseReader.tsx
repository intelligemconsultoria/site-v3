import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ArrowLeft, Calendar, Clock, Building, Target, TrendingUp, Share2, CheckCircle, Users, Award, Zap } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { casesService, CaseStudy } from "../services/casesServiceCompat";
import { toast } from "sonner@2.0.3";

interface CaseReaderProps {
  slug: string;
  onBack: () => void;
  onBackToCases: () => void;
}

export function CaseReader({ slug, onBack, onBackToCases }: CaseReaderProps) {
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    // Scroll para o topo quando o case é carregado
    window.scrollTo(0, 0);
    loadCase();
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const article = document.querySelector('article');
      if (!article) return;

      const articleTop = article.offsetTop;
      const articleHeight = article.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrollTop = window.scrollY;

      const startReading = articleTop - windowHeight / 2;
      const finishReading = articleTop + articleHeight - windowHeight;

      if (scrollTop < startReading) {
        setReadingProgress(0);
      } else if (scrollTop > finishReading) {
        setReadingProgress(100);
      } else {
        const progress = ((scrollTop - startReading) / (finishReading - startReading)) * 100;
        setReadingProgress(Math.min(Math.max(progress, 0), 100));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadCase = async () => {
    try {
      setLoading(true);
      setError(null);
      const foundCase = await casesService.getCaseBySlug(slug);
      
      if (!foundCase) {
        setError("Case não encontrado");
        return;
      }
      
      if (!foundCase.published) {
        setError("Este case não está disponível");
        return;
      }
      
      setCaseStudy(foundCase);
    } catch (err) {
      setError("Erro ao carregar case");
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: caseStudy?.title,
          text: caseStudy?.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        // Usuário cancelou o compartilhamento
      }
    } else {
      // Fallback para clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copiado para a área de transferência!");
      } catch (err) {
        toast.error("Erro ao copiar link");
      }
    }
  };

  const formatMarkdownToHTML = (markdown: string) => {
    // Conversão simples de markdown para HTML
    return markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      // Code blocks
      .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
      // Inline code
      .replace(/`([^`]*)`/gim, '<code>$1</code>')
      // Lists
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>')
      // Line breaks
      .replace(/\n/gim, '<br/>');
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
          <p className="text-foreground/70">Carregando case de sucesso...</p>
        </div>
      </div>
    );
  }

  if (error || !caseStudy) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <Building className="w-16 h-16 text-foreground/30 mx-auto mb-4" />
          <h1 className="text-2xl mb-4">Case não encontrado</h1>
          <p className="text-foreground/70 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={onBack} variant="outline">
              Voltar
            </Button>
            <Button onClick={onBackToCases} className="bg-primary text-primary-foreground">
              Ver todos os cases
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header minimalista com navegação */}
      <div className="bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onBackToCases}
              className="text-foreground/70 hover:text-foreground gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar aos Cases
            </Button>
            
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-foreground/70 hover:text-foreground gap-2 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Compartilhar
              </Button>
            </div>
          </div>
        </div>
        
        {/* Barra de progresso de leitura */}
        <div className="h-1 bg-border">
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 to-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${readingProgress}%` }}
          />
        </div>
      </div>

      {/* Conteúdo do case */}
      <article className="container mx-auto px-6 py-16 max-w-4xl">
        {/* Header do case */}
        <header className="text-center mb-16">
          {/* Categoria */}
          <div className="mb-8">
            <Badge 
              className={`${getCategoryColor(caseStudy.category)} text-white px-6 py-2 rounded-full text-sm font-medium shadow-sm transition-colors`}
            >
              {caseStudy.category}
            </Badge>
          </div>

          {/* Título */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight max-w-4xl mx-auto">
            {caseStudy.title}
          </h1>

          {/* Excerpt */}
          <p className="text-lg md:text-xl text-foreground/70 leading-relaxed mb-12 max-w-3xl mx-auto">
            {caseStudy.excerpt}
          </p>

          {/* Metadados */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-foreground/60 text-sm mb-12">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-foreground/50" />
              <span>{caseStudy.client}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-foreground/50" />
              <span>{caseStudy.industry}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-foreground/50" />
              <span>{caseStudy.metrics.timeframe}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-medium">{caseStudy.metrics.roi}</span>
            </div>
          </div>

          {/* Imagem principal */}
          <div className="relative rounded-2xl overflow-hidden mb-16 shadow-2xl shadow-black/20">
            <ImageWithFallback
              src={caseStudy.image}
              alt={caseStudy.title}
              className="w-full h-72 md:h-96 lg:h-[500px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/10 to-transparent"></div>
          </div>
        </header>

        {/* Resumo Executivo */}
        <div className="mb-16">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Desafio */}
            <Card className="bg-card/30 border border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-5 h-5 text-red-400" />
                  <h3 className="font-medium">Desafio</h3>
                </div>
                <p className="text-foreground/70 text-sm leading-relaxed">
                  {caseStudy.challenge}
                </p>
              </CardContent>
            </Card>

            {/* Solução */}
            <Card className="bg-card/30 border border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-medium">Solução</h3>
                </div>
                <p className="text-foreground/70 text-sm leading-relaxed">
                  {caseStudy.solution}
                </p>
              </CardContent>
            </Card>

            {/* Principais Resultados */}
            <Card className="bg-card/30 border border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-5 h-5 text-blue-400" />
                  <h3 className="font-medium">Principais Resultados</h3>
                </div>
                <div className="space-y-2">
                  {caseStudy.results.slice(0, 3).map((result, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground/70 text-xs">{result}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Métricas de Impacto */}
        <div className="mb-16">
          <div className="bg-gradient-to-br from-emerald-400/10 to-blue-400/10 border border-emerald-400/20 rounded-2xl p-8">
            <h2 className="text-2xl mb-8 text-center">
              <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                Impacto Mensurado
              </span>
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-400 mb-2">{caseStudy.metrics.roi}</div>
                <div className="text-sm text-foreground/60">Retorno sobre Investimento</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">{caseStudy.metrics.timeframe}</div>
                <div className="text-sm text-foreground/60">Tempo de Implementação</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">{caseStudy.metrics.improvement}</div>
                <div className="text-sm text-foreground/60">Melhoria Principal</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-400 mb-2">95%</div>
                <div className="text-sm text-foreground/60">Satisfação do Cliente</div>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo detalhado do case */}
        <div className="max-w-3xl mx-auto mb-16">
          <div
            className="case-content text-foreground leading-relaxed text-lg"
            dangerouslySetInnerHTML={{
              __html: formatMarkdownToHTML(caseStudy.content)
            }}
          />
        </div>

        {/* Todos os Resultados */}
        <div className="mb-16">
          <h2 className="text-2xl mb-8 text-center">
            <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              Resultados Completos
            </span>
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {caseStudy.results.map((result, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-card/20 border border-border/50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span className="text-foreground/80">{result}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        {caseStudy.tags && caseStudy.tags.length > 0 && (
          <div className="mt-16 pt-8 border-t border-border max-w-3xl mx-auto">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-foreground/70">
                <Target className="w-4 h-4" />
                <span className="text-sm font-medium">Tags:</span>
              </div>
              {caseStudy.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="border-border text-foreground/70 hover:border-primary hover:text-primary cursor-pointer transition-colors"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Separador visual */}
        <div className="my-20 flex items-center justify-center">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-emerald-400"></div>
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            <div className="w-8 h-0.5 bg-gradient-to-l from-transparent to-emerald-400"></div>
          </div>
        </div>

        {/* Call to action */}
        <div className="bg-gradient-to-br from-card/50 to-muted/30 border border-border rounded-2xl p-12 text-center backdrop-blur-sm">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-3xl mb-6">
              <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                Próximo case de sucesso: o seu
              </span>
            </h3>
            <p className="text-foreground/70 mb-8 text-lg leading-relaxed">
              Converse com nossos especialistas e descubra como a IntelliGem pode transformar seu negócio com resultados mensuráveis como este.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button 
                className="bg-gradient-to-r from-emerald-400 to-blue-500 hover:from-emerald-500 hover:to-blue-600 text-white border-0 shadow-lg shadow-emerald-400/25 hover:shadow-emerald-400/40 transition-all px-8 py-3"
              >
                Agendar Conversa
              </Button>
              <Button 
                onClick={onBackToCases} 
                variant="outline"
                className="border-border hover:border-primary hover:text-primary transition-colors px-8 py-3"
              >
                Ver mais cases
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleShare}
                className="text-foreground/70 hover:text-foreground transition-colors px-8 py-3"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </div>
        </div>

        {/* Navegação entre cases */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="bg-card/30 border border-border rounded-xl p-8">
            <h4 className="text-xl mb-6 text-center text-foreground/80">Explore mais cases</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                <p className="text-sm text-foreground/60 mb-2">Case anterior</p>
                <p className="text-foreground/80">Descubra outras transformações</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                <p className="text-sm text-foreground/60 mb-2">Próximo case</p>
                <p className="text-foreground/80">Explore mais sucessos</p>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Estilos customizados para o conteúdo do case */}
      <style jsx>{`
        .case-content h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 3rem 0 1.5rem 0;
          color: var(--foreground);
          line-height: 1.2;
          border-bottom: 2px solid var(--border);
          padding-bottom: 1rem;
        }
        
        .case-content h2 {
          font-size: 2rem;
          font-weight: 600;
          margin: 2.5rem 0 1rem 0;
          color: var(--foreground);
          line-height: 1.3;
          position: relative;
        }
        
        .case-content h2::before {
          content: '';
          position: absolute;
          left: -1rem;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 1.5rem;
          background: linear-gradient(135deg, #31af9d, #136eae);
          border-radius: 2px;
        }
        
        .case-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 2rem 0 1rem 0;
          color: var(--foreground);
          line-height: 1.4;
        }
        
        .case-content p {
          margin: 1.5rem 0;
          line-height: 1.8;
          text-align: justify;
        }
        
        .case-content strong {
          font-weight: 700;
          color: var(--foreground);
          background: linear-gradient(135deg, #31af9d, #136eae);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .case-content em {
          font-style: italic;
          color: var(--foreground);
          opacity: 0.9;
        }
        
        .case-content ul {
          margin: 1.5rem 0;
          padding-left: 0;
        }
        
        .case-content li {
          margin: 1rem 0;
          padding-left: 2rem;
          position: relative;
          list-style: none;
        }
        
        .case-content li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0.75rem;
          width: 6px;
          height: 6px;
          background: linear-gradient(135deg, #31af9d, #136eae);
          border-radius: 50%;
        }
        
        .case-content code {
          background-color: var(--muted);
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.875rem;
          color: var(--foreground);
          border: 1px solid var(--border);
        }
        
        .case-content pre {
          background-color: var(--muted);
          padding: 1.5rem;
          border-radius: 0.75rem;
          overflow-x: auto;
          margin: 2rem 0;
          border: 1px solid var(--border);
          position: relative;
        }
        
        .case-content pre::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #31af9d, #136eae, #512f82);
          border-radius: 0.75rem 0.75rem 0 0;
        }
        
        .case-content pre code {
          background: none;
          padding: 0;
          border-radius: 0;
          color: var(--foreground);
          border: none;
        }
      `}</style>
    </div>
  );
}