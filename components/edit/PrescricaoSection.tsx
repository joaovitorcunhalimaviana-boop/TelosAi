"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2, Plus } from 'lucide-react';

interface PrescricaoSectionProps {
  patient: any;
  onUpdate: (data: any) => void;
  onComplete: (isComplete: boolean) => void;
}

interface Ointment {
  id: string;
  name: string;
  frequency: string;
  duration: string;
}

interface SystemicMedication {
  id: string;
  name: string;
  dose: string;
  route: string;
  frequency: string;
  duration: string;
  category: string;
}

export function PrescricaoSection({ patient, onUpdate, onComplete }: PrescricaoSectionProps) {
  const [ointments, setOintments] = useState<Ointment[]>(
    patient?.prescription?.ointments || [
      { id: crypto.randomUUID(), name: '', frequency: '', duration: '' }
    ]
  );

  const [systemicMeds, setSystemicMeds] = useState<SystemicMedication[]>(
    patient?.prescription?.systemicMeds || [
      { id: crypto.randomUUID(), name: '', dose: '', route: '', frequency: '', duration: '', category: '' }
    ]
  );

  // Check completion - no required fields, always complete
  useEffect(() => {
    onComplete(true);
  }, [onComplete]);

  // Update parent
  useEffect(() => {
    onUpdate({
      prescription: {
        ointments: ointments.filter(o => o.name.trim() !== ''),
        systemicMeds: systemicMeds.filter(m => m.name.trim() !== '')
      }
    });
  }, [ointments, systemicMeds, onUpdate]);

  // Ointment handlers
  const handleOintmentChange = (id: string, field: keyof Ointment, value: string) => {
    setOintments(prev =>
      prev.map(oint => (oint.id === id ? { ...oint, [field]: value } : oint))
    );
  };

  const addOintment = () => {
    setOintments(prev => [
      ...prev,
      { id: crypto.randomUUID(), name: '', frequency: '', duration: '' }
    ]);
  };

  const removeOintment = (id: string) => {
    if (ointments.length > 1) {
      setOintments(prev => prev.filter(oint => oint.id !== id));
    }
  };

  // Systemic medication handlers
  const handleSystemicMedChange = (id: string, field: keyof SystemicMedication, value: string) => {
    setSystemicMeds(prev =>
      prev.map(med => (med.id === id ? { ...med, [field]: value } : med))
    );
  };

  const addSystemicMed = () => {
    setSystemicMeds(prev => [
      ...prev,
      { id: crypto.randomUUID(), name: '', dose: '', route: '', frequency: '', duration: '', category: '' }
    ]);
  };

  const removeSystemicMed = (id: string) => {
    if (systemicMeds.length > 1) {
      setSystemicMeds(prev => prev.filter(med => med.id !== id));
    }
  };

  return (
    <Card className="p-6" style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
      <h2 className="text-2xl font-semibold mb-6" style={{ color: '#F0EAD6' }}>Prescrição Pós-Operatória</h2>

      {/* Ointments/Creams Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold" style={{ color: '#D8DEEB' }}>Pomadas/Cremes</h3>
          <Button onClick={addOintment} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Pomada
          </Button>
        </div>

        <div className="space-y-4">
          {ointments.map((ointment, index) => (
            <div
              key={ointment.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-lg" style={{ backgroundColor: '#0B0E14', border: '1px solid #1E2535' }}
            >
              {/* Ointment Name */}
              <div className="md:col-span-5">
                <Label htmlFor={`oint-name-${ointment.id}`} className="text-sm font-medium" style={{ color: '#7A8299' }}>
                  Pomada {index > 0 && <span className="text-xs" style={{ color: '#7A8299' }}>(#{index + 1})</span>}
                </Label>
                <Select
                  value={ointment.name}
                  onValueChange={(value) => handleOintmentChange(ointment.id, 'name', value)}
                >
                  <SelectTrigger className="mt-1" style={{ backgroundColor: '#161B27', color: '#D8DEEB', borderColor: '#1E2535' }}>
                    <SelectValue placeholder="Selecione a pomada" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lidocaína 5%">Lidocaína 5%</SelectItem>
                    <SelectItem value="Nitroglicerina 0.2%">Nitroglicerina 0.2%</SelectItem>
                    <SelectItem value="Diltiazem 2%">Diltiazem 2%</SelectItem>
                    <SelectItem value="Diltiazem 2% + Lidocaína 2% + Vit E 5% + Metronidazol 10%">
                      Diltiazem 2% + Lidocaína 2% + Vit E 5% + Metronidazol 10%
                    </SelectItem>
                    <SelectItem value="Outra">Outra (especificar nas observações)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Frequency */}
              <div className="md:col-span-3">
                <Label htmlFor={`oint-frequency-${ointment.id}`} className="text-sm font-medium" style={{ color: '#7A8299' }}>
                  Frequência
                </Label>
                <Input
                  id={`oint-frequency-${ointment.id}`}
                  type="text"
                  value={ointment.frequency}
                  onChange={(e) => handleOintmentChange(ointment.id, 'frequency', e.target.value)}
                  placeholder="Ex: 3x/dia"
                  className="mt-1"
                  style={{ backgroundColor: '#161B27', color: '#D8DEEB', borderColor: '#1E2535' }}
                />
              </div>

              {/* Duration */}
              <div className="md:col-span-3">
                <Label htmlFor={`oint-duration-${ointment.id}`} className="text-sm font-medium" style={{ color: '#7A8299' }}>
                  Duração (dias)
                </Label>
                <Input
                  id={`oint-duration-${ointment.id}`}
                  type="number"
                  value={ointment.duration}
                  onChange={(e) => handleOintmentChange(ointment.id, 'duration', e.target.value)}
                  placeholder="Ex: 30"
                  min="1"
                  className="mt-1"
                  style={{ backgroundColor: '#161B27', color: '#D8DEEB', borderColor: '#1E2535' }}
                />
              </div>

              {/* Remove Button */}
              <div className="md:col-span-1 flex items-end">
                <Button
                  onClick={() => removeOintment(ointment.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={ointments.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Systemic Medications Section */}
      <div className="border-t pt-6" style={{ borderColor: '#1E2535' }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold" style={{ color: '#D8DEEB' }}>Medicações Sistêmicas</h3>
          <Button onClick={addSystemicMed} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Medicação
          </Button>
        </div>

        <div className="space-y-4">
          {systemicMeds.map((med, index) => (
            <div
              key={med.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-lg" style={{ backgroundColor: '#0B0E14', border: '1px solid #1E2535' }}
            >
              {/* Medication Name */}
              <div className="md:col-span-3">
                <Label htmlFor={`sysmed-name-${med.id}`} className="text-sm font-medium" style={{ color: '#7A8299' }}>
                  Medicação {index > 0 && <span className="text-xs" style={{ color: '#7A8299' }}>(#{index + 1})</span>}
                </Label>
                <Input
                  id={`sysmed-name-${med.id}`}
                  type="text"
                  value={med.name}
                  onChange={(e) => handleSystemicMedChange(med.id, 'name', e.target.value)}
                  placeholder="Nome da medicação"
                  className="mt-1"
                  style={{ backgroundColor: '#161B27', color: '#D8DEEB', borderColor: '#1E2535' }}
                />
              </div>

              {/* Dose */}
              <div className="md:col-span-2">
                <Label htmlFor={`sysmed-dose-${med.id}`} className="text-sm font-medium" style={{ color: '#7A8299' }}>
                  Dose
                </Label>
                <Input
                  id={`sysmed-dose-${med.id}`}
                  type="text"
                  value={med.dose}
                  onChange={(e) => handleSystemicMedChange(med.id, 'dose', e.target.value)}
                  placeholder="Ex: 500mg"
                  className="mt-1"
                  style={{ backgroundColor: '#161B27', color: '#D8DEEB', borderColor: '#1E2535' }}
                />
              </div>

              {/* Route */}
              <div className="md:col-span-2">
                <Label htmlFor={`sysmed-route-${med.id}`} className="text-sm font-medium" style={{ color: '#7A8299' }}>
                  Via
                </Label>
                <Select
                  value={med.route}
                  onValueChange={(value) => handleSystemicMedChange(med.id, 'route', value)}
                >
                  <SelectTrigger className="mt-1" style={{ backgroundColor: '#161B27', color: '#D8DEEB', borderColor: '#1E2535' }}>
                    <SelectValue placeholder="Via" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VO">VO</SelectItem>
                    <SelectItem value="IV">IV</SelectItem>
                    <SelectItem value="IM">IM</SelectItem>
                    <SelectItem value="SC">SC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Frequency */}
              <div className="md:col-span-2">
                <Label htmlFor={`sysmed-frequency-${med.id}`} className="text-sm font-medium" style={{ color: '#7A8299' }}>
                  Frequência
                </Label>
                <Input
                  id={`sysmed-frequency-${med.id}`}
                  type="text"
                  value={med.frequency}
                  onChange={(e) => handleSystemicMedChange(med.id, 'frequency', e.target.value)}
                  placeholder="Ex: 8/8h"
                  className="mt-1"
                  style={{ backgroundColor: '#161B27', color: '#D8DEEB', borderColor: '#1E2535' }}
                />
              </div>

              {/* Duration */}
              <div className="md:col-span-1">
                <Label htmlFor={`sysmed-duration-${med.id}`} className="text-sm font-medium" style={{ color: '#7A8299' }}>
                  Dias
                </Label>
                <Input
                  id={`sysmed-duration-${med.id}`}
                  type="number"
                  value={med.duration}
                  onChange={(e) => handleSystemicMedChange(med.id, 'duration', e.target.value)}
                  placeholder="7"
                  min="1"
                  className="mt-1"
                  style={{ backgroundColor: '#161B27', color: '#D8DEEB', borderColor: '#1E2535' }}
                />
              </div>

              {/* Category */}
              <div className="md:col-span-2">
                <Label htmlFor={`sysmed-category-${med.id}`} className="text-sm font-medium" style={{ color: '#7A8299' }}>
                  Categoria
                </Label>
                <Select
                  value={med.category}
                  onValueChange={(value) => handleSystemicMedChange(med.id, 'category', value)}
                >
                  <SelectTrigger className="mt-1" style={{ backgroundColor: '#161B27', color: '#D8DEEB', borderColor: '#1E2535' }}>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Analgésico">Analgésico</SelectItem>
                    <SelectItem value="Anti-inflamatório">Anti-inflamatório</SelectItem>
                    <SelectItem value="Antibiótico">Antibiótico</SelectItem>
                    <SelectItem value="Laxante">Laxante</SelectItem>
                    <SelectItem value="Antiemético">Antiemético</SelectItem>
                    <SelectItem value="Protetor gástrico">Protetor gástrico</SelectItem>
                    <SelectItem value="Outra">Outra</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Remove Button */}
              <div className="md:col-span-1 flex items-end">
                <Button
                  onClick={() => removeSystemicMed(med.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={systemicMeds.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 text-sm p-4 rounded" style={{ backgroundColor: '#1E2535', color: '#7A8299' }}>
        <p>
          <strong>Nota:</strong> Esta prescrição refere-se às medicações indicadas para o período
          pós-operatório imediato. Inclua todas as medicações necessárias para controle da dor,
          prevenção de infecção, regulação intestinal e outros cuidados pós-operatórios.
        </p>
      </div>
    </Card>
  );
}
