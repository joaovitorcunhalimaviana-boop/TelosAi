import { Patient, Surgery } from '@prisma/client';

// ============================================
// PAGINATION HELPERS
// ============================================

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResult {
  skip: number;
  take: number;
}

export function paginate(page: number = 1, limit: number = 10): PaginationResult {
  const validPage = Math.max(1, page);
  const validLimit = Math.min(Math.max(1, limit), 100); // Max 100 items per page

  return {
    skip: (validPage - 1) * validLimit,
    take: validLimit,
  };
}

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
) {
  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

// ============================================
// SEARCH QUERY BUILDER
// ============================================

export function buildSearchQuery(search: string) {
  if (!search || search.trim() === '') {
    return {};
  }

  const searchTerm = search.trim();

  return {
    OR: [
      { name: { contains: searchTerm, mode: 'insensitive' as const } },
      { phone: { contains: searchTerm } },
      { cpf: { contains: searchTerm } },
    ],
  };
}

// ============================================
// COMPLETENESS CALCULATOR
// ============================================

export interface PatientWithRelations {
  comorbidities?: any[];
  medications?: any[];
  surgery?: {
    details?: any;
    anesthesia?: any;
    preOp?: any;
    postOp?: any;
  } | null;
}

export function calculateCompleteness(patient: PatientWithRelations): number {
  let percentage = 20; // Base from express form

  // +10% if comorbidities filled
  if (patient.comorbidities && patient.comorbidities.length > 0) {
    percentage += 10;
  }

  // +10% if medications filled
  if (patient.medications && patient.medications.length > 0) {
    percentage += 10;
  }

  // +20% if surgery details filled
  if (patient.surgery?.details) {
    percentage += 20;
  }

  // +15% if anesthesia filled
  if (patient.surgery?.anesthesia) {
    percentage += 15;
  }

  // +10% if pre-op filled
  if (patient.surgery?.preOp) {
    percentage += 10;
  }

  // +10% if prescription filled
  if (patient.surgery?.postOp) {
    percentage += 10;
  }

  // +5% if full description filled
  if (patient.surgery?.details?.fullDescription) {
    percentage += 5;
  }

  return Math.min(percentage, 100);
}

// ============================================
// VALIDATION HELPERS
// ============================================

export function isValidCuid(id: string): boolean {
  // CUID format: c + 24 alphanumeric characters
  return /^c[a-z0-9]{24}$/i.test(id);
}

export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

// ============================================
// ERROR RESPONSE BUILDER
// ============================================

export interface ApiError {
  error: string;
  details?: string;
  code?: string;
}

export function buildErrorResponse(
  error: string,
  details?: string,
  code?: string
): ApiError {
  return {
    error,
    details,
    code,
  };
}

// ============================================
// FILTER BUILDERS
// ============================================

export interface PatientFilters {
  surgeryType?: string;
  status?: string;
  completeness?: string; // low (<50), medium (50-79), high (>=80)
  dateFrom?: string;
  dateTo?: string;
}

export function buildPatientFilters(filters: PatientFilters) {
  const where: any = {};

  if (filters.surgeryType) {
    where.surgeries = {
      some: {
        type: filters.surgeryType,
      },
    };
  }

  if (filters.status) {
    where.surgeries = {
      some: {
        ...where.surgeries?.some,
        status: filters.status,
      },
    };
  }

  if (filters.dateFrom || filters.dateTo) {
    where.surgeries = {
      some: {
        ...where.surgeries?.some,
        date: {
          ...(filters.dateFrom && { gte: new Date(filters.dateFrom) }),
          ...(filters.dateTo && { lte: new Date(filters.dateTo) }),
        },
      },
    };
  }

  return where;
}

export function buildCompletenessFilter(completeness: string) {
  switch (completeness) {
    case 'low':
      return { lt: 50 };
    case 'medium':
      return { gte: 50, lt: 80 };
    case 'high':
      return { gte: 80 };
    default:
      return undefined;
  }
}

// ============================================
// TIMELINE HELPERS
// ============================================

export interface TimelineEvent {
  id: string;
  type: 'surgery' | 'followup' | 'consent' | 'update';
  date: Date;
  title: string;
  description: string;
  metadata?: any;
}

export function buildTimelineEvents(patient: any): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  // Add surgery event
  if (patient.surgeries && patient.surgeries.length > 0) {
    patient.surgeries.forEach((surgery: any) => {
      events.push({
        id: surgery.id,
        type: 'surgery',
        date: surgery.date,
        title: `Cirurgia: ${surgery.type}`,
        description: surgery.hospital || 'Hospital não informado',
        metadata: {
          durationMinutes: surgery.durationMinutes,
          dataCompleteness: surgery.dataCompleteness,
        },
      });
    });
  }

  // Add follow-up events
  if (patient.followUps && patient.followUps.length > 0) {
    patient.followUps.forEach((followUp: any) => {
      events.push({
        id: followUp.id,
        type: 'followup',
        date: followUp.respondedAt || followUp.sentAt || followUp.scheduledDate,
        title: `Follow-up D+${followUp.dayNumber}`,
        description: `Status: ${followUp.status}`,
        metadata: {
          dayNumber: followUp.dayNumber,
          status: followUp.status,
          responseCount: followUp.responses?.length || 0,
        },
      });
    });
  }

  // Add consent terms
  if (patient.consentTerms && patient.consentTerms.length > 0) {
    patient.consentTerms.forEach((consent: any) => {
      events.push({
        id: consent.id,
        type: 'consent',
        date: consent.signedDate || consent.createdAt,
        title: `Termo: ${consent.termType}`,
        description: consent.signedPhysically ? 'Assinado fisicamente' : 'Não assinado',
        metadata: {
          termType: consent.termType,
          signedPhysically: consent.signedPhysically,
        },
      });
    });
  }

  // Sort by date (newest first)
  events.sort((a, b) => b.date.getTime() - a.date.getTime());

  return events;
}

// ============================================
// SANITIZATION
// ============================================

export function sanitizeInput(input: string): string {
  // Remove potential SQL injection characters and XSS
  return input.trim().replace(/[<>\"'`;]/g, '');
}

export function sanitizeSearchTerm(search: string): string {
  // Allow only alphanumeric, spaces, and common punctuation
  return search.trim().replace(/[^a-zA-Z0-9\s\-_@.]/g, '');
}
