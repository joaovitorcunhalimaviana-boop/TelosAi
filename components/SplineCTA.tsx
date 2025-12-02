'use client'

import { SplineScene } from "@/components/ui/splite"
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"
import Link from "next/link"

export function SplineCTA() {
  return (
    <section className="py-12 px-6">
      <Card className="w-full max-w-7xl mx-auto h-[500px] md:h-[600px] bg-black/[0.96] relative overflow-hidden rounded-3xl border-0">
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="#D4AF37"
        />

        <div className="flex flex-col md:flex-row h-full">
          {/* Left content */}
          <div className="flex-1 p-8 md:p-12 relative z-10 flex flex-col justify-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full shadow-lg mb-6 w-fit">
              <div className="w-2 h-2 bg-telos-gold rounded-full animate-pulse"></div>
              <span className="text-sm font-bold text-telos-gold uppercase tracking-wider">
                IA Conversacional via WhatsApp
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 mb-6">
              Seu Assistente
              <br />
              <span className="text-gradient-gold">Inteligente</span>
            </h2>

            <p className="text-lg md:text-xl text-neutral-300 max-w-lg mb-8 leading-relaxed text-justify">
              Nossa IA conversa naturalmente com seus pacientes pelo WhatsApp, coletando sintomas, identificando riscos e alertando você em tempo real. Acompanhamento 24/7 sem esforço manual.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/cadastro-medico"
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-telos-gold text-white rounded-xl font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(212,175,55,0.5)]"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                <span className="relative flex items-center gap-2">
                  Começar Agora
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>

              <Link
                href="/como-funciona"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-transparent border border-white/20 text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
              >
                Ver Demonstração
              </Link>
            </div>
          </div>

          {/* Right content - Robot illustration */}
          <div className="flex-1 relative hidden md:block">
            <SplineScene
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Mobile fallback gradient */}
        <div className="absolute bottom-0 right-0 w-full h-1/3 md:hidden bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
      </Card>
    </section>
  )
}
