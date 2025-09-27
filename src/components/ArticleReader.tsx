import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ArrowLeft, Calendar, Clock, User, Share2, BookOpen, Tag } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { blogService, BlogArticle } from "../services/blogServiceCompat";
import { toast } from "sonner@2.0.3";

interface ArticleReaderProps {
  slug: string;
  onBack: () => void;
  onBackToBlog: () => void;
}

export function ArticleReader({ slug, onBack, onBackToBlog }: ArticleReaderProps) {
  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    // Scroll para o topo quando o artigo é carregado
    window.scrollTo(0, 0);
    loadArticle();
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

  const loadArticle = async () => {
    try {
      setLoading(true);
      setError(null);
      const foundArticle = await blogService.getArticleBySlug(slug);
      
      if (!foundArticle) {
        setError("Artigo não encontrado");
        return;
      }
      
      if (!foundArticle.published) {
        setError("Este artigo não está disponível");
        return;
      }
      
      setArticle(foundArticle);
    } catch (err) {
      setError("Erro ao carregar artigo");
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: article?.excerpt,
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
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>')
      // Line breaks
      .replace(/\n/gim, '<br/>');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/70">Carregando artigo...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <BookOpen className="w-16 h-16 text-foreground/30 mx-auto mb-4" />
          <h1 className="text-2xl mb-4">Artigo não encontrado</h1>
          <p className="text-foreground/70 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={onBack} variant="outline">
              Voltar
            </Button>
            <Button onClick={onBackToBlog} className="bg-primary text-primary-foreground">
              Ver todos os artigos
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
              onClick={onBackToBlog}
              className="text-foreground/70 hover:text-foreground gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Blog
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

      {/* Conteúdo do artigo */}
      <article className="container mx-auto px-6 py-16 max-w-4xl">
        {/* Header do artigo */}
        <header className="text-center mb-16">
          {/* Categoria */}
          <div className="mb-8">
            <Badge 
              className="bg-emerald-400 hover:bg-emerald-500 text-white px-6 py-2 rounded-full text-sm font-medium shadow-sm transition-colors"
            >
              {article.category}
            </Badge>
          </div>

          {/* Título */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight max-w-4xl mx-auto">
            {article.title}
          </h1>

          {/* Excerpt */}
          <p className="text-lg md:text-xl text-foreground/70 leading-relaxed mb-12 max-w-3xl mx-auto">
            {article.excerpt}
          </p>

          {/* Metadados */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-foreground/60 text-sm mb-12">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-foreground/50" />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-foreground/50" />
              <span>{article.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-foreground/50" />
              <span>{article.readTime} de leitura</span>
            </div>
          </div>

          {/* Imagem principal */}
          <div className="relative rounded-2xl overflow-hidden mb-16 shadow-2xl shadow-black/20">
            <ImageWithFallback
              src={article.image_url}
              alt={article.title}
              className="w-full h-72 md:h-96 lg:h-[500px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/10 to-transparent"></div>
          </div>
        </header>

        {/* Conteúdo do artigo */}
        <div className="max-w-3xl mx-auto">
          {/* Sumário (se houver cabeçalhos) */}
          {article.content.includes('##') && (
            <div className="bg-muted/30 border border-border rounded-xl p-6 mb-12">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Neste artigo
              </h4>
              <div className="space-y-2 text-sm">
                {article.content.match(/^##\s+(.*)$/gm)?.map((heading, index) => (
                  <div key={index} className="text-foreground/70 hover:text-primary cursor-pointer transition-colors">
                    → {heading.replace(/^##\s+/, '')}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            className="article-content text-foreground leading-relaxed text-lg"
            dangerouslySetInnerHTML={{
              __html: formatMarkdownToHTML(article.content)
            }}
          />
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-16 pt-8 border-t border-border max-w-3xl mx-auto">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-foreground/70">
                <Tag className="w-4 h-4" />
                <span className="text-sm font-medium">Tags:</span>
              </div>
              {article.tags.map((tag, index) => (
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

        {/* Newsletter e feedback */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Newsletter */}
          <div className="bg-gradient-to-br from-emerald-400/10 to-blue-400/10 border border-emerald-400/20 rounded-xl p-8">
            <h4 className="text-xl mb-4 text-foreground">📧 Newsletter IntelliGem</h4>
            <p className="text-foreground/70 mb-6 text-sm">
              Receba insights semanais sobre IA, dados e automação diretamente no seu email.
            </p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="seu@email.com"
                className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              />
              <Button 
                size="sm"
                className="bg-emerald-400 hover:bg-emerald-500 text-white px-4"
              >
                Assinar
              </Button>
            </div>
          </div>

          {/* Feedback */}
          <div className="bg-gradient-to-br from-blue-400/10 to-purple-400/10 border border-blue-400/20 rounded-xl p-8">
            <h4 className="text-xl mb-4 text-foreground">💬 Sua opinião importa</h4>
            <p className="text-foreground/70 mb-6 text-sm">
              Este artigo foi útil? Deixe seu feedback para melhorarmos nosso conteúdo.
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="ghost" size="sm" className="text-2xl">👍</Button>
              <Button variant="ghost" size="sm" className="text-2xl">👎</Button>
              <Button variant="ghost" size="sm" className="text-2xl">❤️</Button>
              <Button variant="ghost" size="sm" className="text-2xl">🤔</Button>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="bg-gradient-to-br from-card/50 to-muted/30 border border-border rounded-2xl p-12 text-center backdrop-blur-sm">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-3xl mb-6">
              <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent hover:from-emerald-300 hover:to-blue-300 transition-all duration-300 inline-block">
                Quer saber mais?
              </span>
            </h3>
            <p className="text-foreground/70 mb-8 text-lg leading-relaxed">
              Converse com nossos especialistas e descubra como a IntelliGem pode transformar seus dados em vantagem competitiva.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button 
                className="bg-gradient-to-r from-emerald-400 to-blue-500 hover:from-emerald-500 hover:to-blue-600 text-white border-0 shadow-lg shadow-emerald-400/25 hover:shadow-emerald-400/40 transition-all px-8 py-3"
              >
                Agendar Conversa
              </Button>
              <Button 
                onClick={onBackToBlog} 
                variant="outline"
                className="border-border hover:border-primary hover:text-primary transition-colors px-8 py-3"
              >
                Ver mais artigos
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

        {/* Navegação entre artigos */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="bg-card/30 border border-border rounded-xl p-8">
            <h4 className="text-xl mb-6 text-center text-foreground/80">Continue lendo</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                <p className="text-sm text-foreground/60 mb-2">Artigo anterior</p>
                <p className="text-foreground/80">Descubra outros insights em nosso blog</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                <p className="text-sm text-foreground/60 mb-2">Próximo artigo</p>
                <p className="text-foreground/80">Explore mais conteúdo especializado</p>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Estilos customizados para o conteúdo do artigo */}
      <style jsx>{`
        .article-content h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 3rem 0 1.5rem 0;
          color: var(--foreground);
          line-height: 1.2;
          border-bottom: 2px solid var(--border);
          padding-bottom: 1rem;
        }
        
        .article-content h2 {
          font-size: 2rem;
          font-weight: 600;
          margin: 2.5rem 0 1rem 0;
          color: var(--foreground);
          line-height: 1.3;
          position: relative;
        }
        
        .article-content h2::before {
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
        
        .article-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 2rem 0 1rem 0;
          color: var(--foreground);
          line-height: 1.4;
        }
        
        .article-content p {
          margin: 1.5rem 0;
          line-height: 1.8;
          text-align: justify;
        }
        
        .article-content strong {
          font-weight: 700;
          color: var(--foreground);
          background: linear-gradient(135deg, #31af9d, #136eae);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .article-content em {
          font-style: italic;
          color: var(--foreground);
          opacity: 0.9;
        }
        
        .article-content code {
          background-color: var(--muted);
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.875rem;
          color: var(--foreground);
          border: 1px solid var(--border);
        }
        
        .article-content pre {
          background-color: var(--muted);
          padding: 1.5rem;
          border-radius: 0.75rem;
          overflow-x: auto;
          margin: 2rem 0;
          border: 1px solid var(--border);
          position: relative;
        }
        
        .article-content pre::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #31af9d, #136eae, #512f82);
          border-radius: 0.75rem 0.75rem 0 0;
        }
        
        .article-content pre code {
          background: none;
          padding: 0;
          border-radius: 0;
          color: var(--foreground);
          border: none;
        }
        
        .article-content ul {
          margin: 1.5rem 0;
          padding-left: 0;
        }
        
        .article-content li {
          margin: 1rem 0;
          padding-left: 2rem;
          position: relative;
          list-style: none;
        }
        
        .article-content li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0.75rem;
          width: 6px;
          height: 6px;
          background: linear-gradient(135deg, #31af9d, #136eae);
          border-radius: 50%;
        }
        
        .article-content blockquote {
          border-left: 4px solid #31af9d;
          background: var(--muted);
          padding: 1rem 1.5rem;
          margin: 2rem 0;
          border-radius: 0 0.5rem 0.5rem 0;
          font-style: italic;
          color: var(--foreground);
          opacity: 0.9;
        }
        
        .article-content a {
          color: #31af9d;
          text-decoration: underline;
          text-decoration-color: rgba(49, 175, 157, 0.3);
          transition: all 0.2s ease;
        }
        
        .article-content a:hover {
          color: #136eae;
          text-decoration-color: #136eae;
        }
        
        .drop-cap {
          float: left;
          font-size: 4rem;
          line-height: 3rem;
          padding-right: 0.5rem;
          margin-top: 0.25rem;
          font-weight: 700;
          background: linear-gradient(135deg, #31af9d, #136eae);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .article-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
          margin: 2rem 0;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .article-content hr {
          border: none;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--border), transparent);
          margin: 3rem 0;
        }
      `}</style>
    </div>
  );
}