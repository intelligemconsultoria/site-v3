import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Check, ArrowRight } from "lucide-react";

interface SolutionsComparisonProps {
  onNavigateToGemFlow: () => void;
  onNavigateToGemInsights: () => void;
  onNavigateToGemMind: () => void;
  onContact: () => void;
}

export function SolutionsComparison({
  onNavigateToGemFlow,
  onNavigateToGemInsights,
  onNavigateToGemMind,
  onContact
}: SolutionsComparisonProps) {
  const solutions = [
    {
      name: "GemFlow",
      subtitle: "Automação de Processos",
      color: "emerald",
      description: "Automatize fluxos de trabalho e integre sistemas",
      features: [
        "Integração de sistemas",
        "Automação de workflows",
        "Monitoramento em tempo real",
        "APIs robustas",
        "Processamento inteligente"
      ],
      ideal: "Empresas com processos manuais repetitivos",
      onNavigate: onNavigateToGemFlow
    },
    {
      name: "GemInsights",
      subtitle: "Business Intelligence", 
      color: "blue",
      description: "Transforme dados em insights acionáveis",
      features: [
        "Dashboards interativos",
        "Relatórios automatizados",
        "Análise preditiva",
        "Visualizações avançadas",
        "Monitoramento de KPIs"
      ],
      ideal: "Empresas que precisam de visibilidade dos dados",
      onNavigate: onNavigateToGemInsights
    },
    {
      name: "GemMind",
      subtitle: "Inteligência Artificial",
      color: "purple", 
      description: "Implemente IA para decisões inteligentes",
      features: [
        "Modelos preditivos",
        "Processamento de linguagem",
        "Visão computacional",
        "Recomendações inteligentes",
        "IA generativa"
      ],
      ideal: "Empresas prontas para inovação com IA",
      onNavigate: onNavigateToGemMind
    }
  ];

  const getColorClasses = (color: string) => {
    switch(color) {
      case 'emerald':
        return {
          primary: 'text-emerald-400',
          bg: 'bg-emerald-400',
          bgHover: 'hover:bg-emerald-500',
          border: 'border-emerald-400/20',
          gradient: 'from-emerald-400 to-emerald-600'
        };
      case 'blue':
        return {
          primary: 'text-blue-400',
          bg: 'bg-blue-500',
          bgHover: 'hover:bg-blue-600', 
          border: 'border-blue-400/20',
          gradient: 'from-blue-400 to-blue-600'
        };
      case 'purple':
        return {
          primary: 'text-purple-400',
          bg: 'bg-purple-500',
          bgHover: 'hover:bg-purple-600',
          border: 'border-purple-400/20', 
          gradient: 'from-purple-400 to-purple-600'
        };
      default:
        return {
          primary: 'text-foreground',
          bg: 'bg-primary',
          bgHover: 'hover:bg-primary/90',
          border: 'border-border',
          gradient: 'from-primary to-primary'
        };
    }
  };

  return (
    <section className="py-20 bg-card/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl mb-6">
            <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Compare Nossas Soluções
            </span>
          </h2>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            Escolha a solução ideal para suas necessidades ou combine múltiplas para máximo impacto
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {solutions.map((solution) => {
            const colors = getColorClasses(solution.color);
            
            return (
              <Card key={solution.name} className={`border-border hover:${colors.border} transition-all duration-300 relative overflow-hidden`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-5`}></div>
                
                <CardHeader className="relative">
                  <div className="text-center mb-4">
                    <h3 className="text-2xl mb-2">
                      <span className={colors.primary}>Gem</span>
                      <span className="text-foreground">{solution.name.replace('Gem', '')}</span>
                    </h3>
                    <Badge variant="outline" className={colors.border}>
                      {solution.subtitle}
                    </Badge>
                  </div>
                  <p className="text-foreground/70 text-center">
                    {solution.description}
                  </p>
                </CardHeader>

                <CardContent className="relative">
                  <div className="space-y-3 mb-6">
                    {solution.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Check className={`w-4 h-4 ${colors.primary} flex-shrink-0`} />
                        <span className="text-sm text-foreground/80">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className={`p-3 rounded-lg ${colors.border} bg-card/30 mb-6`}>
                    <p className="text-sm">
                      <span className="font-semibold">Ideal para:</span> {solution.ideal}
                    </p>
                  </div>

                  <Button
                    onClick={solution.onNavigate}
                    className={`w-full ${colors.bg} ${colors.bgHover} text-white`}
                  >
                    Conhecer {solution.name}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Combined Solution CTA */}
        <div className="text-center p-8 bg-gradient-to-r from-card/50 to-card/30 rounded-2xl border border-border">
          <h3 className="text-2xl mb-4">
            Precisa de uma solução completa?
          </h3>
          <p className="text-foreground/70 mb-6 max-w-2xl mx-auto">
            Combine GemFlow, GemInsights e GemMind para uma transformação digital completa. 
            Nossos especialistas podem desenhar uma arquitetura integrada para suas necessidades.
          </p>
          
          <Button
            size="lg"
            onClick={onContact}
            className="bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500 hover:from-emerald-500 hover:via-blue-600 hover:to-purple-600 text-white"
          >
            Consultar Solução Integrada
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}