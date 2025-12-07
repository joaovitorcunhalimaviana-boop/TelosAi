'use client';

/**
 * FollowUpStatus Component
 * Displays follow-up timeline, status, and actions
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Clock,
  Send,
  XCircle,
  AlertTriangle,
  Eye,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FollowUp {
  id: string;
  dayNumber: number;
  scheduledDate: Date | string;
  status: 'pending' | 'sent' | 'responded' | 'overdue' | 'skipped';
  sentAt?: Date | string | null;
  respondedAt?: Date | string | null;
  responses?: FollowUpResponse[];
}

interface FollowUpResponse {
  id: string;
  createdAt: Date | string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  redFlags?: string | null;
  aiResponse?: string | null;
}

interface FollowUpStatusProps {
  followUps: FollowUp[];
  onResend?: (followUpId: string) => Promise<void>;
  onViewResponses?: (followUpId: string) => void;
  isLoading?: boolean;
}

export function FollowUpStatus({
  followUps,
  onResend,
  onViewResponses,
  isLoading = false,
}: FollowUpStatusProps) {
  const [resendingId, setResendingId] = useState<string | null>(null);

  const handleResend = async (followUpId: string) => {
    if (!onResend) return;

    setResendingId(followUpId);
    try {
      await onResend(followUpId);
    } finally {
      setResendingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Acompanhamento Pós-Operatório</h3>
        <Badge variant="outline">
          {followUps.length} {followUps.length === 1 ? 'Follow-up' : 'Follow-ups'}
        </Badge>
      </div>

      {/* Timeline */}
      <div className="relative space-y-4">
        {followUps.map((followUp, index) => {
          const isLast = index === followUps.length - 1;
          const latestResponse = followUp.responses?.[0];

          return (
            <div key={followUp.id} className="relative">
              {/* Timeline line */}
              {!isLast && (
                <div className="absolute left-4 top-10 h-full w-0.5 bg-border" />
              )}

              <Card className="p-4">
                <div className="flex items-start gap-4">
                  {/* Status Icon */}
                  <div className="relative z-10">
                    <StatusIcon status={followUp.status} riskLevel={latestResponse?.riskLevel} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">Dia {followUp.dayNumber}</h4>
                          <StatusBadge status={followUp.status} />
                          {latestResponse && (
                            <RiskBadge riskLevel={latestResponse.riskLevel} />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <Calendar className="inline h-3 w-3 mr-1" />
                          Agendado para{' '}
                          {format(new Date(followUp.scheduledDate), 'dd/MM/yyyy', {
                            locale: ptBR,
                          })}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {followUp.status === 'responded' && onViewResponses && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onViewResponses(followUp.id)}
                          >
                            <Eye className="h-4 w-4" />
                            Ver respostas
                          </Button>
                        )}

                        {(followUp.status === 'pending' ||
                          followUp.status === 'sent' ||
                          followUp.status === 'overdue') &&
                          onResend && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResend(followUp.id)}
                              disabled={resendingId === followUp.id || isLoading}
                            >
                              <RefreshCw
                                className={`h-4 w-4 ${resendingId === followUp.id ? 'animate-spin' : ''
                                  }`}
                              />
                              {followUp.status === 'pending' ? 'Enviar' : 'Reenviar'}
                            </Button>
                          )}
                      </div>
                    </div>

                    {/* Timestamps */}
                    <div className="text-xs text-muted-foreground space-y-1">
                      {followUp.sentAt && (
                        <div>
                          Enviado em{' '}
                          {format(new Date(followUp.sentAt), "dd/MM/yyyy 'às' HH:mm", {
                            locale: ptBR,
                          })}
                        </div>
                      )}
                      {followUp.respondedAt && (
                        <div>
                          Respondido em{' '}
                          {format(new Date(followUp.respondedAt), "dd/MM/yyyy 'às' HH:mm", {
                            locale: ptBR,
                          })}
                        </div>
                      )}
                    </div>

                    {/* Red Flags */}
                    {latestResponse && latestResponse.redFlags && (
                      <div className="mt-2 p-2 rounded-md bg-destructive/10 border border-destructive/20">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-destructive">
                              Sinais de alerta detectados:
                            </p>
                            <ul className="text-xs mt-1 space-y-0.5">
                              {JSON.parse(latestResponse.redFlags).map(
                                (flag: string, i: number) => (
                                  <li key={i}>• {flag}</li>
                                )
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      {followUps.length === 0 && (
        <Card className="p-8 text-center">
          <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Nenhum follow-up agendado ainda.
          </p>
        </Card>
      )}
    </div>
  );
}

/**
 * Status Icon Component
 */
function StatusIcon({
  status,
  riskLevel,
}: {
  status: string;
  riskLevel?: string;
}) {
  const iconClassName = 'h-8 w-8';

  switch (status) {
    case 'responded':
      if (riskLevel === 'critical' || riskLevel === 'high') {
        return <AlertTriangle className={`${iconClassName} text-destructive`} />;
      }
      return <CheckCircle2 className={`${iconClassName} text-green-500`} />;

    case 'sent':
      return <Send className={`${iconClassName} text-blue-500`} />;

    case 'overdue':
      return <XCircle className={`${iconClassName} text-orange-500`} />;

    case 'skipped':
      return <XCircle className={`${iconClassName} text-gray-400`} />;

    case 'pending':
    default:
      return <Clock className={`${iconClassName} text-gray-400`} />;
  }
}

/**
 * Status Badge Component
 */
function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending: { label: 'Pendente', variant: 'secondary' },
    sent: { label: 'Enviado', variant: 'default' },
    responded: { label: 'Respondido', variant: 'default' },
    overdue: { label: 'Atrasado', variant: 'destructive' },
    skipped: { label: 'Pulado', variant: 'outline' },
  };

  const config = variants[status] || { label: status, variant: 'outline' };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

/**
 * Risk Badge Component
 */
function RiskBadge({ riskLevel }: { riskLevel: string }) {
  const variants: Record<
    string,
    { label: string; className: string }
  > = {
    low: {
      label: 'Baixo risco',
      className: 'bg-green-100 text-green-800 border-green-200',
    },
    medium: {
      label: 'Risco moderado',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    high: {
      label: 'Risco alto',
      className: 'bg-orange-100 text-orange-800 border-orange-200',
    },
    critical: {
      label: 'Risco crítico',
      className: 'bg-red-100 text-red-800 border-red-200',
    },
  };

  const config = variants[riskLevel] || {
    label: riskLevel,
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
