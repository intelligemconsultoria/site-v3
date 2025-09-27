import { getSupabaseClient } from '../utils/supabase/client';

// Cases Service - Conectado ao Supabase
export interface CaseStudy {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  client: string;
  industry: string;
  challenge: string;
  solution: string;
  results: string[];
  image_url: string; // Mudança para match com DB
  category: 'GemFlow' | 'GemInsights' | 'GemMind';
  metrics: Record<string, any>; // Mudança para JSONB
  slug: string;
  published: boolean;
  featured: boolean;
  tags: string[];
  created_at: string; // Mudança para match com DB
  updated_at: string; // Mudança para match com DB
  view_count?: number;
}

class CasesService {
  private supabase = getSupabaseClient();

  // Função auxiliar para gerar slug
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplos
      .replace(/^-|-$/g, ''); // Remove hífens do início/fim
  }

  // Dados padrão para migração (não mais usados em produção)
  private getDefaultData() {
    const cases: CaseStudy[] = [
      {
        id: '1',
        title: 'Transformação Digital no Varejo: +400% ROI',
        excerpt: 'Como uma grande rede varejista automatizou processos e aumentou vendas em 40% com dashboards inteligentes.',
        content: `
# Transformação Digital no Varejo: +400% ROI

Uma das maiores redes varejistas do Brasil enfrentava desafios críticos na gestão de estoque e análise de vendas, perdendo oportunidades e desperdiçando recursos.

## O Desafio

A empresa operava com sistemas legados desconectados, gerando:
- **Falta de visibilidade** em tempo real do estoque
- **Decisões baseadas em intuição** ao invés de dados
- **Processos manuais** que consumiam 40% do tempo das equipes
- **Perda de vendas** por ruptura de estoque

## Nossa Solução

Implementamos uma solução completa integrando **GemFlow** e **GemInsights**:

### GemFlow - Automação de Processos
- Automação do fluxo de reposição de estoque
- Integração entre sistemas ERP, e-commerce e lojas físicas
- Alertas inteligentes para situações críticas
- Workflows automatizados para aprovações

### GemInsights - Business Intelligence
- Dashboards em tempo real de vendas e estoque
- Análise preditiva de demanda
- Relatórios executivos automatizados
- KPIs personalizados por região e categoria

## Resultados Alcançados

### Métricas de Impacto
- **400% de ROI** em 8 meses
- **40% de aumento** nas vendas
- **60% de redução** no tempo de análise
- **90% menos rupturas** de estoque

### Benefícios Operacionais
- Decisões baseadas em dados em tempo real
- Processos 100% automatizados
- Equipes focadas em estratégia, não em tarefas manuais
- Experiência do cliente significativamente melhorada

## Depoimento do Cliente

*"A IntelliGem não apenas transformou nossos processos, mas mudou nossa cultura organizacional. Hoje somos uma empresa verdadeiramente data-driven."*

**João Silva** - Diretor de Operações

## Tecnologias Utilizadas

- **Automação**: Python, Apache Airflow
- **BI**: Power BI, SQL Server
- **Integração**: APIs REST, webhooks
- **Cloud**: Azure, AWS S3

## Timeline do Projeto

1. **Mês 1-2**: Análise e mapeamento de processos
2. **Mês 3-4**: Desenvolvimento da automação
3. **Mês 5-6**: Implementação dos dashboards
4. **Mês 7-8**: Treinamento e go-live
5. **Mês 9+**: Monitoramento e otimização

## Próximos Passos

O sucesso deste projeto abriu caminho para:
- Expansão para outras unidades de negócio
- Implementação de IA preditiva (GemMind)
- Automação de marketing e CRM
        `,
        client: 'RetailCorp',
        industry: 'Varejo',
        challenge: 'Processos manuais, falta de visibilidade em tempo real e perda de vendas por ruptura de estoque',
        solution: 'Automação completa de processos com GemFlow e dashboards inteligentes com GemInsights',
        results: [
          '400% de ROI em 8 meses',
          '40% de aumento nas vendas',
          '60% de redução no tempo de análise',
          '90% menos rupturas de estoque'
        ],
        image_url: 'https://images.unsplash.com/photo-1556155092-490a1ba16284?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXRhaWwlMjBzdG9yZSUyMGRhc2hib2FyZCUyMGFuYWx5dGljc3xlbnwxfHx8fDE3NTg1NDc0MjJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
        category: 'GemInsights',
        metrics: {
          improvement: '400% ROI',
          timeframe: '8 meses',
          roi: '+400%'
        },
        slug: 'transformacao-digital-varejo-roi',
        published: true,
        featured: true,
        tags: ['varejo', 'automação', 'bi', 'roi'],
        created_at: '2025-01-20T10:00:00Z',
        updated_at: '2025-01-20T10:00:00Z'
      },
      {
        id: '2',
        title: 'IA Preditiva na Indústria: Redução de 70% em Falhas',
        excerpt: 'Implementação de modelos preditivos que revolucionaram a manutenção industrial e reduziram custos operacionais.',
        content: `
# IA Preditiva na Indústria: Redução de 70% em Falhas

Uma indústria química líder no mercado brasileiro buscava reduzir paradas não programadas e otimizar custos de manutenção através de tecnologia de ponta.

## O Desafio

A empresa enfrentava:
- **Paradas não programadas** custando R$ 2M mensais
- **Manutenção reativa** aumentando custos operacionais
- **Falta de previsibilidade** nos equipamentos críticos
- **Desperdício de recursos** em manutenções desnecessárias

## Nossa Solução: GemMind

Desenvolvemos uma solução completa de **IA Preditiva** utilizando:

### Coleta e Processamento de Dados
- Sensores IoT em equipamentos críticos
- Análise de histórico de manutenção
- Dados de operação em tempo real
- Integração com sistemas SCADA

### Modelos de Machine Learning
- **Algoritmos de Anomalia**: Detecção precoce de problemas
- **Modelos Preditivos**: Previsão de falhas com 95% de precisão
- **Otimização de Maintenance**: Agendamento inteligente
- **Análise de Causa Raiz**: Identificação automática de problemas

## Resultados Transformadores

### Impacto Financeiro
- **70% de redução** em falhas não programadas
- **R$ 1.4M economizados** mensalmente
- **350% de ROI** em 12 meses
- **40% de redução** nos custos de manutenção

### Melhorias Operacionais
- **95% de precisão** na previsão de falhas
- **Disponibilidade de equipamentos** aumentou para 98.5%
- **Tempo médio entre falhas** aumentou em 300%
- **Satisfação da equipe** melhorou significativamente

## Tecnologia Implementada

### Stack Tecnológico
- **Machine Learning**: Python, TensorFlow, scikit-learn
- **Big Data**: Apache Spark, Kafka
- **Visualização**: Grafana, custom dashboards
- **Cloud**: AWS, containers Docker

### Infraestrutura
- Edge computing para processamento local
- Pipeline de dados em tempo real
- Modelos auto-ajustáveis
- Alertas inteligentes via WhatsApp/email

## Depoimento

*"O GemMind da IntelliGem não apenas reduziu nossos custos, mas transformou nossa abordagem à manutenção. Agora somos proativos, não reativos."*

**Maria Santos** - Gerente de Manutenção

## Fases do Projeto

1. **Análise**: Mapeamento de equipamentos e histórico
2. **Implementação**: Instalação de sensores e coleta de dados
3. **Desenvolvimento**: Criação e treinamento dos modelos
4. **Validação**: Testes e ajustes finos
5. **Produção**: Go-live e monitoramento contínuo

## Expansão Futura

O sucesso levou a novos projetos:
- Previsão de qualidade do produto
- Otimização de energia
- Manutenção preditiva em outras plantas
        `,
        client: 'IndustryChem',
        industry: 'Indústria Química',
        challenge: 'Paradas não programadas custando R$ 2M mensais e manutenção reativa ineficiente',
        solution: 'IA preditiva com GemMind para previsão de falhas e otimização de manutenção',
        results: [
          '70% de redução em falhas não programadas',
          'R$ 1.4M economizados mensalmente',
          '350% de ROI em 12 meses',
          '95% de precisão na previsão de falhas'
        ],
        image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwYXV0b21hdGlvbiUyMGFpfGVufDF8fHx8MTc1ODU0NzQyMnww&ixlib=rb-4.1.0&q=80&w=1080',
        category: 'GemMind',
        metrics: {
          improvement: '70% redução em falhas',
          timeframe: '12 meses',
          roi: '+350%'
        },
        slug: 'ia-preditiva-industria-falhas',
        published: true,
        featured: true,
        tags: ['ia', 'indústria', 'preditiva', 'manutenção'],
        created_at: '2025-01-18T14:30:00Z',
        updated_at: '2025-01-18T14:30:00Z'
      },
      {
        id: '3',
        title: 'Automação Bancária: 95% de Processos Digitalizados',
        excerpt: 'Como um banco regional automatizou operações críticas e melhorou a experiência do cliente.',
        content: `
# Automação Bancária: 95% de Processos Digitalizados

Um banco regional brasileiro precisava modernizar suas operações para competir com fintechs e grandes bancos, mantendo excelência no atendimento.

## O Desafio

O banco enfrentava:
- **Processos manuais** consumindo 80% do tempo das equipes
- **Experiência do cliente** abaixo das expectativas
- **Compliance complexo** exigindo controles rigorosos
- **Concorrência digital** ameaçando participação de mercado

## Nossa Solução: GemFlow

Implementamos automação completa com **GemFlow**:

### Automação de Processos Core
- **Abertura de contas**: De 3 dias para 2 horas
- **Análise de crédito**: Decisão automatizada em 15 minutos
- **Compliance**: Verificações KYC/AML automatizadas
- **Reconciliação**: Processos contábeis 100% automatizados

### Integração de Sistemas
- Core banking + CRM + sistemas regulatórios
- APIs para parceiros e fintechs
- Workflow engine personalizado
- Monitoramento em tempo real

## Resultados Excepcionais

### Eficiência Operacional
- **95% dos processos** totalmente digitalizados
- **300% de aumento** na produtividade
- **80% de redução** no tempo de processamento
- **250% de ROI** em 10 meses

### Experiência do Cliente
- **NPS aumentou** de 6.2 para 8.7
- **Tempo de espera** reduzido em 85%
- **Satisfação** aumentou para 94%
- **Onboarding digital** em menos de 2 horas

## Impacto nos Negócios

### Crescimento
- **40% de aumento** em novos clientes
- **Receitas cresceram** 35% no primeiro ano
- **Custos operacionais** reduziram 45%
- **Market share** aumentou 15%

### Compliance e Segurança
- **100% de conformidade** regulatória
- **Zero falhas** em auditorias
- **Detecção de fraudes** melhorou 90%
- **Tempo de resposta** para reguladores: 24h

## Tecnologias Utilizadas

### Plataforma de Automação
- **RPA**: UiPath, Blue Prism
- **BPM**: Bonita, custom workflows
- **API Management**: Kong, AWS API Gateway
- **Monitoramento**: Splunk, custom dashboards

### Segurança e Compliance
- **Blockchain** para auditoria
- **Criptografia** end-to-end
- **Biometria** e autenticação multi-fator
- **LGPD** compliance nativo

## Depoimento

*"A IntelliGem nos ajudou a fazer uma transformação que parecia impossível. Hoje somos referência em inovação no setor bancário."*

**Roberto Lima** - CTO

## Fases da Implementação

1. **Assessment**: Análise detalhada dos processos atuais
2. **Design**: Arquitetura da solução e workflows
3. **Desenvolvimento**: Customização e integrações
4. **Piloto**: Testes em ambiente controlado
5. **Rollout**: Implementação gradual e treinamento
6. **Otimização**: Ajustes e melhorias contínuas

## Evolução Contínua

O projeto abriu caminho para:
- **Open Banking** APIs
- **IA para análise** de risco (GemMind)
- **Chatbots inteligentes** para atendimento
- **Blockchain** para transações
        `,
        client: 'RegionalBank',
        industry: 'Serviços Financeiros',
        challenge: 'Processos manuais consumindo 80% do tempo e experiência do cliente insatisfatória',
        solution: 'Automação completa de processos bancários com GemFlow, incluindo abertura de contas e análise de crédito',
        results: [
          '95% dos processos digitalizados',
          '300% de aumento na produtividade',
          '250% de ROI em 10 meses',
          'NPS aumentou de 6.2 para 8.7'
        ],
        image_url: 'https://images.unsplash.com/photo-1556155092-490a1ba16284?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW5raW5nJTIwZGlnaXRhbCUyMGF1dG9tYXRpb258ZW58MXx8fHwxNzU4NTQ3NDIyfDA&ixlib=rb-4.1.0&q=80&w=1080',
        category: 'GemFlow',
        metrics: {
          improvement: '95% processos digitalizados',
          timeframe: '10 meses',
          roi: '+250%'
        },
        slug: 'automacao-bancaria-processos-digitalizados',
        published: true,
        featured: false,
        tags: ['banking', 'automação', 'digital', 'fintech'],
        created_at: '2025-01-15T09:15:00Z',
        updated_at: '2025-01-15T09:15:00Z'
      }
    ];

    return cases;
  }

  // Métodos para cases
  async getAllCases(): Promise<CaseStudy[]> {
    try {
      const { data, error } = await this.supabase
        .from('case_studies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar cases:', error);
      return [];
    }
  }

  async getPublishedCases(): Promise<CaseStudy[]> {
    try {
      const { data, error } = await this.supabase
        .from('case_studies')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar cases publicados:', error);
      return [];
    }
  }

  async getCaseBySlug(slug: string): Promise<CaseStudy | null> {
    try {
      const { data, error } = await this.supabase
        .from('case_studies')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .limit(1);

      if (error) {
        console.error('Erro ao buscar case por slug:', error);
        return null;
      }

      if (!data || data.length === 0) {
        return null; // Not found
      }

      const caseStudy = data[0];

      // Incrementar view_count
      await this.supabase
        .from('case_studies')
        .update({ view_count: (caseStudy.view_count || 0) + 1 })
        .eq('id', caseStudy.id);

      return caseStudy;
    } catch (error) {
      console.error('Erro ao buscar case por slug:', error);
      return null;
    }
  }

  async getCaseById(id: string): Promise<CaseStudy | null> {
    try {
      const { data, error } = await this.supabase
        .from('case_studies')
        .select('*')
        .eq('id', id)
        .limit(1);

      if (error) {
        console.error('Erro ao buscar case por ID:', error);
        return null;
      }

      if (!data || data.length === 0) {
        return null; // Not found
      }

      return data[0];
    } catch (error) {
      console.error('Erro ao buscar case por ID:', error);
      return null;
    }
  }

  async getCasesByCategory(category: string): Promise<CaseStudy[]> {
    try {
      let query = this.supabase
        .from('case_studies')
        .select('*')
        .eq('published', true);

      if (category !== 'Todos') {
        query = query.eq('category', category);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar cases por categoria:', error);
      return [];
    }
  }

  async searchCases(query: string): Promise<CaseStudy[]> {
    try {
      const { data, error } = await this.supabase
        .from('case_studies')
        .select('*')
        .eq('published', true)
        .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%,industry.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao pesquisar cases:', error);
      return [];
    }
  }

  async getFeaturedCases(): Promise<CaseStudy[]> {
    try {
      const { data, error } = await this.supabase
        .from('case_studies')
        .select('*')
        .eq('published', true)
        .eq('featured', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar cases em destaque:', error);
      return [];
    }
  }

  async createCase(caseStudy: Omit<CaseStudy, 'id' | 'created_at' | 'updated_at'>): Promise<CaseStudy> {
    try {
      // Gerar slug único se não fornecido
      let slug = caseStudy.slug || this.generateSlug(caseStudy.title);
      
      // Verificar se o slug já existe e gerar um único
      let counter = 1;
      let originalSlug = slug;
      let maxAttempts = 100; // Limite de segurança
      
      while (counter <= maxAttempts) {
        const { data: existingCases, error: checkError } = await this.supabase
          .from('case_studies')
          .select('id')
          .eq('slug', slug)
          .limit(1);
        
        if (checkError) {
          console.error('Erro ao verificar slug único:', checkError);
          break; // Se houver erro, usar o slug atual
        }
        
        if (!existingCases || existingCases.length === 0) {
          break; // Slug é único
        }
        
        slug = `${originalSlug}-${counter}`;
        counter++;
      }
      
      if (counter > maxAttempts) {
        // Se excedeu o limite, adicionar timestamp
        slug = `${originalSlug}-${Date.now()}`;
      }

      const { data, error } = await this.supabase
        .from('case_studies')
        .insert([{
          ...caseStudy,
          slug,
          view_count: 0
        }])
        .select();

      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error('Nenhum dado retornado após inserção');
      }
      
      return data[0];
    } catch (error) {
      console.error('Erro ao criar case:', error);
      throw error;
    }
  }

  async updateCase(id: string, updates: Partial<CaseStudy>): Promise<CaseStudy | null> {
    try {
      // Se título foi alterado, regenerar slug
      const updateData: any = { ...updates };
      if (updates.title && !updates.slug) {
        updateData.slug = this.generateSlug(updates.title);
      }

      const { data, error } = await this.supabase
        .from('case_studies')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Erro ao atualizar case:', error);
        return null;
      }

      if (!data || data.length === 0) {
        return null; // Not found
      }

      return data[0];
    } catch (error) {
      console.error('Erro ao atualizar case:', error);
      throw error;
    }
  }

  async deleteCase(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('case_studies')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar case:', error);
      return false;
    }
  }

  // Método para obter categorias únicas
  async getCategories(): Promise<string[]> {
    return ['GemFlow', 'GemInsights', 'GemMind'];
  }

  // Método para obter estatísticas
  async getStats() {
    try {
      const { data: cases, error } = await this.supabase
        .from('case_studies')
        .select('published, featured, category, view_count');

      if (error) throw error;

      const allCases = cases || [];

      return {
        totalCases: allCases.length,
        publishedCases: allCases.filter(c => c.published).length,
        draftCases: allCases.filter(c => !c.published).length,
        featuredCases: allCases.filter(c => c.featured).length,
        totalViews: allCases.reduce((sum, c) => sum + (c.view_count || 0), 0),
        categories: await this.getCategories(),
        byCategory: {
          GemFlow: allCases.filter(c => c.category === 'GemFlow').length,
          GemInsights: allCases.filter(c => c.category === 'GemInsights').length,
          GemMind: allCases.filter(c => c.category === 'GemMind').length
        }
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de cases:', error);
      return {
        totalCases: 0,
        publishedCases: 0,
        draftCases: 0,
        featuredCases: 0,
        totalViews: 0,
        categories: await this.getCategories(),
        byCategory: {
          GemFlow: 0,
          GemInsights: 0,
          GemMind: 0
        }
      };
    }
  }
}

export const casesService = new CasesService();