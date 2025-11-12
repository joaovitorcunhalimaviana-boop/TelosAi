"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2, Plus } from 'lucide-react';

interface MedicacoesSectionProps {
  patient: any;
  onUpdate: (data: any) => void;
  onComplete: (isComplete: boolean) => void;
}

interface Medication {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  route: string;
}

export function MedicacoesSection({ patient, onUpdate, onComplete }: MedicacoesSectionProps) {
  const [medications, setMedications] = useState<Medication[]>(
    patient?.currentMedications || [
      { id: crypto.randomUUID(), name: '', dose: '', frequency: '', route: '' }
    ]
  );

  // Check completion - no required fields, always complete
  useEffect(() => {
    onComplete(true);
  }, [onComplete]);

  // Update parent
  useEffect(() => {
    onUpdate({ currentMedications: medications.filter(m => m.name.trim() !== '') });
  }, [medications, onUpdate]);

  const handleMedicationChange = (id: string, field: keyof Medication, value: string) => {
    setMedications(prev =>
      prev.map(med => (med.id === id ? { ...med, [field]: value } : med))
    );
  };

  const addMedication = () => {
    setMedications(prev => [
      ...prev,
      { id: crypto.randomUUID(), name: '', dose: '', frequency: '', route: '' }
    ]);
  };

  const removeMedication = (id: string) => {
    if (medications.length > 1) {
      setMedications(prev => prev.filter(med => med.id !== id));
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Medicações em Uso</h2>
        <Button onClick={addMedication} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Medicação
        </Button>
      </div>

      <div className="space-y-4">
        {medications.map((medication, index) => (
          <div
            key={medication.id}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-lg bg-gray-50"
          >
            {/* Medication Name */}
            <div className="md:col-span-4">
              <Label htmlFor={`med-name-${medication.id}`} className="text-sm font-medium text-gray-700">
                Medicação {index > 0 && <span className="text-gray-500 text-xs">(#{index + 1})</span>}
              </Label>
              <Input
                id={`med-name-${medication.id}`}
                type="text"
                value={medication.name}
                onChange={(e) => handleMedicationChange(medication.id, 'name', e.target.value)}
                placeholder="Nome da medicação"
                className="mt-1"
              />
            </div>

            {/* Dose */}
            <div className="md:col-span-2">
              <Label htmlFor={`med-dose-${medication.id}`} className="text-sm font-medium text-gray-700">
                Dose
              </Label>
              <Input
                id={`med-dose-${medication.id}`}
                type="text"
                value={medication.dose}
                onChange={(e) => handleMedicationChange(medication.id, 'dose', e.target.value)}
                placeholder="Ex: 10mg"
                className="mt-1"
              />
            </div>

            {/* Frequency */}
            <div className="md:col-span-2">
              <Label htmlFor={`med-frequency-${medication.id}`} className="text-sm font-medium text-gray-700">
                Frequência
              </Label>
              <Input
                id={`med-frequency-${medication.id}`}
                type="text"
                value={medication.frequency}
                onChange={(e) => handleMedicationChange(medication.id, 'frequency', e.target.value)}
                placeholder="Ex: 2x/dia"
                className="mt-1"
              />
            </div>

            {/* Route */}
            <div className="md:col-span-3">
              <Label htmlFor={`med-route-${medication.id}`} className="text-sm font-medium text-gray-700">
                Via
              </Label>
              <Select
                value={medication.route}
                onValueChange={(value) => handleMedicationChange(medication.id, 'route', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VO">VO (Via Oral)</SelectItem>
                  <SelectItem value="IV">IV (Intravenosa)</SelectItem>
                  <SelectItem value="IM">IM (Intramuscular)</SelectItem>
                  <SelectItem value="SC">SC (Subcutânea)</SelectItem>
                  <SelectItem value="Topica">Tópica</SelectItem>
                  <SelectItem value="Sublingual">Sublingual</SelectItem>
                  <SelectItem value="Retal">Retal</SelectItem>
                  <SelectItem value="Inalatoria">Inalatória</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Remove Button */}
            <div className="md:col-span-1 flex items-end">
              <Button
                onClick={() => removeMedication(medication.id)}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={medications.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {medications.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhuma medicação adicionada.</p>
          <Button onClick={addMedication} variant="outline" className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Primeira Medicação
          </Button>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p>
          <strong>Nota:</strong> Liste apenas as medicações em uso contínuo pelo paciente antes da
          cirurgia. As prescrições pós-operatórias serão registradas em outra seção.
        </p>
      </div>
    </Card>
  );
}
