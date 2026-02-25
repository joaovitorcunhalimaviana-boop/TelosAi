"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

export function ScrollVideoSection() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    })

    // Scale from 0.8 to 1 as it comes into view/centers
    const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1])
    // Opacity fade in
    const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1])

    return (
        <section ref={containerRef} className="py-24 bg-gradient-to-b from-white via-gray-50/50 to-white overflow-hidden">
            <div className="container mx-auto px-6">
                {/* Header modernizado */}
                <div className="text-center mb-16">
                    <motion.div
                        style={{ opacity }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D7377]/5 rounded-full mb-6"
                    >
                        <span className="w-2 h-2 bg-[#C9A84C] rounded-full animate-pulse"></span>
                        <span className="text-sm font-semibold text-[#14BDAE] uppercase tracking-wider">
                            Assista e Descubra
                        </span>
                    </motion.div>

                    <motion.h2
                        style={{ opacity }}
                        className="text-4xl lg:text-5xl font-black text-[#14BDAE] mb-6 tracking-tight"
                    >
                        A <span className="text-gradient-gold">Evolução</span> da Cirurgia
                    </motion.h2>

                    <motion.p
                        style={{ opacity }}
                        className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
                    >
                        Veja como a <span className="font-semibold text-[#14BDAE]">inteligência artificial</span> está
                        revolucionando o cuidado pós-operatório em tempo real.
                    </motion.p>
                </div>

                <motion.div
                    style={{ scale, opacity }}
                    className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(10,38,71,0.15)] border border-[#0D7377]/10"
                >
                    {/* Placeholder for the video - User will replace this */}
                    <div className="absolute inset-0 bg-gray-900 flex items-center justify-center group cursor-pointer">
                        {/* Background gradient/image placeholder */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#0D7377] via-[#0A2647] to-black"></div>

                        {/* Animated grid background */}
                        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>

                        {/* Glow effects */}
                        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#C9A84C]/20 rounded-full blur-[100px] animate-pulse"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#0D7377]/30 rounded-full blur-[100px] animate-pulse animation-delay-1000"></div>

                        {/* Play Button / Icon */}
                        <div className="relative z-10 w-24 h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 group-hover:bg-[#C9A84C]/20 transition-all duration-500 shadow-[0_0_40px_rgba(212,175,55,0.2)] group-hover:shadow-[0_0_60px_rgba(212,175,55,0.4)]">
                            <div className="absolute inset-0 rounded-full border-2 border-[#C9A84C]/30 animate-ping"></div>
                            <svg className="w-10 h-10 text-white ml-1 group-hover:text-[#C9A84C] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>

                        {/* Bottom text */}
                        <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-2">
                            <p className="text-white/80 text-base font-semibold tracking-wide">
                                Clique para assistir
                            </p>
                            <p className="text-white/40 text-sm font-medium tracking-widest uppercase">
                                Apresentação VigIA
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
