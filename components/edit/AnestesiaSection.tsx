"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

interface AnestesiaSectionProps {
  patient: any;
  onUpdate: (data: any) => void;
  onComplete: (isComplete: boolean) => void;
}

export function AnestesiaSection({ patient, onUpdate, onComplete }: AnestesiaSectionProps) {
  // Anesthesia type
  const [anesthesiaType, setAnesthesiaType] = useState(patient?.anesthesia?.type || '');
  const [anesthesiologist, setAnesthesiologist] = useState(patient?.anesthesia?.anesthesiologist || '');

  // Pudendal Block fields
  const [pudendalUsed, setPudendalUsed] = useState(patient?.anesthesia?.pudendalBlock?.used || false);
  const [pudendalTechnique, setPudendalTechnique] = useState(patient?.anesthesia?.pudendalBlock?.technique || '');
  const [pudendalAccess, setPudendalAccess] = useState(patient?.anesthesia?.pudendalBlock?.access || '');
  const [pudendalAnesthetic, setPudendalAnesthetic] = useState(patient?.anesthesia?.pudendalBlock?.anesthetic || '');
  const [pudendalConcentration, setPudendalConcentration] = useState(patient?.anesthesia?.pudendalBlock?.concentration || '');
  const [pudendalVolume, setPudendalVolume] = useState(patient?.anesthesia?.pudendalBlock?.volume || '');
  const [pudendalLaterality, setPudendalLaterality] = useState(patient?.anesthesia?.pudendalBlock?.laterality || '');
  const [pudendalAdjuvants, setPudendalAdjuvants] = useState<string[]>(patient?.anesthesia?.pudendalBlock?.adjuvants || []);
  const [pudendalDetails, setPudendalDetails] = useState(patient?.anesthesia?.pudendalBlock?.details || '');

  // General observations
  const [generalObservations, setGeneralObservations] = useState(patient?.anesthesia?.observations || '');

  // Check completion
  useEffect(() => {
    const isComplete = !!anesthesiaType;
    onComplete(isComplete);
  }, [anesthesiaType, onComplete]);

  // Update parent
  useEffect(() => {
    onUpdate({
      anesthesia: {
        type: anesthesiaType,
        anesthesiologist,
        pudendalBlock: {
          used: pudendalUsed,
          technique: pudendalTechnique,
          access: pudendalAccess,
          anesthetic: pudendalAnesthetic,
          concentration: pudendalConcentration,
          volume: pudendalVolume,
          laterality: pudendalLaterality,
          adjuvants: pudendalAdjuvants,
          details: pudendalDetails
        },
        observations: generalObservations
      }
    });
  }, [anesthesiaType, anesthesiologist, pudendalUsed, pudendalTechnique, pudendalAccess, pudendalAnesthetic, pudendalConcentration, pudendalVolume, pudendalLaterality, pudendalAdjuvants, pudendalDetails, generalObservations, onUpdate]);

  const handleAdjuvantToggle = (adjuvant: string) => {
    setPudendalAdjuvants(prev =>
      prev.includes(adjuvant)
        ? prev.filter(a => a !== adjuvant)
        : [...prev, adjuvant]
    );
  };

  return (
    <Card className="p-6" style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
      <h2 className="text-2xl font-semibold mb-6" style={{ color: '#F0EAD6' }}>Anestesia</h2>

      {/* Anesthesia Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <Label htmlFor="anesthesiaType" className="text-sm font-medium" style={{ color: '#7A8299' }}>
            Tipo de Anestesia <span className="text-red-500">*</span>
          </Label>
          <Select value={anesthesiaType} onValueChange={setAnesthesiaType}>
            <SelectTrigger className="mt-1" style={{ backgroundColor: '#161B27', color: '#D8DEEB', borderColor: '#1E2535' }}>
              <SelectValue placeholder="Selecione o tipo de anestesia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="geral_IOT">Geral com IOT</SelectItem>
              <SelectItem value="geral_mascara">Geral com Máscara</SelectItem>
              <SelectItem value="raqui">Raquianestesia</SelectItem>
              <SelectItem value="peridural">Peridural</SelectItem>
              <SelectItem value="local_sedacao">Local com Sedação</SelectItem>
              <SelectItem value="local">Local</SelectItem>
              <SelectItem value="bloqueio_plexo">Bloqueio de Plexo</SelectItem>
              <SelectItem value="outra">Outra</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="anesthesiologist" className="text-sm font-medium" style={{ color: '#7A8299' }}>
            Nome do Anestesiologista
          </Label>
          <Input
            id="anesthesiologist"
            type="text"
            value={anesthesiologist}
            onChange={(e) => setAnesthesiologist(e.target.value)}
            placeholder="Nome completo"
            className="mt-1"
            style={{ backgroundColor: '#161B27', color: '#D8DEEB', borderColor: '#1E2535' }}
          />
        </div>
      </div>

      {/* Pudendal Block Section */}
      <div className="border-t pt-6" style={{ borderColor: '#1E2535' }}>
        <div className="flex items-center space-x-2 mb-4">
          <Checkbox
            id="pudendalUsed"
            checked={pudendalUsed}
            onCheckedChange={(checked) => setPudendalUsed(checked as boolean)}
          />
          <Label htmlFor="pudendalUsed" className="text-base font-semibold cursor-pointer" style={{ color: '#D8DEEB' }}>
            Bloqueio do Nervo Pudendo
          </Label>
        </div>

        {pudendalUsed && (
          <div className="ml-6 space-y-4 p-4 rounded-lg" style={{ backgroundColor: '#0B0E14', border: '1px solid #1E2535' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Technique */}
              <div>
                <Label htmlFor="pudendalTechnique" className="text-sm font-medium" style={{ color: '#7A8299' }}>
                  Técnica
                </Label>
                <Select value={pudendalTechnique} onValueChange={setPudendalTechnique}>
                  <SelectTrigger className="mt-1" style={{ backgroundColor: '#161B27', color: '#D8DEEB', borderColor: '#1E2535' }}>
                    <SelectValue placeholder="Selecione a técnica" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anatomia">Anatomia (Referências Anatômicas)</SelectItem>
                    <SelectItem value="ultrassom">Ultrassom</SelectItem>
                    <SelectItem value="neuroestimulacao">Neuroestimulação</SelectItem>
                    <SelectItem value="combinado">Combinado (US + Neuroestimulação)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Access */}
              <div>
                <Label htmlFor="pudendalAccess" className="text-sm font-medium" style={{ color: '#7A8299' }}>
                  Via de Acesso
                </Label>
                <Select value={pudendalAccess} onValueChange={setPudendalAccess}>
                  <SelectTrigger className="mt-1" style={{ backgroundColor: '#161B27', color: '#D8DEEB', borderColor: '#1E2535' }}>
                    <SelectValue placeholder="Selecione a via" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transperineal">Transperineal</SelectItem>
                    <SelectItem value="transvaginal">Transvaginal</SelectItem>
                    <SelectItem value="transglutea">Transglútea</SelectItem>
                    <SelectItem value="outra">Outra</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Anesthetic */}
              <div>
                <Label htmlFor="pudendalAnesthetic" className="text-sm font-medium" style={{ color: '#7A8299' }}>
                  Anestésico Utilizado
                </Label>
                <Select value={pudendalAnesthetic} onValueChange={setPudendalAnesthetic}>
                  <SelectTrigger className="mt-1" style={{ backgroundColor: '#161B27', color: '#D8DEEB', borderColor: '#1E2535' }}>
                    <SelectValue placeholder="Selecione o anestésico" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ropivacaina">Ropivacaína</SelectItem>
                    <SelectItem value="bupivacaina">Bupivacaína</SelectItem>
                    <SelectItem value="levobupivacaina">Levobupivacaína</SelectItem>
                    <SelectItem value="lidocaina">Lidocaína</SelectItem>
                    <SelectItem value="outra">Outra</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Concentration */}
              <div>
                <Label htmlFor="pudendalConcentration" className="text-sm font-medium" style={{ color: '#7A8299' }}>
                  Concentração
                </Label>
                <Select value={pudendalConcentration} onValueChange={setPudendalConcentration}>
                  <SelectTrigger className="mt-1" style={{ backgroundColor: '#161B27', color: '#D8DEEB', borderColor: '#1E2535' }}>
                    <SelectValue placeholder="Selecione a concentração" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.25">0.25%</SelectItem>
                    <SelectItem value="0.5">0.5%</SelectItem>
                    <SelectItem value="0.75">0.75%</SelectItem>
                    <SelectItem value="1">1%</SelectItem>
                    <SelectItem value="2">2%</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Volume */}
              <div>
                <Label htmlFor="pudendalVolume" className="text-sm font-medium" style={{ color: '#7A8299' }}>
                  Volume (mL)
                </Label>
                <Input
                  id="pudendalVolume"
                  type="number"
                  value={pudendalVolume}
                  onChange={(e) => setPudendalVolume(e.target.value)}
                  placeholder="Ex: 10"
                  min="0"
                  step="0.5"
                  className="mt-1"
                  style={{ backgroundColor: '#161B27', color: '#D8DEEB', borderColor: '#1E2535' }}
                />
              </div>

              {/* Laterality */}
              <div>
                <Label htmlFor="pudendalLaterality" className="text-sm font-medium" style={{ color: '#7A8299' }}>
                  Lateralidade
                </Label>
                <Select value={pudendalLaterality} onValueChange={setPudendalLaterality}>
                  <SelectTrigger className="mt-1" style={{ backgroundColor: '#161B27', color: '#D8DEEB', borderColor: '#1E2535' }}>
                    <SelectValue placeholder="Selecione a lateralidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bilateral">Bilateral</SelectItem>
                    <SelectItem value="unilateral_direito">Unilateral Direito</SelectItem>
                    <SelectItem value="unilateral_esquerdo">Unilateral Esquerdo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Adjuvants */}
            <div>
              <Label className="text-sm font-medium" style={{ color: '#7A8299' }}>
                Adjuvantes
              </Label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="adjuvant-epinefrina"
                    checked={pudendalAdjuvants.includes('epinefrina')}
                    onCheckedChange={() => handleAdjuvantToggle('epinefrina')}
                  />
                  <Label htmlFor="adjuvant-epinefrina" className="text-sm cursor-pointer">
                    Epinefrina
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="adjuvant-dexametasona"
                    checked={pudendalAdjuvants.includes('dexametasona')}
                    onCheckedChange={() => handleAdjuvantToggle('dexametasona')}
                  />
                  <Label htmlFor="adjuvant-dexametasona" className="text-sm cursor-pointer">
                    Dexametasona
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="adjuvant-clonidina"
                    checked={pudendalAdjuvants.includes('clonidina')}
                    onCheckedChange={() => handleAdjuvantToggle('clonidina')}
                  />
                  <Label htmlFor="adjuvant-clonidina" className="text-sm cursor-pointer">
                    Clonidina
                  </Label>
                </div>
              </div>
            </div>

            {/* Pudendal Details */}
            <div>
              <Label htmlFor="pudendalDetails" className="text-sm font-medium" style={{ color: '#7A8299' }}>
                Detalhes Adicionais do Bloqueio
              </Label>
              <Textarea
                id="pudendalDetails"
                value={pudendalDetails}
                onChange={(e) => setPudendalDetails(e.target.value)}
                placeholder="Observações sobre o bloqueio do nervo pudendo (intercorrências, dificuldades, etc.)"
                className="mt-1"
                style={{ backgroundColor: '#161B27', color: '#D8DEEB', borderColor: '#1E2535' }}
                rows={3}
              />
            </div>

            <div className="mt-3 text-sm p-3 rounded" style={{ backgroundColor: '#1E2535', color: '#14BDAE' }}>
              <p>
                <strong>Nota:</strong> O bloqueio do nervo pudendo é uma técnica anestésica
                importante para controle da dor pós-operatória em cirurgias anorretais.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* General Observations */}
      <div className="border-t pt-4 mt-6" style={{ borderColor: '#1E2535' }}>
        <Label htmlFor="generalObservations" className="text-sm font-medium" style={{ color: '#7A8299' }}>
          Observações Gerais sobre a Anestesia
        </Label>
        <Textarea
          id="generalObservations"
          value={generalObservations}
          onChange={(e) => setGeneralObservations(e.target.value)}
          placeholder="Outras informações relevantes sobre a anestesia (intercorrências, medicações adicionais, etc.)"
          className="mt-1"
          style={{ backgroundColor: '#161B27', color: '#D8DEEB', borderColor: '#1E2535' }}
          rows={4}
        />
      </div>
    </Card>
  );
}
