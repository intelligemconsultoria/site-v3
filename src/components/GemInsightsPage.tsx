import { SolutionPage } from "./SolutionPage";
import { BarChart3, PieChart, TrendingUp, Eye, Filter, Share2 } from "lucide-react";

interface GemInsightsPageProps {
  onBack: () => void;
  onContact: () => void;
  logo: string;
}

export function GemInsightsPage({ onBack, onContact, logo }: GemInsightsPageProps) {
  const geminsightsData = {
    name: "GemInsights",
    subtitle: "Business Intelligence",
    fullName: "GemInsights - Inteligência de Negócios Avançada",
    description: "Visualize seus dados como nunca antes. Criamos dashboards interativos e relatórios personalizados que revelam padrões ocultos e orientam decisões estratégicas em tempo real, transformando dados complexos em insights acionáveis.",
    heroImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGludGVsbGlnZW5jZSUyMGRhc2hib2FyZHxlbnwxfHx8fDE3NTg1NjkwMTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    logo: logo,
    color: 'blue' as const,
    features: [
      {
        title: "Dashboards Interativos",
        description: "Crie visualizações dinâmicas e interativas que permitem explorar dados em profundidade, com drill-down e filtros avançados.",
        icon: <BarChart3 className="w-6 h-6 text-blue-400" />
      },
      {
        title: "Relatórios Automatizados",
        description: "Gere e distribua relatórios personalizados automaticamente, com agendamento flexível e formatos variados (PDF, Excel, Web).",
        icon: <Share2 className="w-6 h-6 text-blue-400" />
      },
      {
        title: "Análise Preditiva",
        description: "Utilize modelos estatísticos avançados para prever tendências, identificar padrões e antecipar oportunidades de negócio.",
        icon: <TrendingUp className="w-6 h-6 text-blue-400" />
      },
      {
        title: "Visualizações Avançadas",
        description: "Transforme dados complexos em gráficos, mapas de calor, treemaps e outras visualizações que facilitam a compreensão.",
        icon: <PieChart className="w-6 h-6 text-blue-400" />
      },
      {
        title: "Monitoramento de KPIs",
        description: "Defina e acompanhe indicadores-chave de performance com alertas automáticos quando metas são atingidas ou perdidas.",
        icon: <Eye className="w-6 h-6 text-blue-400" />
      },
      {
        title: "Filtros Inteligentes",
        description: "Aplique filtros dinâmicos e contextuais que se adaptam aos dados e às necessidades específicas de cada usuário.",
        icon: <Filter className="w-6 h-6 text-blue-400" />
      }
    ],
    benefits: [
      {
        title: "Tomada de Decisão",
        description: "Acelere decisões estratégicas com dados precisos e visualizações claras",
        metric: "5x"
      },
      {
        title: "Visibilidade dos Dados",
        description: "Tenha visão completa do seu negócio com dashboards centralizados",
        metric: "360°"
      },
      {
        title: "ROI em Analytics",
        description: "Retorno comprovado sobre investimento em inteligência de dados",
        metric: "300%"
      }
    ],
    useCases: [
      {
        title: "Dashboard Executivo de Vendas",
        description: "Visualize performance de vendas por região, produto, vendedor e período, com comparativos históricos e projeções futuras integradas ao CRM.",
        industry: "Vendas",
        result: "Aumento de 35% na precisão de forecasting"
      },
      {
        title: "Análise de Comportamento do Cliente",
        description: "Combine dados de navegação web, transações e atendimento para criar perfis detalhados de clientes e identificar oportunidades de cross-sell.",
        industry: "E-commerce",
        result: "Aumento de 45% na taxa de conversão"
      },
      {
        title: "Monitoramento de Qualidade Industrial",
        description: "Monitore métricas de produção, qualidade e eficiência em tempo real, com alertas automáticos para desvios e análise de root cause.",
        industry: "Manufatura",
        result: "Redução de 60% em defeitos de produção"
      },
      {
        title: "Analytics de Marketing Digital",
        description: "Unifique dados de Google Ads, Facebook, email marketing e website para medir ROI de campanhas e otimizar investimentos em mídia.",
        industry: "Marketing",
        result: "Redução de 40% no custo de aquisição de clientes"
      }
    ],
    technologies: [
      "Tableau",
      "Power BI",
      "Apache Superset",
      "Python/R",
      "SQL Server",
      "Elasticsearch",
      "D3.js",
      "React/Angular"
    ],
    ctaText: "Visualizar Meus Dados"
  };

  return (
    <SolutionPage
      solution={geminsightsData}
      onBack={onBack}
      onContact={onContact}
    />
  );
}