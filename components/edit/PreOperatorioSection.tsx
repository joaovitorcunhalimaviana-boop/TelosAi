"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

interface PreOperatorioSectionProps {
  patient: any;
  onUpdate: (data: any) => void;
  onComplete: (isComplete: boolean) => void;
}

export function PreOperatorioSection({ patient, onUpdate, onComplete }: PreOperatorioSectionProps) {
  // Botox fields
  const [botoxUsed, setBotoxUsed] = useState(patient?.preOperative?.botox?.used || false);
  const [botoxDate, setBotoxDate] = useState(patient?.preOperative?.botox?.date || '');
  const [botoxDose, setBotoxDose] = useState(patient?.preOperative?.botox?.dose || '');
  const [botoxLocation, setBotoxLocation] = useState(patient?.preOperative?.botox?.location || '');
  const [botoxObservations, setBotoxObservations] = useState(patient?.preOperative?.botox?.observations || '');

  // Intestinal prep fields
  const [intestinalPrepUsed, setIntestinalPrepUsed] = useState(patient?.preOperative?.intestinalPrep?.used || false);
  const [intestinalPrepType, setIntestinalPrepType] = useState(patient?.preOperative?.intestinalPrep?.type || '');

  // Other preparations
  const [otherPreparations, setOtherPreparations] = useState(patient?.preOperative?.otherPreparations || '');

  // Check completion - no required fields, always complete
  useEffect(() => {
    onComplete(true);
  }, [onComplete]);

  // Update parent
  useEffect(() => {
    onUpdate({
      preOperative: {
        botox: {
          used: botoxUsed,
          date: botoxDate,
          dose: botoxDose,
          location: botoxLocation,
          observations: botoxObservations
        },
        intestinalPrep: {
          used: intestinalPrepUsed,
          type: intestinalPrepType
        },
        otherPreparations
      }
    });
  }, [botoxUsed, botoxDate, botoxDose, botoxLocation, botoxObservations, intestinalPrepUsed, intestinalPrepType, otherPreparations, onUpdate]);

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Preparo Pré-Operatório</h2>

      {/* Botox Section */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="botoxUsed"
            checked={botoxUsed}
            onCheckedChange={(checked) => setBotoxUsed(checked as boolean)}
          />
          <Label htmlFor="botoxUsed" className="text-base font-medium text-gray-700 cursor-pointer">
            Uso de Toxina Botulínica (Botox) Pré-Operatória
          </Label>
        </div>

        {botoxUsed && (
          <div className="ml-6 space-y-4 p-4 border rounded-lg bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="botoxDate" className="text-sm font-medium text-gray-700">
                  Data da Aplicação
                </Label>
                <Input
                  id="botoxDate"
                  type="date"
                  value={botoxDate}
                  onChange={(e) => setBotoxDate(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="botoxDose" className="text-sm font-medium text-gray-700">
                  Dose (unidades)
                </Label>
                <Input
                  id="botoxDose"
                  type="number"
                  value={botoxDose}
                  onChange={(e) => setBotoxDose(e.target.value)}
                  placeholder="Ex: 100"
                  min="0"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="botoxLocation" className="text-sm font-medium text-gray-700">
                Local da Aplicação
              </Label>
              <Input
                id="botoxLocation"
                type="text"
                value={botoxLocation}
                onChange={(e) => setBotoxLocation(e.target.value)}
                placeholder="Ex: Esfíncter anal interno"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="botoxObservations" className="text-sm font-medium text-gray-700">
                Observações
              </Label>
              <Textarea
                id="botoxObservations"
                value={botoxObservations}
                onChange={(e) => setBotoxObservations(e.target.value)}
                placeholder="Observações adicionais sobre a aplicação de botox"
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        )}
      </div>

      {/* Intestinal Prep Section */}
      <div className="space-y-4 mb-6 border-t pt-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="intestinalPrepUsed"
            checked={intestinalPrepUsed}
            onCheckedChange={(checked) => setIntestinalPrepUsed(checked as boolean)}
          />
          <Label htmlFor="intestinalPrepUsed" className="text-base font-medium text-gray-700 cursor-pointer">
            Preparo Intestinal Pré-Operatório
          </Label>
        </div>

        {intestinalPrepUsed && (
          <div className="ml-6 p-4 border rounded-lg bg-gray-50">
            <Label htmlFor="intestinalPrepType" className="text-sm font-medium text-gray-700">
              Tipo de Preparo
            </Label>
            <Textarea
              id="intestinalPrepType"
              value={intestinalPrepType}
              onChange={(e) => setIntestinalPrepType(e.target.value)}
              placeholder="Ex: Manitol 10%, Fleet enema, etc."
              className="mt-1"
              rows={3}
            />
          </div>
        )}
      </div>

      {/* Other Preparations */}
      <div className="border-t pt-4">
        <Label htmlFor="otherPreparations" className="text-sm font-medium text-gray-700">
          Outros Preparos Pré-Operatórios
        </Label>
        <Textarea
          id="otherPreparations"
          value={otherPreparations}
          onChange={(e) => setOtherPreparations(e.target.value)}
          placeholder="Descreva quaisquer outros preparos realizados antes da cirurgia (jejum, medicações, profilaxia antibiótica, etc.)"
          className="mt-1"
          rows={4}
        />
      </div>

      <div className="mt-4 text-sm text-gray-600 bg-blue-50 p-3 rounded">
        <p>
          <strong>Nota:</strong> Documente todos os procedimentos e preparos realizados antes da
          cirurgia que possam influenciar o período pós-operatório.
        </p>
      </div>
    </Card>
  );
}
