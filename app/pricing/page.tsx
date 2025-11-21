"use client"

import { useState } from "react"
import Link from "next/link"
import { TelosHeader } from "@/components/TelosHeader"
import { FadeIn } from "@/components/animations/FadeIn"

export default function PricingPage() {
  const [patients, setPatients] = useState(3)

  const calculatePrice = (basePrice: number, additionalPrice: number) => {
    if (patients <= 3) return basePrice
    return basePrice + (patients - 3) * additionalPrice
  }

  const foundingPrice = calculatePrice(400, 150)
  const earlyAdopterPrice = calculatePrice(500, 180)
  const professionalPrice = calculatePrice(950, 350)

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <TelosHeader />

      {/* Background Animated Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-telos-blue/5 rounded-full blur-3xl animate-blob-move"></div>
        <div className="absolute top-40 -right-20 w-96 h-96 bg-telos-gold/5 rounded-full blur-3xl animate-blob-move animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/2 w-96 h-96 bg-telos-blue/5 rounded-full blur-3xl animate-blob-move animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <section className="py-20 bg-white relative z-10">
        <div className="container mx-auto px-6">
          <FadeIn delay={0.1} direction="up">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-telos-blue">
                Planos e Preços Transparentes
              </h1>
              <p className="text-2xl text-gray-700 font-light">
                Escolha o plano ideal para sua prática médica.{" "}
                <span className="text-telos-gold font-medium">Sem taxas ocultas</span>, sem surpresas.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Why Invest Section */}
      <section className="py-16 bg-white relative z-10">
        <div className="container mx-auto px-6">
          <FadeIn delay={0.15} direction="up">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-telos-blue mb-4">
                Por que Investir no Telos.AI?
              </h2>
              <p className="text-xl text-gray-600">
                O investimento se paga sozinho. Veja como:
              </p>
            </div>
          </FadeIn>

          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            <FadeIn delay={0.2} direction="up">
              <div className="h-full bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl p-8 border-2 border-gray-200 hover-lift-strong card-shine flex flex-col">
                <div className="w-16 h-16 bg-telos-blue/10 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-4xl">💰</span>
                </div>
                <h3 className="text-2xl font-bold text-telos-blue mb-4">
                  Evite Custos
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4 flex-grow">
                  Uma complicação com reinternação <span className="font-bold text-telos-blue">custa caro</span>
                  ao sistema de saúde e ao seu paciente.
                </p>
                <p className="text-lg font-semibold text-telos-blue">
                  Evitar apenas 1 complicação por ano já paga o sistema completo.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.25} direction="up">
              <div className="h-full bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl p-8 border-2 border-gray-200 hover-lift-strong card-shine flex flex-col">
                <div className="w-16 h-16 bg-telos-blue/10 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-4xl">⏰</span>
                </div>
                <h3 className="text-2xl font-bold text-telos-blue mb-4">
                  Economize Tempo
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4 flex-grow">
                  Economize <span className="font-bold text-telos-blue">10+ horas por semana</span> em
                  ligações manuais, planilhas e anotações.
                </p>
                <p className="text-lg font-semibold text-telos-blue">
                  Mais tempo para cirurgias, família e qualidade de vida.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.3} direction="up">
              <div className="h-full bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl p-8 border-2 border-telos-gold hover-lift-strong card-shine flex flex-col">
                <div className="w-16 h-16 bg-telos-gold/20 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-4xl">🚀</span>
                </div>
                <h3 className="text-2xl font-bold text-telos-blue mb-4">
                  Diferencial Competitivo
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4 flex-grow">
                  Seja o cirurgião que usa <span className="font-bold text-telos-gold">Inteligência Artificial</span> no
                  acompanhamento.
                </p>
                <p className="text-lg font-semibold text-telos-gold">
                  Pacientes escolhem inovação, tecnologia e cuidado proativo.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Price Calculator */}
      <section className="py-16 bg-gray-50 relative z-10">
        <div className="container mx-auto px-6">
          <FadeIn delay={0.2} direction="up">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8 hover-lift-strong card-shine">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-telos-blue mb-2">
                Calculadora de Preços
              </h2>
              <p className="text-gray-600">
                Ajuste o número de pacientes para ver o custo estimado
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-telos-blue mb-4">
                  Quantos pacientes você acompanha por mês?
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={patients}
                    onChange={(e) => setPatients(parseInt(e.target.value))}
                    className="flex-1 h-3 bg-[#0A2647] rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex items-center justify-center w-20 h-12 bg-telos-blue text-white rounded-lg font-bold text-xl">
                    {patients}
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-500">
                  <span>1</span>
                  <span>15</span>
                  <span>30+</span>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mt-8">
                {/* Founding Members */}
                <div className="relative p-6 bg-gradient-to-br from-telos-gold/10 to-yellow-50 rounded-xl border-2 border-telos-gold hover-lift-strong card-shine animate-fade-in animation-delay-200 animate-glow-pulse-strong">
                  {/* Badge PREÇO VITALÍCIO */}
                  <div className="absolute -top-3 -right-3 bg-telos-gold text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg transform rotate-12 animate-pulse">
                    🔒 PREÇO VITALÍCIO
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-6 h-6 text-telos-gold hover-tilt animate-scale-bounce neon-gold" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      <h3 className="text-xl font-bold text-telos-blue">Founding Member</h3>
                    </div>
                    <p className="text-xs text-telos-gold font-bold mb-3">⚡ Vagas limitadas</p>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700 mb-4">
                    <p>Base: R$ 400 (3 pacientes)</p>
                    <p className="font-semibold text-telos-gold">+ R$ 150/paciente adicional</p>
                    {patients > 3 && (
                      <p className="text-xs">({patients - 3} × R$ 150 = R$ {(patients - 3) * 150})</p>
                    )}
                  </div>
                  <div className="text-3xl font-bold text-telos-gold">
                    R$ {foundingPrice.toLocaleString('pt-BR')}
                    <span className="text-sm text-gray-600 font-normal">/mês</span>
                  </div>

                  {/* Destaque de Economia */}
                  <div className="mt-4 p-3 bg-green-50 border-2 border-green-300 rounded-lg">
                    <p className="text-sm font-bold text-green-700 text-center">
                      💰 Economize R$ {(professionalPrice - foundingPrice).toLocaleString('pt-BR')}/mês
                    </p>
                    <p className="text-xs text-green-600 text-center mt-1">
                      PARA SEMPRE
                    </p>
                  </div>
                </div>

                {/* Early Adopter */}
                <div className="p-6 bg-white rounded-xl border-2 border-telos-blue hover-lift-strong card-shine animate-fade-in animation-delay-300">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-6 h-6 text-telos-blue hover-tilt" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <h3 className="text-xl font-bold text-telos-blue">Early Adopter</h3>
                    </div>
                    <p className="text-xs text-telos-blue font-bold mb-3">⚡ Vagas limitadas</p>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700 mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-gray-400 line-through">R$ 950</span>
                      <span className="font-bold text-red-500">→ R$ 500</span>
                    </div>
                    <p>Base: R$ 500 (3 pacientes)</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-gray-400 line-through text-xs">R$ 350</span>
                      <span className="font-semibold text-red-500">→ R$ 180/paciente adicional</span>
                    </div>
                    {patients > 3 && (
                      <p className="text-xs">({patients - 3} × R$ 180 = R$ {(patients - 3) * 180})</p>
                    )}
                  </div>
                  <div className="text-3xl font-bold text-telos-blue">
                    R$ {earlyAdopterPrice.toLocaleString('pt-BR')}
                    <span className="text-sm text-gray-600 font-normal">/mês</span>
                  </div>
                  <p className="text-xs text-green-600 font-semibold mt-2">
                    💰 Economize NO MÍNIMO R$ {(professionalPrice - earlyAdopterPrice).toLocaleString('pt-BR')}/mês
                  </p>
                </div>

                {/* Professional */}
                <div className="p-6 bg-gray-50 rounded-xl border-2 border-gray-300 hover-lift-strong card-shine animate-fade-in animation-delay-400 opacity-80">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <h3 className="text-xl font-bold text-gray-700">Profissional</h3>
                    </div>
                    <p className="text-xs text-gray-600 font-bold mb-3">Plano regular</p>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p>Base: R$ 950 (3 pacientes)</p>
                    <p className="font-semibold text-gray-700">+ R$ 350/paciente adicional</p>
                    {patients > 3 && (
                      <p className="text-xs">({patients - 3} × R$ 350 = R$ {(patients - 3) * 350})</p>
                    )}
                  </div>
                  <div className="text-3xl font-bold text-gray-700">
                    R$ {professionalPrice.toLocaleString('pt-BR')}
                    <span className="text-sm text-gray-500 font-normal">/mês</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Preço regular
                  </p>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-telos-gold/10 to-telos-blue/10 border-2 border-telos-gold/30 rounded-xl">
                <div className="flex items-start gap-4">
                  <svg className="w-8 h-8 text-telos-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-bold text-telos-blue mb-2">⚡ Oferta Limitada</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      Os planos <span className="font-semibold text-telos-gold">Founding Member e Early Adopter têm vagas limitadas</span>.
                      Após o preenchimento, apenas o plano Profissional estará disponível: R$ 950/mês + R$ 350/paciente adicional.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA PRINCIPAL */}
              <div className="mt-12 text-center">
                <Link
                  href="/cadastro-medico?plan=founding"
                  className="group inline-flex items-center gap-3 px-10 py-5 bg-telos-gold text-white rounded-2xl font-bold text-xl hover-lift-strong hover:shadow-2xl hover:shadow-telos-gold/50 hover:bg-yellow-600 transition-all duration-500 shadow-xl"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Garantir Minha Vaga de Founding Member
                  <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <p className="mt-4 text-sm text-gray-600">
                  <span className="font-semibold text-telos-blue">Vagas limitadas</span> • Preço vitalício garantido
                </p>
              </div>

              {/* CTA SECUNDÁRIO */}
              <div className="mt-6 text-center">
                <Link
                  href="/cadastro-medico?plan=early"
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-telos-blue text-white rounded-xl font-semibold text-lg hover-lift hover:shadow-xl hover:shadow-telos-blue/30 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Quero ser Early Adopter
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <p className="mt-3 text-sm text-gray-600">
                  Vagas limitadas • Economize NO MÍNIMO R$ 450/mês
                </p>
              </div>
            </div>
          </div>
          </FadeIn>
        </div>
      </section>

      {/* Investment Comparison Section */}
      <section className="py-16 bg-gradient-to-br from-telos-blue/5 to-telos-gold/5 relative z-10">
        <div className="container mx-auto px-6">
          <FadeIn delay={0.1} direction="up">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-telos-blue mb-4">
                Comparativo de Investimento
              </h2>
              <p className="text-xl text-gray-600">
                Veja como o Telos.AI se paga sozinho
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.2} direction="up">
            <div className="max-w-5xl mx-auto overflow-x-auto">
              <div className="bg-white rounded-2xl shadow-2xl border-2 border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-telos-blue to-telos-blue/90">
                    <tr>
                      <th className="py-5 px-6 text-left text-lg font-bold text-white">
                        Item
                      </th>
                      <th className="py-5 px-6 text-center text-lg font-bold text-telos-gold">
                        Founding Member
                      </th>
                      <th className="py-5 px-6 text-center text-lg font-bold text-white">
                        Early Adopter
                      </th>
                      <th className="py-5 px-6 text-center text-lg font-bold text-white/80">
                        Profissional
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                      <td className="py-5 px-6 font-semibold text-telos-blue">
                        Custo mensal (3 pacientes)
                      </td>
                      <td className="py-5 px-6 text-center">
                        <span className="text-2xl font-bold text-telos-gold">R$ 400</span>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <span className="text-2xl font-bold text-telos-blue">R$ 500</span>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <span className="text-2xl font-bold text-gray-600">R$ 950</span>
                      </td>
                    </tr>

                    <tr className="border-b border-gray-100 bg-red-50/30">
                      <td className="py-5 px-6 font-semibold text-red-700">
                        Custo de 1 complicação evitada
                      </td>
                      <td colSpan={3} className="py-5 px-6 text-center">
                        <span className="text-3xl font-bold text-red-600">Alto custo</span>
                        <p className="text-sm text-gray-600 mt-1">(reinternação + reoperação)</p>
                      </td>
                    </tr>

                    <tr className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                      <td className="py-5 px-6 font-semibold text-telos-blue">
                        Horas economizadas/semana
                      </td>
                      <td colSpan={3} className="py-5 px-6 text-center">
                        <span className="text-2xl font-bold text-blue-600">~10 horas</span>
                        <p className="text-sm text-gray-600 mt-1">em ligações e acompanhamento manual</p>
                      </td>
                    </tr>

                    <tr className="border-b border-gray-100 bg-green-50/30">
                      <td className="py-5 px-6 font-semibold text-green-700">
                        Valor do tempo economizado
                      </td>
                      <td colSpan={3} className="py-5 px-6 text-center">
                        <span className="text-3xl font-bold text-green-600">R$ 8.000/mês</span>
                        <p className="text-sm text-gray-600 mt-1">(10h/semana × R$ 200/h × 4 semanas)</p>
                      </td>
                    </tr>

                    <tr className="bg-gradient-to-r from-telos-gold/10 to-yellow-50">
                      <td className="py-6 px-6 font-bold text-telos-blue text-lg">
                        ROI (Retorno sobre Investimento)
                      </td>
                      <td className="py-6 px-6 text-center">
                        <div className="inline-block bg-telos-gold text-white px-6 py-3 rounded-xl">
                          <span className="text-2xl font-bold">+1.900%</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">com tempo economizado</p>
                      </td>
                      <td className="py-6 px-6 text-center">
                        <div className="inline-block bg-telos-blue text-white px-6 py-3 rounded-xl">
                          <span className="text-2xl font-bold">+1.500%</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">com tempo economizado</p>
                      </td>
                      <td className="py-6 px-6 text-center">
                        <div className="inline-block bg-gray-600 text-white px-6 py-3 rounded-xl">
                          <span className="text-2xl font-bold">+740%</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">com tempo economizado</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Conclusão */}
              <div className="mt-8 p-8 bg-white rounded-2xl border-2 border-telos-gold shadow-xl">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-telos-gold/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-telos-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-telos-blue mb-3">
                      Conclusão: O Investimento se Paga Sozinho
                    </h4>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      Evitando apenas <span className="font-bold text-red-600">1 complicação por ano</span>, você já recupera
                      completamente o investimento anual no Telos.AI. Uma complicação custa muito caro ao sistema e ao paciente.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      Além disso, as <span className="font-bold text-blue-600">10 horas/semana economizadas</span> permitem realizar
                      mais cirurgias, aumentar sua receita ou simplesmente ter mais qualidade de vida.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Detailed Comparison Table */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <FadeIn delay={0.1} direction="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-telos-blue mb-4">
                Comparação Detalhada
              </h2>
              <p className="text-gray-600">
                Todos os recursos incluídos em ambos os planos
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.2} direction="up">
            <div className="max-w-5xl mx-auto overflow-x-auto">
              <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="py-4 px-6 text-left text-lg font-bold text-telos-blue">
                    Recursos
                  </th>
                  <th className="py-4 px-6 text-center text-lg font-bold text-telos-gold">
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      Founding
                    </div>
                  </th>
                  <th className="py-4 px-6 text-center text-lg font-bold text-telos-blue">
                    Early Adopter
                  </th>
                  <th className="py-4 px-6 text-center text-lg font-bold text-gray-600">
                    Profissional
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Preço mensal (3 pacientes)", founding: "R$ 400", earlyAdopter: "R$ 500", professional: "R$ 950" },
                  { feature: "Paciente adicional", founding: "R$ 150", earlyAdopter: "R$ 180", professional: "R$ 350" },
                  { feature: "Disponibilidade", founding: "Limitada", earlyAdopter: "Limitada", professional: "Aberta" },
                  { feature: "Acompanhamento 24/7", founding: true, earlyAdopter: true, professional: true },
                  { feature: "WhatsApp + IA", founding: true, earlyAdopter: true, professional: true },
                  { feature: "Detecção de red flags", founding: true, earlyAdopter: true, professional: true },
                  { feature: "Alertas em tempo real", founding: true, earlyAdopter: true, professional: true },
                  { feature: "Dashboard completo", founding: true, earlyAdopter: true, professional: true },
                  { feature: "Modo Pesquisa (LGPD)", founding: true, earlyAdopter: true, professional: true },
                  { feature: "Histórico completo", founding: true, earlyAdopter: true, professional: true },
                  { feature: "Suporte prioritário", founding: "WhatsApp", earlyAdopter: "Email", professional: "Email" },
                  { feature: "Acesso antecipado", founding: true, earlyAdopter: true, professional: false },
                  { feature: "Preço vitalício", founding: true, earlyAdopter: false, professional: false },
                  { feature: "Badge exclusivo", founding: true, earlyAdopter: false, professional: false },
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                    <td className="py-4 px-6 text-gray-700">{row.feature}</td>

                    {/* Founding */}
                    <td className="py-4 px-6 text-center">
                      {typeof row.founding === 'boolean' ? (
                        row.founding ? (
                          <svg className="w-6 h-6 text-telos-gold mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )
                      ) : (
                        <span className="font-semibold text-telos-gold">{row.founding}</span>
                      )}
                    </td>

                    {/* Early Adopter */}
                    <td className="py-4 px-6 text-center">
                      {typeof row.earlyAdopter === 'boolean' ? (
                        row.earlyAdopter ? (
                          <svg className="w-6 h-6 text-telos-blue mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )
                      ) : (
                        <span className="font-semibold text-telos-blue">{row.earlyAdopter}</span>
                      )}
                    </td>

                    {/* Professional */}
                    <td className="py-4 px-6 text-center">
                      {typeof row.professional === 'boolean' ? (
                        row.professional ? (
                          <svg className="w-6 h-6 text-gray-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )
                      ) : (
                        <span className="font-semibold text-gray-600">{row.professional}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </FadeIn>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <FadeIn delay={0.1} direction="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-telos-blue mb-4">
                Perguntas Frequentes
              </h2>
            </div>
          </FadeIn>

          <FadeIn delay={0.2} direction="up">
            <div className="max-w-3xl mx-auto space-y-6">
              {[
                {
                  question: "Como funciona o Modo Pesquisa?",
                  answer: "O Modo Pesquisa organiza automaticamente os dados dos seus pacientes em grupos, permitindo análise de complicações, comparação de tratamentos e exportação anonimizada para estudos. Totalmente conforme a LGPD."
                },
                {
                  question: "Como funciona o pagamento?",
                  answer: "O pagamento é mensal via cartão de crédito. Você paga o plano base (3 pacientes inclusos) + o valor por cada paciente adicional que estiver em acompanhamento no mês."
                },
                {
                  question: "O que significa 'Preço Vitalício' para Founding Members?",
                  answer: "Como Founding Member, você garante o preço de R$ 400 base + R$ 150/paciente adicional PARA SEMPRE, mesmo que os preços aumentem no futuro."
                },
                {
                  question: "Os dados dos pacientes estão seguros?",
                  answer: "Sim! Somos 100% compatíveis com LGPD. Todos os dados são criptografados e armazenados com segurança. A exportação é sempre anonimizada."
                },
                {
                  question: "Posso cancelar a qualquer momento?",
                  answer: "Sim! Você pode cancelar sua assinatura a qualquer momento, sem multas ou taxas de cancelamento."
                },
                {
                  question: "Funciona para quais tipos de cirurgia?",
                  answer: "Atualmente especializado em cirurgias orificiais (doença hemorroidária, fístulas, fissuras, pilonidal). Em breve expandiremos para outras especialidades cirúrgicas."
                }
            ].map((faq, idx) => (
              <details key={idx} className="group bg-white rounded-xl border-2 border-gray-100 hover:border-telos-blue transition-colors shadow-sm">
                <summary className="p-6 cursor-pointer flex justify-between items-center">
                  <span className="font-semibold text-telos-blue text-lg">{faq.question}</span>
                  <svg className="w-6 h-6 text-telos-blue transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-6 text-gray-700 text-justify">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <FadeIn delay={0.1} direction="up">
            <h2 className="text-3xl lg:text-4xl font-bold text-telos-blue mb-4">
              Pronto para começar?
            </h2>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              Escolha seu plano e transforme seu pós-operatório hoje
            </p>
            <Link
              href="/cadastro-medico?plan=founding"
              className="inline-flex items-center gap-3 px-12 py-6 bg-telos-gold text-white text-xl rounded-2xl font-bold hover-lift-strong hover:shadow-2xl hover:shadow-telos-gold/50 hover:bg-yellow-600 transition-all duration-500 shadow-xl"
            >
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Quero Fazer Parte Agora!
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="telos-gradient text-white">
        <div className="container mx-auto px-6">
          {/* Main Footer Content */}
          <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Company Info */}
            <div className="space-y-6">
              <div className="flex items-baseline gap-0.5">
                <span className="telos-brand text-3xl text-white">Telos</span>
                <span className="telos-ai text-3xl text-telos-gold">.AI</span>
              </div>
              <p className="text-blue-200 leading-relaxed text-justify">
                A Inteligência no Cuidado para o Propósito da Recuperação.
              </p>
              <p className="text-blue-200 leading-relaxed text-justify">
                Transformando o acompanhamento pós-operatório com IA.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-14 h-14 bg-white/10 hover:bg-telos-gold rounded-xl flex items-center justify-center transition-all hover-lift hover:scale-110">
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Navegação */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Navegação</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/" className="text-blue-200 hover:text-telos-gold transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Início
                  </Link>
                </li>
                <li>
                  <Link href="/sobre" className="text-blue-200 hover:text-telos-gold transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Sobre
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-blue-200 hover:text-telos-gold transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Planos
                  </Link>
                </li>
                <li>
                  <Link href="/cadastro-medico" className="text-blue-200 hover:text-telos-gold transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Cadastro
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="text-blue-200 hover:text-telos-gold transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Login
                  </Link>
                </li>
              </ul>
            </div>

            {/* Para Médicos */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Para Médicos</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/pricing" className="text-blue-200 hover:text-telos-gold transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Planos e Preços
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-blue-200 hover:text-telos-gold transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Como Funciona
                  </a>
                </li>
                <li>
                  <a href="#" className="text-blue-200 hover:text-telos-gold transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Casos de Sucesso
                  </a>
                </li>
                <li>
                  <a href="#" className="text-blue-200 hover:text-telos-gold transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="text-blue-200 hover:text-telos-gold transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Suporte
                  </a>
                </li>
              </ul>
            </div>

            {/* Contato */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Contato</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-blue-200">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-white">Email</p>
                    <a href="mailto:telos.ia@gmail.com" className="hover:text-telos-gold transition-colors">
                      telos.ia@gmail.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-blue-200">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-white">Localização</p>
                    <p>João Pessoa, Paraíba</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-blue-200 text-sm text-center md:text-left">
                © 2025 Telos.AI - Dr. João Vitor Viana. Todos os direitos reservados.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <Link href="/termos" className="text-blue-200 hover:text-telos-gold transition-colors">
                  Termos de Uso
                </Link>
                <Link href="/termos" className="text-blue-200 hover:text-telos-gold transition-colors">
                  Política de Privacidade
                </Link>
                <a href="#" className="text-blue-200 hover:text-telos-gold transition-colors">
                  LGPD
                </a>
                <a href="#" className="text-blue-200 hover:text-telos-gold transition-colors">
                  Cookies
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          background: #0A2647;
          cursor: pointer;
          border-radius: 50%;
          border: 3px solid #D4AF37;
        }

        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: #0A2647;
          cursor: pointer;
          border-radius: 50%;
          border: 3px solid #D4AF37;
        }
      `}</style>
    </div>
  )
}
