import Image from "next/image"
import Link from "next/link"
import { TelosHeader } from "@/components/TelosHeader"
import { FadeIn, SlideIn, FloatingParticles } from "@/components/animations"
import { ScrollVideoSection } from "@/components/ScrollVideoSection"
import { SplineCTA } from "@/components/SplineCTA"

export default function Home() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <TelosHeader />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Elements - Floating Particles (Globes/Lines) */}
        <div className="absolute inset-0 z-0">
          <FloatingParticles count={60} />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text */}
            <div className="max-w-2xl">
              <FadeIn delay={0.1} direction="right">
                <h1 className="text-5xl lg:text-7xl font-black text-telos-blue mb-6 tracking-tight leading-tight">
                  <span className="text-gradient-blue">Telos</span>
                  <span className="text-gradient-gold">.AI</span>
                </h1>
              </FadeIn>

              <FadeIn delay={0.2} direction="up">
                <p className="text-xl lg:text-2xl text-gray-600 mb-6 font-light leading-relaxed">
                  Sistema de acompanhamento pós-operatório com <span className="font-semibold text-telos-blue">Inteligência Artificial</span>.
                </p>
                <div className="flex items-center gap-3 mb-10 p-4 bg-gradient-to-r from-telos-gold/10 to-transparent border-l-4 border-telos-gold rounded-r-xl">
                  <svg className="w-6 h-6 text-telos-gold flex-shrink-0 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <p className="text-lg font-semibold text-telos-blue">
                    Não fique de fora da <span className="text-telos-gold">revolução da IA na cirurgia</span>. O futuro chegou!
                  </p>
                </div>
              </FadeIn>

              <FadeIn delay={0.3} direction="up">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/cadastro-medico"
                    className="group relative w-full sm:w-auto px-6 sm:px-8 py-4 bg-[#0A2647] text-white rounded-xl font-bold text-lg shadow-lg overflow-hidden text-center transition-all duration-500 hover:shadow-[0_0_30px_rgba(10,38,71,0.5)] hover:-translate-y-2 hover:bg-[#081E39]"
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </div>
                    <span className="relative flex items-center justify-center gap-2">
                      Começar Agora
                      <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </Link>
                  <Link
                    href="/sobre"
                    className="group relative px-8 py-4 bg-white text-telos-blue border-2 border-telos-blue/20 rounded-xl font-bold text-lg overflow-hidden text-center transition-all duration-500 hover:-translate-y-2 hover:border-telos-gold hover:shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                  >
                    {/* Background fill on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-telos-gold/5 to-telos-gold/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                    <span className="relative flex items-center justify-center gap-2">
                      Saiba Mais
                      <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </Link>
                </div>
              </FadeIn>
            </div>

            {/* Right Side - Logo */}
            <div className="flex justify-center relative mt-12 lg:mt-0">
              <FadeIn delay={0.2} direction="left">
                <div className="relative w-[280px] sm:w-[350px] lg:w-[500px] aspect-square animate-float">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-telos-blue/20 blur-[60px] lg:blur-[100px] rounded-full"></div>
                  <Image
                    src="/icons/icon-original.jpeg"
                    alt="Telos.AI Logo"
                    fill
                    className="object-contain drop-shadow-2xl relative z-10"
                    priority
                    sizes="(max-width: 768px) 280px, (max-width: 1024px) 350px, 500px"
                  />
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section - Expands on Scroll */}
      <ScrollVideoSection />

      {/* Why Subscribe Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-telos-blue/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-telos-gold/5 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>

        <div className="container mx-auto px-6 relative z-10">
          <FadeIn delay={0.1} direction="up">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-telos-gold/10 rounded-full mb-6">
                <svg className="w-5 h-5 text-telos-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span className="text-sm font-bold text-telos-gold uppercase tracking-wider">Vantagens Exclusivas</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-telos-blue mb-6 tracking-tight">
                Por que Assinar o <span className="text-gradient-gold">Telos.AI</span>?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Benefícios reais para sua prática médica e produção científica
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Organiza Dados Automaticamente",
                description: "Diga adeus às planilhas manuais. O sistema estrutura todos os dados dos seus pacientes para pesquisa.",
                icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              },
              {
                title: "Detecte Complicações",
                description: "Algoritmos de IA monitoram sinais de alerta e notificam você precocemente sobre possíveis complicações.",
                icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              },
              {
                title: "Fidelize Pacientes",
                description: "O acompanhamento próximo e tecnológico aumenta a satisfação e a confiança do seu paciente.",
                icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              },
              {
                title: "Publique Mais",
                description: "Com dados organizados e estruturados, sua produção científica se torna muito mais ágil e frequente.",
                icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              },
              {
                title: "Economize Tempo",
                description: "Automatize o follow-up de rotina e foque sua atenção apenas nos casos que realmente precisam.",
                icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              },
              {
                title: "Segurança Jurídica",
                description: "Tenha todo o histórico de recuperação documentado e protegido, garantindo respaldo para sua conduta.",
                icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              }
            ].map((item, index) => (
              <div key={index} className="group relative">
                {/* Glow effect on hover */}
                <div className="absolute -inset-1 bg-gradient-to-r from-telos-blue/20 via-telos-gold/20 to-telos-blue/20 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500"></div>

                <div className="relative p-8 bg-white border border-gray-100 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 h-full flex flex-col items-start text-left group-hover:-translate-y-2 group-hover:border-telos-gold/30">
                  {/* Icon container with animation */}
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-[#0A2647] rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg group-hover:shadow-[0_10px_30px_rgba(10,38,71,0.3)] group-hover:bg-[#081E39]">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-telos-blue mb-3 group-hover:text-telos-gold transition-colors duration-300">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-justify">{item.description}</p>

                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-8 right-8 h-1 bg-gradient-to-r from-telos-blue to-telos-gold rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02]"></div>

        <div className="container mx-auto px-6 relative z-10">
          <FadeIn delay={0.1} direction="up">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-telos-blue/5 rounded-full mb-6">
                <svg className="w-5 h-5 text-telos-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-sm font-bold text-telos-blue uppercase tracking-wider">Processo Simplificado</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-telos-blue mb-6 tracking-tight">
                Como <span className="text-gradient-gold">Funciona</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Passos simples para revolucionar seu pós-operatório
              </p>
            </div>
          </FadeIn>

          {/* Timeline container */}
          <div className="relative">
            {/* Golden timeline line (Desktop) */}
            <div className="hidden md:block absolute top-[100px] left-[12.5%] right-[12.5%] h-1 bg-gray-100 rounded-full">
              <div className="absolute inset-0 bg-gradient-to-r from-telos-gold via-telos-gold to-telos-gold/50 rounded-full"></div>
              {/* Animated glow on the line */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full animate-shimmer-line"></div>
            </div>

            <div className="grid md:grid-cols-4 gap-12 md:gap-8">
              {[
                {
                  step: "1",
                  title: "Cadastro",
                  description: "Cadastre seu paciente e o procedimento realizado em menos de 1 minuto.",
                  icon: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                },
                {
                  step: "2",
                  title: "Monitoramento",
                  description: "O paciente recebe questionários automáticos via WhatsApp nos dias programados.",
                  icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                },
                {
                  step: "3",
                  title: "Análise IA",
                  description: "Nossa IA analisa as respostas e classifica o risco de complicações em tempo real.",
                  icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                },
                {
                  step: "4",
                  title: "Ação",
                  description: "Você recebe alertas apenas se houver necessidade de intervenção. Tranquilidade total.",
                  icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                }
              ].map((item, index) => (
                <div key={index} className="relative group">
                  <div className="flex flex-col items-center text-center">
                    {/* Card com efeito de cards empilhados */}
                    <div className="relative mx-auto mb-8">
                      {/* Cards empilhados atrás */}
                      <div className="absolute top-2 left-2 w-28 h-28 bg-gray-100 rounded-2xl transform rotate-3"></div>
                      <div className="absolute top-1 left-1 w-28 h-28 bg-gray-200 rounded-2xl transform rotate-1"></div>
                      {/* Card principal */}
                      <div className="relative w-28 h-28 bg-[#0A2647] rounded-2xl flex items-center justify-center group-hover:scale-105 group-hover:-rotate-2 transition-all duration-500 shadow-xl group-hover:shadow-[0_15px_40px_rgba(10,38,71,0.4)]">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                        </svg>
                        {/* Step number badge */}
                        <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-telos-gold rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg border-4 border-white group-hover:scale-110 transition-transform duration-300">
                          {item.step}
                        </div>
                      </div>
                    </div>

                    {/* Title with more spacing */}
                    <h3 className="text-2xl font-bold text-telos-blue mb-4 group-hover:text-telos-gold transition-colors duration-300">
                      {item.title}
                    </h3>

                    {/* Description with more spacing */}
                    <p className="text-gray-600 leading-relaxed max-w-[250px] mx-auto text-justify">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Research Mode Section - RESTORED FULL FEATURES */}
      <section className="py-20 sm:py-32 bg-[#061A33] relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-telos-blue-light/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-telos-gold/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 animate-pulse-slow animation-delay-1000"></div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left - Content */}
            <FadeIn delay={0.2} direction="left">
              <div className="space-y-8 text-white">
                <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full shadow-lg animate-fade-in-left">
                  <div className="w-2 h-2 bg-telos-gold rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold text-telos-gold uppercase tracking-wider">
                    Exclusivo Telos.AI
                  </span>
                </div>

                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
                  Modo Pesquisa
                  <br />
                  <span className="text-gradient-gold">Científica</span>
                </h2>

                <p className="text-xl sm:text-2xl font-light text-blue-100 max-w-xl">
                  Transforme dados clínicos em <span className="font-semibold text-white">publicações de alto impacto</span> automaticamente.
                </p>

                <p className="text-base sm:text-lg text-blue-200/80 leading-relaxed text-justify max-w-xl">
                  O primeiro sistema de IA médica do Brasil que organiza seus estudos clínicos enquanto você opera.
                </p>

                {/* Key Features do Modo Pesquisa - MELHORADOS */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    "Dados Estruturados para Publicação",
                    "Exportação Excel/CSV em 1 Clique",
                    "Grupos de Estudo Ilimitados",
                    "Análise Estatística Automática",
                    "Conformidade 100% LGPD",
                    "TCLE Digital Integrado",
                    "Filtros por Procedimento/Período",
                    "Dashboards em Tempo Real"
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-blue-100">
                      <svg className="w-5 h-5 text-telos-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-8 flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/cadastro-medico?plan=professional"
                    className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-telos-gold text-white rounded-xl font-bold text-lg hover:scale-105 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all duration-300 shadow-xl hover:-translate-y-1"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    Ativar Modo Pesquisa
                  </Link>
                </div>
              </div>
            </FadeIn>

            {/* Right - Visual/Stats */}
            <FadeIn delay={0.4} direction="right">
              <div className="relative">
                {/* Glass Card Container */}
                <div className="glass-card-dark rounded-3xl p-8 border border-white/10 relative z-10 overflow-hidden">
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                    <svg className="w-40 h-40 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>

                  <div className="space-y-6 relative">
                    {/* Header */}
                    <div className="border-b border-white/10 pb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-green-400 text-xs font-semibold uppercase tracking-wider">Sistema Ativo</span>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">Central de Pesquisa</h3>
                      <p className="text-blue-200 text-sm">Gerenciamento completo de dados científicos</p>
                    </div>

                    {/* Stats grid - 2x2 - ÍCONES BRANCOS */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-xl p-4 border border-white/5 hover:bg-white/10 hover:border-telos-gold/30 transition-all duration-300 group">
                        <div className="w-12 h-12 bg-[#0A2647] rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <p className="text-white font-bold text-lg">LGPD</p>
                        <p className="text-blue-200/60 text-xs mt-1">Conformidade Total</p>
                      </div>

                      <div className="bg-white/5 rounded-xl p-4 border border-white/5 hover:bg-white/10 hover:border-telos-gold/30 transition-all duration-300 group">
                        <div className="w-12 h-12 bg-[#0A2647] rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </div>
                        <p className="text-white font-bold text-lg">Exportação</p>
                        <p className="text-blue-200/60 text-xs mt-1">Excel/CSV Instantâneo</p>
                      </div>

                      <div className="bg-white/5 rounded-xl p-4 border border-white/5 hover:bg-white/10 hover:border-telos-gold/30 transition-all duration-300 group">
                        <div className="w-12 h-12 bg-[#0A2647] rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <p className="text-white font-bold text-lg">Analytics</p>
                        <p className="text-blue-200/60 text-xs mt-1">Estatísticas Automáticas</p>
                      </div>

                      <div className="bg-white/5 rounded-xl p-4 border border-white/5 hover:bg-white/10 hover:border-telos-gold/30 transition-all duration-300 group">
                        <div className="w-12 h-12 bg-[#0A2647] rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                        <p className="text-white font-bold text-lg">Grupos</p>
                        <p className="text-blue-200/60 text-xs mt-1">Estudos Comparativos</p>
                      </div>
                    </div>

                    {/* Área de propaganda do Modo Pesquisa */}
                    <div className="pt-6 border-t border-white/10">
                      <p className="text-blue-100 text-sm leading-relaxed text-justify">
                        <span className="text-telos-gold font-semibold">Publique mais, com menos esforço.</span> O Modo Pesquisa transforma automaticamente os dados de acompanhamento dos seus pacientes em tabelas prontas para análise estatística. Ideal para residentes, mestrandos e cirurgiões que querem aumentar sua produção científica sem perder tempo com planilhas manuais.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Decorator Badge */}
                <div className="absolute -top-6 -right-6 bg-gradient-to-r from-telos-gold to-yellow-500 p-[2px] rounded-2xl shadow-2xl animate-float z-20">
                  <div className="bg-black/80 backdrop-blur-xl rounded-2xl px-6 py-4">
                    <p className="text-telos-gold font-bold text-lg whitespace-nowrap flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      Exclusivo
                    </p>
                  </div>
                </div>

                {/* Secondary badge */}
                <div className="absolute -bottom-4 -left-4 bg-white/10 backdrop-blur-xl rounded-xl px-4 py-2 border border-white/20 shadow-xl z-20">
                  <p className="text-white text-sm font-medium flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Dados 100% Seguros
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Technology Section - RESTORED */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        <div className="container mx-auto px-6">
          <FadeIn delay={0.1} direction="up">
            <div className="text-center mb-20">
              <h2 className="text-3xl lg:text-4xl font-bold text-telos-blue mb-4">
                Tecnologia a Serviço do Cuidado
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Um ecossistema completo de inteligência clínica
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                title: "Follow-up Automático",
                desc: "Jornada do paciente automatizada em D+1, D+2, D+3, D+5, D+7, D+10 e D+14 via WhatsApp. Sem intervenção manual.",
                icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              },
              {
                title: "Machine Learning Preditivo",
                desc: "Algoritmos que aprendem com cada caso para prever complicações antes que elas se tornem emergências.",
                icon: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
              },
              {
                title: "Inteligência Coletiva",
                desc: "Benchmarking anônimo com outros cirurgiões. Compare seus resultados com a média nacional.",
                icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              }
            ].map((feature, idx) => (
              <div key={idx} className="group relative p-8 bg-white rounded-2xl border border-gray-100 hover:border-telos-gold/30 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-telos-blue/10 via-telos-gold/10 to-telos-blue/10 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500 -z-10"></div>

                <div className="w-16 h-16 bg-[#0A2647] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg group-hover:shadow-[0_10px_30px_rgba(10,38,71,0.3)]">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-telos-blue mb-3 group-hover:text-telos-gold transition-colors duration-300">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-justify">{feature.desc}</p>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-8 right-8 h-1 bg-gradient-to-r from-telos-blue to-telos-gold rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Spline 3D CTA Section */}
      <SplineCTA />

      {/* CTA Section - Fundo claro para contraste com footer */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-white via-gray-50 to-gray-100">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-telos-blue/5 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-telos-gold/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-10">
            <h2 className="text-4xl lg:text-5xl font-bold text-telos-blue tracking-tight">
              Pronto para o Futuro da Cirurgia?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
              Junte-se à elite médica que já utiliza inteligência artificial para elevar o padrão de cuidado.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
              <Link
                href="/cadastro-medico?plan=founding"
                className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-telos-gold text-white text-lg rounded-xl font-bold overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(212,175,55,0.4)]"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                <span className="relative flex items-center gap-2">
                  Garantir Minha Vaga
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>

              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-telos-blue text-white text-lg rounded-xl font-bold hover:bg-[#0A2647]/90 transition-all duration-300 hover:shadow-xl"
              >
                Ver Planos e Preços
              </Link>
            </div>

            <div className="pt-12 border-t border-gray-200 mt-12">
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold">Desenvolvido por cirurgião para cirurgiões</p>
                <p className="text-xl font-serif text-telos-gold">Dr. João Vitor Viana</p>
                <p className="text-sm text-gray-600">Coloproctologista | CRM-PB 12831</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - RESTORED */}
      <footer className="bg-gradient-to-b from-[#061A33] to-[#040E1D] text-white border-t border-white/10">
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
            </div>

            {/* Navegação */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Navegação</h3>
              <ul className="space-y-3">
                <li><Link href="/" className="text-blue-200 hover:text-telos-gold transition-colors">Início</Link></li>
                <li><Link href="/sobre" className="text-blue-200 hover:text-telos-gold transition-colors">Sobre</Link></li>
                <li><Link href="/pricing" className="text-blue-200 hover:text-telos-gold transition-colors">Planos</Link></li>
                <li><Link href="/cadastro-medico" className="text-blue-200 hover:text-telos-gold transition-colors">Cadastro</Link></li>
              </ul>
            </div>

            {/* Para Médicos */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Para Médicos</h3>
              <ul className="space-y-3">
                <li><Link href="/pricing" className="text-blue-200 hover:text-telos-gold transition-colors">Planos e Preços</Link></li>
                <li><a href="#" className="text-blue-200 hover:text-telos-gold transition-colors">Como Funciona</a></li>
                <li><a href="#" className="text-blue-200 hover:text-telos-gold transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Contato */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Contato</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-blue-200">
                  <div>
                    <p className="font-semibold text-white">Email</p>
                    <a href="mailto:telos.ia@gmail.com" className="hover:text-telos-gold transition-colors">telos.ia@gmail.com</a>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-blue-200">
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
                <Link href="/termos" className="text-blue-200 hover:text-telos-gold transition-colors">Termos de Uso</Link>
                <Link href="/termos" className="text-blue-200 hover:text-telos-gold transition-colors">Política de Privacidade</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
