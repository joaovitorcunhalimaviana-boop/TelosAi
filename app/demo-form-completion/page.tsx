"use client"

import React, { useState } from 'react'
import { CompletenessIncentive } from '@/components/CompletenessIncentive'
import { MilestoneReward } from '@/components/MilestoneReward'
import { useFormCompletion } from '@/hooks/useFormCompletion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, User, Phone, Mail, MapPin, Heart, FileText, Stethoscope } from 'lucide-react'

export default function FormCompletionDemo() {
  const [showMilestone, setShowMilestone] = useState<40 | 60 | 80 | 100 | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    // Basic Info (20% weight total)
    nome: '',
    email: '',
    telefone: '',
    dataNascimento: '',

    // Address (20% weight total)
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',

    // Medical Info (30% weight - more important)
    tipoSanguineo: '',
    alergias: '',
    medicamentos: '',
    condicoes: '',

    // Emergency Contact (15% weight)
    contatoEmergenciaNome: '',
    contatoEmergenciaTelefone: '',
    contatoEmergenciaRelacao: '',

    // Additional Info (15% weight)
    convenio: '',
    numeroConvenio: '',
    observacoes: ''
  })

  // Calculate completion with weights
  const { completion } = useFormCompletion({
    fields: {
      // Basic Info - weight 1 each (total: 4 points)
      nome: { value: formData.nome, weight: 1 },
      email: { value: formData.email, weight: 1 },
      telefone: { value: formData.telefone, weight: 1 },
      dataNascimento: { value: formData.dataNascimento, weight: 1 },

      // Address - weight 1 each (total: 4 points)
      endereco: { value: formData.endereco, weight: 1 },
      cidade: { value: formData.cidade, weight: 1 },
      estado: { value: formData.estado, weight: 1 },
      cep: { value: formData.cep, weight: 1 },

      // Medical Info - weight 2 each (total: 8 points - more important!)
      tipoSanguineo: { value: formData.tipoSanguineo, weight: 2 },
      alergias: { value: formData.alergias, weight: 2 },
      medicamentos: { value: formData.medicamentos, weight: 2 },
      condicoes: { value: formData.condicoes, weight: 2 },

      // Emergency Contact - weight 1 each (total: 3 points)
      contatoEmergenciaNome: { value: formData.contatoEmergenciaNome, weight: 1 },
      contatoEmergenciaTelefone: { value: formData.contatoEmergenciaTelefone, weight: 1 },
      contatoEmergenciaRelacao: { value: formData.contatoEmergenciaRelacao, weight: 1 },

      // Additional Info - weight 1 each (total: 3 points)
      convenio: { value: formData.convenio, weight: 1 },
      numeroConvenio: { value: formData.numeroConvenio, weight: 1 },
      observacoes: { value: formData.observacoes, weight: 1 }
    },
    onMilestoneReached: (milestone) => {
      setShowMilestone(milestone)
    }
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const scrollToNextEmptyField = () => {
    // Find first empty field and scroll to it
    const emptyField = Object.entries(formData).find(([_, value]) => !value)
    if (emptyField) {
      const element = document.getElementById(emptyField[0])
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.focus()
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Cadastro de Paciente
          </h1>
          <p className="text-gray-600">
            Preencha suas informações para ter acesso completo à plataforma
          </p>
        </div>

        {/* Incentive Component - Sticky */}
        <div className="sticky top-4 z-20 mb-8">
          <CompletenessIncentive
            currentCompletion={completion}
            onContinue={scrollToNextEmptyField}
            showConfetti={true}
          />
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Basic Information */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-6 h-6 text-[#0066CC]" />
              <h2 className="text-2xl font-bold text-gray-900">Informações Básicas</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome completo *</Label>
                <Input
                  id="nome"
                  placeholder="Digite seu nome completo"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  placeholder="(00) 00000-0000"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange('telefone', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
                <Input
                  id="dataNascimento"
                  type="date"
                  value={formData.dataNascimento}
                  onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-6 h-6 text-[#0066CC]" />
              <h2 className="text-2xl font-bold text-gray-900">Endereço</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  placeholder="Rua, número, complemento"
                  value={formData.endereco}
                  onChange={(e) => handleInputChange('endereco', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  placeholder="Sua cidade"
                  value={formData.cidade}
                  onChange={(e) => handleInputChange('cidade', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value) => handleInputChange('estado', value)}
                >
                  <SelectTrigger id="estado">
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SP">São Paulo</SelectItem>
                    <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                    <SelectItem value="MG">Minas Gerais</SelectItem>
                    <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                    <SelectItem value="PR">Paraná</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  placeholder="00000-000"
                  value={formData.cep}
                  onChange={(e) => handleInputChange('cep', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Stethoscope className="w-6 h-6 text-[#0066CC]" />
              <h2 className="text-2xl font-bold text-gray-900">Informações Médicas</h2>
              <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">
                Importante
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tipoSanguineo">Tipo Sanguíneo</Label>
                <Select
                  value={formData.tipoSanguineo}
                  onValueChange={(value) => handleInputChange('tipoSanguineo', value)}
                >
                  <SelectTrigger id="tipoSanguineo">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="alergias">Alergias</Label>
                <Input
                  id="alergias"
                  placeholder="Ex: penicilina, látex"
                  value={formData.alergias}
                  onChange={(e) => handleInputChange('alergias', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="medicamentos">Medicamentos em Uso</Label>
                <Input
                  id="medicamentos"
                  placeholder="Medicamentos que você toma regularmente"
                  value={formData.medicamentos}
                  onChange={(e) => handleInputChange('medicamentos', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="condicoes">Condições Pré-existentes</Label>
                <Input
                  id="condicoes"
                  placeholder="Ex: diabetes, hipertensão"
                  value={formData.condicoes}
                  onChange={(e) => handleInputChange('condicoes', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-6 h-6 text-[#0066CC]" />
              <h2 className="text-2xl font-bold text-gray-900">Contato de Emergência</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="contatoEmergenciaNome">Nome</Label>
                <Input
                  id="contatoEmergenciaNome"
                  placeholder="Nome do contato"
                  value={formData.contatoEmergenciaNome}
                  onChange={(e) => handleInputChange('contatoEmergenciaNome', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="contatoEmergenciaTelefone">Telefone</Label>
                <Input
                  id="contatoEmergenciaTelefone"
                  placeholder="(00) 00000-0000"
                  value={formData.contatoEmergenciaTelefone}
                  onChange={(e) => handleInputChange('contatoEmergenciaTelefone', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="contatoEmergenciaRelacao">Relação</Label>
                <Input
                  id="contatoEmergenciaRelacao"
                  placeholder="Ex: Cônjuge, Pai, Mãe"
                  value={formData.contatoEmergenciaRelacao}
                  onChange={(e) => handleInputChange('contatoEmergenciaRelacao', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-6 h-6 text-[#0066CC]" />
              <h2 className="text-2xl font-bold text-gray-900">Informações Adicionais</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="convenio">Convênio</Label>
                <Input
                  id="convenio"
                  placeholder="Nome do convênio"
                  value={formData.convenio}
                  onChange={(e) => handleInputChange('convenio', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="numeroConvenio">Número do Convênio</Label>
                <Input
                  id="numeroConvenio"
                  placeholder="Número da carteirinha"
                  value={formData.numeroConvenio}
                  onChange={(e) => handleInputChange('numeroConvenio', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Informações adicionais que você gostaria de compartilhar"
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Reward */}
      {showMilestone && (
        <MilestoneReward
          milestone={showMilestone}
          isVisible={true}
          onClose={() => setShowMilestone(null)}
        />
      )}
    </div>
  )
}
