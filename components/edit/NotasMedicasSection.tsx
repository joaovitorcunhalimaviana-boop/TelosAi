"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Stethoscope } from 'lucide-react';

interface NotasMedicasSectionProps {
  patient: any;
  onUpdate: (data: any) => void;
  onComplete: (isComplete: boolean) => void;
}

export function NotasMedicasSection({ patient, onUpdate, onComplete }: NotasMedicasSectionProps) {
  const [doctorNotes, setDoctorNotes] = useState<string>(
    patient?.surgery?.doctorNotes || ''
  );

  // Always complete (optional field)
  useEffect(() => {
    onComplete(true);
  }, [onComplete]);

  // Update parent
  useEffect(() => {
    onUpdate({
      surgery: {
        doctorNotes: doctorNotes || null,
      }
    });
  }, [doctorNotes, onUpdate]);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Stethoscope className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-semibold text-gray-800">Notas do Médico</h2>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-amber-800">
          <strong>Importante:</strong> Orientações escritas aqui têm <strong>prioridade sobre o protocolo padrão</strong> nas
          conversas da IA com o paciente. Use este campo para registrar adaptações específicas para este caso
          (ex: manter compressa gelada ao invés de água morna, trocar medicação, cuidados especiais).
        </p>
      </div>

      <div>
        <Label htmlFor="doctor-notes" className="text-sm font-medium text-gray-700">
          Orientações específicas para este paciente
        </Label>
        <Textarea
          id="doctor-notes"
          value={doctorNotes}
          onChange={(e) => setDoctorNotes(e.target.value)}
          placeholder="Ex: Paciente com inflamação maior que o normal. Manter banho de assento com água gelada em vez de morna. Aumentar frequência de analgésico se necessário."
          className="mt-2 min-h-[150px]"
          rows={6}
        />
        <p className="mt-2 text-xs text-gray-500">
          A IA usará estas notas para adaptar as orientações ao caso específico do paciente, sem contradizer suas instruções.
        </p>
      </div>
    </Card>
  );
}
