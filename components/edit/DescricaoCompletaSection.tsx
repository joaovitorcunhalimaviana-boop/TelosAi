"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface DescricaoCompletaSectionProps {
  patient: any;
  onUpdate: (data: any) => void;
  onComplete: (isComplete: boolean) => void;
}

export function DescricaoCompletaSection({ patient, onUpdate, onComplete }: DescricaoCompletaSectionProps) {
  const [description, setDescription] = useState(patient?.surgicalDescription || '');

  // Check completion - no required fields, always complete
  useEffect(() => {
    onComplete(true);
  }, [onComplete]);

  // Update parent
  useEffect(() => {
    onUpdate({ surgicalDescription: description });
  }, [description, onUpdate]);

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Descrição Completa da Cirurgia</h2>

      <div>
        <Label htmlFor="surgicalDescription" className="text-sm font-medium text-gray-700">
          Descrição Operatória Detalhada
        </Label>
        <p className="text-sm text-gray-600 mt-1 mb-2">
          Descreva detalhadamente todos os procedimentos realizados durante a cirurgia, incluindo:
          posição do paciente, antissepsia, técnica cirúrgica, achados intraoperatórios,
          hemostasia, síntese, curativos e qualquer outra informação relevante.
        </p>

        <Textarea
          id="surgicalDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: Paciente posicionado em decúbito ventral, sob anestesia raquiana. Realizada antissepsia da região perianal com clorexidina alcoólica. Identificadas três mamilos hemorroidários nas posições anterior esquerda, lateral direita e posterior. Realizada hemorroidectomia pela técnica de Ferguson modificada por Campos, utilizando bisturi elétrico para dissecção e hemostasia. Ressecção dos mamilos com preservação da ponte mucosa entre os mesmos. Hemostasia cuidadosa com pontos absorvíveis. Não houve intercorrências. Paciente encaminhado à sala de recuperação em boas condições..."
          className="mt-1 min-h-[400px]"
          rows={20}
        />

        <div className="mt-4 text-sm text-gray-600">
          <p className="font-medium mb-2">Sugestões do que incluir na descrição:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Posicionamento do paciente</li>
            <li>Antissepsia e paramentação</li>
            <li>Achados ao exame físico inicial</li>
            <li>Técnica cirúrgica detalhada (passo a passo)</li>
            <li>Instrumentos e dispositivos utilizados</li>
            <li>Achados intraoperatórios relevantes</li>
            <li>Método de hemostasia</li>
            <li>Técnica de síntese (se aplicável)</li>
            <li>Curativos e drenos (se aplicável)</li>
            <li>Intercorrências ou complicações</li>
            <li>Estado do paciente ao final do procedimento</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4">
        <p className="text-sm text-blue-800">
          <strong>Importante:</strong> Esta é a descrição cirúrgica completa e oficial do
          procedimento. Será utilizada para documentação médica, relatórios e laudos. Seja
          detalhado e preciso nas informações.
        </p>
      </div>
    </Card>
  );
}
