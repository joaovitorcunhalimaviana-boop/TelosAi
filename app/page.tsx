import Image from "next/image"
import Link from "next/link"
import { TelosHeader } from "@/components/TelosHeader"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <TelosHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full animate-fade-in-down">
                  <div className="w-2 h-2 bg-telos-gold rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-telos-blue">
                    Tecnologia + Propósito
                  </span>
                </div>

                <h1 className="text-5xl lg:text-6xl font-bold leading-tight animate-fade-in-up animation-delay-200">
                  <span className="telos-brand text-telos-blue">Telos</span>
                  <span className="telos-ai text-telos-gold">.AI</span>
                </h1>

                <p className="text-2xl text-gray-700 font-light animate-fade-in-up animation-delay-400">
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

              <p className="text-lg text-gray-600 leading-relaxed max-w-xl animate-fade-in-up animation-delay-600">
                Sistema de acompanhamento pós-operatório com Inteligência Artificial.
                Monitore seus pacientes 24/7 com análise automática de riscos e alertas em tempo real.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-800">
                <Link
                  href="/cadastro-medico?plan=founding"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-telos-gold text-white rounded-lg font-semibold hover-lift transition-smooth shadow-lg hover-glow"
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
                  Quero ser Founding Member
                </Link>

                <Link
                  href="/cadastro-medico?plan=professional"
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
                  Começar Agora
                </Link>
              </div>
            </div>

            {/* Right Column - Visual Element */}
            <div className="relative animate-fade-in-right animation-delay-400">
              <div className="relative w-full h-[500px] flex items-center justify-center">
                <Image
                  src="/icons/icon-512.png"
                  alt="Telos.AI - Acompanhamento Pós-Operatório"
                  width={400}
                  height={400}
                  className="drop-shadow-2xl animate-float hover-scale transition-smooth"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Subscribe Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-telos-blue mb-4">
              Por que Assinar o Telos.AI?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Invista no futuro da sua prática médica com benefícios comprovados
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Economize Tempo */}
            <div className="group p-8 bg-white border-2 border-gray-100 rounded-2xl hover:border-telos-blue hover-lift transition-smooth shadow-lg">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-telos-blue transition-colors">
                <svg className="w-8 h-8 text-telos-blue group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-telos-blue mb-3">Ganhe Tempo Valioso</h3>
              <p className="text-gray-600 leading-relaxed mb-4 text-justify">
                Automatize o acompanhamento pós-operatório e recupere horas preciosas do seu dia.
                O sistema trabalha 24/7 por você, enviando questionários e coletando respostas automaticamente.
              </p>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-telos-gold font-semibold">
                  Economize até 10 horas/semana em follow-up
                </p>
              </div>
            </div>

            {/* Economize Dinheiro */}
            <div className="group p-8 bg-white border-2 border-gray-100 rounded-2xl hover:border-telos-gold hover-lift transition-smooth shadow-lg">
              <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-telos-gold transition-colors">
                <svg className="w-8 h-8 text-telos-gold group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-telos-blue mb-3">Economize em Custos</h3>
              <p className="text-gray-600 leading-relaxed mb-4 text-justify">
                Reduza custos com complicações evitáveis e reinternações. Pacientes melhor monitorados
                têm recuperação mais rápida e resultados superiores, reduzindo gastos hospitalares.
              </p>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-telos-gold font-semibold">
                  ROI positivo desde o primeiro mês
                </p>
              </div>
            </div>

            {/* Detecção Precoce */}
            <div className="group p-8 bg-white border-2 border-gray-100 rounded-2xl hover:border-telos-blue hover-lift transition-smooth shadow-lg">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-telos-blue transition-colors">
                <svg className="w-8 h-8 text-telos-blue group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-telos-blue mb-3">Detecte Complicações Cedo</h3>
              <p className="text-gray-600 leading-relaxed mb-4 text-justify">
                A IA analisa respostas em tempo real e detecta red flags automaticamente.
                Identifique problemas antes que se tornem complicações graves, salvando vidas e reputação.
              </p>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-telos-gold font-semibold">
                  Alertas em tempo real para decisões rápidas
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-telos-blue hover:text-telos-gold font-semibold text-lg underline transition-colors"
            >
              Ver planos e começar agora
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-telos-blue mb-4">
              Como Funciona
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              4 passos simples para revolucionar seu pós-operatório
            </p>
          </div>

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
              <div key={idx} className="text-center space-y-4 group animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="relative mx-auto w-20 h-20">
                  <div className="absolute inset-0 bg-telos-blue rounded-2xl transform rotate-6 group-hover:rotate-12 transition-transform opacity-10"></div>
                  <div className="relative w-full h-full bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-telos-blue transition-colors">
                    <svg className="w-10 h-10 text-telos-blue group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-telos-gold rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-telos-blue">{item.title}</h3>
                <p className="text-gray-600 text-justify">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research Mode Section - DESTAQUE */}
      <section className="py-24 bg-gradient-to-br from-[#0A2647] via-[#051629] to-[#020817] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-telos-gold rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Content */}
            <div className="space-y-8 text-white">
              <div className="inline-flex items-center gap-3 px-5 py-3 bg-telos-gold/20 border-2 border-telos-gold rounded-full">
                <div className="w-3 h-3 bg-telos-gold rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-telos-gold uppercase tracking-wide">
                  🔬 Exclusivo Telos.AI
                </span>
              </div>

              <h2 className="text-5xl lg:text-6xl font-black leading-tight">
                Modo Pesquisa
                <br />
                <span className="text-telos-gold">Científica</span>
              </h2>

              <p className="text-2xl font-semibold text-blue-100">
                Transforme Seus Dados em Publicações de Impacto
              </p>

              <p className="text-lg text-blue-200 leading-relaxed text-justify">
                O primeiro sistema de IA médica do Brasil com funcionalidade dedicada para{" "}
                <span className="text-telos-gold font-bold">organização automática de estudos clínicos</span>.
                Revolucione sua produção científica enquanto cuida dos seus pacientes.
              </p>

              {/* Key Features do Modo Pesquisa */}
              <div className="space-y-4">
                <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                  <div className="w-12 h-12 bg-telos-gold rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">Organização Automática de Grupos</h4>
                    <p className="text-blue-200 text-justify">
                      Crie e gerencie grupos de pesquisa automaticamente. Organize pacientes por tipo de cirurgia,
                      protocolo experimental, ou qualquer critério científico.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                  <div className="w-12 h-12 bg-telos-gold rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">Exportação Pronta para Publicação</h4>
                    <p className="text-blue-200 text-justify">
                      Exporte dados anonimizados em formatos prontos para análise estatística (CSV, Excel, SPSS).
                      Conformidade total com LGPD e ética em pesquisa.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                  <div className="w-12 h-12 bg-telos-gold rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">Análise Estatística Integrada</h4>
                    <p className="text-blue-200 text-justify">
                      Visualize tendências, compare grupos, identifique correlações. A IA sugere análises relevantes
                      para seus dados automaticamente.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href="/cadastro-medico?plan=professional"
                  className="group inline-flex items-center gap-3 px-10 py-5 bg-telos-gold text-white rounded-xl font-bold text-xl hover-lift hover-glow transition-smooth shadow-2xl"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Ativar Modo Pesquisa Agora
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <p className="text-sm text-blue-200 mt-4 italic">
                  ✨ Disponível em todos os planos Professional e Founding Member
                </p>
              </div>
            </div>

            {/* Right - Visual/Stats */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border-2 border-white/20 shadow-2xl">
                <div className="space-y-6">
                  {/* Stat Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl p-6 text-center transform hover:scale-105 transition-transform">
                      <p className="text-4xl font-black text-telos-blue mb-2">100%</p>
                      <p className="text-sm text-gray-600 font-semibold">Conforme LGPD</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 text-center transform hover:scale-105 transition-transform">
                      <p className="text-4xl font-black text-telos-gold mb-2">1 Clique</p>
                      <p className="text-sm text-gray-600 font-semibold">Exportação</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 text-center transform hover:scale-105 transition-transform">
                      <p className="text-4xl font-black text-telos-blue mb-2">∞</p>
                      <p className="text-sm text-gray-600 font-semibold">Grupos</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 text-center transform hover:scale-105 transition-transform">
                      <p className="text-4xl font-black text-telos-gold mb-2">AI</p>
                      <p className="text-sm text-gray-600 font-semibold">Análise Auto</p>
                    </div>
                  </div>

                  {/* Use Case Example */}
                  <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 border-2 border-telos-gold/30">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 bg-telos-blue rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h5 className="font-bold text-telos-blue text-lg mb-1">Exemplo de Caso de Uso</h5>
                        <p className="text-sm text-gray-700 leading-relaxed text-justify">
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
                  <div className="space-y-3">
                    <h5 className="text-white font-bold text-lg mb-3">Inclui também:</h5>
                    {[
                      "Anonimização automática (LGPD)",
                      "Termos de consentimento digitais",
                      "Filtros avançados por período/tipo",
                      "Gráficos e dashboards customizados"
                    ].map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-white">
                        <div className="w-6 h-6 bg-telos-gold rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-6 -right-6 bg-gradient-to-br from-telos-gold to-yellow-500 text-white px-6 py-3 rounded-full shadow-2xl transform rotate-12 animate-pulse-slow">
                <p className="font-black text-lg">🏆 Exclusivo!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-telos-blue mb-4">
              Tecnologia a Serviço do Cuidado
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Um sistema completo de acompanhamento pós-operatório com inteligência artificial
            </p>
          </div>

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
                Exportação para Pesquisa
              </h3>
              <p className="text-gray-600 leading-relaxed text-justify">
                Dados organizados e anonimizados para estudos científicos, em conformidade com LGPD
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-telos-blue mb-4">
              Por que escolher Telos.AI?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A única plataforma que une tecnologia de ponta com o propósito do cuidado
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
                title: "Economize Tempo",
                description: "Automatize o acompanhamento e foque no que realmente importa: decisões clínicas"
              },
              {
                icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                title: "Reduza Complicações",
                description: "Identifique problemas precocemente com análise de IA em tempo real"
              },
              {
                icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                title: "Gere Insights",
                description: "Exporte dados para pesquisa científica e aprimore sua prática"
              }
            ].map((benefit, idx) => (
              <div key={idx} className="group p-8 bg-white rounded-2xl border-2 border-gray-100 hover:border-telos-blue hover-lift transition-smooth shadow-lg">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-telos-blue transition-colors">
                  <svg className="w-8 h-8 text-telos-blue group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={benefit.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-telos-blue mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed text-justify">{benefit.description}</p>
              </div>
            ))}
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
                Garantir Vaga Founding
              </Link>
              <Link
                href="/cadastro-medico?plan=professional"
                className="inline-flex items-center gap-3 px-10 py-5 bg-white text-telos-blue text-lg rounded-xl font-bold hover-lift transition-smooth shadow-2xl"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Começar Agora
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
