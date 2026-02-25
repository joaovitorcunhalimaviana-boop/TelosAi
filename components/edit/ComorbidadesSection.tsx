"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface ComorbidadesSectionProps {
  patient: any;
  onUpdate: (data: any) => void;
  onComplete: (isComplete: boolean) => void;
}

interface Comorbidade {
  name: string;
  category: string;
  checked: boolean;
  details: string;
}

export function ComorbidadesSection({ patient, onUpdate, onComplete }: ComorbidadesSectionProps) {
  const [comorbidades, setComorbidades] = useState<Comorbidade[]>([
    // Cardiovascular
    { name: 'HAS (Hipertensão Arterial Sistêmica)', category: 'cardiovascular', checked: false, details: '' },
    { name: 'Cardiopatia', category: 'cardiovascular', checked: false, details: '' },
    { name: 'Arritmia', category: 'cardiovascular', checked: false, details: '' },
    { name: 'Insuficiência Cardíaca', category: 'cardiovascular', checked: false, details: '' },
    { name: 'Doença Arterial Coronariana', category: 'cardiovascular', checked: false, details: '' },

    // Metabólica
    { name: 'DM (Diabetes Mellitus)', category: 'metabolica', checked: false, details: '' },
    { name: 'Hipotireoidismo', category: 'metabolica', checked: false, details: '' },
    { name: 'Hipertireoidismo', category: 'metabolica', checked: false, details: '' },
    { name: 'Dislipidemia', category: 'metabolica', checked: false, details: '' },
    { name: 'Obesidade', category: 'metabolica', checked: false, details: '' },

    // Pulmonar
    { name: 'Asma', category: 'pulmonar', checked: false, details: '' },
    { name: 'DPOC (Doença Pulmonar Obstrutiva Crônica)', category: 'pulmonar', checked: false, details: '' },
    { name: 'Apneia do Sono', category: 'pulmonar', checked: false, details: '' },

    // Renal
    { name: 'Doença Renal Crônica', category: 'renal', checked: false, details: '' },
    { name: 'Insuficiência Renal', category: 'renal', checked: false, details: '' },

    // Hepática
    { name: 'Doença Hepática', category: 'hepatica', checked: false, details: '' },
    { name: 'Cirrose', category: 'hepatica', checked: false, details: '' },
    { name: 'Hepatite', category: 'hepatica', checked: false, details: '' },

    // Imunológica
    { name: 'HIV/Imunossupressão', category: 'imunologica', checked: false, details: '' },
    { name: 'Doenças Autoimunes', category: 'imunologica', checked: false, details: '' },

    // Outras
    { name: 'Neoplasia', category: 'outras', checked: false, details: '' },
    { name: 'AVC Prévio', category: 'outras', checked: false, details: '' },
    { name: 'Doença Psiquiátrica', category: 'outras', checked: false, details: '' },
    { name: 'Coagulopatia', category: 'outras', checked: false, details: '' },
  ]);

  const [severity, setSeverity] = useState(patient?.comorbidadesSeverity || 'leve');
  const [otherComorbidities, setOtherComorbidities] = useState(patient?.otherComorbidities || '');

  // Load patient data
  useEffect(() => {
    if (patient?.comorbidades) {
      const updatedComorbidades = comorbidades.map(c => {
        const found = patient.comorbidades.find((pc: any) => pc.name === c.name);
        return found ? { ...c, checked: found.checked, details: found.details } : c;
      });
      setComorbidades(updatedComorbidades);
    }
  }, []);

  // Check completion - no required fields, always complete
  useEffect(() => {
    onComplete(true);
  }, [onComplete]);

  // Update parent
  useEffect(() => {
    onUpdate({
      comorbidades: comorbidades.filter(c => c.checked),
      comorbidadesSeverity: severity,
      otherComorbidities
    });
  }, [comorbidades, severity, otherComorbidities, onUpdate]);

  const handleCheckboxChange = (index: number, checked: boolean) => {
    const updated = [...comorbidades];
    updated[index].checked = checked;
    if (!checked) {
      updated[index].details = ''; // Clear details if unchecked
    }
    setComorbidades(updated);
  };

  const handleDetailsChange = (index: number, details: string) => {
    const updated = [...comorbidades];
    updated[index].details = details;
    setComorbidades(updated);
  };

  const getCategoryTitle = (category: string) => {
    const titles: { [key: string]: string } = {
      cardiovascular: 'Cardiovascular',
      metabolica: 'Metabólica',
      pulmonar: 'Pulmonar',
      renal: 'Renal',
      hepatica: 'Hepática',
      imunologica: 'Imunológica',
      outras: 'Outras'
    };
    return titles[category] || category;
  };

  const categories = ['cardiovascular', 'metabolica', 'pulmonar', 'renal', 'hepatica', 'imunologica', 'outras'];

  return (
    <Card className="p-6" style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
      <h2 className="text-2xl font-semibold mb-6" style={{ color: '#F0EAD6' }}>Comorbidades</h2>

      {/* Severity Selection */}
      <div className="mb-6">
        <Label htmlFor="severity" className="text-sm font-medium" style={{ color: '#7A8299' }}>
          Gravidade Geral das Comorbidades
        </Label>
        <Select value={severity} onValueChange={setSeverity}>
          <SelectTrigger className="mt-1 w-full md:w-64" style={{ backgroundColor: '#161B27', color: '#D8DEEB', borderColor: '#1E2535' }}>
            <SelectValue placeholder="Selecione a gravidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="leve">Leve</SelectItem>
            <SelectItem value="moderada">Moderada</SelectItem>
            <SelectItem value="grave">Grave</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Comorbidities by Category */}
      <div className="space-y-6">
        {categories.map(category => {
          const categoryComorbidades = comorbidades.filter(c => c.category === category);

          return (
            <div key={category} className="border-t pt-4" style={{ borderColor: '#1E2535' }}>
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#D8DEEB' }}>
                {getCategoryTitle(category)}
              </h3>

              <div className="space-y-4">
                {categoryComorbidades.map((comorbidade, idx) => {
                  const globalIndex = comorbidades.findIndex(c => c === comorbidade);

                  return (
                    <div key={globalIndex} className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id={`comorbidade-${globalIndex}`}
                          checked={comorbidade.checked}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange(globalIndex, checked as boolean)
                          }
                          className="mt-1"
                        />
                        <Label
                          htmlFor={`comorbidade-${globalIndex}`}
                          className="text-sm font-medium cursor-pointer flex-1" style={{ color: '#D8DEEB' }}
                        >
                          {comorbidade.name}
                        </Label>
                      </div>

                      {/* Detail field for ALL comorbidities (shown when checked) */}
                      {comorbidade.checked && (
                        <div className="ml-6">
                          <Input
                            type="text"
                            value={comorbidade.details}
                            onChange={(e) => handleDetailsChange(globalIndex, e.target.value)}
                            placeholder="Detalhes (ex: medicações em uso, tempo de doença, etc.)"
                            className="w-full"
                            style={{ backgroundColor: '#161B27', color: '#D8DEEB', borderColor: '#1E2535' }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Other Comorbidities */}
      <div className="mt-6 border-t pt-4" style={{ borderColor: '#1E2535' }}>
        <Label htmlFor="otherComorbidities" className="text-sm font-medium" style={{ color: '#7A8299' }}>
          Outras Comorbidades (não listadas acima)
        </Label>
        <Textarea
          id="otherComorbidities"
          value={otherComorbidities}
          onChange={(e) => setOtherComorbidities(e.target.value)}
          placeholder="Descreva outras comorbidades relevantes..."
          className="mt-1"
          style={{ backgroundColor: '#161B27', color: '#D8DEEB', borderColor: '#1E2535' }}
          rows={3}
        />
      </div>
    </Card>
  );
}
