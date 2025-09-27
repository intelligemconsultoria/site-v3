import { ArrowLeft, Check, ArrowRight, Zap, Target, Lightbulb, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { MeetingRequestModal } from "./MeetingRequestModal";
import { useMeetingModal } from "../hooks/useMeetingModal";

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface Benefit {
  title: string;
  description: string;
  metric?: string;
}

interface UseCase {
  title: string;
  description: string;
  industry: string;
  result: string;
}

interface SolutionPageProps {
  solution: {
    name: string;
    subtitle: string;
    fullName: string;
    description: string;
    heroImage: string;
    logo: string;
    color: 'emerald' | 'blue' | 'purple';
    features: Feature[];
    benefits: Benefit[];
    useCases: UseCase[];
    technologies: string[];
    ctaText: string;
  };
  onBack: () => void;
  onContact: () => void;
}

export function SolutionPage({ solution, onBack, onContact }: SolutionPageProps) {
  const solutionType = solution.name as 'GemFlow' | 'GemInsights' | 'GemMind';
  const { isOpen, openModal, closeModal, currentSolution, currentSource } = useMeetingModal({
    prefilledSolution: solutionType,
    sourcePage: `${solution.name.toLowerCase()}-page`
  });
  const colorClasses = {
    emerald: {
      primary: 'text-emerald-400',
      bg: 'bg-emerald-400',
      bgHover: 'hover:bg-emerald-500',
      gradient: 'from-emerald-400 to-emerald-600',
      border: 'border-emerald-400/20',
      ring: 'ring-emerald-400/20'
    },
    blue: {
      primary: 'text-blue-400',
      bg: 'bg-blue-500',
      bgHover: 'hover:bg-blue-600',
      gradient: 'from-blue-400 to-blue-600',
      border: 'border-blue-400/20',
      ring: 'ring-blue-400/20'
    },
    purple: {
      primary: 'text-purple-400',
      bg: 'bg-purple-500',
      bgHover: 'hover:bg-purple-600',
      gradient: 'from-purple-400 to-purple-600',
      border: 'border-purple-400/20',
      ring: 'ring-purple-400/20'
    }
  };

  const colors = colorClasses[solution.color];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onBack}
              className="flex items-center gap-2 hover:bg-card/50"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>

            <div className="flex items-center gap-3">
              <img 
                src={solution.logo} 
                alt={`${solution.name} Logo`}
                className="w-8 h-8 object-contain"
              />
              <h1 className={`text-xl font-semibold ${colors.primary}`}>
                {solution.name}
              </h1>
            </div>

            <Button
              onClick={() => openModal(solutionType, `${solution.name.toLowerCase()}-header`)}
              className={`${colors.bg} ${colors.bgHover} text-white`}
            >
              Agendar Demonstração
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background to-card/20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <img 
                  src={solution.logo} 
                  alt={`${solution.name} Logo`}
                  className="w-20 h-20 object-contain rounded-xl bg-white/10 p-3"
                />
                <div>
                  <h1 className="text-4xl lg:text-5xl mb-2">
                    <span className={colors.primary}>Gem</span>
                    <span className="text-foreground">{solution.name.replace('Gem', '')}</span>
                  </h1>
                  <p className="text-xl text-foreground/70">{solution.subtitle}</p>
                </div>
              </div>
              
              <p className="text-lg text-foreground/80 mb-8 leading-relaxed">
                {solution.description}
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                {solution.technologies.map((tech) => (
                  <Badge key={tech} variant="secondary" className={`${colors.border}`}>
                    {tech}
                  </Badge>
                ))}
              </div>

              <Button
                size="lg"
                onClick={() => openModal(solutionType, `${solution.name.toLowerCase()}-hero`)}
                className={`${colors.bg} ${colors.bgHover} text-white`}
              >
                {solution.ctaText}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-20 rounded-2xl blur-xl transform scale-110`}></div>
              <ImageWithFallback
                src={solution.heroImage}
                alt={solution.fullName}
                className="relative w-full h-96 object-cover rounded-2xl border border-border"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl mb-6">
              <span className={`bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>
                Principais Funcionalidades
              </span>
            </h2>
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
              Descubra como o {solution.name} pode revolucionar seus processos de negócio
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {solution.features.map((feature, index) => (
              <Card key={index} className={`border-border hover:${colors.border} transition-all duration-300 hover:scale-105`}>
                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 rounded-xl ${colors.bg}/10 flex items-center justify-center mb-4`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/70 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-card/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl mb-6">
              <span className={`bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>
                Benefícios Comprovados
              </span>
            </h2>
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
              Resultados reais que nossos clientes alcançaram com o {solution.name}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {solution.benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 rounded-full ${colors.bg}/10 flex items-center justify-center mx-auto mb-4`}>
                  <Check className={`w-8 h-8 ${colors.primary}`} />
                </div>
                {benefit.metric && (
                  <div className={`text-3xl font-bold ${colors.primary} mb-2`}>
                    {benefit.metric}
                  </div>
                )}
                <h3 className="text-xl mb-3">{benefit.title}</h3>
                <p className="text-foreground/70 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl mb-6">
              <span className={`bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>
                Casos de Uso
              </span>
            </h2>
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
              Veja como diferentes setores aplicam o {solution.name} em suas operações
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {solution.useCases.map((useCase, index) => (
              <Card key={index} className="border-border hover:bg-card/50 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className={colors.border}>
                      {useCase.industry}
                    </Badge>
                    <TrendingUp className={`w-5 h-5 ${colors.primary}`} />
                  </div>
                  <CardTitle className="text-xl">{useCase.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/70 mb-4">{useCase.description}</p>
                  <div className={`p-3 rounded-lg ${colors.border} bg-card/30`}>
                    <p className="text-sm">
                      <span className="font-semibold">Resultado:</span> {useCase.result}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 bg-gradient-to-br ${colors.gradient}/10`}>
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl mb-6">
            Pronto para Transformar seus Dados?
          </h2>
          <p className="text-xl text-foreground/70 mb-8 max-w-2xl mx-auto">
            Entre em contato conosco e descubra como o {solution.name} pode acelerar seus resultados
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => openModal(solutionType, `${solution.name.toLowerCase()}-cta`)}
              className={`${colors.bg} ${colors.bgHover} text-white`}
            >
              Solicitar Demonstração
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onBack}
              className="border-border hover:bg-card/50"
            >
              Voltar às Soluções
            </Button>
          </div>
        </div>
      </section>

      {/* Modal de Agendamento */}
      <MeetingRequestModal
        isOpen={isOpen}
        onClose={closeModal}
        prefilledSolution={currentSolution}
        sourcePage={currentSource}
      />
    </div>
  );
}