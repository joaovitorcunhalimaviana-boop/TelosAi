"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

interface DetalhesCirurgicosSectionProps {
  patient: any;
  onUpdate: (data: any) => void;
  onComplete: (isComplete: boolean) => void;
}

export function DetalhesCirurgicosSection({ patient, onUpdate, onComplete }: DetalhesCirurgicosSectionProps) {
  const [surgeryType, setSurgeryType] = useState(patient?.surgeryType || 'hemorroidectomia');

  // Hemorrhoidectomy fields
  const [techniques, setTechniques] = useState<string[]>(patient?.hemorrhoidectomy?.techniques || []);
  const [energyType, setEnergyType] = useState(patient?.hemorrhoidectomy?.energyType || '');
  const [mamillaeResected, setMamillaeResected] = useState(patient?.hemorrhoidectomy?.mamillaeResected || '');
  const [mamillaePositions, setMamillaePositions] = useState(patient?.hemorrhoidectomy?.mamillaePositions || '');
  const [hemorrhoidType, setHemorrhoidType] = useState(patient?.hemorrhoidectomy?.type || '');
  const [internalGrade, setInternalGrade] = useState(patient?.hemorrhoidectomy?.internalGrade || '');
  const [externalDetails, setExternalDetails] = useState(patient?.hemorrhoidectomy?.externalDetails || '');

  // Fistula fields
  const [fistulaType, setFistulaType] = useState(patient?.fistula?.type || '');
  const [fistulaTechnique, setFistulaTechnique] = useState(patient?.fistula?.technique || '');
  const [fistulaTracts, setFistulaTracts] = useState(patient?.fistula?.tracts || '');
  const [setonUsed, setSetonUsed] = useState(patient?.fistula?.setonUsed || false);
  const [setonMaterial, setSetonMaterial] = useState(patient?.fistula?.setonMaterial || '');

  // Fissure fields
  const [fissureType, setFissureType] = useState(patient?.fissure?.type || '');
  const [fissureLocation, setFissureLocation] = useState(patient?.fissure?.location || '');
  const [fissureTechniques, setFissureTechniques] = useState(patient?.fissure?.techniques || '');

  // Pilonidal fields
  const [pilonidalTechnique, setPilonidalTechnique] = useState(patient?.pilonidal?.technique || '');

  // Common fields
  const [complications, setComplications] = useState(patient?.surgicalComplications || '');
  const [recoveryMinutes, setRecoveryMinutes] = useState(patient?.recoveryRoomMinutes || '');
  const [sameDayDischarge, setSameDayDischarge] = useState(patient?.sameDayDischarge || false);
  const [hospitalizationDays, setHospitalizationDays] = useState(patient?.hospitalizationDays || '');

  // Use refs to stabilize callbacks
  const onUpdateRef = React.useRef(onUpdate);
  const onCompleteRef = React.useRef(onComplete);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
    onCompleteRef.current = onComplete;
  });

  // Check completion
  useEffect(() => {
    let isComplete = false;

    if (surgeryType === 'hemorroidectomia') {
      isComplete = !!(techniques.length > 0 && energyType && mamillaeResected);
    } else if (surgeryType === 'fistula') {
      isComplete = !!(fistulaType && fistulaTechnique);
    } else if (surgeryType === 'fissura') {
      isComplete = !!(fissureType && fissureLocation);
    } else if (surgeryType === 'cisto_pilonidal') {
      isComplete = !!pilonidalTechnique;
    }

    onCompleteRef.current(isComplete);
  }, [surgeryType, techniques, energyType, mamillaeResected, fistulaType, fistulaTechnique, fissureType, fissureLocation, pilonidalTechnique]);

  // Update parent
  useEffect(() => {
    const data: any = {
      surgeryType,
      surgicalComplications: complications,
      recoveryRoomMinutes: recoveryMinutes,
      sameDayDischarge,
      hospitalizationDays
    };

    if (surgeryType === 'hemorroidectomia') {
      data.hemorrhoidectomy = {
        techniques,
        energyType,
        mamillaeResected,
        mamillaePositions,
        type: hemorrhoidType,
        internalGrade,
        externalDetails
      };
    } else if (surgeryType === 'fistula') {
      data.fistula = {
        type: fistulaType,
        technique: fistulaTechnique,
        tracts: fistulaTracts,
        setonUsed,
        setonMaterial
      };
    } else if (surgeryType === 'fissura') {
      data.fissure = {
        type: fissureType,
        location: fissureLocation,
        techniques: fissureTechniques
      };
    } else if (surgeryType === 'cisto_pilonidal') {
      data.pilonidal = {
        technique: pilonidalTechnique
      };
    }

    onUpdateRef.current(data);
  }, [surgeryType, techniques, energyType, mamillaeResected, mamillaePositions, hemorrhoidType, internalGrade, externalDetails, fistulaType, fistulaTechnique, fistulaTracts, setonUsed, setonMaterial, fissureType, fissureLocation, fissureTechniques, pilonidalTechnique, complications, recoveryMinutes, sameDayDischarge, hospitalizationDays]);

  const handleTechniqueToggle = (technique: string) => {
    setTechniques(prev =>
      prev.includes(technique)
        ? prev.filter(t => t !== technique)
        : [...prev, technique]
    );
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Detalhes Cirúrgicos</h2>

      {/* Surgery Type */}
      <div className="mb-6">
        <Label htmlFor="surgeryType" className="text-sm font-medium text-gray-700">
          Tipo de Cirurgia <span className="text-red-500">*</span>
        </Label>
        <Select value={surgeryType} onValueChange={setSurgeryType}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Selecione o tipo de cirurgia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hemorroidectomia">Hemorroidectomia</SelectItem>
            <SelectItem value="fistula">Fístula Anorretal</SelectItem>
            <SelectItem value="fissura">Fissura Anal</SelectItem>
            <SelectItem value="cisto_pilonidal">Cisto Pilonidal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Hemorrhoidectomy Details */}
      {surgeryType === 'hemorroidectomia' && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-700">Detalhes da Hemorroidectomia</h3>

          {/* Technique (multi-select) */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Técnica Cirúrgica <span className="text-red-500">*</span>
            </Label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tech-ferguson"
                  checked={techniques.includes('ferguson_modificada_campos')}
                  onCheckedChange={() => handleTechniqueToggle('ferguson_modificada_campos')}
                />
                <Label htmlFor="tech-ferguson" className="text-sm cursor-pointer">
                  Ferguson modificada por Campos
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tech-milligan"
                  checked={techniques.includes('milligan_morgan')}
                  onCheckedChange={() => handleTechniqueToggle('milligan_morgan')}
                />
                <Label htmlFor="tech-milligan" className="text-sm cursor-pointer">
                  Milligan-Morgan
                </Label>
              </div>
            </div>
          </div>

          {/* Energy Type */}
          <div>
            <Label htmlFor="energyType" className="text-sm font-medium text-gray-700">
              Tipo de Energia <span className="text-red-500">*</span>
            </Label>
            <Select value={energyType} onValueChange={setEnergyType}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione o tipo de energia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bisturi_eletrico">Bisturi Elétrico</SelectItem>
                <SelectItem value="bipolar">Bipolar</SelectItem>
                <SelectItem value="ligasure">LigaSure</SelectItem>
                <SelectItem value="ultrasonica">Ultrasônica</SelectItem>
                <SelectItem value="laser_co2">Laser CO2</SelectItem>
                <SelectItem value="laser_diodo">Laser Diodo</SelectItem>
                <SelectItem value="radiofrequencia">Radiofrequência</SelectItem>
                <SelectItem value="bisturi_frio">Bisturi Frio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Number of Mamillae Resected */}
          <div>
            <Label htmlFor="mamillaeResected" className="text-sm font-medium text-gray-700">
              Número de Mamilos Ressecados <span className="text-red-500">*</span>
            </Label>
            <Input
              id="mamillaeResected"
              type="number"
              value={mamillaeResected}
              onChange={(e) => setMamillaeResected(e.target.value)}
              placeholder="Ex: 3"
              min="1"
              max="10"
              className="mt-1"
            />
          </div>

          {/* Mamillae Positions (FREE TEXT) */}
          <div>
            <Label htmlFor="mamillaePositions" className="text-sm font-medium text-gray-700">
              Posições dos Mamilos
            </Label>
            <Input
              id="mamillaePositions"
              type="text"
              value={mamillaePositions}
              onChange={(e) => setMamillaePositions(e.target.value)}
              placeholder="Ex: anterior esquerda, posterior direita, lateral direita"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Descreva livremente as posições dos mamilos ressecados
            </p>
          </div>

          {/* Hemorrhoid Type */}
          <div>
            <Label htmlFor="hemorrhoidType" className="text-sm font-medium text-gray-700">
              Tipo de Hemorroida
            </Label>
            <Select value={hemorrhoidType} onValueChange={setHemorrhoidType}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="interna">Interna</SelectItem>
                <SelectItem value="externa">Externa</SelectItem>
                <SelectItem value="mista">Mista</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Internal Grade (if internal or mixed) */}
          {(hemorrhoidType === 'interna' || hemorrhoidType === 'mista') && (
            <div>
              <Label htmlFor="internalGrade" className="text-sm font-medium text-gray-700">
                Grau da Hemorroida Interna
              </Label>
              <Select value={internalGrade} onValueChange={setInternalGrade}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o grau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="I">Grau I</SelectItem>
                  <SelectItem value="II">Grau II</SelectItem>
                  <SelectItem value="III">Grau III</SelectItem>
                  <SelectItem value="IV">Grau IV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* External Details */}
          {(hemorrhoidType === 'externa' || hemorrhoidType === 'mista') && (
            <div>
              <Label htmlFor="externalDetails" className="text-sm font-medium text-gray-700">
                Detalhes da Hemorroida Externa
              </Label>
              <Textarea
                id="externalDetails"
                value={externalDetails}
                onChange={(e) => setExternalDetails(e.target.value)}
                placeholder="Descreva características da hemorroida externa (tamanho, trombose, etc.)"
                className="mt-1"
                rows={3}
              />
            </div>
          )}
        </div>
      )}

      {/* Fistula Details */}
      {surgeryType === 'fistula' && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-700">Detalhes da Fístula Anorretal</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fistulaType" className="text-sm font-medium text-gray-700">
                Tipo de Fístula <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fistulaType"
                type="text"
                value={fistulaType}
                onChange={(e) => setFistulaType(e.target.value)}
                placeholder="Ex: Interesfincteriana"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="fistulaTechnique" className="text-sm font-medium text-gray-700">
                Técnica <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fistulaTechnique"
                type="text"
                value={fistulaTechnique}
                onChange={(e) => setFistulaTechnique(e.target.value)}
                placeholder="Ex: Fistulotomia"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="fistulaTracts" className="text-sm font-medium text-gray-700">
                Número de Trajetos
              </Label>
              <Input
                id="fistulaTracts"
                type="number"
                value={fistulaTracts}
                onChange={(e) => setFistulaTracts(e.target.value)}
                placeholder="Ex: 1"
                min="1"
                className="mt-1"
              />
            </div>

            <div>
              <div className="flex items-center space-x-2 mt-6">
                <Checkbox
                  id="setonUsed"
                  checked={setonUsed}
                  onCheckedChange={(checked) => setSetonUsed(checked as boolean)}
                />
                <Label htmlFor="setonUsed" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Uso de Seton
                </Label>
              </div>
            </div>
          </div>

          {setonUsed && (
            <div>
              <Label htmlFor="setonMaterial" className="text-sm font-medium text-gray-700">
                Material do Seton
              </Label>
              <Input
                id="setonMaterial"
                type="text"
                value={setonMaterial}
                onChange={(e) => setSetonMaterial(e.target.value)}
                placeholder="Ex: Fio de algodão, silicone"
                className="mt-1"
              />
            </div>
          )}
        </div>
      )}

      {/* Fissure Details */}
      {surgeryType === 'fissura' && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-700">Detalhes da Fissura Anal</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fissureType" className="text-sm font-medium text-gray-700">
                Tipo de Fissura <span className="text-red-500">*</span>
              </Label>
              <Select value={fissureType} onValueChange={setFissureType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aguda">Aguda</SelectItem>
                  <SelectItem value="cronica">Crônica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="fissureLocation" className="text-sm font-medium text-gray-700">
                Localização <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fissureLocation"
                type="text"
                value={fissureLocation}
                onChange={(e) => setFissureLocation(e.target.value)}
                placeholder="Ex: Posterior, Anterior"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="fissureTechniques" className="text-sm font-medium text-gray-700">
              Técnicas Realizadas
            </Label>
            <Textarea
              id="fissureTechniques"
              value={fissureTechniques}
              onChange={(e) => setFissureTechniques(e.target.value)}
              placeholder="Ex: Esfincterotomia lateral interna, Fissurectomia"
              className="mt-1"
              rows={3}
            />
          </div>
        </div>
      )}

      {/* Pilonidal Details */}
      {surgeryType === 'cisto_pilonidal' && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-700">Detalhes do Cisto Pilonidal</h3>

          <div>
            <Label htmlFor="pilonidalTechnique" className="text-sm font-medium text-gray-700">
              Técnica Cirúrgica <span className="text-red-500">*</span>
            </Label>
            <Input
              id="pilonidalTechnique"
              type="text"
              value={pilonidalTechnique}
              onChange={(e) => setPilonidalTechnique(e.target.value)}
              placeholder="Ex: Excisão com fechamento primário"
              className="mt-1"
            />
          </div>
        </div>
      )}

      {/* Common Fields */}
      <div className="space-y-4 border-t pt-4 mt-6">
        <h3 className="text-lg font-semibold text-gray-700">Informações Gerais</h3>

        <div>
          <Label htmlFor="complications" className="text-sm font-medium text-gray-700">
            Complicações Intraoperatórias
          </Label>
          <Textarea
            id="complications"
            value={complications}
            onChange={(e) => setComplications(e.target.value)}
            placeholder="Descreva quaisquer complicações ocorridas durante a cirurgia"
            className="mt-1"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="recoveryMinutes" className="text-sm font-medium text-gray-700">
              Tempo na Sala de Recuperação (minutos)
            </Label>
            <Input
              id="recoveryMinutes"
              type="number"
              value={recoveryMinutes}
              onChange={(e) => setRecoveryMinutes(e.target.value)}
              placeholder="Ex: 60"
              min="0"
              className="mt-1"
            />
          </div>

          <div>
            <div className="flex items-center space-x-2 mt-6">
              <Checkbox
                id="sameDayDischarge"
                checked={sameDayDischarge}
                onCheckedChange={(checked) => setSameDayDischarge(checked as boolean)}
              />
              <Label htmlFor="sameDayDischarge" className="text-sm font-medium text-gray-700 cursor-pointer">
                Alta no Mesmo Dia
              </Label>
            </div>
          </div>
        </div>

        {!sameDayDischarge && (
          <div>
            <Label htmlFor="hospitalizationDays" className="text-sm font-medium text-gray-700">
              Dias de Internação
            </Label>
            <Input
              id="hospitalizationDays"
              type="number"
              value={hospitalizationDays}
              onChange={(e) => setHospitalizationDays(e.target.value)}
              placeholder="Ex: 2"
              min="1"
              className="mt-1"
            />
          </div>
        )}
      </div>
    </Card>
  );
}
