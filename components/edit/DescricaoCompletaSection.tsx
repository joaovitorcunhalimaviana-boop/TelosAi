"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

interface DescricaoCompletaSectionProps {
  patient: any;
  onUpdate: (data: any) => void;
  onComplete: (isComplete: boolean) => void;
}

export function DescricaoCompletaSection({ patient, onUpdate, onComplete }: DescricaoCompletaSectionProps) {
  const [description, setDescription] = useState(patient?.details?.fullDescription || '');
  const [energyType, setEnergyType] = useState(patient?.details?.hemorrhoidEnergyType || '');
  const [recoveryMin, setRecoveryMin] = useState(patient?.details?.recoveryRoomMinutes || '');
  const [sameDay, setSameDay] = useState(patient?.details?.sameDayDischarge || false);
  const [hospDays, setHospDays] = useState(patient?.details?.hospitalizationDays || '');

  // Use refs to stabilize callbacks
  const onUpdateRef = React.useRef(onUpdate);
  const onCompleteRef = React.useRef(onComplete);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
    onCompleteRef.current = onComplete;
  });

  // Check completion - no required fields, always complete
  useEffect(() => {
    onCompleteRef.current(true);
  }, []);

  // Update parent — emit in the format the API expects (details.*)
  useEffect(() => {
    onUpdateRef.current({
      details: {
        fullDescription: description || null,
        hemorrhoidEnergyType: energyType || null,
        recoveryRoomMinutes: recoveryMin !== '' ? parseInt(String(recoveryMin)) : null,
        sameDayDischarge: sameDay,
        hospitalizationDays: hospDays !== '' ? parseInt(String(hospDays)) : null,
      }
    });
  }, [description, energyType, recoveryMin, sameDay, hospDays]);

  return (
    <Card className="p-6" style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
      <h2 className="text-2xl font-semibold mb-6" style={{ color: '#F0EAD6' }}>Descrição Completa da Cirurgia</h2>

      {/* Main description textarea */}
      <div className="mb-6">
        <Label htmlFor="surgicalDescription" className="text-sm font-medium" style={{ color: '#7A8299' }}>
          Descrição Operatória Detalhada
        </Label>
        <p className="text-sm mt-1 mb-2" style={{ color: '#D8DEEB' }}>
          Descreva o procedimento livremente: técnica cirúrgica, posição dos mamilos, tipo de hemorroida,
          achados intraoperatórios, hemostasia, síntese e qualquer informação relevante.
        </p>

        <Textarea
          id="surgicalDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: Paciente posicionado em decúbito ventral, sob raquianestesia. Realizada antissepsia da região perianal com clorexidina. Identificados três mamilos hemorroidários nas posições anterior esquerda (3h), lateral direita (7h) e posterior (11h). Realizada hemorroidectomia pela técnica de Ferguson modificada por Campos, utilizando bisturi elétrico (LigaSure). Ressecção dos mamilos com preservação da ponte mucosa entre os mesmos. Hemostasia com pontos absorvíveis. Sem intercorrências. Alta no mesmo dia."
          className="mt-1 min-h-[300px]"
          style={{ backgroundColor: '#161B27', color: '#D8DEEB', borderColor: '#1E2535' }}
          rows={15}
        />
      </div>

      {/* Simplified surgical details */}
      <div className="border-t pt-6 space-y-4" style={{ borderColor: '#1E2535' }}>
        <h3 className="text-lg font-semibold" style={{ color: '#D8DEEB' }}>Detalhes Técnicos</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Energy type */}
          <div>
            <Label htmlFor="energyType" className="text-sm font-medium" style={{ color: '#7A8299' }}>
              Tipo de Energia
            </Label>
            <Select value={energyType} onValueChange={setEnergyType}>
              <SelectTrigger className="mt-1" style={{ backgroundColor: '#161B27', color: '#D8DEEB', borderColor: '#1E2535' }}>
                <SelectValue placeholder="Selecione o tipo de energia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bisturi_eletrico">Bisturi Elétrico (Monopolar)</SelectItem>
                <SelectItem value="bipolar">Bipolar</SelectItem>
                <SelectItem value="ligasure">LigaSure</SelectItem>
                <SelectItem value="ultrasonica">Ultrasônica (Harmonic)</SelectItem>
                <SelectItem value="laser_co2">Laser CO₂</SelectItem>
                <SelectItem value="laser_diodo">Laser Diodo</SelectItem>
                <SelectItem value="radiofrequencia">Radiofrequência</SelectItem>
                <SelectItem value="bisturi_frio">Bisturi Frio</SelectItem>
                <SelectItem value="nao_utilizado">Não utilizado / Não se aplica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recovery room */}
          <div>
            <Label htmlFor="recoveryMin" className="text-sm font-medium" style={{ color: '#7A8299' }}>
              Tempo na Sala de Recuperação (minutos)
            </Label>
            <Input
              id="recoveryMin"
              type="number"
              value={recoveryMin}
              onChange={(e) => setRecoveryMin(e.target.value)}
              placeholder="Ex: 60"
              min="0"
              className="mt-1"
              style={{ backgroundColor: '#161B27', color: '#D8DEEB', borderColor: '#1E2535' }}
            />
          </div>
        </div>

        {/* Same day discharge */}
        <div className="flex items-center space-x-2 mt-2">
          <Checkbox
            id="sameDay"
            checked={sameDay}
            onCheckedChange={(checked) => setSameDay(checked as boolean)}
          />
          <Label htmlFor="sameDay" className="text-sm cursor-pointer" style={{ color: '#D8DEEB' }}>
            Alta no Mesmo Dia (cirurgia ambulatorial)
          </Label>
        </div>

        {/* Hospitalization days — only shown when NOT same day */}
        {!sameDay && (
          <div className="mt-2 w-full md:w-64">
            <Label htmlFor="hospDays" className="text-sm font-medium" style={{ color: '#7A8299' }}>
              Dias de Internação
            </Label>
            <Input
              id="hospDays"
              type="number"
              value={hospDays}
              onChange={(e) => setHospDays(e.target.value)}
              placeholder="Ex: 1"
              min="0"
              className="mt-1"
              style={{ backgroundColor: '#161B27', color: '#D8DEEB', borderColor: '#1E2535' }}
            />
          </div>
        )}
      </div>

      <div className="mt-6 border-l-4 p-4" style={{ backgroundColor: '#1E2535', borderColor: '#0D7377' }}>
        <p className="text-sm" style={{ color: '#14BDAE' }}>
          <strong>Importante:</strong> Esta é a descrição cirúrgica completa e oficial do procedimento.
          Será utilizada para documentação médica, relatórios e laudos. Seja detalhado e preciso nas informações.
        </p>
      </div>
    </Card>
  );
}
