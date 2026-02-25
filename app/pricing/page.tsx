"use client"

import { useState } from "react"
import Link from "next/link"
import { VigiaHeader } from "@/components/VigiaHeader"
import { FadeIn } from "@/components/animations/FadeIn"
import { Pricing } from "@/components/ui/pricing"

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
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0B0E14' }}>
      <VigiaHeader />

      {/* Background Animated Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 -left-20 w-96 h-96 rounded-full blur-3xl animate-blob-move" style={{ backgroundColor: 'rgba(13,115,119,0.08)' }}></div>
        <div className="absolute top-40 -right-20 w-96 h-96 rounded-full blur-3xl animate-blob-move animation-delay-2000" style={{ backgroundColor: 'rgba(13,115,119,0.06)' }}></div>
        <div className="absolute -bottom-20 left-1/2 w-96 h-96 rounded-full blur-3xl animate-blob-move animation-delay-4000" style={{ backgroundColor: 'rgba(13,115,119,0.08)' }}></div>
      </div>

      {/* Hero Section */}
      <section className="pt-20 pb-8 relative z-10" style={{ backgroundColor: '#0B0E14' }}>
        <div className="container mx-auto px-6">
          <FadeIn delay={0.1} direction="up">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h1 className="text-5xl lg:text-7xl font-brand" style={{ fontWeight: 300, color: '#F0EAD6' }}>
                Planos e Preços Transparentes
              </h1>
              <p className="text-2xl font-light" style={{ color: '#D8DEEB' }}>
                Escolha o plano ideal para sua prática médica.{" "}
                <span className="font-medium" style={{ color: '#F0EAD6' }}>Sem taxas ocultas</span>, sem surpresas.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Price Calculator & Plans */}
      <section className="py-12 relative z-10" style={{ backgroundColor: '#111520' }}>
        <div className="container mx-auto px-6">
          <FadeIn delay={0.15} direction="up">
            <div className="max-w-3xl mx-auto rounded-2xl shadow-xl p-8 hover-lift-strong card-shine mb-16" style={{ backgroundColor: '#161B27', borderWidth: '2px', borderColor: '#1E2535' }}>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#F0EAD6' }}>
                  Calculadora de Preços
                </h2>
                <p style={{ color: '#7A8299' }}>
                  Ajuste o número de pacientes para ver o custo estimado
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold mb-4" style={{ color: '#F0EAD6' }}>
                    Quantos pacientes você acompanha por mês?
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={patients}
                      onChange={(e) => setPatients(parseInt(e.target.value))}
                      className="flex-1 h-3 rounded-lg appearance-none cursor-pointer slider" style={{ backgroundColor: '#1E2535' }}
                    />
                    <div className="flex items-center justify-center w-20 h-12 text-white rounded-lg font-bold text-xl" style={{ backgroundColor: '#0D7377' }}>
                      {patients}
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-sm" style={{ color: '#7A8299' }}>
                    <span>1</span>
                    <span>15</span>
                    <span>30+</span>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          <Pricing
            showMonthlyToggle={false}
            title="Escolha seu Plano"
            description="Planos flexíveis que crescem com sua prática."
            plans={[
              {
                name: "Founding Member",
                price: foundingPrice.toString(),
                yearlyPrice: foundingPrice.toString(),
                period: "mês",
                features: [
                  "🔒 PREÇO VITALÍCIO",
                  `Base: R$ 400 (3 pacientes)`,
                  `+ R$ 150/paciente adicional`,
                  `Economia de R$ ${(professionalPrice - foundingPrice).toLocaleString('pt-BR')}/mês`,
                  "Acesso antecipado",
                  "Suporte via WhatsApp"
                ],
                description: "Para os primeiros visionários. Preço nunca aumenta.",
                buttonText: "Garantir Vaga",
                href: "/cadastro-medico?plan=founding",
                isPopular: true,
                spots: 5
              },
              {
                name: "Early Adopter",
                price: earlyAdopterPrice.toString(),
                yearlyPrice: earlyAdopterPrice.toString(),
                period: "mês",
                features: [
                  "Desconto significativo",
                  `Base: R$ 500 (3 pacientes)`,
                  `+ R$ 180/paciente adicional`,
                  `Economia de R$ ${(professionalPrice - earlyAdopterPrice).toLocaleString('pt-BR')}/mês`,
                  "Suporte prioritário via Email"
                ],
                description: "Para quem quer inovação com economia.",
                buttonText: "Começar Agora",
                href: "/cadastro-medico?plan=early",
                isPopular: false,
                spots: 12
              },
              {
                name: "Profissional",
                price: professionalPrice.toString(),
                yearlyPrice: professionalPrice.toString(),
                period: "mês",
                features: [
                  "Acesso total à plataforma",
                  `Base: R$ 950 (3 pacientes)`,
                  `+ R$ 350/paciente adicional`,
                  "Suporte via Email",
                  "Sem fidelidade"
                ],
                description: "Preço regular de mercado.",
                buttonText: "Assinar",
                href: "/cadastro-medico?plan=professional",
                isPopular: false
              }
            ]}
          />
        </div>
      </section>

      {/* Why Invest Section */}
      <section className="py-16 relative z-10" style={{ backgroundColor: '#0B0E14' }}>
        <div className="container mx-auto px-6">
          <FadeIn delay={0.15} direction="up">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-brand mb-4" style={{ fontWeight: 400, color: '#F0EAD6' }}>
                Por que Investir no VigIA?
              </h2>
              <p className="text-xl" style={{ color: '#7A8299' }}>
                O investimento se paga sozinho. Veja como:
              </p>
            </div>
          </FadeIn>

          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            <FadeIn delay={0.2} direction="up">
              <div className="h-full rounded-2xl p-8 hover-lift-strong card-shine flex flex-col" style={{ backgroundColor: "#161B27", borderWidth: "2px", borderColor: "#1E2535" }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: "rgba(13,115,119,0.15)" }}>
                  <span className="text-4xl">💰</span>
                </div>
                <h3 className="text-2xl font-bold mb-4" style={{ color: '#F0EAD6' }}>
                  Evite Custos
                </h3>
                <p className="leading-relaxed mb-4 flex-grow" style={{ color: '#D8DEEB' }}>
                  Uma complicação com reinternação <span className="font-bold" style={{ color: '#14BDAE' }}>custa caro</span>
                  ao sistema de saúde e ao seu paciente.
                </p>
                <p className="text-lg font-semibold" style={{ color: '#14BDAE' }}>
                  Evitar apenas 1 complicação por ano já paga o sistema completo.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.25} direction="up">
              <div className="h-full rounded-2xl p-8 hover-lift-strong card-shine flex flex-col" style={{ backgroundColor: "#161B27", borderWidth: "2px", borderColor: "#1E2535" }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: "rgba(13,115,119,0.15)" }}>
                  <span className="text-4xl">⏰</span>
                </div>
                <h3 className="text-2xl font-bold mb-4" style={{ color: '#F0EAD6' }}>
                  Economize Tempo
                </h3>
                <p className="leading-relaxed mb-4 flex-grow" style={{ color: '#D8DEEB' }}>
                  Economize <span className="font-bold" style={{ color: '#14BDAE' }}>10+ horas por semana</span> em
                  ligações manuais, planilhas e anotações.
                </p>
                <p className="text-lg font-semibold" style={{ color: '#14BDAE' }}>
                  Mais tempo para cirurgias, família e qualidade de vida.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.3} direction="up">
              <div className="h-full rounded-2xl p-8 hover-lift-strong card-shine flex flex-col" style={{ backgroundColor: '#161B27', borderWidth: '2px', borderColor: '#14BDAE' }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(13,115,119,0.15)' }}>
                  <span className="text-4xl">🚀</span>
                </div>
                <h3 className="text-2xl font-bold mb-4" style={{ color: '#F0EAD6' }}>
                  Diferencial Competitivo
                </h3>
                <p className="leading-relaxed mb-4 flex-grow" style={{ color: '#D8DEEB' }}>
                  Seja o cirurgião que usa <span className="font-bold" style={{ color: '#14BDAE' }}>Inteligência Artificial</span> no
                  acompanhamento.
                </p>
                <p className="text-lg font-semibold" style={{ color: '#14BDAE' }}>
                  Pacientes escolhem inovação, tecnologia e cuidado proativo.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Investment Comparison Section */}
      <section className="py-16 relative z-10" style={{ backgroundColor: "#111520" }}>
        <div className="container mx-auto px-6">
          <FadeIn delay={0.1} direction="up">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-brand mb-4" style={{ fontWeight: 400, color: "#F0EAD6" }}>
                Comparativo de Investimento
              </h2>
              <p className="text-xl" style={{ color: "#7A8299" }}>
                Veja como o VigIA se paga sozinho
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.2} direction="up">
            <div className="max-w-5xl mx-auto overflow-x-auto">
              <div className="rounded-2xl shadow-2xl overflow-hidden" style={{ backgroundColor: "#161B27", borderWidth: "2px", borderColor: "#1E2535" }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottomWidth: "1px", borderColor: "#1E2535" }}>
                      <th className="py-6 px-6 text-left text-lg font-bold" style={{ color: "#F0EAD6" }}>
                        Item
                      </th>
                      <th className="py-6 px-6 text-center text-lg font-bold" style={{ color: "#14BDAE", backgroundColor: "rgba(13,115,119,0.05)" }}>
                        Founding Member
                      </th>
                      <th className="py-6 px-6 text-center text-lg font-bold" style={{ color: "#7A8299" }}>
                        Early Adopter
                      </th>
                      <th className="py-6 px-6 text-center text-lg font-bold" style={{ color: "#7A8299" }}>
                        Profissional
                      </th>
                    </tr>
                  </thead>
                  <tbody >
                    <tr style={{ borderBottomWidth: "1px", borderColor: "#1E2535" }} className="group transition-colors">
                      <td className="py-5 px-6 font-medium" style={{ color: "#D8DEEB" }}>
                        Custo mensal (3 pacientes)
                      </td>
                      <td className="py-5 px-6 text-center" style={{ backgroundColor: "rgba(13,115,119,0.05)" }}>
                        <span className="text-2xl font-bold" style={{ color: "#14BDAE" }}>R$ 400</span>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <span className="text-2xl font-bold" style={{ color: "#14BDAE" }}>R$ 500</span>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <span className="text-2xl font-bold" style={{ color: "#7A8299" }}>R$ 950</span>
                      </td>
                    </tr>

                    <tr style={{ borderBottomWidth: "1px", borderColor: "#1E2535" }} className="group transition-colors">
                      <td className="py-5 px-6 font-medium" style={{ color: "#D8DEEB" }}>
                        Custo de 1 complicação evitada
                      </td>
                      <td colSpan={3} className="py-5 px-6 text-center relative">
                        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-px -z-10" style={{ backgroundColor: "rgba(239,68,68,0.2)" }}></div>
                        <span className="inline-block px-4 py-1 rounded-full font-bold" style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#ef4444", borderWidth: "1px", borderColor: "rgba(239,68,68,0.2)" }}>
                          Alto custo (reinternação + reoperação)
                        </span>
                      </td>
                    </tr>

                    <tr style={{ borderBottomWidth: "1px", borderColor: "#1E2535" }} className="group transition-colors">
                      <td className="py-5 px-6 font-medium" style={{ color: "#D8DEEB" }}>
                        Horas economizadas/semana
                      </td>
                      <td colSpan={3} className="py-5 px-6 text-center">
                        <span className="text-xl font-bold" style={{ color: "#14BDAE" }}>~10 horas</span>
                        <span className="text-sm ml-2" style={{ color: "#7A8299" }}>em ligações e acompanhamento manual</span>
                      </td>
                    </tr>

                    <tr style={{ borderBottomWidth: "1px", borderColor: "#1E2535" }} className="group transition-colors">
                      <td className="py-5 px-6 font-medium" style={{ color: "#D8DEEB" }}>
                        Valor do tempo economizado
                      </td>
                      <td colSpan={3} className="py-5 px-6 text-center">
                        <span className="text-xl font-bold text-green-400">R$ 8.000/mês</span>
                        <span className="text-sm ml-2" style={{ color: "#7A8299" }}>(10h/semana × R$ 200/h)</span>
                      </td>
                    </tr>

                    <tr style={{ backgroundColor: "#111520" }}>
                      <td className="py-6 px-6 font-bold text-lg" style={{ color: "#F0EAD6" }}>
                        ROI (Retorno sobre Investimento)
                      </td>
                      <td className="py-6 px-6 text-center relative" style={{ backgroundColor: "rgba(13,115,119,0.08)", borderLeftWidth: "1px", borderRightWidth: "1px", borderColor: "rgba(13,115,119,0.2)" }}>
                        <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: "#0D7377" }}></div>
                        <span className="text-3xl font-black block" style={{ color: "#14BDAE" }}>+1.900%</span>
                        <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "#7A8299" }}>Melhor Retorno</span>
                      </td>
                      <td className="py-6 px-6 text-center">
                        <span className="text-2xl font-bold block" style={{ color: "#14BDAE" }}>+1.500%</span>
                      </td>
                      <td className="py-6 px-6 text-center">
                        <span className="text-2xl font-bold block" style={{ color: "#7A8299" }}>+740%</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Conclusão */}
              <div className="mt-8 p-8 rounded-2xl shadow-xl" style={{ backgroundColor: "#161B27", borderWidth: "2px", borderColor: "#14BDAE" }}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(13,115,119,0.15)" }}>
                    <svg className="w-8 h-8" style={{ color: "#14BDAE" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold mb-3" style={{ color: "#F0EAD6" }}>
                      Conclusão: O Investimento se Paga Sozinho
                    </h4>
                    <p className="leading-relaxed mb-3" style={{ color: "#D8DEEB" }}>
                      Evitando apenas <span className="font-bold text-red-400">1 complicação por ano</span>, você já recupera
                      completamente o investimento anual no VigIA. Uma complicação custa muito caro ao sistema e ao paciente.
                    </p>
                    <p className="leading-relaxed" style={{ color: "#D8DEEB" }}>
                      Além disso, as <span className="font-bold" style={{ color: "#14BDAE" }}>10 horas/semana economizadas</span> permitem realizar
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
      <section className="py-16" style={{ backgroundColor: "#0B0E14" }}>
        <div className="container mx-auto px-6">
          <FadeIn delay={0.1} direction="up">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-brand mb-4" style={{ fontWeight: 400, color: "#F0EAD6" }}>
                Comparação Detalhada
              </h2>
              <p style={{ color: "#7A8299" }}>
                Todos os recursos incluídos em ambos os planos
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.2} direction="up">
            <div className="max-w-5xl mx-auto overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ borderBottomWidth: "2px", borderColor: "#1E2535" }}>
                    <th className="py-4 px-6 text-left text-lg font-bold" style={{ color: "#14BDAE" }}>
                      Recursos
                    </th>
                    <th className="py-4 px-6 text-center text-lg font-bold" style={{ color: "#14BDAE" }}>
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        Founding
                      </div>
                    </th>
                    <th className="py-4 px-6 text-center text-lg font-bold" style={{ color: "#14BDAE" }}>
                      Early Adopter
                    </th>
                    <th className="py-4 px-6 text-center text-lg font-bold" style={{ color: "#7A8299" }}>
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
                    <tr key={idx} className="transition-colors" style={{ borderBottomWidth: "1px", borderColor: "#1E2535" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1E2535"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                      <td className="py-4 px-6" style={{ color: "#D8DEEB" }}>{row.feature}</td>

                      {/* Founding */}
                      <td className="py-4 px-6 text-center">
                        {typeof row.founding === 'boolean' ? (
                          row.founding ? (
                            <svg className="w-6 h-6 mx-auto" style={{ color: "#14BDAE" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 mx-auto" style={{ color: "#2A3040" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )
                        ) : (
                          <span className="font-semibold" style={{ color: "#14BDAE" }}>{row.founding}</span>
                        )}
                      </td>

                      {/* Early Adopter */}
                      <td className="py-4 px-6 text-center">
                        {typeof row.earlyAdopter === 'boolean' ? (
                          row.earlyAdopter ? (
                            <svg className="w-6 h-6 mx-auto" style={{ color: "#14BDAE" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 mx-auto" style={{ color: "#2A3040" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )
                        ) : (
                          <span className="font-semibold" style={{ color: "#14BDAE" }}>{row.earlyAdopter}</span>
                        )}
                      </td>

                      {/* Professional */}
                      <td className="py-4 px-6 text-center">
                        {typeof row.professional === 'boolean' ? (
                          row.professional ? (
                            <svg className="w-6 h-6 mx-auto" style={{ color: "#7A8299" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 mx-auto" style={{ color: "#2A3040" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )
                        ) : (
                          <span className="font-semibold" style={{ color: "#7A8299" }}>{row.professional}</span>
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
      <section className="py-16" style={{ backgroundColor: "#111520" }}>
        <div className="container mx-auto px-6">
          <FadeIn delay={0.1} direction="up">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-brand mb-4" style={{ fontWeight: 400, color: "#F0EAD6" }}>
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
                <details key={idx} className="group rounded-xl shadow-sm transition-colors" style={{ backgroundColor: "#161B27", borderWidth: "2px", borderColor: "#1E2535" }}>
                  <summary className="p-6 cursor-pointer flex justify-between items-center">
                    <span className="font-semibold text-lg" style={{ color: "#F0EAD6" }}>{faq.question}</span>
                    <svg className="w-6 h-6 transform group-open:rotate-180 transition-transform" style={{ color: "#14BDAE" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-6 pb-6 text-justify" style={{ color: "#D8DEEB" }}>
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20" style={{ backgroundColor: "#0B0E14" }}>
        <div className="container mx-auto px-6 text-center">
          <FadeIn delay={0.1} direction="up">
            <h2 className="text-3xl lg:text-5xl font-brand mb-4" style={{ fontWeight: 300, color: "#F0EAD6" }}>
              Pronto para começar?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: "#D8DEEB" }}>
              Escolha seu plano e transforme seu pós-operatório hoje
            </p>
            <Link
              href="/cadastro-medico?plan=founding"
              className="inline-flex items-center gap-3 px-12 py-6 text-white text-xl rounded-2xl font-bold hover-lift-strong hover:shadow-2xl transition-all duration-500 shadow-xl" style={{ backgroundColor: "#0D7377" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#14BDAE"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#0D7377"}
            >
              Quero Fazer Parte Agora
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: "#0B0E14" }} className="text-white">
        <div className="container mx-auto px-6">
          {/* Main Footer Content */}
          <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12" style={{ borderTopWidth: "1px", borderColor: "#1E2535" }}>
            {/* Company Info */}
            <div className="space-y-6">
              <div className="flex items-baseline gap-0.5">
                <span className="text-3xl font-brand font-bold" style={{ color: "#F0EAD6" }}>Vig</span><span className="text-3xl font-brand font-bold" style={{ color: "#14BDAE" }}>IA</span>
              </div>
              <p className="leading-relaxed text-justify" style={{ color: "#7A8299" }}>
                A Inteligência no Cuidado para o Propósito da Recuperação.
              </p>
              <p className="leading-relaxed text-justify" style={{ color: "#7A8299" }}>
                Transformando o acompanhamento pós-operatório com IA.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-14 h-14 rounded-xl flex items-center justify-center transition-all hover-lift hover:scale-110" style={{ backgroundColor: "rgba(255,255,255,0.05)" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#0D7377"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"}>
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Navegação */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold" style={{ color: "#F0EAD6" }}>Navegação</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/" className="transition-colors flex items-center gap-2" style={{ color: "#7A8299" }} onMouseEnter={(e) => e.currentTarget.style.color = "#F0EAD6"} onMouseLeave={(e) => e.currentTarget.style.color = "#7A8299"}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Início
                  </Link>
                </li>
                <li>
                  <Link href="/sobre" className="transition-colors flex items-center gap-2" style={{ color: "#7A8299" }} onMouseEnter={(e) => e.currentTarget.style.color = "#F0EAD6"} onMouseLeave={(e) => e.currentTarget.style.color = "#7A8299"}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Sobre
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="transition-colors flex items-center gap-2" style={{ color: "#7A8299" }} onMouseEnter={(e) => e.currentTarget.style.color = "#F0EAD6"} onMouseLeave={(e) => e.currentTarget.style.color = "#7A8299"}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Planos
                  </Link>
                </li>
                <li>
                  <Link href="/cadastro-medico" className="transition-colors flex items-center gap-2" style={{ color: "#7A8299" }} onMouseEnter={(e) => e.currentTarget.style.color = "#F0EAD6"} onMouseLeave={(e) => e.currentTarget.style.color = "#7A8299"}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Cadastro
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="transition-colors flex items-center gap-2" style={{ color: "#7A8299" }} onMouseEnter={(e) => e.currentTarget.style.color = "#F0EAD6"} onMouseLeave={(e) => e.currentTarget.style.color = "#7A8299"}>
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
              <h3 className="text-lg font-bold" style={{ color: "#F0EAD6" }}>Para Médicos</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/pricing" className="transition-colors flex items-center gap-2" style={{ color: "#7A8299" }} onMouseEnter={(e) => e.currentTarget.style.color = "#F0EAD6"} onMouseLeave={(e) => e.currentTarget.style.color = "#7A8299"}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Planos e Preços
                  </Link>
                </li>
                <li>
                  <a href="#" className="transition-colors flex items-center gap-2" style={{ color: "#7A8299" }} onMouseEnter={(e) => e.currentTarget.style.color = "#F0EAD6"} onMouseLeave={(e) => e.currentTarget.style.color = "#7A8299"}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Como Funciona
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors flex items-center gap-2" style={{ color: "#7A8299" }} onMouseEnter={(e) => e.currentTarget.style.color = "#F0EAD6"} onMouseLeave={(e) => e.currentTarget.style.color = "#7A8299"}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Casos de Sucesso
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors flex items-center gap-2" style={{ color: "#7A8299" }} onMouseEnter={(e) => e.currentTarget.style.color = "#F0EAD6"} onMouseLeave={(e) => e.currentTarget.style.color = "#7A8299"}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors flex items-center gap-2" style={{ color: "#7A8299" }} onMouseEnter={(e) => e.currentTarget.style.color = "#F0EAD6"} onMouseLeave={(e) => e.currentTarget.style.color = "#7A8299"}>
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
              <h3 className="text-lg font-bold" style={{ color: "#F0EAD6" }}>Contato</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3" style={{ color: "#7A8299" }}>
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-semibold" style={{ color: "#F0EAD6" }}>Email</p>
                    <a href="mailto:vigia.app.br@gmail.com" className="transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = "#F0EAD6"} onMouseLeave={(e) => e.currentTarget.style.color = "#7A8299"}>
                      vigia.app.br@gmail.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3" style={{ color: "#7A8299" }}>
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold" style={{ color: "#F0EAD6" }}>Localização</p>
                    <p>João Pessoa, Paraíba</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="py-8" style={{ borderTopWidth: "1px", borderColor: "#1E2535" }}>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-center md:text-left" style={{ color: "#7A8299" }}>
                © 2025 VigIA - Dr. João Vitor Viana. Todos os direitos reservados.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <Link href="/termos" className="transition-colors" style={{ color: "#7A8299" }} onMouseEnter={(e) => e.currentTarget.style.color = "#F0EAD6"} onMouseLeave={(e) => e.currentTarget.style.color = "#7A8299"}>
                  Termos de Uso
                </Link>
                <Link href="/termos" className="transition-colors" style={{ color: "#7A8299" }} onMouseEnter={(e) => e.currentTarget.style.color = "#F0EAD6"} onMouseLeave={(e) => e.currentTarget.style.color = "#7A8299"}>
                  Política de Privacidade
                </Link>
                <a href="#" className="transition-colors" style={{ color: "#7A8299" }} onMouseEnter={(e) => e.currentTarget.style.color = "#F0EAD6"} onMouseLeave={(e) => e.currentTarget.style.color = "#7A8299"}>
                  LGPD
                </a>
                <a href="#" className="transition-colors" style={{ color: "#7A8299" }} onMouseEnter={(e) => e.currentTarget.style.color = "#F0EAD6"} onMouseLeave={(e) => e.currentTarget.style.color = "#7A8299"}>
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
          background: #0B0E14;
          cursor: pointer;
          border-radius: 50%;
          border: 3px solid #14BDAE;
        }

        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: #0B0E14;
          cursor: pointer;
          border-radius: 50%;
          border: 3px solid #14BDAE;
        }
      `}</style>
    </div>
  )
}
