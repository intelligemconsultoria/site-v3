import { SolutionPage } from "./SolutionPage";
import { Brain, Target, Lightbulb, Cpu, Bot, Sparkles } from "lucide-react";

interface GemMindPageProps {
  onBack: () => void;
  onContact: () => void;
  logo: string;
}

export function GemMindPage({ onBack, onContact, logo }: GemMindPageProps) {
  const gemmindData = {
    name: "GemMind",
    subtitle: "Inteligência Artificial",
    fullName: "GemMind - Inteligência Artificial Aplicada",
    description: "O futuro dos seus dados está aqui. Desenvolvemos modelos de machine learning e IA que preveem comportamentos, identificam oportunidades e automatizam decisões complexas, transformando dados em inteligência preditiva.",
    heroImage: "https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NTg0ODA0ODB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    logo: logo,
    color: 'purple' as const,
    features: [
      {
        title: "Modelos Preditivos",
        description: "Desenvolva modelos de machine learning personalizados que antecipam tendências, comportamentos e resultados futuros baseados em dados históricos.",
        icon: <Brain className="w-6 h-6 text-purple-400" />
      },
      {
        title: "Processamento de Linguagem Natural",
        description: "Extraia insights de textos, documentos e conversas usando NLP avançado, incluindo análise de sentimento e classificação automática.",
        icon: <Bot className="w-6 h-6 text-purple-400" />
      },
      {
        title: "Visão Computacional",
        description: "Analise imagens e vídeos automaticamente para detecção de objetos, reconhecimento facial e controle de qualidade visual.",
        icon: <Target className="w-6 h-6 text-purple-400" />
      },
      {
        title: "Recomendações Inteligentes",
        description: "Crie sistemas de recomendação personalizados que aumentam engajamento e conversões através de algoritmos de collaborative filtering.",
        icon: <Lightbulb className="w-6 h-6 text-purple-400" />
      },
      {
        title: "AutoML e Otimização",
        description: "Automatize a criação e otimização de modelos com ferramentas de AutoML que selecionam os melhores algoritmos e hiperparâmetros.",
        icon: <Cpu className="w-6 h-6 text-purple-400" />
      },
      {
        title: "IA Generativa",
        description: "Implemente soluções com IA generativa para criação de conteúdo, assistentes virtuais e automação de tarefas cognitivas complexas.",
        icon: <Sparkles className="w-6 h-6 text-purple-400" />
      }
    ],
    benefits: [
      {
        title: "Precisão Preditiva",
        description: "Modelos com alta precisão que antecipam cenários e resultados futuros",
        metric: "95%"
      },
      {
        title: "Redução de Riscos",
        description: "Identifique e mitigue riscos antes que se tornem problemas reais",
        metric: "70%"
      },
      {
        title: "Aumento de Receita",
        description: "Impacto direto na receita através de otimizações baseadas em IA",
        metric: "250%"
      }
    ],
    useCases: [
      {
        title: "Previsão de Demanda Inteligente",
        description: "Modelos de machine learning que preveem demanda de produtos considerando sazonalidade, eventos, promoções e fatores externos como clima e economia.",
        industry: "Varejo",
        result: "Redução de 50% no excesso de estoque"
      },
      {
        title: "Credit Scoring Avançado",
        description: "Algoritmos de IA que avaliam risco de crédito usando centenas de variáveis, incluindo dados comportamentais e alternativos, para decisões mais precisas.",
        industry: "Financeiro",
        result: "Redução de 30% na inadimplência"
      },
      {
        title: "Manutenção Preditiva Industrial",
        description: "Monitore equipamentos com sensores IoT e modelos de IA para prever falhas antes que aconteçam, otimizando manutenção e reduzindo downtime.",
        industry: "Manufatura",
        result: "Redução de 80% em paradas não planejadas"
      },
      {
        title: "Personalização de Conteúdo",
        description: "Sistemas de recomendação que analisam comportamento do usuário para personalizar produtos, conteúdo e ofertas em tempo real.",
        industry: "Digital/Media",
        result: "Aumento de 150% no engajamento"
      }
    ],
    technologies: [
      "TensorFlow",
      "PyTorch",
      "Scikit-learn",
      "OpenAI GPT",
      "Hugging Face",
      "MLflow",
      "Kubeflow",
      "NVIDIA CUDA"
    ],
    ctaText: "Implementar IA no Meu Negócio"
  };

  return (
    <SolutionPage
      solution={gemmindData}
      onBack={onBack}
      onContact={onContact}
    />
  );
}