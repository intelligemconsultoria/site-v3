import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { MeetingRequestModal } from "./MeetingRequestModal";
import { useMeetingModal } from "../hooks/useMeetingModal";
import gemFlowLogo from "figma:asset/5175adeec9ce8271bb85bf293b9214728409a71a.png";
import gemInsightsLogo from "figma:asset/7dd46db1fefa5288c113180ade65c741fafebcce.png";
import gemMindLogo from "figma:asset/c856949ab322f91d15b5aaecc11426c61fe0ed10.png";

interface SolutionsSectionProps {
  onNavigateToGemFlow?: () => void;
  onNavigateToGemInsights?: () => void;
  onNavigateToGemMind?: () => void;
}

export function SolutionsSection({ 
  onNavigateToGemFlow, 
  onNavigateToGemInsights, 
  onNavigateToGemMind 
}: SolutionsSectionProps = {}) {
  const { isOpen, openModal, closeModal, currentSolution, currentSource } = useMeetingModal({
    sourcePage: 'solutions-section'
  });
  const [solutionLogos, setSolutionLogos] = useState({
    gemflow: gemFlowLogo,
    geminsights: gemInsightsLogo,
    gemmind: gemMindLogo
  });

  useEffect(() => {
    // Load custom logos from localStorage
    const savedGemFlowLogo = localStorage.getItem('site-image-logo-gemflow');
    const savedGemInsightsLogo = localStorage.getItem('site-image-logo-geminsights');
    const savedGemMindLogo = localStorage.getItem('site-image-logo-gemmind');

    setSolutionLogos({
      gemflow: savedGemFlowLogo || gemFlowLogo,
      geminsights: savedGemInsightsLogo || gemInsightsLogo,
      gemmind: savedGemMindLogo || gemMindLogo
    });

    // Listen for image updates
    const handleImageUpdate = (event: CustomEvent) => {
      const logos = event.detail;
      setSolutionLogos(prev => ({
        gemflow: logos['logo-gemflow'] || prev.gemflow,
        geminsights: logos['logo-geminsights'] || prev.geminsights,
        gemmind: logos['logo-gemmind'] || prev.gemmind
      }));
    };

    window.addEventListener('site-images-updated', handleImageUpdate as EventListener);
    return () => {
      window.removeEventListener('site-images-updated', handleImageUpdate as EventListener);
    };
  }, []);

  const solutions = [
    {
      name: "GemFlow",
      subtitle: "Automação de Processos",
      description: "Integração e automação de dados para otimizar fluxos de trabalho e eliminar tarefas repetitivas.",
      details: "Transforme processos manuais em fluxos automatizados inteligentes. Nossa plataforma conecta sistemas, padroniza dados e cria pipelines robustos que garantem eficiência operacional.",
      image: "https://images.unsplash.com/photo-1758387933125-5ac945b4e2cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXRvbWF0aW9uJTIwcHJvY2VzcyUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzU4NTc5NjU5fDA&ixlib=rb-4.1.0&q=80&w=1080",
      color: "emerald",
      logo: solutionLogos.gemflow
    },
    {
      name: "GemInsights",
      subtitle: "Business Intelligence",
      description: "Dashboards e relatórios inteligentes que transformam dados complexos em insights acionáveis.",
      details: "Visualize seus dados como nunca antes. Criamos dashboards interativos e relatórios personalizados que revelam padrões ocultos e orientam decisões estratégicas em tempo real.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGludGVsbGlnZW5jZSUyMGRhc2hib2FyZHxlbnwxfHx8fDE3NTg1NjkwMTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
      color: "blue",
      logo: solutionLogos.geminsights
    },
    {
      name: "GemMind",
      subtitle: "Inteligência Artificial",
      description: "Modelos preditivos e algoritmos de IA para antecipar tendências e otimizar resultados.",
      details: "O futuro dos seus dados está aqui. Desenvolvemos modelos de machine learning e IA que preveem comportamentos, identificam oportunidades e automatizam decisões complexas.",
      image: "https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NTg0ODA0ODB8MA&ixlib=rb-4.1.0&q=80&w=1080",
      color: "purple",
      logo: solutionLogos.gemmind
    }
  ];

  return (
    <section id="solucoes" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl mb-6">
            <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent hover:from-emerald-300 hover:to-blue-300 transition-all duration-300 inline-block">
              Nossas Soluções
            </span>
          </h2>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            Três verticals integradas que trabalham em sinergia para transformar seus dados em vantagem competitiva.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 lg:items-stretch">
          {solutions.map((solution, index) => (
            <div 
              key={solution.name}
              className="group relative bg-card/50 backdrop-blur-sm rounded-2xl border border-border p-8 hover:bg-card/70 transition-all duration-300 hover:scale-105 flex flex-col h-full"
            >
              {/* Logo e Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0">
                  <img 
                    src={solution.logo} 
                    alt={`${solution.name} Logo`}
                    className="w-20 h-20 object-contain rounded-xl bg-white/10 p-3"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl mb-2 text-foreground">
                    <span className={`
                      ${solution.color === 'emerald' ? 'text-emerald-400' : ''}
                      ${solution.color === 'blue' ? 'text-blue-400' : ''}
                      ${solution.color === 'purple' ? 'text-purple-400' : ''}
                    `}>
                      Gem
                    </span>
                    <span className="text-foreground">
                      {solution.name.replace('Gem', '')}
                    </span>
                  </h3>
                  <p className="text-foreground/70 text-sm">{solution.subtitle}</p>
                </div>
              </div>

              {/* Imagem */}
              <div className="relative mb-6 overflow-hidden rounded-xl">
                <ImageWithFallback 
                  src={solution.image}
                  alt={solution.name}
                  className="w-full h-48 object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-t from-${solution.color}-900/40 to-transparent`}></div>
              </div>

              {/* Descrição */}
              <p className="text-foreground/80 mb-4 leading-relaxed">
                {solution.description}
              </p>

              {/* Detalhes expandidos */}
              <div className="group-hover:max-h-40 max-h-0 overflow-hidden transition-all duration-300">
                <p className="text-foreground/60 text-sm leading-relaxed border-t border-border pt-4">
                  {solution.details}
                </p>
              </div>

              {/* CTA */}
              <div className="mt-auto pt-6 space-y-3">
                <Button 
                  onClick={() => {
                    if (solution.name === 'GemFlow' && onNavigateToGemFlow) {
                      onNavigateToGemFlow();
                    } else if (solution.name === 'GemInsights' && onNavigateToGemInsights) {
                      onNavigateToGemInsights();
                    } else if (solution.name === 'GemMind' && onNavigateToGemMind) {
                      onNavigateToGemMind();
                    }
                  }}
                  className={`w-full transition-all duration-300 ${
                    solution.color === 'emerald' 
                      ? 'bg-emerald-400 hover:bg-emerald-500 text-black' 
                      : solution.color === 'blue'
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }`}
                >
                  Saiba Mais
                </Button>
                <Button 
                  onClick={() => {
                    const solutionType = solution.name as 'GemFlow' | 'GemInsights' | 'GemMind';
                    openModal(solutionType, `solutions-${solution.name.toLowerCase()}`);
                  }}
                  variant="outline"
                  className="w-full border-border hover:bg-card/50 transition-all duration-300"
                >
                  Agendar Demonstração
                </Button>
              </div>

              {/* Efeito de hover */}
              <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-br ${
                solution.color === 'emerald' 
                  ? 'from-emerald-400/10 to-transparent' 
                  : solution.color === 'blue'
                  ? 'from-blue-500/10 to-transparent'
                  : 'from-purple-500/10 to-transparent'
              }`}></div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <Button 
            size="lg"
            onClick={() => openModal('All', 'solutions-cta')}
            className="bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500 hover:from-emerald-500 hover:via-blue-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-blue-400/25 hover:shadow-blue-400/40 transition-all px-12 py-6"
          >
            Descubra Como Podemos Ajudar
          </Button>
        </div>
      </div>

      {/* Modal de Agendamento */}
      <MeetingRequestModal
        isOpen={isOpen}
        onClose={closeModal}
        prefilledSolution={currentSolution}
        sourcePage={currentSource}
      />
    </section>
  );
}