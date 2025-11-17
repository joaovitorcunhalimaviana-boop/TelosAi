import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * Sistema de Auditoria/Logs para compliance LGPD
 * Registra todas as ações críticas na plataforma
 */

export interface AuditLogData {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  isSensitive?: boolean;
  isDataAccess?: boolean;
}

export class AuditLogger {
  /**
   * Método principal para criar um log de auditoria
   */
  static async log(data: AuditLogData): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          resource: data.resource,
          resourceId: data.resourceId,
          metadata: data.metadata ? (data.metadata as Prisma.JsonObject) : undefined,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          isSensitive: data.isSensitive ?? false,
          isDataAccess: data.isDataAccess ?? false,
        },
      });
    } catch (error) {
      // Log de auditoria não deve quebrar a aplicação
      // Em produção, você pode enviar isso para um serviço de monitoramento
      console.error('Erro ao criar log de auditoria:', error);
    }
  }

  // ============================================
  // MÉTODOS HELPER ESPECÍFICOS
  // ============================================

  /**
   * Log de criação de paciente
   */
  static async patientCreated(params: {
    userId: string;
    patientId: string;
    patientName: string;
    ipAddress: string;
    userAgent: string;
  }): Promise<void> {
    await this.log({
      userId: params.userId,
      action: 'patient.created',
      resource: `Patient:${params.patientId}`,
      resourceId: params.patientId,
      metadata: {
        patientName: params.patientName,
      },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      isSensitive: false,
      isDataAccess: false,
    });
  }

  /**
   * Log de atualização de paciente
   */
  static async patientUpdated(params: {
    userId: string;
    patientId: string;
    patientName: string;
    fieldsUpdated: string[];
    ipAddress: string;
    userAgent: string;
  }): Promise<void> {
    await this.log({
      userId: params.userId,
      action: 'patient.updated',
      resource: `Patient:${params.patientId}`,
      resourceId: params.patientId,
      metadata: {
        patientName: params.patientName,
        fieldsUpdated: params.fieldsUpdated,
      },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      isSensitive: false,
      isDataAccess: false,
    });
  }

  /**
   * Log de visualização de paciente (acesso a dados sensíveis)
   */
  static async patientViewed(params: {
    userId: string;
    patientId: string;
    patientName: string;
    ipAddress: string;
    userAgent: string;
  }): Promise<void> {
    await this.log({
      userId: params.userId,
      action: 'patient.viewed',
      resource: `Patient:${params.patientId}`,
      resourceId: params.patientId,
      metadata: {
        patientName: params.patientName,
      },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      isSensitive: false,
      isDataAccess: true, // Acesso a dados
    });
  }

  /**
   * Log de exportação de dataset (MUITO SENSÍVEL - LGPD)
   */
  static async exportDataset(params: {
    userId: string;
    exportType: string;
    recordCount: number;
    filters?: Record<string, any>;
    ipAddress: string;
    userAgent: string;
  }): Promise<void> {
    await this.log({
      userId: params.userId,
      action: 'export.dataset',
      resource: 'CollectiveIntelligence',
      metadata: {
        exportType: params.exportType,
        recordCount: params.recordCount,
        filters: params.filters,
      },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      isSensitive: true, // Exportação de dados é sensível
      isDataAccess: true,
    });
  }

  /**
   * Log de exportação de pesquisa
   */
  static async exportResearch(params: {
    userId: string;
    researchId: string;
    researchTitle: string;
    exportFormat: string;
    recordCount: number;
    ipAddress: string;
    userAgent: string;
  }): Promise<void> {
    await this.log({
      userId: params.userId,
      action: 'export.research',
      resource: `Research:${params.researchId}`,
      resourceId: params.researchId,
      metadata: {
        researchTitle: params.researchTitle,
        exportFormat: params.exportFormat,
        recordCount: params.recordCount,
      },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      isSensitive: true,
      isDataAccess: true,
    });
  }

  /**
   * Log de assinatura de termo de consentimento
   */
  static async consentSigned(params: {
    userId: string;
    patientId: string;
    termType: string;
    ipAddress: string;
    userAgent: string;
  }): Promise<void> {
    await this.log({
      userId: params.userId,
      action: 'consent.signed',
      resource: `Patient:${params.patientId}`,
      resourceId: params.patientId,
      metadata: {
        termType: params.termType,
      },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      isSensitive: false,
      isDataAccess: false,
    });
  }

  /**
   * Log de análise de follow-up
   */
  static async followUpAnalyzed(params: {
    userId: string;
    followUpId: string;
    patientId: string;
    riskLevel: string;
    ipAddress: string;
    userAgent: string;
  }): Promise<void> {
    await this.log({
      userId: params.userId,
      action: 'followup.analyzed',
      resource: `FollowUp:${params.followUpId}`,
      resourceId: params.followUpId,
      metadata: {
        patientId: params.patientId,
        riskLevel: params.riskLevel,
      },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      isSensitive: false,
      isDataAccess: true,
    });
  }

  /**
   * Log de registro de novo usuário
   */
  static async userRegistered(params: {
    userId: string;
    email: string;
    role: string;
    ipAddress: string;
    userAgent: string;
  }): Promise<void> {
    await this.log({
      userId: params.userId,
      action: 'user.registered',
      resource: `User:${params.userId}`,
      resourceId: params.userId,
      metadata: {
        email: params.email,
        role: params.role,
      },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      isSensitive: false,
      isDataAccess: false,
    });
  }

  /**
   * Log de criação de template
   */
  static async templateCreated(params: {
    userId: string;
    templateId: string;
    templateName: string;
    surgeryType: string;
    ipAddress: string;
    userAgent: string;
  }): Promise<void> {
    await this.log({
      userId: params.userId,
      action: 'template.created',
      resource: `SurgeryTemplate:${params.templateId}`,
      resourceId: params.templateId,
      metadata: {
        templateName: params.templateName,
        surgeryType: params.surgeryType,
      },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      isSensitive: false,
      isDataAccess: false,
    });
  }

  /**
   * Log de criação de protocolo
   */
  static async protocolCreated(params: {
    userId: string;
    protocolId: string;
    title: string;
    surgeryType: string;
    category: string;
    ipAddress: string;
    userAgent: string;
  }): Promise<void> {
    await this.log({
      userId: params.userId,
      action: 'protocol.created',
      resource: `Protocol:${params.protocolId}`,
      resourceId: params.protocolId,
      metadata: {
        title: params.title,
        surgeryType: params.surgeryType,
        category: params.category,
      },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      isSensitive: false,
      isDataAccess: false,
    });
  }

  /**
   * Log de criação de pesquisa
   */
  static async researchCreated(params: {
    userId: string;
    researchId: string;
    title: string;
    surgeryType?: string;
    ipAddress: string;
    userAgent: string;
  }): Promise<void> {
    await this.log({
      userId: params.userId,
      action: 'research.created',
      resource: `Research:${params.researchId}`,
      resourceId: params.researchId,
      metadata: {
        title: params.title,
        surgeryType: params.surgeryType,
      },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      isSensitive: false,
      isDataAccess: false,
    });
  }
}
