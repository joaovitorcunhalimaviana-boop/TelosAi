"use client"

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, Star, TrendingUp, Trophy, Zap, CheckCircle2, PartyPopper } from 'lucide-react'
import confetti from 'canvas-confetti'

interface MilestoneRewardProps {
  milestone: 40 | 60 | 80 | 100
  isVisible: boolean
  onClose?: () => void
  autoClose?: boolean
  autoCloseDelay?: number
}

const milestoneData = {
  40: {
    title: "Ótimo Progresso!",
    subtitle: "Você desbloqueou relatórios básicos",
    icon: TrendingUp,
    color: "#F97316",
    gradient: "from-orange-500 to-amber-500",
    bgGradient: "from-orange-50 to-amber-50",
    benefits: ["Relatórios simples disponíveis", "Visualização de dados básicos"],
    celebration: "Está indo muito bem! Continue assim."
  },
  60: {
    title: "Mais da Metade!",
    subtitle: "Análises avançadas liberadas",
    icon: Zap,
    color: "#EAB308",
    gradient: "from-yellow-500 to-orange-500",
    bgGradient: "from-yellow-50 to-orange-50",
    benefits: ["Análises preditivas ativadas", "Alertas personalizados", "Dashboard expandido"],
    celebration: "Você está arrasando! A reta final está próxima."
  },
  80: {
    title: "Quase Perfeito!",
    subtitle: "Ferramentas avançadas desbloqueadas",
    icon: Award,
    color: "#22C55E",
    gradient: "from-green-500 to-emerald-500",
    bgGradient: "from-green-50 to-emerald-50",
    benefits: ["Exportação completa de dados", "Gráficos avançados", "Análises detalhadas"],
    celebration: "Incrível! Só mais um pouco para 100%."
  },
  100: {
    title: "PERFEIÇÃO ALCANÇADA!",
    subtitle: "Todos os recursos liberados",
    icon: Trophy,
    color: "#FFD700",
    gradient: "from-yellow-400 via-yellow-500 to-orange-500",
    bgGradient: "from-yellow-50 via-amber-50 to-orange-50",
    benefits: [
      "Todos os recursos desbloqueados",
      "Pontuação máxima de qualidade",
      "Elegível para pesquisas",
      "Prioridade no suporte",
      "Certificado de completude"
    ],
    celebration: "PARABÉNS! Você atingiu a excelência!"
  }
}

export function MilestoneReward({
  milestone,
  isVisible,
  onClose,
  autoClose = true,
  autoCloseDelay = 5000
}: MilestoneRewardProps) {
  const [show, setShow] = useState(false)
  const data = milestoneData[milestone]
  const Icon = data.icon

  const handleClose = () => {
    setShow(false)
    setTimeout(() => {
      onClose?.()
    }, 300)
  }

  const triggerSmallConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: [data.color, '#FFD700', '#FFA500']
    })
  }

  const triggerBigConfetti = () => {
    const duration = 3000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1']
      })
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1']
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    frame()
  }

  useEffect(() => {
    if (isVisible) {
      setShow(true)

      // Trigger confetti
      if (milestone === 100) {
        triggerBigConfetti()
      } else {
        triggerSmallConfetti()
      }

      // Auto close
      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose()
        }, autoCloseDelay)
        return () => clearTimeout(timer)
      }
    }
  }, [isVisible, milestone, autoClose, autoCloseDelay])

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 100 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{
                type: "spring",
                damping: 20,
                stiffness: 300
              }}
              onClick={(e) => e.stopPropagation()}
              className={`bg-gradient-to-br ${data.bgGradient} rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative`}
            >
              {/* Animated background elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{
                      x: (i * 20) - 200, // Deterministic x
                      y: -20,
                      opacity: 0
                    }}
                    animate={{
                      y: 500,
                      opacity: [0, 1, 0],
                      rotate: i * 18 // Deterministic rotation
                    }}
                    transition={{
                      duration: 2 + (i % 3), // Deterministic duration
                      repeat: Infinity,
                      delay: i * 0.1, // Deterministic delay
                      ease: "linear"
                    }}
                    className="absolute text-2xl"
                  >
                    {milestone === 100 ? '🏆' : ['⭐', '✨', '🎉'][i % 3]}
                  </motion.div>
                ))}
              </div>

              {/* Content */}
              <div className="relative z-10 p-8">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{
                    scale: 1,
                    rotate: 0,
                  }}
                  transition={{
                    type: "spring",
                    damping: 10,
                    stiffness: 200,
                    delay: 0.2
                  }}
                  className="mx-auto w-24 h-24 mb-6 relative"
                >
                  <motion.div
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="absolute inset-0 rounded-full opacity-20"
                    style={{
                      background: `conic-gradient(from 0deg, ${data.color}, transparent)`
                    }}
                  />
                  <div
                    className="absolute inset-2 rounded-full flex items-center justify-center shadow-xl"
                    style={{ backgroundColor: data.color }}
                  >
                    <Icon className="w-12 h-12 text-white" />
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold text-center mb-2 bg-gradient-to-r bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${data.color}, ${data.color}dd)`
                  }}
                >
                  {data.title}
                </motion.h2>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-center text-gray-700 mb-6 font-medium"
                >
                  {data.subtitle}
                </motion.p>

                {/* Celebration message */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-6 text-center"
                >
                  <p className="text-gray-800 font-semibold flex items-center justify-center gap-2">
                    <PartyPopper className="w-5 h-5" style={{ color: data.color }} />
                    {data.celebration}
                  </p>
                </motion.div>

                {/* Benefits list */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6"
                >
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5" style={{ color: data.color }} />
                    Recursos Desbloqueados
                  </h3>
                  <div className="space-y-2">
                    {data.benefits.map((benefit, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + idx * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <CheckCircle2
                          className="w-5 h-5 flex-shrink-0 mt-0.5"
                          style={{ color: data.color }}
                        />
                        <span className="text-gray-700 text-sm">{benefit}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Progress badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-center mb-6"
                >
                  <div
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-bold text-lg shadow-lg"
                    style={{
                      background: `linear-gradient(to right, ${data.color}, ${data.color}dd)`
                    }}
                  >
                    <Trophy className="w-6 h-6" />
                    {milestone}% Completo
                    {milestone === 100 && <Trophy className="w-6 h-6" />}
                  </div>
                </motion.div>

                {/* Close button */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClose}
                  className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  {milestone === 100 ? 'Começar a usar!' : 'Continuar'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
