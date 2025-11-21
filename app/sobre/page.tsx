"use client"

import Image from "next/image"
import Link from "next/link"
import { TelosHeader } from "@/components/TelosHeader"
import { FadeIn } from "@/components/animations/FadeIn"

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-white">
      <TelosHeader />

      {/* Hero Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6">
          <FadeIn delay={0.1} direction="up">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold">
                Sobre o{" "}
                <span className="telos-brand text-telos-blue">Telos</span>
                <span className="telos-ai text-telos-gold">.AI</span>
              </h1>
              <p className="text-2xl text-gray-700 font-light">
                A{" "}
                <span className="text-telos-gold font-medium">
                  Inteligência
                </span>{" "}
                no Cuidado para o{" "}
                <span className="text-telos-blue font-medium">
                  Propósito
                </span>{" "}
                da Recuperação
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Sobre o Projeto */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <FadeIn delay={0.2} direction="left">
                <div className="space-y-6">
                <h2 className="text-3xl font-bold text-telos-blue">O Projeto</h2>
                <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                  <p className="text-justify">
                    <span className="telos-brand font-semibold text-telos-blue">Telos</span>
                    <span className="telos-ai font-semibold text-telos-gold">.AI</span> nasceu da
                    intersecção entre medicina e tecnologia, com um propósito claro: transformar o
                    acompanhamento pós-operatório através da Inteligência Artificial.
                  </p>
                  <p className="text-justify">
                    <em>Telos</em>, na filosofia aristotélica, significa <strong>"propósito final"</strong> ou <strong>"fim último"</strong> —
                    a razão pela qual algo existe. Para nós, esse propósito é a recuperação plena do paciente,
                    o objetivo que guia cada decisão clínica e cada funcionalidade da plataforma.
                  </p>
                  <p className="text-justify">
                    Utilizamos Inteligência Artificial de última geração para
                    analisar respostas de pacientes em tempo real, detectar sinais de alerta e
                    permitir que você, médico, tome decisões baseadas em dados concretos.
                  </p>
                  <p className="text-justify">
                    Nosso sistema automatiza o follow-up via WhatsApp em dias estratégicos
                    (D+1, D+2, D+3, D+5, D+7, D+10 e D+14), garantindo que nenhum paciente seja
                    esquecido e que complicações sejam identificadas precocemente.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-fade-in-up animation-delay-400">
                  <Link
                    href="/cadastro-medico?plan=founding"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-telos-gold text-white rounded-lg font-semibold hover-lift-strong transition-smooth shadow-lg card-shine"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    Ser Founding Member
                  </Link>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-telos-blue text-telos-blue rounded-lg font-semibold hover:border-telos-gold hover-lift-strong transition-all shadow-lg"
                  >
                    Ver Planos
                  </Link>
                </div>
              </div>
              </FadeIn>

              <FadeIn delay={0.3} direction="right">
                <div className="relative">
                <div className="relative w-full h-[400px] flex items-center justify-center">
                  <Image
                    src="/icons/icon-512.png"
                    alt="Telos.AI"
                    width={350}
                    height={350}
                    className="drop-shadow-2xl hover-scale"
                  />
                </div>
              </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Sobre o Fundador */}
      <section className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <FadeIn delay={0.2} direction="left">
              <div className="order-2 lg:order-1 relative space-y-4">
                <div className="relative w-full h-[450px] rounded-3xl shadow-2xl overflow-hidden hover-lift-strong">
                  <Image
                    src="/congress photo.jpeg"
                    alt="Dr. João Vitor Viana"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-telos-blue text-lg font-semibold">Dr. João Vitor Viana</p>
                  <p className="text-gray-600 text-sm">Médico Coloproctologista</p>
                  <p className="text-gray-500 text-xs">Founder & CEO</p>
                </div>
              </div>
              </FadeIn>

              <FadeIn delay={0.4} direction="right">
              <div className="order-1 lg:order-2 space-y-6">
                <h2 className="text-3xl font-bold text-telos-blue">O Fundador</h2>
                <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                  <p className="text-justify">
                    <strong className="text-telos-blue">Dr. João Vitor Viana</strong> é cirurgião coloretal
                    com residência médica em Cirurgia Geral pelo Hospital Universitário Onofre Lopes (HUOL/UFRN)
                    e residência em Coloproctologia pelo Hospital Santa Isabel em João Pessoa.
                  </p>
                  <p className="text-justify">
                    Atualmente, cursa Mestrado em Ciência Cirúrgica Interdisciplinar
                    na Universidade Federal de São Paulo (Unifesp) — Escola Paulista de Medicina,
                    e pós-graduação em Ciências Políticas e Atuação Pública na Faculdade Internacional Cidade Viva (FICV).
                    Entusiasta de tecnologias e promotor de protocolos de recuperação acelerada, fundamenta sua
                    prática na medicina baseada em evidências.
                  </p>
                  <p className="text-justify">
                    Frustrado com a dificuldade de acompanhar dezenas de pacientes pós-operatórios simultaneamente
                    de forma personalizada e eficiente, decidiu unir sua experiência clínica, formação científica
                    e visão de inovação para criar uma solução que pudesse beneficiar médicos e pacientes em todo
                    o Brasil, democratizando o acesso à tecnologia de ponta no cuidado pós-operatório.
                  </p>
                </div>

                <div className="pt-4">
                  <blockquote className="border-l-4 border-telos-gold pl-6 py-4 bg-blue-50/50 rounded-r-lg">
                    <p className="text-gray-700 italic text-lg leading-relaxed text-justify">
                      "A tecnologia não substitui o médico, mas potencializa sua capacidade de
                      cuidar. Com Telos.AI, cada médico pode acompanhar pacientes com mais
                      qualidade, identificando problemas antes que se tornem complicações."
                    </p>
                    <footer className="mt-4 text-telos-blue font-semibold">
                      — Dr. João Vitor Viana
                    </footer>
                  </blockquote>
                </div>
              </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Nossa Missão */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <FadeIn delay={0.1} direction="up">
            <h2 className="text-3xl font-bold text-telos-blue">Nossa Missão</h2>
            </FadeIn>

            <div className="grid md:grid-cols-3 gap-8">
              <FadeIn delay={0.2} direction="up">
              <div className="group h-full p-8 bg-white rounded-2xl border-2 border-gray-100 hover:border-telos-blue hover-lift-strong transition-smooth shadow-lg card-shine flex flex-col">
                <div className="w-16 h-16 mx-auto bg-telos-blue rounded-2xl flex items-center justify-center mb-6 hover-scale transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-telos-blue mb-4 text-center">Cuidado Proativo</h3>
                <p className="text-gray-600 text-justify leading-relaxed flex-grow">
                  Transformar o acompanhamento pós-operatório de reativo para proativo,
                  identificando riscos antes que se tornem problemas.
                </p>
              </div>
              </FadeIn>

              <FadeIn delay={0.3} direction="up">
              <div className="group h-full p-8 bg-white rounded-2xl border-2 border-gray-100 hover:border-telos-gold hover-lift-strong transition-smooth shadow-lg card-shine flex flex-col">
                <div className="w-16 h-16 mx-auto bg-telos-gold rounded-2xl flex items-center justify-center mb-6 hover-scale transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-telos-blue mb-4 text-center">Tecnologia Acessível</h3>
                <p className="text-gray-600 text-justify leading-relaxed flex-grow">
                  Democratizar o acesso à IA de ponta para médicos de todo o Brasil, com
                  preços justos e transparentes.
                </p>
              </div>
              </FadeIn>

              <FadeIn delay={0.4} direction="up">
              <div className="group h-full p-8 bg-white rounded-2xl border-2 border-gray-100 hover:border-telos-blue hover-lift-strong transition-smooth shadow-lg card-shine flex flex-col">
                <div className="w-16 h-16 mx-auto bg-telos-blue rounded-2xl flex items-center justify-center mb-6 hover-scale transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-telos-blue mb-4 text-center">Ciência e Dados</h3>
                <p className="text-gray-600 text-justify leading-relaxed flex-grow">
                  Facilitar a produção científica através de dados organizados, anonimizados
                  e prontos para pesquisa.
                </p>
              </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Visão de Futuro */}
      <section className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            <FadeIn delay={0.1} direction="up">
            <h2 className="text-3xl font-bold text-telos-blue text-center">Visão de Futuro</h2>
            </FadeIn>

            <FadeIn delay={0.2} direction="up">
            <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
              <p className="text-justify">
                <strong className="text-telos-blue">O futuro da medicina é colaborativo e orientado por dados.</strong> Acreditamos
                que a Inteligência Artificial não substitui o médico, mas amplifica sua capacidade de análise,
                predição e tomada de decisão. No pós-operatório, onde cada hora conta, essa transformação
                digital pode significar a diferença entre detectar uma complicação a tempo ou enfrentar
                uma emergência evitável.
              </p>

              <p className="text-justify">
                Machine Learning e IA estão revolucionando o acompanhamento pós-operatório ao identificar
                padrões invisíveis ao olho humano. Nosso sistema analisa milhares de respostas de pacientes,
                aprende com cada caso e aprimora continuamente sua capacidade de alertar médicos sobre
                sinais precoces de complicações.
              </p>

              <p className="text-justify">
                Mais do que isso, estamos construindo uma <strong className="text-telos-gold">inteligência coletiva</strong>: cada médico
                que usa Telos.AI contribui para um sistema que aprende com a experiência de centenas
                de profissionais. Isso significa que decisões clínicas se tornam mais precisas, guidelines
                se adaptam à realidade brasileira, e o conhecimento médico se multiplica exponencialmente.
              </p>

              <p className="text-justify">
                Tudo isso fundamentado nos pilares da <strong className="text-telos-blue">ética e da LGPD</strong>. Seus dados e os
                de seus pacientes são criptografados com SHA-256, anonimizados para pesquisa científica,
                e jamais compartilhados sem consentimento explícito. A tecnologia deve servir à medicina,
                não o contrário — e isso começa com transparência, segurança e respeito à privacidade.
              </p>
            </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Por que Telos.AI é Diferente */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto space-y-12">
            <FadeIn delay={0.1} direction="up">
            <h2 className="text-3xl font-bold text-telos-blue text-center">Por que Telos.AI é Diferente</h2>
            </FadeIn>

            <div className="grid md:grid-cols-2 gap-8">
              <FadeIn delay={0.2} direction="up">
              <div className="group h-full p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl border-2 border-gray-100 hover:border-telos-blue hover-lift-strong transition-smooth shadow-lg card-shine">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-telos-blue rounded-xl flex items-center justify-center flex-shrink-0 hover-scale transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-telos-blue">Machine Learning Preditivo</h3>
                    <p className="text-gray-700 leading-relaxed text-justify">
                      Não apenas coletamos dados — <strong>prevemos complicações</strong>. Nosso sistema
                      de IA analisa respostas em tempo real e identifica padrões de risco antes
                      que sintomas graves apareçam. É medicina preventiva de verdade.
                    </p>
                  </div>
                </div>
              </div>
              </FadeIn>

              <FadeIn delay={0.3} direction="up">
              <div className="group h-full p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl border-2 border-gray-100 hover:border-telos-gold hover-lift-strong transition-smooth shadow-lg card-shine">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-telos-gold rounded-xl flex items-center justify-center flex-shrink-0 hover-scale transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-telos-blue">Inteligência Coletiva</h3>
                    <p className="text-gray-700 leading-relaxed text-justify">
                      Cada médico que usa Telos.AI contribui para um sistema que <strong>aprende
                      com múltiplos profissionais</strong>. Sua experiência clínica ajuda a melhorar
                      os alertas para toda a comunidade médica. Juntos, somos mais fortes.
                    </p>
                  </div>
                </div>
              </div>
              </FadeIn>

              <FadeIn delay={0.4} direction="up">
              <div className="group h-full p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl border-2 border-gray-100 hover:border-telos-blue hover-lift-strong transition-smooth shadow-lg card-shine">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-telos-blue rounded-xl flex items-center justify-center flex-shrink-0 hover-scale transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-telos-blue">IA Conversacional Real</h3>
                    <p className="text-gray-700 leading-relaxed text-justify">
                      Powered by <strong>Claude Sonnet 4.5</strong>, a IA mais avançada da Anthropic.
                      Conversas naturais com pacientes, compreensão de contexto médico, e análise
                      de sintomas que vai muito além de chatbots simples. É inteligência de verdade.
                    </p>
                  </div>
                </div>
              </div>
              </FadeIn>

              <FadeIn delay={0.5} direction="up">
              <div className="group h-full p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl border-2 border-gray-100 hover:border-telos-gold hover-lift-strong transition-smooth shadow-lg card-shine">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-telos-gold rounded-xl flex items-center justify-center flex-shrink-0 hover-scale transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-telos-blue">LGPD-Compliant desde o Dia 1</h3>
                    <p className="text-gray-700 leading-relaxed text-justify">
                      Criptografia <strong>SHA-256</strong> de ponta a ponta, anonimização automática
                      para pesquisas, consentimento explícito em cada etapa. Segurança e privacidade
                      não são recursos opcionais — são fundamentos do nosso sistema.
                    </p>
                  </div>
                </div>
              </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <FadeIn delay={0.1} direction="up">
            <h2 className="text-3xl lg:text-4xl font-bold text-telos-blue">
              Faça Parte da Revolução no Pós-Operatório
            </h2>
            </FadeIn>
            <FadeIn delay={0.2} direction="up">
            <p className="text-xl text-gray-700">
              Apenas 3 vagas de Founding Members disponíveis com preço vitalício garantido
            </p>
            </FadeIn>
            <FadeIn delay={0.3} direction="up">
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
