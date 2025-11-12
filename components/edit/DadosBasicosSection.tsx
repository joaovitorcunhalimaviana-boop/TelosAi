"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ResearchRequiredIndicator } from '@/components/ResearchRequiredBadge';

interface DadosBasicosSectionProps {
  patient: any;
  onUpdate: (data: any) => void;
  onComplete: (isComplete: boolean) => void;
  isResearchParticipant?: boolean;
}

export function DadosBasicosSection({ patient, onUpdate, onComplete, isResearchParticipant = false }: DadosBasicosSectionProps) {
  const [formData, setFormData] = useState({
    name: patient?.name || '',
    cpf: patient?.cpf || '',
    dateOfBirth: patient?.dateOfBirth || '',
    sex: patient?.sex || '',
    phone: patient?.phone || '',
    email: patient?.email || '',
    hospital: patient?.hospital || '',
    surgeryDuration: patient?.surgeryDuration || ''
  });

  const [age, setAge] = useState<number | null>(null);

  // Calculate age from date of birth
  useEffect(() => {
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }

      setAge(calculatedAge);
    } else {
      setAge(null);
    }
  }, [formData.dateOfBirth]);

  // Check if form is complete
  useEffect(() => {
    const isComplete = !!(
      formData.name &&
      formData.cpf &&
      formData.dateOfBirth &&
      formData.sex &&
      formData.phone &&
      formData.hospital
    );
    onComplete(isComplete);
  }, [formData, onComplete]);

  // Update parent on any change
  useEffect(() => {
    onUpdate(formData);
  }, [formData, onUpdate]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // CPF mask
  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})$/);
    if (match) {
      return [match[1], match[2], match[3], match[4]]
        .filter(Boolean)
        .join('.')
        .replace(/\.(\d{2})$/, '-$1');
    }
    return value;
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    handleChange('cpf', formatted);
  };

  // Phone mask (WhatsApp)
  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
    if (match) {
      const formatted = [match[1], match[2], match[3]]
        .filter(Boolean)
        .join(' ')
        .replace(/^(\d{2}) /, '($1) ')
        .replace(/ (\d{4})$/, '-$1');
      return formatted;
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    handleChange('phone', formatted);
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Dados Básicos do Paciente</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nome Completo */}
        <div className="md:col-span-2">
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
            Nome Completo <ResearchRequiredIndicator isResearchParticipant={isResearchParticipant} />
          </Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Nome completo do paciente"
            className="mt-1"
            required
          />
        </div>

        {/* CPF */}
        <div>
          <Label htmlFor="cpf" className="text-sm font-medium text-gray-700">
            CPF <ResearchRequiredIndicator isResearchParticipant={isResearchParticipant} />
          </Label>
          <Input
            id="cpf"
            type="text"
            value={formData.cpf}
            onChange={handleCPFChange}
            placeholder="000.000.000-00"
            maxLength={14}
            className="mt-1"
            required
          />
        </div>

        {/* Data de Nascimento */}
        <div>
          <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
            Data de Nascimento <ResearchRequiredIndicator isResearchParticipant={isResearchParticipant} />
          </Label>
          <div className="flex gap-2 items-center">
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleChange('dateOfBirth', e.target.value)}
              className="mt-1 flex-1"
              required
            />
            {age !== null && (
              <span className="text-sm font-medium text-gray-600 mt-1">
                {age} anos
              </span>
            )}
          </div>
        </div>

        {/* Sexo */}
        <div>
          <Label htmlFor="sex" className="text-sm font-medium text-gray-700">
            Sexo <ResearchRequiredIndicator isResearchParticipant={isResearchParticipant} />
          </Label>
          <Select value={formData.sex} onValueChange={(value) => handleChange('sex', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione o sexo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="masculino">Masculino</SelectItem>
              <SelectItem value="feminino">Feminino</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Telefone (WhatsApp) */}
        <div>
          <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
            Telefone/WhatsApp <ResearchRequiredIndicator isResearchParticipant={isResearchParticipant} />
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={handlePhoneChange}
            placeholder="(00) 00000-0000"
            maxLength={15}
            className="mt-1"
            required
          />
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email <ResearchRequiredIndicator isResearchParticipant={isResearchParticipant} />
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="email@exemplo.com"
            className="mt-1"
          />
        </div>

        {/* Hospital */}
        <div className="md:col-span-2">
          <Label htmlFor="hospital" className="text-sm font-medium text-gray-700">
            Hospital <ResearchRequiredIndicator isResearchParticipant={isResearchParticipant} />
          </Label>
          <Input
            id="hospital"
            type="text"
            value={formData.hospital}
            onChange={(e) => handleChange('hospital', e.target.value)}
            placeholder="Nome do hospital onde a cirurgia foi realizada"
            className="mt-1"
            required
          />
        </div>

        {/* Duração da Cirurgia */}
        <div>
          <Label htmlFor="surgeryDuration" className="text-sm font-medium text-gray-700">
            Duração da Cirurgia (minutos)
          </Label>
          <Input
            id="surgeryDuration"
            type="number"
            value={formData.surgeryDuration}
            onChange={(e) => handleChange('surgeryDuration', e.target.value)}
            placeholder="Ex: 45"
            min="0"
            className="mt-1"
          />
        </div>
      </div>
    </Card>
  );
}
