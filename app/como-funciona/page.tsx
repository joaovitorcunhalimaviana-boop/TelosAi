"use client"

import { VigiaHeader } from "@/components/VigiaHeader"
import { FadeIn } from "@/components/animations/FadeIn"
import Link from "next/link"

export default function ComoFuncionaPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B0E14' }}>
      <VigiaHeader />

      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: '#0B0E14' }}>
        <div className="container mx-auto px-6">
          <FadeIn delay={0.1} direction="up">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold">
                Como Funciona a{" "}
                <span className="font-bold" style={{ color: '#14BDAE' }}>VigIA</span>
              </h1>
              <p className="text-2xl font-light" style={{ color: '#D8DEEB' }}>
                Combinamos{" "}
                <span className="font-medium" style={{ color: '#14BDAE' }}>
                  IA Preditiva
                </span>
                , Automação Inteligente e{" "}
                <span className="font-medium" style={{ color: '#14BDAE' }}>
                  Análise Coletiva
                </span>{" "}
                para transformar o acompanhamento pós-operatório
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Fluxo Visual - 4 Etapas */}
      <section className="py-20" style={{ backgroundColor: '#0B0E14' }}>
        <div className="container mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4" style={{ color: '#F0EAD6' }}>
                O Processo em 4 Etapas Simples
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: '#7A8299' }}>
                Do cadastro à tomada de decisão clínica em menos de 2 minutos
              </p>
            </div>
          </FadeIn>

          <div className="max-w-6xl mx-auto space-y-12">
            {/* Etapa 1 */}
            <FadeIn delay={0.1}>
              <div className="relative">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-shrink-0 w-full md:w-auto">
                    <div className="relative">
                      <div className="absolute -inset-4 rounded-2xl blur-xl" style={{ background: 'linear-gradient(to right, rgba(13,115,119,0.2), rgba(26,37,68,0.2))' }}></div>
                      <div className="relative rounded-2xl p-8 shadow-xl" style={{ backgroundColor: '#0D7377' }}>
                        <div className="flex items-center justify-center w-20 h-20 bg-[#0B0E14] rounded-xl mb-4">
                          <svg className="w-12 h-12" style={{ color: '#14BDAE' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                        </div>
                        <div className="text-white text-6xl font-bold">01</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-3xl font-bold mb-4" style={{ color: '#F0EAD6' }}>
                      Cadastro do Paciente
                    </h3>
                    <p className="text-lg mb-6" style={{ color: '#D8DEEB' }}>
                      Após a cirurgia, você cadastra o paciente no sistema em menos de 30 segundos.
                      Apenas nome, telefone WhatsApp e tipo de procedimento realizado.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-[#14BDAE] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="font-semibold" style={{ color: '#14BDAE' }}>Interface Rápida</p>
                          <p className="text-sm" style={{ color: '#7A8299' }}>Formulário otimizado para velocidade</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-[#14BDAE] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="font-semibold" style={{ color: '#14BDAE' }}>Validação Automática</p>
                          <p className="text-sm" style={{ color: '#7A8299' }}>Sistema valida dados em tempo real</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Linha conectora */}
                <div className="hidden md:block absolute left-[5rem] top-full h-12 w-0.5" style={{ background: 'linear-gradient(to bottom, #0D7377, transparent)' }}></div>
              </div>
            </FadeIn>

            {/* Etapa 2 */}
            <FadeIn delay={0.2}>
              <div className="relative">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-shrink-0 w-full md:w-auto">
                    <div className="relative">
                      <div className="absolute -inset-4 rounded-2xl blur-xl" style={{ background: 'linear-gradient(to right, rgba(26,37,68,0.2), rgba(13,115,119,0.2))' }}></div>
                      <div className="relative rounded-2xl p-8 shadow-xl" style={{ backgroundColor: '#1A2544' }}>
                        <div className="flex items-center justify-center w-20 h-20 bg-[#0B0E14] rounded-xl mb-4">
                          <svg className="w-12 h-12" style={{ color: '#14BDAE' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        </div>
                        <div className="text-white text-6xl font-bold">02</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-3xl font-bold mb-4" style={{ color: '#F0EAD6' }}>
                      WhatsApp Automático
                    </h3>
                    <p className="text-lg mb-6" style={{ color: '#D8DEEB' }}>
                      O sistema envia mensagens programadas via WhatsApp API oficial nos dias críticos
                      (D+1, D+2, D+3, D+5, D+7, D+10, D+14). O paciente responde conversando naturalmente.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-[#14BDAE] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="font-semibold" style={{ color: '#14BDAE' }}>Follow-ups Programados</p>
                          <p className="text-sm" style={{ color: '#7A8299' }}>Baseados em protocolos cirúrgicos</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-[#14BDAE] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="font-semibold" style={{ color: '#14BDAE' }}>Linguagem Natural</p>
                          <p className="text-sm" style={{ color: '#7A8299' }}>Paciente não preenche formulários</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hidden md:block absolute left-[5rem] top-full h-12 w-0.5" style={{ background: 'linear-gradient(to bottom, #1A2544, transparent)' }}></div>
              </div>
            </FadeIn>

            {/* Etapa 3 */}
            <FadeIn delay={0.3}>
              <div className="relative">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-shrink-0 w-full md:w-auto">
                    <div className="relative">
                      <div className="absolute -inset-4 rounded-2xl blur-xl animate-pulse-slow" style={{ background: 'linear-gradient(to right, rgba(13,115,119,0.2), rgba(20,189,174,0.2))' }}></div>
                      <div className="relative bg-[#0D7377] rounded-2xl p-8 shadow-xl">
                        <div className="flex items-center justify-center w-20 h-20 bg-[#0B0E14] rounded-xl mb-4">
                          <svg className="w-12 h-12 text-[#14BDAE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <div className="text-white text-6xl font-bold">03</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-3xl font-bold mb-4" style={{ color: '#F0EAD6' }}>
                      IA Analisa Respostas
                    </h3>
                    <p className="text-lg mb-6" style={{ color: '#D8DEEB' }}>
                      Nossa IA (Claude Sonnet 4.5) extrai dados estruturados das conversas e o modelo
                      de Machine Learning analisa mais de 15 variáveis para calcular score de risco.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-[#14BDAE] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="font-semibold" style={{ color: '#14BDAE' }}>NLP Avançado</p>
                          <p className="text-sm" style={{ color: '#7A8299' }}>Extração automática de sintomas</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-[#14BDAE] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="font-semibold" style={{ color: '#14BDAE' }}>Detecção de Red Flags</p>
                          <p className="text-sm" style={{ color: '#7A8299' }}>Sinais de alerta prioritários</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hidden md:block absolute left-[5rem] top-full h-12 w-0.5 bg-gradient-to-b from-[#0D7377] to-transparent"></div>
              </div>
            </FadeIn>

            {/* Etapa 4 */}
            <FadeIn delay={0.4}>
              <div className="relative">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-shrink-0 w-full md:w-auto">
                    <div className="relative">
                      <div className="absolute -inset-4 rounded-2xl blur-xl" style={{ background: 'linear-gradient(to right, rgba(13,115,119,0.2), rgba(26,37,68,0.2))' }}></div>
                      <div className="relative rounded-2xl p-8 shadow-xl" style={{ background: 'linear-gradient(to bottom right, #0D7377, #1A2544)' }}>
                        <div className="flex items-center justify-center w-20 h-20 bg-[#0B0E14] rounded-xl mb-4">
                          <svg className="w-12 h-12" style={{ color: '#14BDAE' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                          </svg>
                        </div>
                        <div className="text-white text-6xl font-bold">04</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-3xl font-bold mb-4" style={{ color: '#F0EAD6' }}>
                      Você Decide
                    </h3>
                    <p className="text-lg mb-6" style={{ color: '#D8DEEB' }}>
                      Visualize alertas críticos em tempo real, acesse o dashboard completo com
                      histórico de cada paciente e tome decisões clínicas informadas.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-[#14BDAE] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="font-semibold" style={{ color: '#14BDAE' }}>Alertas Inteligentes</p>
                          <p className="text-sm" style={{ color: '#7A8299' }}>Notificações priorizadas por risco</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-[#14BDAE] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="font-semibold" style={{ color: '#14BDAE' }}>Controle Total</p>
                          <p className="text-sm" style={{ color: '#7A8299' }}>Decisão final sempre do médico</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Tecnologia Por Trás */}
      <section className="py-20" style={{ backgroundColor: '#111520' }}>
        <div className="container mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D7377]/10 backdrop-blur-sm rounded-full mb-6 border border-[#0D7377]/20">
                <svg className="w-5 h-5 text-[#14BDAE]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 7H7v6h6V7z" />
                  <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-[#14BDAE]">Stack Tecnológico</span>
              </div>

              <h2 className="text-4xl font-bold mb-4" style={{ color: '#F0EAD6' }}>
                A Tecnologia Por Trás
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: '#7A8299' }}>
                Infraestrutura robusta combinando IA conversacional, machine learning preditivo
                e inteligência coletiva anonimizada
              </p>
            </div>
          </FadeIn>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Machine Learning Preditivo */}
            <FadeIn delay={0.1}>
              <div className="group relative rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-[#1E2535] hover:border-[#14BDAE]/30" style={{ backgroundColor: '#161B27' }}>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full" style={{ background: 'linear-gradient(to bottom right, rgba(13,115,119,0.1), transparent)' }}></div>

                <div className="relative">
                  <div className="flex items-center justify-center w-16 h-16 rounded-xl mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: '#0D7377' }}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>

                  <h3 className="text-2xl font-bold mb-4" style={{ color: '#F0EAD6' }}>
                    Machine Learning Preditivo
                  </h3>

                  <p className="mb-6" style={{ color: '#D8DEEB' }}>
                    Modelo treinado que analisa simultaneamente mais de 15 variáveis clínicas
                    para calcular score de risco em tempo real.
                  </p>

                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[#14BDAE] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm" style={{ color: '#D8DEEB' }}>Análise de sintomas reportados</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[#14BDAE] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm" style={{ color: '#D8DEEB' }}>Padrões temporais de evolução</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[#14BDAE] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm" style={{ color: '#D8DEEB' }}>Correlação entre variáveis clínicas</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[#14BDAE] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm" style={{ color: '#D8DEEB' }}>Score de risco estratificado</span>
                    </li>
                  </ul>
                </div>
              </div>
            </FadeIn>

            {/* Inteligência Coletiva */}
            <FadeIn delay={0.2}>
              <div className="group relative rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-[#1E2535] hover:border-[#14BDAE]/30" style={{ backgroundColor: '#161B27' }}>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full" style={{ background: 'linear-gradient(to bottom right, rgba(26,37,68,0.1), transparent)' }}></div>

                <div className="relative">
                  <div className="flex items-center justify-center w-16 h-16 rounded-xl mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: '#1A2544' }}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>

                  <h3 className="text-2xl font-bold mb-4" style={{ color: '#F0EAD6' }}>
                    Inteligência Coletiva
                  </h3>

                  <p className="mb-6" style={{ color: '#D8DEEB' }}>
                    Aprendizado colaborativo entre cirurgiões, respeitando total anonimização
                    via hash SHA-256 em conformidade com LGPD.
                  </p>

                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[#14BDAE] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm" style={{ color: '#D8DEEB' }}>Dados anonimizados via SHA-256</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[#14BDAE] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm" style={{ color: '#D8DEEB' }}>100% conforme LGPD</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[#14BDAE] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm" style={{ color: '#D8DEEB' }}>Melhoria contínua do modelo</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[#14BDAE] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm" style={{ color: '#D8DEEB' }}>Benchmarks anônimos por especialidade</span>
                    </li>
                  </ul>
                </div>
              </div>
            </FadeIn>

            {/* IA Conversacional */}
            <FadeIn delay={0.3}>
              <div className="group relative rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-[#1E2535] hover:border-[#14BDAE]/30" style={{ backgroundColor: '#161B27' }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#0D7377]/10 to-transparent rounded-bl-full"></div>

                <div className="relative">
                  <div className="flex items-center justify-center w-16 h-16 bg-[#0D7377] rounded-xl mb-6 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>

                  <h3 className="text-2xl font-bold mb-4" style={{ color: '#14BDAE' }}>
                    IA Conversacional
                  </h3>

                  <p className="mb-6" style={{ color: '#D8DEEB' }}>
                    Claude Sonnet 4.5 processa linguagem natural do paciente, extrai dados
                    estruturados e identifica padrões de risco automaticamente.
                  </p>

                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[#14BDAE] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm" style={{ color: '#D8DEEB' }}>NLP médico especializado</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[#14BDAE] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm" style={{ color: '#D8DEEB' }}>Extração automática de sintomas</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[#14BDAE] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm" style={{ color: '#D8DEEB' }}>Entendimento de contexto clínico</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[#14BDAE] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm" style={{ color: '#D8DEEB' }}>Geração de resumos estruturados</span>
                    </li>
                  </ul>
                </div>
              </div>
            </FadeIn>

            {/* WhatsApp API Oficial */}
            <FadeIn delay={0.4}>
              <div className="group relative rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-[#1E2535] hover:border-[#14BDAE]/30" style={{ backgroundColor: '#161B27' }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-bl-full"></div>

                <div className="relative">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mb-6 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>

                  <h3 className="text-2xl font-bold mb-4" style={{ color: '#14BDAE' }}>
                    WhatsApp API Oficial
                  </h3>

                  <p className="mb-6" style={{ color: '#D8DEEB' }}>
                    Integração oficial com Meta WhatsApp Business API para comunicação
                    segura, confiável e em conformidade com políticas de privacidade.
                  </p>

                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[#14BDAE] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm" style={{ color: '#D8DEEB' }}>Criptografia end-to-end</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[#14BDAE] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm" style={{ color: '#D8DEEB' }}>Alta taxa de abertura (98%+)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[#14BDAE] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm" style={{ color: '#D8DEEB' }}>Envios programados automáticos</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[#14BDAE] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm" style={{ color: '#D8DEEB' }}>Confirmação de leitura e entrega</span>
                    </li>
                  </ul>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Comparativo - Sistema Tradicional vs VigIA */}
      <section className="py-20" style={{ backgroundColor: '#0B0E14' }}>
        <div className="container mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4" style={{ color: '#F0EAD6' }}>
                Diferencial vs Sistemas Tradicionais
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: '#7A8299' }}>
                Veja como o VigIA se compara aos métodos convencionais de acompanhamento pós-operatório
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="max-w-5xl mx-auto">
              <div className="rounded-2xl overflow-hidden shadow-xl border" style={{ backgroundColor: '#161B27', borderColor: '#1E2535' }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#1E2535]">
                        <th className="px-6 py-4 text-left w-1/3">
                          <span className="text-lg font-bold" style={{ color: '#D8DEEB' }}>Critério</span>
                        </th>
                        <th className="px-6 py-4 text-center bg-[#1E2535]">
                          <div className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" style={{ color: '#7A8299' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-lg font-bold" style={{ color: '#D8DEEB' }}>Sistema Tradicional</span>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-center" style={{ backgroundColor: '#0D7377' }}>
                          <div className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5 text-[#14BDAE]" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-lg font-bold text-white">VigIA</span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-[#1E2535] hover:bg-[#1E2535] transition-colors">
                        <td className="px-6 py-4 font-semibold" style={{ color: '#D8DEEB' }}>Coleta de Dados</td>
                        <td className="px-6 py-4 text-center" style={{ color: '#7A8299' }}>
                          Ligações telefônicas manuais ou formulários longos
                        </td>
                        <td className="px-6 py-4 text-center font-medium" style={{ color: '#14BDAE' }}>
                          Conversa natural via WhatsApp com IA
                        </td>
                      </tr>
                      <tr className="border-b border-[#1E2535] hover:bg-[#1E2535] transition-colors">
                        <td className="px-6 py-4 font-semibold" style={{ color: '#D8DEEB' }}>Tempo por Paciente</td>
                        <td className="px-6 py-4 text-center" style={{ color: '#7A8299' }}>
                          5-10 minutos de ligação
                        </td>
                        <td className="px-6 py-4 text-center font-medium" style={{ color: '#14BDAE' }}>
                          30 segundos de cadastro
                        </td>
                      </tr>
                      <tr className="border-b border-[#1E2535] hover:bg-[#1E2535] transition-colors">
                        <td className="px-6 py-4 font-semibold" style={{ color: '#D8DEEB' }}>Análise de Risco</td>
                        <td className="px-6 py-4 text-center" style={{ color: '#7A8299' }}>
                          Manual, subjetiva e demorada
                        </td>
                        <td className="px-6 py-4 text-center font-medium" style={{ color: '#14BDAE' }}>
                          Automática com ML em tempo real
                        </td>
                      </tr>
                      <tr className="border-b border-[#1E2535] hover:bg-[#1E2535] transition-colors">
                        <td className="px-6 py-4 font-semibold" style={{ color: '#D8DEEB' }}>Detecção de Red Flags</td>
                        <td className="px-6 py-4 text-center" style={{ color: '#7A8299' }}>
                          Depende da experiência individual
                        </td>
                        <td className="px-6 py-4 text-center font-medium" style={{ color: '#14BDAE' }}>
                          Algoritmo treinado + inteligência coletiva
                        </td>
                      </tr>
                      <tr className="border-b border-[#1E2535] hover:bg-[#1E2535] transition-colors">
                        <td className="px-6 py-4 font-semibold" style={{ color: '#D8DEEB' }}>Escalabilidade</td>
                        <td className="px-6 py-4 text-center" style={{ color: '#7A8299' }}>
                          Limitada por equipe disponível
                        </td>
                        <td className="px-6 py-4 text-center font-medium" style={{ color: '#14BDAE' }}>
                          Ilimitada - 100% automatizada
                        </td>
                      </tr>
                      <tr className="border-b border-[#1E2535] hover:bg-[#1E2535] transition-colors">
                        <td className="px-6 py-4 font-semibold" style={{ color: '#D8DEEB' }}>Histórico e Dados</td>
                        <td className="px-6 py-4 text-center" style={{ color: '#7A8299' }}>
                          Planilhas dispersas ou anotações
                        </td>
                        <td className="px-6 py-4 text-center font-medium" style={{ color: '#14BDAE' }}>
                          Dashboard unificado com histórico completo
                        </td>
                      </tr>
                      <tr className="border-b border-[#1E2535] hover:bg-[#1E2535] transition-colors">
                        <td className="px-6 py-4 font-semibold" style={{ color: '#D8DEEB' }}>Taxa de Resposta</td>
                        <td className="px-6 py-4 text-center" style={{ color: '#7A8299' }}>
                          40-60% (ligações não atendidas)
                        </td>
                        <td className="px-6 py-4 text-center font-medium" style={{ color: '#14BDAE' }}>
                          85%+ via WhatsApp assíncrono
                        </td>
                      </tr>
                      <tr className="hover:bg-[#1E2535] transition-colors">
                        <td className="px-6 py-4 font-semibold" style={{ color: '#D8DEEB' }}>Melhoria Contínua</td>
                        <td className="px-6 py-4 text-center" style={{ color: '#7A8299' }}>
                          Depende de atualização manual de protocolos
                        </td>
                        <td className="px-6 py-4 text-center font-medium" style={{ color: '#14BDAE' }}>
                          Modelo aprende continuamente com dados
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-xl p-6 border" style={{ backgroundColor: '#1E2535', borderColor: '#0D7377' }}>
                  <div className="text-4xl font-bold mb-2" style={{ color: '#14BDAE' }}>90%+</div>
                  <p className="text-sm font-medium" style={{ color: '#D8DEEB' }}>Redução de tempo operacional</p>
                </div>
                <div className="rounded-xl p-6 border" style={{ backgroundColor: '#1E2535', borderColor: '#1E2535' }}>
                  <div className="text-4xl font-bold mb-2" style={{ color: '#14BDAE' }}>24/7</div>
                  <p className="text-sm font-medium" style={{ color: '#D8DEEB' }}>Monitoramento contínuo ativo</p>
                </div>
                <div className="rounded-xl p-6 border" style={{ backgroundColor: '#1E2535', borderColor: '#14BDAE' }}>
                  <div className="text-4xl font-bold mb-2" style={{ color: '#14BDAE' }}>15+</div>
                  <p className="text-sm font-medium" style={{ color: '#D8DEEB' }}>Variáveis clínicas analisadas</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: '#0B0E14' }}>
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <FadeIn delay={0.1} direction="up">
            <h2 className="text-3xl lg:text-4xl font-bold" style={{ color: '#F0EAD6' }}>
              Pronto para Ver na Prática?
            </h2>
            </FadeIn>
            <FadeIn delay={0.2} direction="up">
            <p className="text-xl" style={{ color: '#D8DEEB' }}>
              Comece hoje mesmo a transformar seu acompanhamento pós-operatório com inteligência artificial
            </p>
            </FadeIn>
            <FadeIn delay={0.3} direction="up">
            <Link
              href="/cadastro-medico?plan=professional"
              className="inline-flex items-center gap-3 px-12 py-6 text-white text-xl rounded-2xl font-bold hover-lift-strong hover:shadow-2xl hover:shadow-[#0D7377]/50 transition-all duration-500 shadow-xl" style={{ backgroundColor: '#0D7377' }}
            >
              Começar Agora
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#0B0E14', borderTop: '1px solid #1E2535' }}>
        <div className="container mx-auto px-6">
          <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Company Info */}
            <div className="space-y-6">
              <div className="flex items-baseline gap-0.5">
                <span className="font-brand text-3xl" style={{ fontWeight: 300, color: '#F0EAD6' }}>
                  Vig<em className="not-italic" style={{ color: '#14BDAE', fontStyle: 'italic' }}>IA</em>
                </span>
              </div>
              <p className="leading-relaxed text-justify" style={{ color: '#7A8299' }}>
                A Inteligência no Cuidado para o Propósito da Recuperação.
              </p>
              <p className="leading-relaxed text-justify" style={{ color: '#7A8299' }}>
                Transformando o acompanhamento pós-operatório com IA.
              </p>
            </div>

            {/* Navigation */}
            <div className="space-y-6">
              <h3 className="font-brand text-lg" style={{ fontWeight: 400, color: '#F0EAD6' }}>Navegação</h3>
              <ul className="space-y-3">
                <li><Link href="/" className="transition-colors hover:text-[#F0EAD6]" style={{ color: '#7A8299' }}>Início</Link></li>
                <li><Link href="/sobre" className="transition-colors hover:text-[#F0EAD6]" style={{ color: '#7A8299' }}>Sobre</Link></li>
                <li><Link href="/pricing" className="transition-colors hover:text-[#F0EAD6]" style={{ color: '#7A8299' }}>Planos</Link></li>
                <li><Link href="/cadastro-medico" className="transition-colors hover:text-[#F0EAD6]" style={{ color: '#7A8299' }}>Cadastro</Link></li>
              </ul>
            </div>

            {/* For Doctors */}
            <div className="space-y-6">
              <h3 className="font-brand text-lg" style={{ fontWeight: 400, color: '#F0EAD6' }}>Para Médicos</h3>
              <ul className="space-y-3">
                <li><Link href="/pricing" className="transition-colors hover:text-[#F0EAD6]" style={{ color: '#7A8299' }}>Planos e Preços</Link></li>
                <li><Link href="/como-funciona" className="transition-colors hover:text-[#F0EAD6]" style={{ color: '#7A8299' }}>Como Funciona</Link></li>
                <li><Link href="/faq" className="transition-colors hover:text-[#F0EAD6]" style={{ color: '#7A8299' }}>FAQ</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-6">
              <h3 className="font-brand text-lg" style={{ fontWeight: 400, color: '#F0EAD6' }}>Contato</h3>
              <ul className="space-y-4">
                <li>
                  <div>
                    <p className="font-semibold" style={{ color: '#F0EAD6' }}>Email</p>
                    <a href="mailto:telos.ia@gmail.com" className="transition-colors hover:text-[#F0EAD6]" style={{ color: '#7A8299' }}>telos.ia@gmail.com</a>
                  </div>
                </li>
                <li>
                  <div>
                    <p className="font-semibold" style={{ color: '#F0EAD6' }}>Localização</p>
                    <p style={{ color: '#7A8299' }}>João Pessoa, Paraíba</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="py-8" style={{ borderTop: '1px solid #1E2535' }}>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-center md:text-left" style={{ color: '#7A8299' }}>
                © 2025 VigIA - Dr. João Vitor Viana. Todos os direitos reservados.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <Link href="/termos" className="transition-colors hover:text-[#F0EAD6]" style={{ color: '#7A8299' }}>Termos de Uso</Link>
                <Link href="/termos" className="transition-colors hover:text-[#F0EAD6]" style={{ color: '#7A8299' }}>Política de Privacidade</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
