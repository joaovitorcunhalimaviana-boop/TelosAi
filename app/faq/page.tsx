"use client"

import { useState } from "react"
import Link from "next/link"
import { VigiaHeader } from "@/components/VigiaHeader"
import { FadeIn } from "@/components/animations"

interface FAQItem {
  question: string
  answer: string
  category: "ia" | "geral" | "precos" | "tecnico"
}

const faqData: FAQItem[] = [
  // CATEGORIA: INTELIGÊNCIA ARTIFICIAL
  {
    category: "ia",
    question: "Como funciona o Machine Learning no VigIA?",
    answer: "O sistema usa um modelo de ML que analisa 15+ variáveis clínicas (idade, comorbidades, tipo de cirurgia, dor, sangramento, etc.) para calcular o risco de complicações. O modelo foi treinado com Random Forest e Gradient Boosting, técnicas consolidadas em medicina preditiva."
  },
  {
    category: "ia",
    question: "O que é 'Inteligência Coletiva' e como funciona?",
    answer: "Inteligência Coletiva significa que o sistema aprende com dados pseudonimizados de múltiplos cirurgiões (com consentimento dos pacientes). Os dados são criptografados com SHA-256, tornando impossível identificar pacientes individuais. Quanto mais médicos usam, mais preciso o modelo fica. É 100% conforme LGPD."
  },
  {
    category: "ia",
    question: "A IA pode errar? O que acontece nesse caso?",
    answer: "Sim, IA não é infalível. Por isso o sistema usa detecção dupla: red flags determinísticos (baseados em guidelines clínicos) + análise de IA. Você sempre tem a decisão final. O sistema é uma ferramenta de suporte, não substitui o julgamento médico."
  },
  {
    category: "ia",
    question: "Qual modelo de IA é usado?",
    answer: "Usamos Claude Haiku da Anthropic para análise conversacional e detecção de padrões em respostas dos pacientes. Para predição de complicações, usamos Random Forest e Gradient Boosting treinados especificamente para dados pós-operatórios."
  },
  {
    category: "ia",
    question: "A IA aprende com os meus casos?",
    answer: "Sim, com seu consentimento. Se você ativar a Inteligência Coletiva, seus dados (pseudonimizados) ajudam a treinar modelos mais precisos. Você pode desativar a qualquer momento. Seus dados nunca são compartilhados sem pseudonimização."
  },

  // CATEGORIA: GERAL
  {
    category: "geral",
    question: "O que é o VigIA?",
    answer: "VigIA é um sistema completo de acompanhamento pós-operatório com IA. Envia questionários automatizados via WhatsApp, analisa respostas com Machine Learning, detecta complicações precocemente e organiza dados para pesquisa científica."
  },
  {
    category: "geral",
    question: "Para quais especialidades o sistema funciona?",
    answer: "Atualmente especializado em cirurgias orificiais (hemorroidectomia, fístulas, fissuras, doença pilonidal). Estamos expandindo para colecistectomias e herniorrafias. Founding Members terão acesso prioritário a novas especialidades."
  },
  {
    category: "geral",
    question: "Preciso de conhecimento técnico para usar?",
    answer: "Não. O sistema é totalmente intuitivo. Você cadastra o paciente em 30 segundos e o resto é automático. A IA cuida de enviar mensagens, analisar respostas e te alertar quando necessário."
  },
  {
    category: "geral",
    question: "O paciente precisa instalar algum app?",
    answer: "Não! Tudo funciona pelo WhatsApp que o paciente já tem instalado. Ele apenas responde mensagens como faria normalmente."
  },
  {
    category: "geral",
    question: "Os dados dos pacientes estão seguros?",
    answer: "Sim. Criptografia de ponta a ponta, servidores no Brasil, conformidade 100% com LGPD. Dados pseudonimizados com SHA-256 irreversível. Você tem controle total sobre seus dados."
  },
  {
    category: "geral",
    question: "Posso usar para pesquisa científica?",
    answer: "Sim! O 'Modo Pesquisa' organiza pacientes em grupos, gera estatísticas e exporta dados anonimizados prontos para publicação. Inclui termos de consentimento digitais conforme ética em pesquisa."
  },
  {
    category: "geral",
    question: "O sistema substitui o médico?",
    answer: "Não. O VigIA é uma ferramenta de suporte à decisão. Você continua sendo o responsável por todas as decisões clínicas. O sistema apenas te ajuda a identificar problemas mais cedo e organizar informações."
  },

  // CATEGORIA: PREÇOS
  {
    category: "precos",
    question: "Por que o plano Founding Member custa R$ 400/mês?",
    answer: "Founding Members pagam R$ 400/mês VITALÍCIO (preço nunca aumenta) enquanto outros pagarão R$ 950/mês. É uma oportunidade de garantir tecnologia de ponta com desconto de 58% para sempre. Além disso, evitar uma única complicação já justifica o investimento."
  },
  {
    category: "precos",
    question: "Existe garantia?",
    answer: "Sim, 30 dias de garantia incondicional. Se não estiver satisfeito, devolvemos 100% do valor pago. Sem perguntas, sem burocracia."
  },
  {
    category: "precos",
    question: "Posso cancelar a qualquer momento?",
    answer: "Sim. Sem multas, sem fidelidade. Cancele quando quiser. Seus dados permanecem acessíveis por 90 dias após cancelamento."
  },
  {
    category: "precos",
    question: "O que acontece se eu exceder o número de pacientes do plano?",
    answer: "Você paga apenas pelos pacientes adicionais. Founding Member: R$ 150/paciente extra. Early Adopter: R$ 180/paciente. Professional: R$ 350/paciente. Sem taxas surpresa."
  },
  {
    category: "precos",
    question: "Vale a pena o investimento?",
    answer: "Considere: uma complicação pós-operatória custa em média R$ 15.000 (reinternação, medicação, reoperação, processo). Evitar UMA complicação por ano já paga o sistema 30x. Além disso, você economiza 10h/semana em ligações manuais."
  },
  {
    category: "precos",
    question: "Posso mudar de plano depois?",
    answer: "Sim. Você pode fazer upgrade a qualquer momento. ATENÇÃO: Founding Members que mudarem de plano perdem o preço vitalício e não podem voltar."
  },

  // CATEGORIA: TÉCNICO
  {
    category: "tecnico",
    question: "Como o WhatsApp é integrado?",
    answer: "Usamos a API oficial do WhatsApp Business. Totalmente legal, seguro e conforme termos de uso do WhatsApp. Não usamos soluções não-oficiais."
  },
  {
    category: "tecnico",
    question: "Funciona sem internet?",
    answer: "O sistema precisa de internet para enviar mensagens e sincronizar dados. Você pode acessar o dashboard offline, mas funcionalidades de análise e alertas requerem conexão."
  },
  {
    category: "tecnico",
    question: "Onde os dados ficam armazenados?",
    answer: "Banco de dados PostgreSQL hospedado em servidores no Brasil (conformidade LGPD). Backups automáticos diários. Criptografia em repouso e em trânsito."
  },
  {
    category: "tecnico",
    question: "O sistema funciona em celular?",
    answer: "Sim! Design 100% responsivo. Funciona perfeitamente em iPhone, Android, tablets e computadores. Você pode acompanhar pacientes de qualquer dispositivo."
  },
  {
    category: "tecnico",
    question: "Quantos pacientes posso cadastrar?",
    answer: "Founding Member: 3 inclusos + ilimitados extras. Early Adopter: 3 inclusos + ilimitados extras. Professional: 3 inclusos + ilimitados extras. Todos os planos são escaláveis."
  },
  {
    category: "tecnico",
    question: "Como funciona a detecção de red flags?",
    answer: "Sistema duplo: (1) Red flags determinísticos baseados em guidelines (febre ≥38°C, sangramento volumoso, etc.). (2) Análise de IA que identifica padrões sutis nas respostas. Você é alertado imediatamente quando há risco."
  },
  {
    category: "tecnico",
    question: "Posso personalizar os questionários?",
    answer: "Sim. Você pode adicionar perguntas customizadas, ajustar dias de follow-up e definir protocolos específicos para sua prática. Total flexibilidade."
  },
]

const categories = {
  ia: { name: "Inteligência Artificial", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
  geral: { name: "Geral", icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  precos: { name: "Preços e Planos", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  tecnico: { name: "Técnico", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
}

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [openItem, setOpenItem] = useState<number | null>(null)

  const filteredFAQ = selectedCategory
    ? faqData.filter(item => item.category === selectedCategory)
    : faqData

  return (
    <div className="min-h-screen bg-[#0B0E14]">
      <VigiaHeader />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-[#0B0E14] via-[#111520] to-[#0B0E14]">
        <div className="container mx-auto px-6">
          <FadeIn delay={0.1} direction="up">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#161B27] border border-[#1E2535] rounded-full mb-6">
                <div className="w-2 h-2 bg-[#C9A84C] rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-[#14BDAE]">
                  Perguntas Frequentes
                </span>
              </div>

              <h1 className="text-4xl lg:text-6xl font-brand text-[#F0EAD6] mb-6" style={{ fontWeight: 300 }}>
                Dúvidas sobre o VigIA?
              </h1>
              <p className="text-lg text-[#7A8299]">
                Respostas honestas e diretas sobre IA, Machine Learning, preços e funcionalidades
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-[#111520] border-b border-[#1E2535]">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                selectedCategory === null
                  ? "bg-[#0D7377] text-[#F0EAD6] shadow-lg shadow-[#0D7377]/20"
                  : "bg-[#161B27] text-[#7A8299] hover:bg-[#1E2535]"
              }`}
            >
              Todas
            </button>
            {Object.entries(categories).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  selectedCategory === key
                    ? "bg-[#0D7377] text-[#F0EAD6] shadow-lg shadow-[#0D7377]/20"
                    : "bg-[#161B27] text-[#7A8299] hover:bg-[#1E2535]"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={cat.icon} />
                </svg>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Items */}
      <section className="py-16 bg-[#0B0E14]">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {filteredFAQ.map((item, idx) => (
              <FadeIn key={idx} delay={idx * 0.05} direction="up">
                <div className="border-2 border-[#1E2535] rounded-xl overflow-hidden hover:border-[#14BDAE] transition-all">
                  <button
                    onClick={() => setOpenItem(openItem === idx ? null : idx)}
                    className="w-full px-6 py-5 flex items-start justify-between gap-4 text-left hover:bg-[#161B27] transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#161B27] text-[#14BDAE] text-xs font-semibold rounded-full border border-[#1E2535]">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={categories[item.category as keyof typeof categories].icon} />
                          </svg>
                          {categories[item.category as keyof typeof categories].name}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-[#F0EAD6]">
                        {item.question}
                      </h3>
                    </div>
                    <svg
                      className={`w-6 h-6 text-[#14BDAE] flex-shrink-0 transition-transform ${
                        openItem === idx ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {openItem === idx && (
                    <div className="px-6 pb-6">
                      <div className="pl-4 border-l-4 border-[#14BDAE]">
                        <p className="text-[#D8DEEB] leading-relaxed text-justify">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-[#111520] via-[#0D7377]/10 to-[#111520] border-t border-[#1E2535]">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl lg:text-5xl font-brand text-[#F0EAD6]" style={{ fontWeight: 300 }}>
              Ainda tem dúvidas?
            </h2>
            <p className="text-xl text-[#7A8299]">
              Entre em contato conosco ou agende uma demonstração gratuita
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/cadastro-medico?plan=founding"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#0D7377] text-[#F0EAD6] rounded-xl font-bold text-lg hover-lift shadow-2xl hover:bg-[#14BDAE] transition-colors"
              >
                Começar Agora
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <a
                href="mailto:vigia.app.br@gmail.com"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#161B27] text-[#F0EAD6] border border-[#1E2535] rounded-xl font-bold text-lg hover-lift shadow-2xl hover:bg-[#1E2535] transition-colors"
              >
                Falar com Equipe
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0B0E14] border-t border-[#1E2535] text-white py-12">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4">
            <div className="flex items-baseline justify-center gap-0.5">
              <span className="text-3xl font-bold text-[#F0EAD6]">VigIA</span>
            </div>
            <p className="text-[#7A8299]">
              A Inteligência no Cuidado para o Propósito da Recuperação
            </p>
            <div className="flex justify-center gap-6 text-sm">
              <Link href="/" className="text-[#7A8299] hover:text-[#F0EAD6] transition-colors">
                Início
              </Link>
              <Link href="/sobre" className="text-[#7A8299] hover:text-[#F0EAD6] transition-colors">
                Sobre
              </Link>
              <Link href="/pricing" className="text-[#7A8299] hover:text-[#F0EAD6] transition-colors">
                Planos
              </Link>
              <Link href="/termos" className="text-[#7A8299] hover:text-[#F0EAD6] transition-colors">
                Termos
              </Link>
            </div>
            <p className="text-[#7A8299] text-sm">
              © 2025 VigIA - Dr. João Vitor Viana. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
