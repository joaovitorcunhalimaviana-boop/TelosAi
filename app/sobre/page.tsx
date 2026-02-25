"use client"

import Image from "next/image"
import Link from "next/link"
import { VigiaHeader } from "@/components/VigiaHeader"
import { FadeIn } from "@/components/animations/FadeIn"

export default function SobrePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B0E14' }}>
      <VigiaHeader />

      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: '#0B0E14' }}>
        <div className="container mx-auto px-6">
          <FadeIn delay={0.1} direction="up">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold" style={{ color: '#F0EAD6' }}>
                Sobre a{" "}
                <span className="font-brand"><span style={{ color: '#F0EAD6' }}>Vig</span><span style={{ color: '#14BDAE' }}>IA</span></span>
              </h1>
              <p className="text-2xl font-light" style={{ color: '#D8DEEB' }}>
                A{" "}
                <span className="font-medium" style={{ color: '#F0EAD6' }}>
                  Inteligência
                </span>{" "}
                no Cuidado para o{" "}
                <span className="font-medium" style={{ color: '#14BDAE' }}>
                  Propósito
                </span>{" "}
                da Recuperação
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Sobre o Projeto */}
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: '#0B0E14' }}>
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <FadeIn delay={0.2} direction="left">
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold" style={{ color: '#F0EAD6' }}>O Projeto</h2>
                  <div className="space-y-4 text-lg leading-relaxed" style={{ color: '#D8DEEB' }}>
                    <p className="text-justify">
                      <span className="font-semibold" style={{ color: '#14BDAE' }}>VigIA</span> nasceu da
                      intersecção entre medicina e tecnologia, com um propósito claro: transformar o
                      acompanhamento pós-operatório através da Inteligência Artificial.
                    </p>
                    <p className="text-justify">
                      <em>VigIA</em> une <strong>&quot;Vigilância&quot;</strong> e <strong>&quot;IA&quot;</strong> (Inteligência Artificial) —
                      olhos atentos 24 horas por dia sobre a recuperação do seu paciente,
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
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 text-white rounded-lg font-semibold hover-lift-strong transition-smooth shadow-lg card-shine" style={{ backgroundColor: '#0D7377' }}
                    >
                      Ser Founding Member
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                    <Link
                      href="/pricing"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-[#14BDAE] rounded-lg font-semibold hover:border-[#14BDAE] hover-lift-strong transition-all shadow-lg" style={{ color: '#14BDAE' }}
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
                      src="/icons/vigia-logo.svg"
                      alt="VigIA Logo"
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
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: '#111520' }}>
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
                    <p className="text-lg font-semibold" style={{ color: '#14BDAE' }}>Dr. João Vitor Viana</p>
                    <p className="text-sm" style={{ color: '#7A8299' }}>Médico Coloproctologista</p>
                    <p className="text-xs" style={{ color: '#7A8299' }}>Founder & CEO</p>
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={0.4} direction="right">
                <div className="order-1 lg:order-2 space-y-6">
                  <h2 className="text-3xl font-bold" style={{ color: '#F0EAD6' }}>O Fundador</h2>
                  <div className="space-y-4 text-lg leading-relaxed" style={{ color: '#D8DEEB' }}>
                    <p className="text-justify">
                      <strong style={{ color: '#14BDAE' }}>Dr. João Vitor Viana</strong> é cirurgião coloretal
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
                    <blockquote className="border-l-4 border-[#14BDAE] pl-6 py-4 rounded-r-lg" style={{ backgroundColor: '#161B27' }}>
                      <p className="italic text-lg leading-relaxed text-justify" style={{ color: '#D8DEEB' }}>
                        &quot;A tecnologia não substitui o médico, mas potencializa sua capacidade de
                        cuidar. Com VigIA, cada médico pode acompanhar pacientes com mais
                        qualidade, identificando problemas antes que se tornem complicações.&quot;
                      </p>
                      <footer className="mt-4 font-semibold" style={{ color: '#14BDAE' }}>
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
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: '#0B0E14' }}>
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <FadeIn delay={0.1} direction="up">
              <h2 className="text-3xl font-bold" style={{ color: '#F0EAD6' }}>Nossa Missão</h2>
            </FadeIn>

            <div className="grid md:grid-cols-3 gap-8">
              <FadeIn delay={0.2} direction="up">
                <div className="group h-full p-8 rounded-2xl border-2 hover:border-[#14BDAE] hover-lift-strong transition-smooth shadow-lg card-shine flex flex-col" style={{ backgroundColor: '#161B27', borderColor: '#1E2535' }}>
                  <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 hover-scale transition-transform" style={{ backgroundColor: '#0D7377' }}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-center" style={{ color: '#F0EAD6' }}>Cuidado Proativo</h3>
                  <p className="text-justify leading-relaxed flex-grow" style={{ color: '#7A8299' }}>
                    Transformar o acompanhamento pós-operatório de reativo para proativo,
                    identificando riscos antes que se tornem problemas.
                  </p>
                </div>
              </FadeIn>

              <FadeIn delay={0.3} direction="up">
                <div className="group h-full p-8 rounded-2xl border-2 hover:border-[#14BDAE] hover-lift-strong transition-smooth shadow-lg card-shine flex flex-col" style={{ backgroundColor: '#161B27', borderColor: '#1E2535' }}>
                  <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 hover-scale transition-transform" style={{ backgroundColor: '#0D7377' }}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-center" style={{ color: '#F0EAD6' }}>Tecnologia Acessível</h3>
                  <p className="text-justify leading-relaxed flex-grow" style={{ color: '#7A8299' }}>
                    Democratizar o acesso à IA de ponta para médicos de todo o Brasil, com
                    preços justos e transparentes.
                  </p>
                </div>
              </FadeIn>

              <FadeIn delay={0.4} direction="up">
                <div className="group h-full p-8 rounded-2xl border-2 hover:border-[#14BDAE] hover-lift-strong transition-smooth shadow-lg card-shine flex flex-col" style={{ backgroundColor: '#161B27', borderColor: '#1E2535' }}>
                  <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 hover-scale transition-transform" style={{ backgroundColor: '#0D7377' }}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-center" style={{ color: '#F0EAD6' }}>Ciência e Dados</h3>
                  <p className="text-justify leading-relaxed flex-grow" style={{ color: '#7A8299' }}>
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
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: '#111520' }}>
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            <FadeIn delay={0.1} direction="up">
              <h2 className="text-3xl font-bold text-center" style={{ color: '#F0EAD6' }}>Visão de Futuro</h2>
            </FadeIn>

            <FadeIn delay={0.2} direction="up">
              <div className="space-y-6 text-lg leading-relaxed" style={{ color: '#D8DEEB' }}>
                <p className="text-justify">
                  <strong style={{ color: '#14BDAE' }}>O futuro da medicina é colaborativo e orientado por dados.</strong> Acreditamos
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
                  Mais do que isso, estamos construindo uma <strong style={{ color: '#14BDAE' }}>inteligência coletiva</strong>: cada médico
                  que usa VigIA contribui para um sistema que aprende com a experiência de centenas
                  de profissionais. Isso significa que decisões clínicas se tornam mais precisas, guidelines
                  se adaptam à realidade brasileira, e o conhecimento médico se multiplica exponencialmente.
                </p>

                <p className="text-justify">
                  Tudo isso fundamentado nos pilares da <strong style={{ color: '#14BDAE' }}>ética e da LGPD</strong>. Seus dados e os
                  de seus pacientes são criptografados com SHA-256, anonimizados para pesquisa científica,
                  e jamais compartilhados sem consentimento explícito. A tecnologia deve servir à medicina,
                  não o contrário — e isso começa com transparência, segurança e respeito à privacidade.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Por que VigIA é Diferente */}
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: '#0B0E14' }}>
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto space-y-12">
            <FadeIn delay={0.1} direction="up">
              <h2 className="text-3xl font-bold text-center" style={{ color: '#F0EAD6' }}>Por que a VigIA é Diferente</h2>
            </FadeIn>

            <div className="grid md:grid-cols-2 gap-8">
              <FadeIn delay={0.2} direction="up">
                <div className="group h-full p-8 rounded-2xl border-2 hover:border-[#14BDAE] hover-lift-strong transition-smooth shadow-lg card-shine" style={{ backgroundColor: '#161B27', borderColor: '#1E2535' }}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 hover-scale transition-transform" style={{ backgroundColor: '#0D7377' }}>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold" style={{ color: '#F0EAD6' }}>Machine Learning Preditivo</h3>
                      <p className="leading-relaxed text-justify" style={{ color: '#D8DEEB' }}>
                        Não apenas coletamos dados — <strong>prevemos complicações</strong>. Nosso sistema
                        de IA analisa respostas em tempo real e identifica padrões de risco antes
                        que sintomas graves apareçam. É medicina preventiva de verdade.
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={0.3} direction="up">
                <div className="group h-full p-8 rounded-2xl border-2 hover:border-[#14BDAE] hover-lift-strong transition-smooth shadow-lg card-shine" style={{ backgroundColor: '#161B27', borderColor: '#1E2535' }}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 hover-scale transition-transform" style={{ backgroundColor: '#0D7377' }}>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold" style={{ color: '#F0EAD6' }}>Inteligência Coletiva</h3>
                      <p className="leading-relaxed text-justify" style={{ color: '#D8DEEB' }}>
                        Cada médico que usa VigIA contribui para um sistema que <strong>aprende
                          com múltiplos profissionais</strong>. Sua experiência clínica ajuda a melhorar
                        os alertas para toda a comunidade médica. Juntos, somos mais fortes.
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={0.4} direction="up">
                <div className="group h-full p-8 rounded-2xl border-2 hover:border-[#14BDAE] hover-lift-strong transition-smooth shadow-lg card-shine" style={{ backgroundColor: '#161B27', borderColor: '#1E2535' }}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 hover-scale transition-transform" style={{ backgroundColor: '#0D7377' }}>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold" style={{ color: '#F0EAD6' }}>IA Conversacional Real</h3>
                      <p className="leading-relaxed text-justify" style={{ color: '#D8DEEB' }}>
                        Powered by <strong>Claude Sonnet 4.5</strong>, a IA mais avançada da Anthropic.
                        Conversas naturais com pacientes, compreensão de contexto médico, e análise
                        de sintomas que vai muito além de chatbots simples. É inteligência de verdade.
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={0.5} direction="up">
                <div className="group h-full p-8 rounded-2xl border-2 hover:border-[#14BDAE] hover-lift-strong transition-smooth shadow-lg card-shine" style={{ backgroundColor: '#161B27', borderColor: '#1E2535' }}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 hover-scale transition-transform" style={{ backgroundColor: '#0D7377' }}>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold" style={{ color: '#F0EAD6' }}>LGPD-Compliant desde o Dia 1</h3>
                      <p className="leading-relaxed text-justify" style={{ color: '#D8DEEB' }}>
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
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: '#111520' }}>
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <FadeIn delay={0.1} direction="up">
              <h2 className="text-3xl lg:text-4xl font-bold" style={{ color: '#F0EAD6' }}>
                Faça Parte da Revolução no Pós-Operatório
              </h2>
            </FadeIn>
            <FadeIn delay={0.2} direction="up">
              <p className="text-xl" style={{ color: '#D8DEEB' }}>
                Apenas 3 vagas de Founding Members disponíveis com preço vitalício garantido
              </p>
            </FadeIn>
            <FadeIn delay={0.3} direction="up">
              <Link
                href="/cadastro-medico?plan=founding"
                className="inline-flex items-center gap-3 px-12 py-6 text-white text-xl rounded-2xl font-bold hover-lift-strong hover:shadow-2xl transition-all duration-500 shadow-xl" style={{ backgroundColor: '#0D7377' }}
              >
                Quero Fazer Parte Agora
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-white" style={{ backgroundColor: '#0B0E14' }}>
        <div className="container mx-auto px-6">
          {/* Main Footer Content */}
          <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Company Info */}
            <div className="space-y-6">
              <div className="flex items-baseline gap-0.5">
                <span className="text-3xl font-bold font-brand"><span style={{ color: '#F0EAD6' }}>Vig</span><span style={{ color: '#14BDAE' }}>IA</span></span>
              </div>
              <p className="leading-relaxed text-justify" style={{ color: '#7A8299' }}>
                A Inteligência no Cuidado para o Propósito da Recuperação.
              </p>
              <p className="leading-relaxed text-justify" style={{ color: '#7A8299' }}>
                Transformando o acompanhamento pós-operatório com IA.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-14 h-14 bg-white/10 hover:bg-[#14BDAE] rounded-xl flex items-center justify-center transition-all hover-lift hover:scale-110">
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Navegação */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold" style={{ color: '#F0EAD6' }}>Navegação</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/" className="hover:text-[#F0EAD6] transition-colors flex items-center gap-2" style={{ color: '#7A8299' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Início
                  </Link>
                </li>
                <li>
                  <Link href="/sobre" className="hover:text-[#F0EAD6] transition-colors flex items-center gap-2" style={{ color: '#7A8299' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Sobre
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-[#F0EAD6] transition-colors flex items-center gap-2" style={{ color: '#7A8299' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Planos
                  </Link>
                </li>
                <li>
                  <Link href="/cadastro-medico" className="hover:text-[#F0EAD6] transition-colors flex items-center gap-2" style={{ color: '#7A8299' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Cadastro
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="hover:text-[#F0EAD6] transition-colors flex items-center gap-2" style={{ color: '#7A8299' }}>
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
              <h3 className="text-lg font-bold" style={{ color: '#F0EAD6' }}>Para Médicos</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/pricing" className="hover:text-[#F0EAD6] transition-colors flex items-center gap-2" style={{ color: '#7A8299' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Planos e Preços
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-[#F0EAD6] transition-colors flex items-center gap-2" style={{ color: '#7A8299' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Como Funciona
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#F0EAD6] transition-colors flex items-center gap-2" style={{ color: '#7A8299' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Casos de Sucesso
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#F0EAD6] transition-colors flex items-center gap-2" style={{ color: '#7A8299' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#F0EAD6] transition-colors flex items-center gap-2" style={{ color: '#7A8299' }}>
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
              <h3 className="text-lg font-bold" style={{ color: '#F0EAD6' }}>Contato</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3" style={{ color: '#7A8299' }}>
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-semibold" style={{ color: '#F0EAD6' }}>Email</p>
                    <a href="mailto:telos.ia@gmail.com" className="hover:text-[#F0EAD6] transition-colors">
                      telos.ia@gmail.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3" style={{ color: '#7A8299' }}>
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold" style={{ color: '#F0EAD6' }}>Localização</p>
                    <p>João Pessoa, Paraíba</p>
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
                <Link href="/termos" className="hover:text-[#F0EAD6] transition-colors" style={{ color: "#7A8299" }}>
                  Termos de Uso
                </Link>
                <Link href="/termos" className="hover:text-[#F0EAD6] transition-colors" style={{ color: "#7A8299" }}>
                  Política de Privacidade
                </Link>
                <a href="#" className="hover:text-[#F0EAD6] transition-colors" style={{ color: "#7A8299" }}>
                  LGPD
                </a>
                <a href="#" className="hover:text-[#F0EAD6] transition-colors" style={{ color: "#7A8299" }}>
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
