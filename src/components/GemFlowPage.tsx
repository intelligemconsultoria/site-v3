import { SolutionPage } from "./SolutionPage";
import { Zap, Target, RefreshCw, BarChart3, Clock, Shield } from "lucide-react";

interface GemFlowPageProps {
  onBack: () => void;
  onContact: () => void;
  logo: string;
}

export function GemFlowPage({ onBack, onContact, logo }: GemFlowPageProps) {
  const gemflowData = {
    name: "GemFlow",
    subtitle: "Automação de Processos",
    fullName: "GemFlow - Automação Inteligente de Processos",
    description: "Transforme processos manuais em fluxos automatizados inteligentes. Nossa plataforma conecta sistemas, padroniza dados e cria pipelines robustos que garantem eficiência operacional máxima.",
    heroImage: "https://images.unsplash.com/photo-1758387933125-5ac945b4e2cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXRvbWF0aW9uJTIwcHJvY2VzcyUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzU4NTc5NjU5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    logo: logo,
    color: 'emerald' as const,
    features: [
      {
        title: "Integração Inteligente",
        description: "Conecte sistemas legados e modernos através de APIs robustas e conectores nativos, criando um ecossistema de dados unificado.",
        icon: <Zap className="w-6 h-6 text-emerald-400" />
      },
      {
        title: "Automação de Workflows",
        description: "Crie fluxos de trabalho automatizados que se adaptam às suas regras de negócio, eliminando gargalos e reduzindo erros humanos.",
        icon: <RefreshCw className="w-6 h-6 text-emerald-400" />
      },
      {
        title: "Monitoramento em Tempo Real",
        description: "Acompanhe o desempenho dos seus processos com dashboards interativos e alertas automatizados para intervenções rápidas.",
        icon: <BarChart3 className="w-6 h-6 text-emerald-400" />
      },
      {
        title: "Processamento Inteligente",
        description: "Utilize algoritmos avançados para transformar, validar e enriquecer dados automaticamente durante o fluxo de processamento.",
        icon: <Target className="w-6 h-6 text-emerald-400" />
      },
      {
        title: "Execução Agendada",
        description: "Configure execuções automáticas baseadas em horários, eventos ou triggers específicos do seu negócio.",
        icon: <Clock className="w-6 h-6 text-emerald-400" />
      },
      {
        title: "Segurança Avançada",
        description: "Proteja seus dados com criptografia end-to-end, controle de acesso granular e auditoria completa de todas as operações.",
        icon: <Shield className="w-6 h-6 text-emerald-400" />
      }
    ],
    benefits: [
      {
        title: "Redução de Tempo",
        description: "Diminua em até 80% o tempo gasto em tarefas repetitivas e manuais",
        metric: "80%"
      },
      {
        title: "Aumento da Precisão",
        description: "Elimine erros humanos com processos automatizados e validações inteligentes",
        metric: "99.9%"
      },
      {
        title: "Economia de Custos",
        description: "Reduza custos operacionais através da otimização de recursos e processos",
        metric: "60%"
      }
    ],
    useCases: [
      {
        title: "Automação de Relatórios Financeiros",
        description: "Automatize a coleta, processamento e distribuição de relatórios financeiros diários, semanais e mensais, integrando dados de múltiplos sistemas ERP e bancos.",
        industry: "Financeiro",
        result: "Redução de 75% no tempo de geração de relatórios"
      },
      {
        title: "Gestão de Estoque Inteligente",
        description: "Sincronize automaticamente níveis de estoque entre lojas físicas, e-commerce e fornecedores, com reposição automática baseada em algoritmos preditivos.",
        industry: "Varejo",
        result: "Redução de 40% na ruptura de estoque"
      },
      {
        title: "Onboarding Automatizado de Clientes",
        description: "Automatize todo o processo de cadastro e validação de novos clientes, desde a coleta de documentos até a aprovação final, com integração a bureaus de crédito.",
        industry: "Serviços Financeiros",
        result: "Redução de 90% no tempo de onboarding"
      },
      {
        title: "Processamento de Pedidos E-commerce",
        description: "Automatize o fluxo completo desde o pedido até a entrega, incluindo validação de pagamento, separação no estoque, emissão de notas fiscais e tracking de entrega.",
        industry: "E-commerce",
        result: "Aumento de 200% na capacidade de processamento"
      }
    ],
    technologies: [
      "Apache Kafka",
      "Python/Java",
      "REST APIs",
      "Docker",
      "Kubernetes",
      "Apache Airflow",
      "Redis",
      "PostgreSQL"
    ],
    ctaText: "Automatizar Meus Processos"
  };

  return (
    <SolutionPage
      solution={gemflowData}
      onBack={onBack}
      onContact={onContact}
    />
  );
}