import Image from "next/image"
import Link from "next/link"
import { TelosHeader } from "@/components/TelosHeader"
import { FadeIn, SlideIn, FloatingParticles } from "@/components/animations"

// Deploy with complete Research Mode section - scientific research features
export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <TelosHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-white py-20">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob-move"></div>
          <div className="absolute top-20 right-20 w-96 h-96 bg-telos-gold/20 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob-move animation-delay-400"></div>
          <div className="absolute -bottom-20 left-1/2 w-80 h-80 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob-move animation-delay-800"></div>
          <FloatingParticles />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <div className="space-y-8">
              <FadeIn delay={0.1} direction="up">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full border-pulse-anim">
                    <div className="w-2 h-2 bg-telos-gold rounded-full icon-breathe"></div>
                    <span className="text-sm font-medium text-telos-blue">
                      Tecnologia + Propósito
                    </span>
                  </div>

                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                    <span className="telos-brand text-telos-blue inline-block hover-tilt">Telos</span>
                    <span className="telos-ai text-telos-gold inline-block">.AI</span>
                  </h1>

                  <p className="text-xl sm:text-2xl text-gray-700 font-light">
                    Sistema de Acompanhamento Pós-Operatório com{" "}
                    <span className="text-telos-gold font-medium">
                      Inteligência Artificial
                    </span>
                  </p>
                </div>
              </FadeIn>

              <FadeIn delay={0.3} direction="up">
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl text-justify">
                  Monitore seus pacientes com análise automática de riscos e alertas em tempo real via WhatsApp.
                  <span className="font-semibold text-telos-blue"> Detecção precoce de complicações.</span>{" "}
                  <span className="font-semibold text-telos-blue">Coleta automática de dados.</span>{" "}
                  <span className="font-semibold text-telos-blue">Mais tempo para você.</span>
                </p>
              </FadeIn>

              <FadeIn delay={0.5} direction="up">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/cadastro-medico?plan=founding"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-telos-gold text-white rounded-lg font-semibold hover-lift-strong transition-smooth shadow-lg hover-glow-strong animate-glow-pulse-strong card-shine"
                  >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                  Quero ser Membro
                </Link>

                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-telos-blue text-white rounded-lg font-semibold hover-lift transition-smooth shadow-lg"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Ver Planos
                </Link>
                </div>
              </FadeIn>
            </div>

            {/* Right Column - Visual Element */}
            <SlideIn delay={0.2} direction="right">
              <div className="relative w-full h-[400px] sm:h-[500px] flex items-center justify-center">
                {/* Glowing Ring Behind Logo */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[420px] h-[420px] rounded-full bg-gradient-to-r from-telos-blue/20 to-telos-gold/20 animate-spin-slow blur-2xl"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[380px] h-[380px] rounded-full bg-telos-gold/10 animate-morph"></div>
                </div>

                <Image
                  src="/icons/icon-512.png"
                  alt="Telos.AI - Acompanhamento Pós-Operatório"
                  width={400}
                  height={400}
                  className="drop-shadow-2xl animate-float hover-scale transition-smooth relative z-10"
                  priority
                />
              </div>
            </SlideIn>
          </div>
        </div>
      </section>

      {/* Why Subscribe Section - 6 Real Benefits */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <FadeIn delay={0.1} direction="up">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-telos-blue mb-4">
                Por que Assinar o Telos.AI?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Benefícios reais para sua prática médica e produção científica
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* 1. Organize Dados Automaticamente - AMARELO */}
            <FadeIn delay={0.2} direction="up">
              <div className="group h-full p-8 bg-gradient-to-br from-white to-yellow-50/50 border-2 border-gray-100 rounded-2xl hover:border-telos-gold hover:shadow-2xl hover:shadow-telos-gold/20 transition-all duration-500 shadow-lg card-shine flex flex-col hover:-translate-y-2 hover:scale-[1.02]">
                <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-telos-gold group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 icon-breathe shadow-md">
                  <svg className="w-8 h-8 text-telos-gold group-hover:text-white transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-telos-blue mb-3">Organize Dados Automaticamente</h3>
                <p className="text-gray-600 leading-relaxed mb-4 text-justify flex-grow">
                  Sistema coleta e organiza tudo automaticamente. Tenha os dados pós-operatórios dos seus pacientes organizados.
                  Analise complicações, compare tratamentos, avalie a evolução da dor. Tome decisões baseadas em dados reais.
                </p>
                <div className="pt-4 border-t border-gray-100 mt-auto">
                  <p className="text-sm text-telos-gold font-semibold">
                    📊 Dados sempre organizados e acessíveis
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* 2. Detecção Precoce de Complicações - AZUL */}
            <FadeIn delay={0.3} direction="up">
              <div className="group h-full p-8 bg-gradient-to-br from-white to-blue-50/50 border-2 border-gray-100 rounded-2xl hover:border-telos-blue hover:shadow-2xl hover:shadow-telos-blue/20 transition-all duration-500 shadow-lg card-shine flex flex-col hover:-translate-y-2 hover:scale-[1.02]">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-telos-blue group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 icon-breathe shadow-md">
                  <svg className="w-8 h-8 text-telos-blue group-hover:text-white transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-telos-blue mb-3">Detecte Complicações Antes</h3>
                <p className="text-gray-600 leading-relaxed mb-4 text-justify flex-grow">
                  IA analisa respostas em tempo real e identifica red flags automaticamente.
                  Você é alertado apenas quando há risco real, evitando emergências.
                </p>
                <div className="pt-4 border-t border-gray-100 mt-auto">
                  <p className="text-sm text-telos-gold font-semibold">
                    🚨 Alertas inteligentes 24/7
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* 3. Paciente se Sente Cuidado - AMARELO (sem coração) */}
            <FadeIn delay={0.4} direction="up">
              <div className="group h-full p-8 bg-gradient-to-br from-white to-yellow-50/50 border-2 border-gray-100 rounded-2xl hover:border-telos-gold hover:shadow-2xl hover:shadow-telos-gold/20 transition-all duration-500 shadow-lg card-shine flex flex-col hover:-translate-y-2 hover:scale-[1.02]">
                <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-telos-gold group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 icon-breathe shadow-md">
                  <svg className="w-8 h-8 text-telos-gold group-hover:text-white transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-telos-blue mb-3">Paciente se Sente Cuidado</h3>
                <p className="text-gray-600 leading-relaxed mb-4 text-justify flex-grow">
                  Mensagens personalizadas diárias mostram atenção e cuidado.
                  Pacientes satisfeitos recomendam você para familiares e amigos.
                </p>
                <div className="pt-4 border-t border-gray-100 mt-auto">
                  <p className="text-sm text-telos-gold font-semibold">
                    ⭐ Mais indicações espontâneas
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* 4. Mais Indicações de Pacientes - AZUL */}
            <FadeIn delay={0.5} direction="up">
              <div className="group h-full p-8 bg-gradient-to-br from-white to-blue-50/50 border-2 border-gray-100 rounded-2xl hover:border-telos-blue hover:shadow-2xl hover:shadow-telos-blue/20 transition-all duration-500 shadow-lg card-shine flex flex-col hover:-translate-y-2 hover:scale-[1.02]">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-telos-blue group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 icon-breathe shadow-md">
                  <svg className="w-8 h-8 text-telos-blue group-hover:text-white transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-telos-blue mb-3">Gere Mais Indicações</h3>
                <p className="text-gray-600 leading-relaxed mb-4 text-justify flex-grow">
                  Experiência diferenciada no pós-operatório transforma pacientes em promotores.
                  Destaque-se dos colegas com tecnologia de ponta.
                </p>
                <div className="pt-4 border-t border-gray-100 mt-auto">
                  <p className="text-sm text-telos-gold font-semibold">
                    🎯 Diferencial competitivo real
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* 5. Recupere Seu Tempo - AMARELO */}
            <FadeIn delay={0.6} direction="up">
              <div className="group h-full p-8 bg-gradient-to-br from-white to-yellow-50/50 border-2 border-gray-100 rounded-2xl hover:border-telos-gold hover:shadow-2xl hover:shadow-telos-gold/20 transition-all duration-500 shadow-lg card-shine flex flex-col hover:-translate-y-2 hover:scale-[1.02]">
                <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-telos-gold group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 icon-breathe shadow-md">
                  <svg className="w-8 h-8 text-telos-gold group-hover:text-white transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-telos-blue mb-3">Recupere Seu Tempo</h3>
                <p className="text-gray-600 leading-relaxed mb-4 text-justify flex-grow">
                  Sem ligações manuais, sem planilhas desorganizadas. Sistema trabalha 24/7.
                  Economize até 2h/dia para focar em cirurgias, família e qualidade de vida.
                </p>
                <div className="pt-4 border-t border-gray-100 mt-auto">
                  <p className="text-sm text-telos-gold font-semibold">
                    ⏰ Até 10h/semana economizadas
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* 6. Reduza Custos Operacionais - AZUL */}
            <FadeIn delay={0.7} direction="up">
              <div className="group h-full p-8 bg-gradient-to-br from-white to-blue-50/50 border-2 border-gray-100 rounded-2xl hover:border-telos-blue hover:shadow-2xl hover:shadow-telos-blue/20 transition-all duration-500 shadow-lg card-shine flex flex-col hover:-translate-y-2 hover:scale-[1.02]">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-telos-blue group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 icon-breathe shadow-md">
                  <svg className="w-8 h-8 text-telos-blue group-hover:text-white transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-telos-blue mb-3">Reduza Custos</h3>
                <p className="text-gray-600 leading-relaxed mb-4 text-justify flex-grow">
                  Evite complicações evitáveis e reinternações. Detecção precoce reduz custos com emergências.
                  ROI positivo desde o primeiro mês de uso.
                </p>
                <div className="pt-4 border-t border-gray-100 mt-auto">
                  <p className="text-sm text-telos-gold font-semibold">
                    💰 Menos complicações = menos custos
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.7} direction="up">
            <div className="mt-12 text-center">
              <Link
                href="/pricing"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-telos-blue text-white rounded-xl font-bold text-lg hover-lift-strong hover:shadow-2xl hover:shadow-telos-blue/50 hover:bg-telos-gold transition-all duration-500 shadow-xl"
              >
                Ver Planos e Garantir Minha Vaga
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <FadeIn delay={0.1} direction="up">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-telos-blue mb-4">
              Como Funciona
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              4 passos simples para revolucionar seu pós-operatório
            </p>
          </div>
          </FadeIn>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                step: "1",
                icon: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z",
                title: "Cadastro",
                description: "Cadastre o paciente em 30 segundos com dados básicos"
              },
              {
                step: "2",
                icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
                title: "WhatsApp",
                description: "Sistema envia questionários automáticos via WhatsApp"
              },
              {
                step: "3",
                icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
                title: "IA Analisa",
                description: "IA avançada detecta red flags e avalia respostas"
              },
              {
                step: "4",
                icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
                title: "Você Decide",
                description: "Receba alertas e tome decisões baseadas em dados"
              }
            ].map((item, idx) => (
              <div key={idx} className="text-center group animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="space-y-5">
                  <div className="relative mx-auto w-20 h-20">
                    <div className="absolute inset-0 bg-telos-blue rounded-2xl transform rotate-6 group-hover:rotate-12 transition-transform opacity-10 rotate-very-slow"></div>
                    <div className="relative w-full h-full bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-telos-blue transition-colors icon-breathe">
                      <svg className="w-10 h-10 text-telos-blue group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-telos-gold rounded-full flex items-center justify-center text-white font-bold shadow-lg badge-float-anim">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-telos-blue px-2">{item.title}</h3>
                  <p className="text-gray-600 text-justify leading-relaxed px-2">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research Mode Section - DESTAQUE */}
      <section className="py-16 sm:py-24 telos-gradient relative overflow-hidden">

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left - Content */}
            <FadeIn delay={0.2} direction="left">
              <div className="space-y-6 sm:space-y-8 text-white">
                <div className="inline-flex items-center gap-3 px-4 sm:px-5 py-2 sm:py-3 bg-telos-gold/20 border-2 border-telos-gold rounded-full">
                  <div className="w-3 h-3 bg-telos-gold rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm font-bold text-telos-gold uppercase tracking-wide">
                    🔬 Exclusivo Telos.AI
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight">
                  Modo Pesquisa
                  <br />
                  <span className="text-telos-gold">Científica</span>
                </h2>

                <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-blue-100">
                  Transforme Seus Dados em Publicações de Impacto
                </p>

                <p className="text-base sm:text-lg text-blue-200 leading-relaxed text-justify">
                  O primeiro sistema de IA médica do Brasil com funcionalidade dedicada para{" "}
                  <span className="text-telos-gold font-bold">organização automática de estudos clínicos</span>.
                  Revolucione sua produção científica enquanto cuida dos seus pacientes.
                </p>

                {/* Key Features do Modo Pesquisa */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start gap-3 sm:gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/20">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-telos-gold rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-1 sm:mb-2">Organização Automática de Grupos</h4>
                      <p className="text-sm sm:text-base text-blue-200 text-justify">
                        Crie e gerencie grupos de pesquisa automaticamente. Organize pacientes por tipo de cirurgia,
                        protocolo experimental, ou qualquer critério científico.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 sm:gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/20">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-telos-gold rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-1 sm:mb-2">Exportação Pronta para Publicação</h4>
                      <p className="text-sm sm:text-base text-blue-200 text-justify">
                        Exporte dados anonimizados em formatos prontos para análise estatística (CSV, Excel, SPSS).
                        Conformidade total com LGPD e ética em pesquisa.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 sm:gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/20">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-telos-gold rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-1 sm:mb-2">Análise Estatística Integrada</h4>
                      <p className="text-sm sm:text-base text-blue-200 text-justify">
                        Visualize tendências, compare grupos, identifique correlações. A IA sugere análises relevantes
                        para seus dados automaticamente.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 sm:pt-6">
                  <Link
                    href="/cadastro-medico?plan=professional"
                    className="group inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-10 py-4 sm:py-5 bg-telos-gold text-white rounded-xl font-bold text-base sm:text-lg lg:text-xl hover-lift hover-glow transition-smooth shadow-2xl w-full sm:w-auto"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="hidden sm:inline">Ativar Modo Pesquisa Agora</span>
                    <span className="sm:hidden">Ativar Agora</span>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <p className="text-xs sm:text-sm text-blue-200 mt-3 sm:mt-4 italic text-center sm:text-left">
                    ✨ Disponível em todos os planos Professional e Founding Member
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* Right - Visual/Stats */}
            <FadeIn delay={0.4} direction="right">
              <div className="relative mt-8 lg:mt-0">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border-2 border-white/20 shadow-2xl">
                  <div className="space-y-4 sm:space-y-6">
                    {/* Stat Cards */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center transform hover:scale-105 transition-transform">
                        <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-telos-blue mb-1 sm:mb-2">100%</p>
                        <p className="text-xs sm:text-sm text-gray-600 font-semibold">Conforme LGPD</p>
                      </div>
                      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center transform hover:scale-105 transition-transform">
                        <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-telos-gold mb-1 sm:mb-2">1-Click</p>
                        <p className="text-xs sm:text-sm text-gray-600 font-semibold">Exportação</p>
                      </div>
                      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center transform hover:scale-105 transition-transform">
                        <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-telos-blue mb-1 sm:mb-2">∞</p>
                        <p className="text-xs sm:text-sm text-gray-600 font-semibold">Grupos</p>
                      </div>
                      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center transform hover:scale-105 transition-transform">
                        <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-telos-gold mb-1 sm:mb-2">AI</p>
                        <p className="text-xs sm:text-sm text-gray-600 font-semibold">Análise Auto</p>
                      </div>
                    </div>

                    {/* Use Case Example */}
                    <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-telos-gold/30">
                      <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-telos-blue rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-telos-blue text-base sm:text-lg mb-1">Exemplo de Caso de Uso</h5>
                          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed text-justify">
                            "Organizei 150 pacientes de artroplastia de quadril em 3 grupos de pesquisa.
                            Em 2 cliques exportei todos os dados anonimizados e publiquei meu primeiro artigo
                            em 6 meses. O Modo Pesquisa mudou minha carreira acadêmica."
                          </p>
                          <p className="text-xs text-telos-gold font-semibold mt-2">
                            - Dr. Ricardo M., Ortopedista
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-2 sm:space-y-3">
                      <h5 className="text-white font-bold text-base sm:text-lg mb-2 sm:mb-3">Inclui também:</h5>
                      {[
                        "Anonimização automática (LGPD)",
                        "Termos de consentimento digitais",
                        "Filtros avançados por período/tipo",
                        "Gráficos e dashboards customizados"
                      ].map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 sm:gap-3 text-white">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-telos-gold rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-xs sm:text-sm font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Floating badge */}
                <div className="absolute -top-4 sm:-top-6 -right-4 sm:-right-6 bg-gradient-to-br from-telos-gold to-yellow-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-2xl badge-float-anim subtle-glow-pulse">
                  <p className="font-black text-sm sm:text-base lg:text-lg">🏆 Exclusivo!</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Current Specialization Section - FOMO */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <FadeIn delay={0.1} direction="up">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-telos-gold/10 border-2 border-telos-gold/30 rounded-full mb-4">
                  <div className="w-2 h-2 bg-telos-gold rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold text-telos-gold uppercase tracking-wide">
                    Especialização Atual
                  </span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-telos-blue mb-4">
                  Foco Inicial em Cirurgias Orificiais
                </h2>
              </div>
            </FadeIn>

            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100">
              <FadeIn delay={0.2} direction="up">
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-telos-blue mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-telos-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Atualmente especializado em:
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      "Doença hemorroidária",
                      "Fístulas anorretais",
                      "Fissuras anais",
                      "Doença pilonidal"
                    ].map((surgery, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                        <div className="w-2 h-2 bg-telos-blue rounded-full"></div>
                        <span className="text-gray-700 font-medium">{surgery}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={0.3} direction="up">
                <div className="bg-gradient-to-r from-telos-gold/10 to-telos-blue/10 rounded-xl p-6 border-2 border-telos-gold/30">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-telos-gold rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-telos-blue mb-2">
                        🚀 Em breve: Expansão para outras cirurgias
                      </h4>
                      <p className="text-gray-700 leading-relaxed text-justify mb-4">
                        Estamos expandindo o sistema para <span className="font-semibold text-telos-blue">colecistectomias,
                        herniorrafias e outras especialidades cirúrgicas</span>. Seja um Early Adopter e
                        influencie as próximas funcionalidades.
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-5 h-5 text-telos-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold text-telos-gold">
                          Founding Members terão acesso prioritário a novas especialidades
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={0.4} direction="up">
                <div className="mt-8 text-center">
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-telos-blue text-white rounded-xl font-bold text-lg hover-lift-strong transition-smooth shadow-lg"
                  >
                    Garantir Vaga Early Adopter Agora
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <p className="text-sm text-gray-600 mt-3">
                    ⚡ Apenas 13 vagas com desconto disponíveis
                  </p>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <FadeIn delay={0.1} direction="up">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-telos-blue mb-4">
                Tecnologia a Serviço do Cuidado
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Um sistema completo de acompanhamento pós-operatório com inteligência artificial
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto stagger-fade-in">
            {/* Feature 1 */}
            <div className="group p-8 bg-white border-2 border-gray-100 rounded-2xl hover:border-telos-gold hover-lift transition-smooth animate-fade-in-up">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-telos-gold group-hover:scale-110 group-hover:rotate-12 transition-smooth">
                <svg
                  className="w-8 h-8 text-telos-blue group-hover:text-white transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-telos-blue mb-3">
                Follow-up Automático
              </h3>
              <p className="text-gray-600 leading-relaxed text-justify">
                Acompanhamento em D+1, D+2, D+3, D+5, D+7, D+10 e D+14 com questionários via WhatsApp
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 bg-white border-2 border-gray-100 rounded-2xl hover:border-telos-gold hover-lift transition-smooth animate-fade-in-up">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-telos-gold group-hover:scale-110 group-hover:rotate-12 transition-smooth">
                <svg
                  className="w-8 h-8 text-telos-blue group-hover:text-white transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-telos-blue mb-3">
                Análise com IA
              </h3>
              <p className="text-gray-600 leading-relaxed text-justify">
                Inteligência Artificial analisa respostas e detecta red flags automaticamente, alertando o médico
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 bg-white border-2 border-gray-100 rounded-2xl hover:border-telos-gold hover-lift transition-smooth animate-fade-in-up">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-telos-gold group-hover:scale-110 group-hover:rotate-12 transition-smooth">
                <svg
                  className="w-8 h-8 text-telos-blue group-hover:text-white transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-telos-blue mb-3">
                Exportação de Dados
              </h3>
              <p className="text-gray-600 leading-relaxed text-justify">
                Dados organizados e anonimizados para sua avaliação e análise, em conformidade com LGPD
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-telos-blue">
              Pronto para Transformar seu Pós-Operatório?
            </h2>
            <p className="text-xl text-gray-700">
              Junte-se aos médicos que já confiam na{" "}
              <span className="telos-brand text-telos-blue font-semibold">Telos</span>
              <span className="telos-ai text-telos-gold">.AI</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/cadastro-medico?plan=founding"
                className="inline-flex items-center gap-3 px-10 py-5 bg-telos-gold text-white text-lg rounded-xl font-bold hover-lift hover-glow transition-smooth shadow-2xl"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                Garantir Minha Vaga
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-3 px-10 py-5 bg-white text-telos-blue text-lg rounded-xl font-bold hover-lift transition-smooth shadow-2xl"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Ver Planos
              </Link>
            </div>
            <p className="text-sm text-telos-blue">
              Já tem conta?{" "}
              <Link href="/auth/login" className="text-telos-gold hover:text-yellow-300 font-semibold underline">
                Fazer login
              </Link>
            </p>
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
    </div>
  )
}
