import { MeetingRequest } from './meetingService';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface EmailServiceResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class EmailService {
  private static readonly API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a91235ef`;
  private static readonly COMPANY_EMAIL = 'intelligemconsultoria@gmail.com';
  private static readonly FROM_EMAIL = 'IntelliGem <noreply@intelligem.com.br>';

  // Template de e-mail interno para a empresa
  static generateInternalNotificationTemplate(meeting: MeetingRequest): EmailTemplate {
    const solutionNames = {
      'GemFlow': 'GemFlow (Automação de Processos)',
      'GemInsights': 'GemInsights (Dashboards e BI)',
      'GemMind': 'GemMind (Modelos de IA)',
      'All': 'Todas as Soluções'
    };

    const typeNames = {
      'consultation': 'Consultoria Estratégica',
      'demonstration': 'Demonstração Técnica',
      'poc': 'Prova de Conceito',
      'implementation': 'Implementação',
      'support': 'Suporte Técnico'
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nova Reunião Agendada</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #030405; color: #ffffff; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #030405 0%, #1a1a1a 100%); border-radius: 12px; padding: 32px; border: 1px solid #31af9d20; }
          .header { text-align: center; margin-bottom: 32px; }
          .logo { font-size: 24px; font-weight: bold; color: #31af9d; margin-bottom: 8px; }
          .title { font-size: 20px; color: #ffffff; margin: 0; }
          .subtitle { color: #94a3b8; margin: 8px 0 0 0; }
          .section { margin: 24px 0; padding: 20px; background: #0f172a; border-radius: 8px; border-left: 4px solid #31af9d; }
          .section-title { font-size: 16px; font-weight: 600; color: #31af9d; margin: 0 0 12px 0; display: flex; align-items: center; }
          .icon { margin-right: 8px; }
          .field { margin: 8px 0; }
          .field-label { font-weight: 500; color: #cbd5e1; margin-right: 8px; }
          .field-value { color: #ffffff; }
          .highlight { background: #31af9d20; padding: 4px 8px; border-radius: 4px; color: #31af9d; font-weight: 500; }
          .timestamp { text-align: center; margin-top: 32px; padding: 16px; background: #0f172a; border-radius: 8px; color: #64748b; font-size: 14px; }
          .footer { text-align: center; margin-top: 24px; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">💎 IntelliGem</div>
            <h1 class="title">🗓️ Nova Reunião Agendada</h1>
            <p class="subtitle">Uma nova reunião foi solicitada através do site</p>
          </div>

          <div class="section">
            <h2 class="section-title">
              <span class="icon">👤</span>
              Dados do Cliente
            </h2>
            <div class="field">
              <span class="field-label">Nome:</span>
              <span class="field-value">${meeting.contact_name}</span>
            </div>
            <div class="field">
              <span class="field-label">E-mail:</span>
              <span class="field-value">${meeting.email}</span>
            </div>
            <div class="field">
              <span class="field-label">Empresa:</span>
              <span class="field-value">${meeting.company}</span>
            </div>
            ${meeting.phone ? `
            <div class="field">
              <span class="field-label">Telefone:</span>
              <span class="field-value">${meeting.phone}</span>
            </div>
            ` : ''}
          </div>

          <div class="section">
            <h2 class="section-title">
              <span class="icon">📋</span>
              Detalhes da Reunião
            </h2>
            <div class="field">
              <span class="field-label">Solução de Interesse:</span>
              <span class="highlight">${solutionNames[meeting.interested_solution] || meeting.interested_solution}</span>
            </div>
            <div class="field">
              <span class="field-label">Tipo de Reunião:</span>
              <span class="field-value">${typeNames[meeting.meeting_type] || meeting.meeting_type}</span>
            </div>
            <div class="field">
              <span class="field-label">Horário Preferido:</span>
              <span class="field-value">${meeting.preferred_time}</span>
            </div>
          </div>

          ${meeting.specific_challenges ? `
          <div class="section">
            <h2 class="section-title">
              <span class="icon">💬</span>
              Desafios Mencionados
            </h2>
            <div class="field-value" style="line-height: 1.6;">
              ${meeting.specific_challenges.replace(/\n/g, '<br>')}
            </div>
          </div>
          ` : ''}

          <div class="section">
            <h2 class="section-title">
              <span class="icon">📊</span>
              Informações de Origem
            </h2>
            <div class="field">
              <span class="field-label">Página de Origem:</span>
              <span class="field-value">${meeting.source_page}</span>
            </div>
            <div class="field">
              <span class="field-label">Status:</span>
              <span class="highlight">Pendente de Confirmação</span>
            </div>
          </div>

          <div class="timestamp">
            📅 Solicitação recebida em: ${new Date().toLocaleString('pt-BR', {
              timeZone: 'America/Sao_Paulo',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>

          <div class="footer">
            Este e-mail foi gerado automaticamente pelo sistema IntelliGem
          </div>
        </div>
      </body>
      </html>
    `;

    return {
      to: this.COMPANY_EMAIL,
      subject: `🗓️ Nova Reunião Agendada - ${meeting.contact_name} (${meeting.company})`,
      html,
      from: this.FROM_EMAIL
    };
  }

  // Template de confirmação para o cliente
  static generateClientConfirmationTemplate(meeting: MeetingRequest): EmailTemplate {
    const solutionNames = {
      'GemFlow': 'GemFlow - Automação de Processos',
      'GemInsights': 'GemInsights - Dashboards e BI',
      'GemMind': 'GemMind - Modelos de IA',
      'All': 'Todas as Nossas Soluções'
    };

    const solutionDescriptions = {
      'GemFlow': 'Automatize processos complexos, reduza tempo de execução e elimine erros manuais com nossa plataforma de automação inteligente.',
      'GemInsights': 'Transforme dados em insights acionáveis com dashboards interativos e análises avançadas de business intelligence.',
      'GemMind': 'Implemente modelos de inteligência artificial personalizados para otimizar operações e tomada de decisões.',
      'All': 'Explore todo nosso ecossistema de soluções integradas para transformação digital completa.'
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reunião Agendada com Sucesso</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f8fafc; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
          .header { text-align: center; margin-bottom: 32px; }
          .logo { font-size: 28px; font-weight: bold; background: linear-gradient(135deg, #31af9d, #136eae); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px; }
          .title { font-size: 24px; color: #1e293b; margin: 0; }
          .subtitle { color: #64748b; margin: 8px 0 0 0; font-size: 16px; }
          .success-badge { display: inline-flex; align-items: center; background: #dcfce7; color: #166534; padding: 8px 16px; border-radius: 50px; font-weight: 500; margin: 16px 0; }
          .section { margin: 24px 0; padding: 24px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #31af9d; }
          .section-title { font-size: 18px; font-weight: 600; color: #31af9d; margin: 0 0 16px 0; display: flex; align-items: center; }
          .icon { margin-right: 8px; font-size: 20px; }
          .field { margin: 12px 0; }
          .field-label { font-weight: 500; color: #475569; margin-right: 8px; }
          .field-value { color: #1e293b; font-weight: 500; }
          .highlight { background: #31af9d; color: white; padding: 6px 12px; border-radius: 6px; font-weight: 500; display: inline-block; }
          .what-to-expect { background: #eff6ff; border-left-color: #3b82f6; }
          .what-to-expect .section-title { color: #1d4ed8; }
          .expectation-list { list-style: none; padding: 0; margin: 0; }
          .expectation-item { padding: 8px 0; display: flex; align-items: flex-start; }
          .expectation-icon { margin-right: 12px; color: #31af9d; font-weight: bold; }
          .cta-section { text-align: center; margin: 32px 0; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #31af9d, #136eae); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; transition: transform 0.2s; }
          .cta-button:hover { transform: translateY(-1px); }
          .team-section { background: #fef3c7; border-left-color: #d97706; }
          .team-section .section-title { color: #92400e; }
          .footer { text-align: center; margin-top: 32px; padding: 24px; background: #f1f5f9; border-radius: 8px; color: #64748b; }
          .footer-links { margin: 16px 0; }
          .footer-link { color: #31af9d; text-decoration: none; margin: 0 8px; }
          .footer-link:hover { text-decoration: underline; }
          .social-links { margin: 16px 0; }
          .social-link { display: inline-block; margin: 0 8px; color: #64748b; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">💎 IntelliGem</div>
            <h1 class="title">✅ Reunião Agendada com Sucesso!</h1>
            <p class="subtitle">Obrigado por agendar uma conversa conosco!</p>
            <div class="success-badge">
              🎉 Agendamento confirmado
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">
              <span class="icon">📅</span>
              Resumo da Sua Reunião
            </h2>
            <div class="field">
              <span class="field-label">Nome:</span>
              <span class="field-value">${meeting.contact_name}</span>
            </div>
            <div class="field">
              <span class="field-label">Empresa:</span>
              <span class="field-value">${meeting.company}</span>
            </div>
            <div class="field">
              <span class="field-label">Data/Hora Preferida:</span>
              <span class="highlight">${meeting.preferred_time}</span>
            </div>
            <div class="field">
              <span class="field-label">Duração:</span>
              <span class="field-value">30-45 minutos</span>
            </div>
            <div class="field">
              <span class="field-label">Formato:</span>
              <span class="field-value">Online via Google Meet</span>
            </div>
            <div class="field">
              <span class="field-label">Foco:</span>
              <span class="field-value">${solutionNames[meeting.interested_solution] || meeting.interested_solution}</span>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">
              <span class="icon">🎯</span>
              Sobre ${solutionNames[meeting.interested_solution] || meeting.interested_solution}
            </h2>
            <p style="line-height: 1.6; color: #475569; margin: 0;">
              ${solutionDescriptions[meeting.interested_solution] || solutionDescriptions['All']}
            </p>
          </div>

          <div class="section what-to-expect">
            <h2 class="section-title">
              <span class="icon">🎯</span>
              O Que Esperar da Nossa Conversa
            </h2>
            <ul class="expectation-list">
              <li class="expectation-item">
                <span class="expectation-icon">✅</span>
                <span>Análise personalizada dos seus desafios e objetivos</span>
              </li>
              <li class="expectation-item">
                <span class="expectation-icon">✅</span>
                <span>Demonstração prática das nossas soluções</span>
              </li>
              <li class="expectation-item">
                <span class="expectation-icon">✅</span>
                <span>Estratégia customizada para sua empresa</span>
              </li>
              <li class="expectation-item">
                <span class="expectation-icon">✅</span>
                <span>Próximos passos recomendados</span>
              </li>
              <li class="expectation-item">
                <span class="expectation-icon">✅</span>
                <span>Estimativa de ROI e cronograma de implementação</span>
              </li>
            </ul>
          </div>

          <div class="section team-section">
            <h2 class="section-title">
              <span class="icon">👨‍💼</span>
              Próximos Passos
            </h2>
            <p style="line-height: 1.6; color: #475569; margin: 0;">
              Nossa equipe de especialistas entrará em contato com você 
              <strong>em até 24 horas</strong> para confirmar os detalhes finais 
              e enviar o link da reunião via Google Meet.
            </p>
          </div>

          <div class="cta-section">
            <p style="color: #64748b; margin-bottom: 16px;">
              Precisa reagendar ou tem alguma dúvida?
            </p>
            <a href="mailto:${this.COMPANY_EMAIL}?subject=Reagendamento - ${meeting.contact_name}" class="cta-button">
              Entre em Contato
            </a>
          </div>

          <div class="footer">
            <div style="font-size: 18px; margin-bottom: 8px;">
              <strong>🤝 IntelliGem - Transformando Dados em Inteligência</strong>
            </div>
            <p style="margin: 8px 0; color: #475569;">
              Especialistas em soluções de dados, automação e inteligência artificial
            </p>
            
            <div class="footer-links">
              <a href="#" class="footer-link">Site</a>
              <a href="#" class="footer-link">Blog</a>
              <a href="#" class="footer-link">Cases de Sucesso</a>
            </div>

            <div class="social-links">
              <a href="#" class="social-link">LinkedIn</a>
              <a href="#" class="social-link">Instagram</a>
              <a href="#" class="social-link">YouTube</a>
            </div>

            <p style="font-size: 12px; color: #94a3b8; margin-top: 16px;">
              Este e-mail foi enviado para ${meeting.email}<br>
              Se você não solicitou esta reunião, pode ignorar este e-mail.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return {
      to: meeting.email,
      subject: `✅ Reunião Agendada com Sucesso - IntelliGem`,
      html,
      from: this.FROM_EMAIL
    };
  }

  // Enviar e-mail através do backend
  static async sendEmail(template: EmailTemplate): Promise<EmailServiceResult> {
    try {
      const response = await fetch(`${this.API_BASE}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(template)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Enviar notificação completa (empresa + cliente)
  static async sendMeetingNotifications(meeting: MeetingRequest): Promise<{
    internal: EmailServiceResult;
    client: EmailServiceResult;
  }> {
    const internalTemplate = this.generateInternalNotificationTemplate(meeting);
    const clientTemplate = this.generateClientConfirmationTemplate(meeting);

    // Enviar e-mails simultaneamente
    const [internalResult, clientResult] = await Promise.all([
      this.sendEmail(internalTemplate),
      this.sendEmail(clientTemplate)
    ]);

    return {
      internal: internalResult,
      client: clientResult
    };
  }

  // Template de lembrete (funcionalidade futura)
  static generateReminderTemplate(meeting: MeetingRequest, hoursUntilMeeting: number): EmailTemplate {
    return {
      to: meeting.email,
      subject: `🔔 Lembrete: Reunião IntelliGem em ${hoursUntilMeeting}h`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>🔔 Sua reunião está próxima!</h2>
          <p>Olá ${meeting.contact_name},</p>
          <p>Este é um lembrete de que nossa reunião está agendada para <strong>${meeting.preferred_time}</strong>.</p>
          <p>Link da reunião: [SERÁ ENVIADO SEPARADAMENTE]</p>
          <p>Estamos ansiosos para nossa conversa!</p>
          <p><strong>Equipe IntelliGem</strong></p>
        </div>
      `,
      from: this.FROM_EMAIL
    };
  }
}