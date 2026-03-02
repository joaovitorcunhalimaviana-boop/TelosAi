import Link from "next/link"
import { VigiaHeader } from "@/components/VigiaHeader"
import { FadeIn } from "@/components/animations"

export default function Home() {
  return (
    <div className="min-h-screen bg-vigia-midnight overflow-x-hidden">
      <VigiaHeader />

      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Grid lines overlay */}
        <div
          className="absolute inset-0 z-0 opacity-100"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(30, 37, 53, 0.4) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(30, 37, 53, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Radial gradient glows */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: `
              radial-gradient(ellipse 600px 400px at 20% 50%, rgba(13, 115, 119, 0.15), transparent),
              radial-gradient(ellipse 600px 400px at 80% 50%, rgba(13, 115, 119, 0.04), transparent),
              radial-gradient(ellipse 800px 600px at 50% 100%, rgba(26, 37, 68, 0.3), transparent)
            `,
          }}
        />

        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '128px 128px',
          }}
        />

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
            {/* Eyebrow */}
            <FadeIn delay={0.1} direction="up">
              <p
                className="font-mono uppercase mb-8"
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.3em',
                  color: '#14BDAE',
                }}
              >
                Sistema de Monitoramento Pós-Operatório
              </p>
            </FadeIn>

            {/* Logo */}
            <FadeIn delay={0.2} direction="up">
              <h1
                className="font-brand font-light mb-6"
                style={{
                  fontSize: 'clamp(80px, 12vw, 160px)',
                  lineHeight: 1,
                  color: '#F0EAD6',
                }}
              >
                Vig<em className="not-italic" style={{ color: '#14BDAE', fontStyle: 'italic' }}>IA</em>
              </h1>
            </FadeIn>

            {/* Tagline */}
            <FadeIn delay={0.3} direction="up">
              <p
                className="font-brand italic mb-8"
                style={{
                  fontSize: 'clamp(18px, 2.5vw, 28px)',
                  color: '#D8DEEB',
                }}
              >
                Vigilância contínua. Decisão sua.
              </p>
            </FadeIn>

            {/* Description */}
            <FadeIn delay={0.4} direction="up">
              <p
                className="max-w-xl mx-auto mb-12"
                style={{
                  fontSize: '14px',
                  lineHeight: 1.8,
                  color: '#7A8299',
                }}
              >
                Sistema de monitoramento pós-operatório inteligente. Criado por um coloproctologista,
                para a medicina que não para quando a cirurgia termina.
              </p>
            </FadeIn>

            {/* CTA Buttons */}
            <FadeIn delay={0.5} direction="up">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/cadastro-medico"
                  className="group relative px-8 py-4 rounded-lg font-sans font-bold text-base overflow-hidden text-center transition-all duration-500 hover:-translate-y-1"
                  style={{
                    backgroundColor: '#0D7377',
                    color: '#F0EAD6',
                  }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>
                  <span className="relative flex items-center justify-center gap-2">
                    Começar Agora
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
                <Link
                  href="/sobre"
                  className="group relative px-8 py-4 rounded-lg font-sans font-bold text-base overflow-hidden text-center transition-all duration-500 hover:-translate-y-1"
                  style={{
                    border: '1px solid #2A3147',
                    backgroundColor: 'transparent',
                    color: '#D8DEEB',
                  }}
                >
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
        </div>
      </section>

      {/* ============================================
          WHY SUBSCRIBE SECTION
          ============================================ */}
      <section className="py-24 relative overflow-hidden" style={{ backgroundColor: '#111520' }}>
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" style={{ backgroundColor: 'rgba(13, 115, 119, 0.06)' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" style={{ backgroundColor: 'transparent' }} />

        <div className="container mx-auto px-6 relative z-10">
          <FadeIn delay={0.1} direction="up">
            <div className="text-center mb-20">
              {/* Section label */}
              <p
                className="font-mono uppercase mb-6"
                style={{
                  fontSize: '10px',
                  letterSpacing: '0.3em',
                  color: '#14BDAE',
                }}
              >
                Vantagens Exclusivas
              </p>
              <h2 className="font-brand text-4xl lg:text-5xl mb-6" style={{ fontWeight: 400, color: '#F0EAD6' }}>
                Por que Assinar o <em className="not-italic" style={{ color: '#14BDAE' }}>VigIA</em>?
              </h2>
              <p className="text-xl max-w-2xl mx-auto" style={{ color: '#7A8299' }}>
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
                <div className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500" style={{ background: 'linear-gradient(to right, rgba(13,115,119,0.15), rgba(13,115,119,0.08), rgba(13,115,119,0.15))' }} />

                <div
                  className="relative p-8 rounded-2xl transition-all duration-500 h-full flex flex-col items-start text-left group-hover:-translate-y-2"
                  style={{
                    backgroundColor: '#161B27',
                    border: '1px solid #1E2535',
                  }}
                >
                  {/* Icon container */}
                  <div className="relative mb-6">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg"
                      style={{ backgroundColor: '#0D7377' }}
                    >
                      <svg className="w-8 h-8" style={{ color: '#F0EAD6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                    </div>
                  </div>

                  <h3 className="font-brand text-xl mb-3 transition-colors duration-300 group-hover:text-[#14BDAE]" style={{ fontWeight: 400, color: '#F0EAD6' }}>{item.title}</h3>
                  <p className="leading-relaxed text-justify" style={{ color: '#D8DEEB' }}>{item.description}</p>

                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-8 right-8 h-px rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-500" style={{ background: 'linear-gradient(to right, #0D7377, #14BDAE)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          HOW IT WORKS SECTION
          ============================================ */}
      <section className="py-24 relative overflow-hidden" style={{ backgroundColor: '#0B0E14' }}>
        <div className="container mx-auto px-6 relative z-10">
          <FadeIn delay={0.1} direction="up">
            <div className="text-center mb-20">
              <p
                className="font-mono uppercase mb-6"
                style={{
                  fontSize: '10px',
                  letterSpacing: '0.3em',
                  color: '#14BDAE',
                }}
              >
                Processo Simplificado
              </p>
              <h2 className="font-brand text-4xl lg:text-5xl mb-6" style={{ fontWeight: 400, color: '#F0EAD6' }}>
                Como <em className="not-italic" style={{ color: '#14BDAE' }}>Funciona</em>
              </h2>
              <p className="text-xl max-w-2xl mx-auto" style={{ color: '#7A8299' }}>
                Passos simples para revolucionar seu pós-operatório
              </p>
            </div>
          </FadeIn>

          {/* Timeline container */}
          <div className="relative">
            {/* Timeline line (Desktop) */}
            <div className="hidden md:block absolute top-[100px] left-[12.5%] right-[12.5%] h-px rounded-full" style={{ backgroundColor: '#1E2535' }}>
              <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(to right, #14BDAE, #0D7377, rgba(13,115,119,0.3))' }} />
              <div className="absolute inset-0 rounded-full animate-shimmer-line" style={{ background: 'linear-gradient(to right, transparent, rgba(20,189,174,0.3), transparent)' }} />
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
                    {/* Stacked cards behind */}
                    <div className="relative mx-auto mb-8">
                      <div className="absolute top-2 left-2 w-28 h-28 rounded-2xl transform rotate-3" style={{ backgroundColor: '#1E2535' }} />
                      <div className="absolute top-1 left-1 w-28 h-28 rounded-2xl transform rotate-1" style={{ backgroundColor: '#2A3147' }} />
                      {/* Main card */}
                      <div
                        className="relative w-28 h-28 rounded-2xl flex items-center justify-center group-hover:scale-105 group-hover:-rotate-2 transition-all duration-500 shadow-xl"
                        style={{ backgroundColor: '#0D7377' }}
                      >
                        <svg className="w-12 h-12" style={{ color: '#F0EAD6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                        </svg>
                        {/* Step number badge */}
                        <div
                          className="absolute -bottom-3 -right-3 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300"
                          style={{
                            backgroundColor: '#0D7377',
                            color: '#F0EAD6',
                            border: '4px solid #0B0E14',
                          }}
                        >
                          {item.step}
                        </div>
                      </div>
                    </div>

                    <h3 className="font-brand text-2xl mb-4 group-hover:text-[#14BDAE] transition-colors duration-300" style={{ fontWeight: 400, color: '#F0EAD6' }}>
                      {item.title}
                    </h3>

                    <p className="leading-relaxed max-w-[250px] mx-auto text-justify" style={{ color: '#D8DEEB' }}>
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          RESEARCH MODE SECTION
          ============================================ */}
      <section className="py-20 sm:py-32 relative overflow-hidden" style={{ backgroundColor: '#161B27' }}>
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 animate-pulse-slow" style={{ backgroundColor: 'rgba(13,115,119,0.1)' }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 animate-pulse-slow animation-delay-1000" style={{ backgroundColor: 'rgba(13,115,119,0.03)' }} />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left - Content */}
            <FadeIn delay={0.2} direction="left">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-3 px-5 py-2 backdrop-blur-md rounded-full shadow-lg" style={{ backgroundColor: 'rgba(22, 27, 39, 0.8)', border: '1px solid #1E2535' }}>
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#14BDAE' }} />
                  <span
                    className="font-mono uppercase"
                    style={{
                      fontSize: '10px',
                      letterSpacing: '0.3em',
                      color: '#14BDAE',
                    }}
                  >
                    Exclusivo VigIA
                  </span>
                </div>

                <h2 className="font-brand text-4xl sm:text-5xl lg:text-6xl leading-tight" style={{ fontWeight: 400, color: '#F0EAD6' }}>
                  Modo Pesquisa
                  <br />
                  <em className="not-italic" style={{ color: '#14BDAE' }}>Científica</em>
                </h2>

                <p className="text-xl sm:text-2xl font-light max-w-xl" style={{ color: '#D8DEEB' }}>
                  Transforme dados clínicos em <span className="font-semibold" style={{ color: '#F0EAD6' }}>publicações de alto impacto</span> automaticamente.
                </p>

                <p className="text-base sm:text-lg leading-relaxed text-justify max-w-xl" style={{ color: '#7A8299' }}>
                  O primeiro sistema de IA médica do Brasil que organiza seus estudos clínicos enquanto você opera.
                </p>

                {/* Key Features */}
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
                    <div key={idx} className="flex items-center gap-3" style={{ color: '#D8DEEB' }}>
                      <svg className="w-5 h-5 flex-shrink-0" style={{ color: '#14BDAE' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-8">
                  <Link
                    href="/cadastro-medico?plan=professional"
                    className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-all duration-300 shadow-xl hover:-translate-y-1"
                    style={{
                      backgroundColor: '#0D7377',
                      color: '#F0EAD6',
                    }}
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
                <div className="glass-premium-dark rounded-3xl p-8 relative z-10 overflow-hidden" style={{ border: '1px solid #1E2535' }}>
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                    <svg className="w-40 h-40" style={{ color: '#D8DEEB' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>

                  <div className="space-y-6 relative">
                    {/* Header */}
                    <div className="pb-6" style={{ borderBottom: '1px solid #1E2535' }}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: '#1A8C6A' }} />
                        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#1A8C6A' }}>Sistema Ativo</span>
                      </div>
                      <h3 className="font-brand text-2xl mb-2" style={{ fontWeight: 400, color: '#F0EAD6' }}>Central de Pesquisa</h3>
                      <p className="text-sm" style={{ color: '#7A8299' }}>Gerenciamento completo de dados científicos</p>
                    </div>

                    {/* Stats grid - 2x2 */}
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", title: "LGPD", sub: "Conformidade Total" },
                        { icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4", title: "Exportação", sub: "Excel/CSV Instantâneo" },
                        { icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", title: "Analytics", sub: "Estatísticas Automáticas" },
                        { icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10", title: "Grupos", sub: "Estudos Comparativos" },
                      ].map((stat, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl p-4 group transition-all duration-300"
                          style={{
                            backgroundColor: 'rgba(22, 27, 39, 0.6)',
                            border: '1px solid rgba(30, 37, 53, 0.5)',
                          }}
                        >
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg"
                            style={{ backgroundColor: '#0D7377' }}
                          >
                            <svg className="w-6 h-6" style={{ color: '#F0EAD6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                            </svg>
                          </div>
                          <p className="font-bold text-lg" style={{ color: '#F0EAD6' }}>{stat.title}</p>
                          <p className="text-xs mt-1" style={{ color: '#7A8299' }}>{stat.sub}</p>
                        </div>
                      ))}
                    </div>

                    {/* Research mode promo */}
                    <div className="pt-6" style={{ borderTop: '1px solid #1E2535' }}>
                      <p className="text-sm leading-relaxed text-justify" style={{ color: '#D8DEEB' }}>
                        <span className="font-semibold" style={{ color: '#14BDAE' }}>Publique mais, com menos esforço.</span> O Modo Pesquisa transforma automaticamente os dados de acompanhamento dos seus pacientes em tabelas prontas para análise estatística. Ideal para residentes, mestrandos e cirurgiões que querem aumentar sua produção científica sem perder tempo com planilhas manuais.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Decorator Badge */}
                <div className="absolute -top-6 -right-6 p-[2px] rounded-2xl shadow-2xl animate-float z-20" style={{ background: 'linear-gradient(to right, #0D7377, #14BDAE)' }}>
                  <div className="backdrop-blur-xl rounded-2xl px-6 py-4" style={{ backgroundColor: 'rgba(11, 14, 20, 0.85)' }}>
                    <p className="font-bold text-lg whitespace-nowrap flex items-center gap-2" style={{ color: '#14BDAE' }}>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      Exclusivo
                    </p>
                  </div>
                </div>

                {/* Secondary badge */}
                <div className="absolute -bottom-4 -left-4 backdrop-blur-xl rounded-xl px-4 py-2 shadow-xl z-20" style={{ backgroundColor: 'rgba(22, 27, 39, 0.8)', border: '1px solid #1E2535' }}>
                  <p className="text-sm font-medium flex items-center gap-2" style={{ color: '#D8DEEB' }}>
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#1A8C6A' }} />
                    Dados 100% Seguros
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ============================================
          TECHNOLOGY SECTION
          ============================================ */}
      <section className="py-24 relative overflow-hidden" style={{ backgroundColor: '#111520' }}>
        <div className="absolute top-0 left-0 w-full h-px" style={{ background: 'linear-gradient(to right, transparent, #1E2535, transparent)' }} />
        <div className="container mx-auto px-6">
          <FadeIn delay={0.1} direction="up">
            <div className="text-center mb-20">
              <p
                className="font-mono uppercase mb-6"
                style={{
                  fontSize: '10px',
                  letterSpacing: '0.3em',
                  color: '#14BDAE',
                }}
              >
                Tecnologia
              </p>
              <h2 className="font-brand text-3xl lg:text-4xl mb-4" style={{ fontWeight: 400, color: '#F0EAD6' }}>
                Tecnologia a Serviço do <em className="not-italic" style={{ color: '#14BDAE' }}>Cuidado</em>
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: '#7A8299' }}>
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
              <div
                key={idx}
                className="group relative p-8 rounded-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden"
                style={{
                  backgroundColor: '#161B27',
                  border: '1px solid #1E2535',
                }}
              >
                {/* Glow effect */}
                <div className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500 -z-10" style={{ background: 'linear-gradient(to right, rgba(13,115,119,0.1), rgba(13,115,119,0.06), rgba(13,115,119,0.1))' }} />

                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg"
                  style={{ backgroundColor: '#0D7377' }}
                >
                  <svg className="w-8 h-8" style={{ color: '#F0EAD6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.icon} />
                  </svg>
                </div>
                <h3 className="font-brand text-xl mb-3 group-hover:text-[#14BDAE] transition-colors duration-300" style={{ fontWeight: 400, color: '#F0EAD6' }}>{feature.title}</h3>
                <p className="leading-relaxed text-justify" style={{ color: '#D8DEEB' }}>{feature.desc}</p>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-8 right-8 h-px rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-500" style={{ background: 'linear-gradient(to right, #0D7377, #14BDAE)' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          CTA SECTION
          ============================================ */}
      <section className="py-24 relative overflow-hidden" style={{ backgroundColor: '#0B0E14' }}>
        {/* Background glows */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[100px]" style={{ backgroundColor: 'rgba(13,115,119,0.06)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[100px]" style={{ backgroundColor: 'transparent' }} />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-10">
            <p
              className="font-mono uppercase"
              style={{
                fontSize: '10px',
                letterSpacing: '0.3em',
                color: '#14BDAE',
              }}
            >
              Junte-se a nós
            </p>
            <h2 className="font-brand text-4xl lg:text-5xl tracking-tight" style={{ fontWeight: 400, color: '#F0EAD6' }}>
              Pronto para o Futuro da <em className="not-italic" style={{ color: '#14BDAE' }}>Cirurgia</em>?
            </h2>
            <p className="text-xl max-w-2xl mx-auto font-light" style={{ color: '#7A8299' }}>
              Junte-se à elite médica que já utiliza inteligência artificial para elevar o padrão de cuidado.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
              <Link
                href="/cadastro-medico?plan=founding"
                className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 text-lg rounded-xl font-bold overflow-hidden transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: '#0D7377',
                  color: '#F0EAD6',
                }}
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <span className="relative flex items-center gap-2">
                  Garantir Minha Vaga
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>

              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 text-lg rounded-xl font-bold transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                style={{
                  border: '1px solid #2A3147',
                  backgroundColor: 'transparent',
                  color: '#D8DEEB',
                }}
              >
                Ver Planos e Preços
              </Link>
            </div>

            <div className="pt-12 mt-12" style={{ borderTop: '1px solid #1E2535' }}>
              <div className="flex flex-col items-center gap-2">
                <p
                  className="font-mono uppercase"
                  style={{
                    fontSize: '10px',
                    letterSpacing: '0.3em',
                    color: '#7A8299',
                  }}
                >
                  Desenvolvido por cirurgião para cirurgiões
                </p>
                <p className="text-xl font-brand" style={{ color: '#F0EAD6' }}>Dr. João Vitor Viana</p>
                <p className="text-sm" style={{ color: '#7A8299' }}>Coloproctologista | CRM-PB 12831</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          FOOTER
          ============================================ */}
      <footer style={{ backgroundColor: '#0B0E14', borderTop: '1px solid #1E2535' }}>
        <div className="container mx-auto px-6">
          {/* Main Footer Content */}
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
                <li><a href="#" className="transition-colors hover:text-[#F0EAD6]" style={{ color: '#7A8299' }}>Como Funciona</a></li>
                <li><a href="#" className="transition-colors hover:text-[#F0EAD6]" style={{ color: '#7A8299' }}>FAQ</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-6">
              <h3 className="font-brand text-lg" style={{ fontWeight: 400, color: '#F0EAD6' }}>Contato</h3>
              <ul className="space-y-4">
                <li>
                  <div>
                    <p className="font-semibold" style={{ color: '#F0EAD6' }}>Email</p>
                    <a href="mailto:vigia.app.br@gmail.com" className="transition-colors hover:text-[#F0EAD6]" style={{ color: '#7A8299' }}>vigia.app.br@gmail.com</a>
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
                &copy; 2025 VigIA - Dr. João Vitor Viana. Todos os direitos reservados.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <Link href="/terms-of-service" className="transition-colors hover:text-[#F0EAD6]" style={{ color: '#7A8299' }}>Termos de Uso</Link>
                <Link href="/privacidade" className="transition-colors hover:text-[#F0EAD6]" style={{ color: '#7A8299' }}>Política de Privacidade</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
