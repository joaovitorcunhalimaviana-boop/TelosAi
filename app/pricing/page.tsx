"use client"

import { useState } from "react"
import Link from "next/link"
import { TelosHeader } from "@/components/TelosHeader"

export default function PricingPage() {
  const [patients, setPatients] = useState(3)

  const calculatePrice = (basePrice: number, additionalPrice: number) => {
    if (patients <= 3) return basePrice
    return basePrice + (patients - 3) * additionalPrice
  }

  const foundingPrice = calculatePrice(400, 150)
  const professionalPrice = calculatePrice(500, 180)

  return (
    <div className="min-h-screen bg-white">
      <TelosHeader />

      {/* Hero Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold text-telos-blue animate-fade-in-down">
              Planos e Preços Transparentes
            </h1>
            <p className="text-2xl text-gray-700 font-light animate-fade-in-up animation-delay-200">
              Escolha o plano ideal para sua prática médica.{" "}
              <span className="text-telos-gold font-medium">Sem taxas ocultas</span>, sem surpresas.
            </p>
          </div>
        </div>
      </section>

      {/* Price Calculator */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8">
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

              <div className="grid md:grid-cols-2 gap-6 mt-8">
                {/* Founding Calculation */}
                <div className="p-6 bg-gradient-to-br from-telos-gold/10 to-yellow-50 rounded-xl border-2 border-telos-gold">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-6 h-6 text-telos-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <h3 className="text-xl font-bold text-telos-blue">Founding Members</h3>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700 mb-4">
                    <p>Base: R$ 400 (3 pacientes)</p>
                    {patients > 3 && (
                      <p>+ {patients - 3} × R$ 150 = R$ {(patients - 3) * 150}</p>
                    )}
                  </div>
                  <div className="text-3xl font-bold text-telos-gold">
                    R$ {foundingPrice.toLocaleString('pt-BR')}
                    <span className="text-sm text-gray-600 font-normal">/mês</span>
                  </div>
                  <p className="text-xs text-telos-gold font-semibold mt-2">
                    Preço VITALÍCIO garantido
                  </p>
                </div>

                {/* Professional Calculation */}
                <div className="p-6 bg-white rounded-xl border-2 border-telos-blue">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-6 h-6 text-telos-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <h3 className="text-xl font-bold text-telos-blue">Profissional</h3>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700 mb-4">
                    <p>Base: R$ 500 (3 pacientes)</p>
                    {patients > 3 && (
                      <p>+ {patients - 3} × R$ 180 = R$ {(patients - 3) * 180}</p>
                    )}
                  </div>
                  <div className="text-3xl font-bold text-telos-blue">
                    R$ {professionalPrice.toLocaleString('pt-BR')}
                    <span className="text-sm text-gray-600 font-normal">/mês</span>
                  </div>
                </div>
              </div>

              {patients > 3 && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-green-800">
                        Economia com Founding Members
                      </p>
                      <p className="text-green-700 text-sm">
                        Você economiza R$ {(professionalPrice - foundingPrice).toLocaleString('pt-BR')}/mês
                        ({Math.round(((professionalPrice - foundingPrice) / professionalPrice) * 100)}% de desconto)
                        com o plano Founding!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Comparison Table */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-telos-blue mb-4">
              Comparação Detalhada
            </h2>
            <p className="text-gray-600">
              Todos os recursos incluídos em ambos os planos
            </p>
          </div>

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
                    Profissional
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Preço mensal (3 pacientes inclusos)", founding: "R$ 400", professional: "R$ 500" },
                  { feature: "Custo por paciente adicional", founding: "R$ 150", professional: "R$ 180" },
                  { feature: "Acompanhamento automático 24/7", founding: true, professional: true },
                  { feature: "Questionários via WhatsApp", founding: true, professional: true },
                  { feature: "Análise com IA de última geração", founding: true, professional: true },
                  { feature: "Detecção de red flags", founding: true, professional: true },
                  { feature: "Alertas em tempo real", founding: true, professional: true },
                  { feature: "Dashboard completo", founding: true, professional: true },
                  { feature: "Exportação de dados (LGPD)", founding: true, professional: true },
                  { feature: "Histórico completo de pacientes", founding: true, professional: true },
                  { feature: "Suporte prioritário", founding: true, professional: "Via email" },
                  { feature: "Acesso antecipado a novos recursos", founding: true, professional: false },
                  { feature: "Preço vitalício garantido", founding: true, professional: false },
                  { feature: "Badge exclusivo Founding Member", founding: true, professional: false },
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                    <td className="py-4 px-6 text-gray-700">{row.feature}</td>
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
                    <td className="py-4 px-6 text-center">
                      {typeof row.professional === 'boolean' ? (
                        row.professional ? (
                          <svg className="w-6 h-6 text-telos-blue mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )
                      ) : (
                        <span className="font-semibold text-telos-blue">{row.professional}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-telos-blue mb-4">
              Perguntas Frequentes
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                question: "Como funciona o billing?",
                answer: "O pagamento é mensal via cartão de crédito. Você paga o plano base + o número de pacientes adicionais ativos no mês."
              },
              {
                question: "O que acontece se eu ultrapassar 3 pacientes?",
                answer: "Não há problema! Você será cobrado automaticamente pelo valor adicional (R$ 150 ou R$ 180 por paciente extra, dependendo do plano)."
              },
              {
                question: "Posso cancelar a qualquer momento?",
                answer: "Sim! Você pode cancelar sua assinatura a qualquer momento, sem multas ou taxas de cancelamento."
              },
              {
                question: "O que significa 'Preço Vitalício' para Founding Members?",
                answer: "Como Founding Member, você garante o preço de R$ 400 base + R$ 150 adicional PARA SEMPRE, mesmo que os preços aumentem no futuro."
              },
              {
                question: "Quantas vagas de Founding Members existem?",
                answer: "Apenas 3 vagas estão disponíveis. Uma vez preenchidas, este plano especial não estará mais disponível."
              },
              {
                question: "Os dados dos pacientes estão seguros?",
                answer: "Sim! Somos 100% compatíveis com LGPD. Todos os dados são criptografados e armazenados com segurança. A exportação para pesquisa é sempre anonimizada."
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-telos-blue mb-4">
            Pronto para começar?
          </h2>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Escolha seu plano e transforme seu pós-operatório hoje
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/cadastro-medico?plan=founding"
              className="inline-flex items-center gap-3 px-10 py-5 bg-telos-gold text-white text-lg rounded-xl font-bold hover-lift hover-glow transition-smooth shadow-2xl"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Garantir Vaga Founding
            </Link>
            <Link
              href="/cadastro-medico?plan=professional"
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-telos-blue text-lg rounded-xl font-bold hover-lift transition-smooth shadow-2xl"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Começar com Profissional
            </Link>
          </div>
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
