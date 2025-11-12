"use client"

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Lock, Sparkles, TrendingUp, Award, Star } from 'lucide-react'
import confetti from 'canvas-confetti'

interface CompletenessIncentiveProps {
  currentCompletion: number // 0-100
  onContinue?: () => void
  showConfetti?: boolean
}

const benefits = {
  20: ["Follow-ups básicos habilitados"],
  40: ["Relatórios simples disponíveis"],
  60: ["Análises preditivas ativadas", "Alertas personalizados"],
  80: ["Exportação completa de dados", "Gráficos avançados"],
  100: ["Todos os recursos desbloqueados", "Pontuação máxima de qualidade", "Elegível para pesquisas"]
}

const levels = [
  { threshold: 0, label: "Dados básicos", color: "#EF4444", bgColor: "#FEE2E2", emoji: "🔴" },
  { threshold: 21, label: "Informações essenciais", color: "#F97316", bgColor: "#FFEDD5", emoji: "🟠" },
  { threshold: 41, label: "Bom progresso", color: "#EAB308", bgColor: "#FEF3C7", emoji: "🟡" },
  { threshold: 61, label: "Quase completo", color: "#84CC16", bgColor: "#ECFCCB", emoji: "🟢" },
  { threshold: 81, label: "Excelente!", color: "#22C55E", bgColor: "#DCFCE7", emoji: "✨" },
  { threshold: 100, label: "Cadastro perfeito!", color: "#FFD700", bgColor: "#FEF9C3", emoji: "🏆" }
]

const motivationalMessages = {
  0: "Vamos começar! Cada informação conta.",
  21: "Ótimo começo! Continue assim.",
  41: "Você está indo muito bem!",
  61: "Quase lá! Não desista agora.",
  81: "Incrível! Falta muito pouco.",
  100: "Perfeito! Cadastro 100% completo!"
}

export function CompletenessIncentive({
  currentCompletion,
  onContinue,
  showConfetti = true
}: CompletenessIncentiveProps) {
  const [previousCompletion, setPreviousCompletion] = useState(currentCompletion)
  const [showMilestone, setShowMilestone] = useState(false)

  // Determine current level
  const currentLevel = [...levels].reverse().find(level => currentCompletion >= level.threshold) || levels[0]

  // Get motivational message
  const message = Object.entries(motivationalMessages)
    .reverse()
    .find(([threshold]) => currentCompletion >= parseInt(threshold))?.[1] || motivationalMessages[0]

  // Check for milestone reached
  useEffect(() => {
    const milestones = [40, 60, 80, 100]
    const reachedMilestone = milestones.find(
      m => currentCompletion >= m && previousCompletion < m
    )

    if (reachedMilestone) {
      setShowMilestone(true)

      // Trigger confetti for 100%
      if (reachedMilestone === 100 && showConfetti) {
        triggerConfetti()
      }

      setTimeout(() => setShowMilestone(false), 3000)
    }

    setPreviousCompletion(currentCompletion)
  }, [currentCompletion, previousCompletion, showConfetti])

  const triggerConfetti = () => {
    const duration = 3000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#0066CC', '#00A3E0', '#FFD700', '#FFA500']
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#0066CC', '#00A3E0', '#FFD700', '#FFA500']
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    frame()
  }

  // Get unlocked and locked benefits
  const allBenefitLevels = [20, 40, 60, 80, 100]
  const unlockedBenefits: { level: number; items: string[] }[] = []
  const nextBenefit = allBenefitLevels.find(level => currentCompletion < level)

  allBenefitLevels.forEach(level => {
    if (currentCompletion >= level) {
      unlockedBenefits.push({ level, items: benefits[level as keyof typeof benefits] })
    }
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {/* Milestone Celebration Overlay */}
      <AnimatePresence>
        {showMilestone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-2xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl p-8 shadow-2xl text-center"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Award className="w-20 h-20 mx-auto mb-4" style={{ color: currentLevel.color }} />
              </motion.div>
              <h3 className="text-2xl font-bold mb-2">Parabéns!</h3>
              <p className="text-gray-600">Você alcançou {currentCompletion}% de completude!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Card */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-start gap-6">
          {/* Progress Ring */}
          <div className="flex-shrink-0">
            <div className="relative w-32 h-32">
              {/* Background circle */}
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                  fill="none"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke={currentLevel.color}
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 352" }}
                  animate={{
                    strokeDasharray: `${(currentCompletion / 100) * 352} 352`,
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  style={{
                    filter: currentCompletion === 100 ? 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))' : 'none'
                  }}
                />
              </svg>

              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                  key={currentCompletion}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-bold"
                  style={{ color: currentLevel.color }}
                >
                  {currentCompletion}%
                </motion.div>
                <motion.div
                  animate={{
                    scale: currentCompletion === 100 ? [1, 1.2, 1] : 1,
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: currentCompletion === 100 ? Infinity : 0,
                    repeatDelay: 1
                  }}
                  className="text-2xl"
                >
                  {currentLevel.emoji}
                </motion.div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Level Badge */}
            <motion.div
              key={currentLevel.label}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold mb-3"
              style={{
                backgroundColor: currentLevel.bgColor,
                color: currentLevel.color
              }}
            >
              <Sparkles className="w-4 h-4" />
              {currentLevel.label}
            </motion.div>

            {/* Motivational Message */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {message}
            </h3>

            {/* Progress to next milestone */}
            {nextBenefit && currentCompletion < 100 && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <TrendingUp className="w-4 h-4" />
                <span>
                  Faltam {nextBenefit - currentCompletion}% para desbloquear novos recursos
                </span>
              </div>
            )}

            {/* Unlocked Benefits */}
            {unlockedBenefits.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Recursos Desbloqueados
                </h4>
                <div className="space-y-1">
                  {unlockedBenefits.flatMap(b => b.items).map((benefit, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      {benefit}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Benefits Preview */}
            {nextBenefit && currentCompletion < 100 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-400" />
                  Próximos Desbloqueios ({nextBenefit}%)
                </h4>
                <div className="space-y-1">
                  {benefits[nextBenefit as keyof typeof benefits].map((benefit, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-2 text-sm text-gray-400"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                      {benefit}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Button */}
            {currentCompletion < 100 && onContinue && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onContinue}
                className="w-full bg-gradient-to-r from-[#0066CC] to-[#00A3E0] text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Continue preenchendo
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  →
                </motion.span>
              </motion.button>
            )}

            {/* Perfect completion message */}
            {currentCompletion === 100 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-4 text-center"
              >
                <div className="flex items-center justify-center gap-2 text-lg font-bold text-yellow-700 mb-1">
                  <Star className="w-6 h-6 fill-yellow-500 text-yellow-500" />
                  Cadastro Perfeito!
                  <Star className="w-6 h-6 fill-yellow-500 text-yellow-500" />
                </div>
                <p className="text-sm text-yellow-600">
                  Você desbloqueou todos os recursos da plataforma!
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Progress Bar (mobile fallback) */}
        <div className="mt-6 md:hidden">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${currentCompletion}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ backgroundColor: currentLevel.color }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
