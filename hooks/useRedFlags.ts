import { useState, useEffect, useCallback, useRef } from 'react'

export interface RedFlag {
  id: string
  patient: {
    id: string
    name: string
    phone: string
  }
  surgery: {
    id: string
    type: string
  }
  followUp: {
    dayNumber: number
  }
  response: {
    riskLevel: 'critical' | 'high'
    redFlags: string[]
    createdAt: Date | string
  }
  isViewed: boolean
  lastViewedAt: Date | string | null
}

export interface UseRedFlagsReturn {
  redFlags: RedFlag[]
  count: number
  loading: boolean
  error: string | null
  markAsViewed: (followUpResponseId: string) => Promise<void>
  refresh: () => Promise<void>
}

export function useRedFlags(): UseRedFlagsReturn {
  const [redFlags, setRedFlags] = useState<RedFlag[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Ref para armazenar o último count de critical flags
  const lastCriticalCountRef = useRef(0)
  // Ref para armazenar se já tocou som nesta sessão
  const hasPlayedSoundRef = useRef(false)

  // Função para tocar som de alerta
  const playAlertSound = useCallback(() => {
    try {
      // Cria um contexto de áudio para garantir compatibilidade
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      const audioContext = new AudioContext()

      // Cria um oscilador para gerar o som
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Configura o som (frequência e volume)
      oscillator.frequency.value = 800 // Hz (tom de alerta)
      gainNode.gain.value = 0.3 // Volume (30%)

      // Toca o som por 200ms
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)

      // Segundo bip após 300ms
      setTimeout(() => {
        const oscillator2 = audioContext.createOscillator()
        const gainNode2 = audioContext.createGain()

        oscillator2.connect(gainNode2)
        gainNode2.connect(audioContext.destination)

        oscillator2.frequency.value = 1000
        gainNode2.gain.value = 0.3

        oscillator2.start(audioContext.currentTime)
        oscillator2.stop(audioContext.currentTime + 0.2)
      }, 300)

    } catch (error) {
      console.error('Erro ao tocar som de alerta:', error)
    }
  }, [])

  // Função para buscar red flags
  const fetchRedFlags = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard/red-flags')
      const data = await response.json()

      if (data.success) {
        const newRedFlags = data.data || []
        const newCount = data.count || 0

        setRedFlags(newRedFlags)
        setCount(newCount)
        setError(null)

        // Verifica se há novos critical flags
        const criticalFlags = newRedFlags.filter(
          (flag: RedFlag) => flag.response.riskLevel === 'critical'
        )
        const newCriticalCount = criticalFlags.length

        // Toca som se:
        // 1. Há critical flags
        // 2. O count de critical aumentou OU ainda não tocou som nesta sessão
        // 3. Não está no primeiro load (loading false)
        if (
          newCriticalCount > 0 &&
          !loading &&
          (newCriticalCount > lastCriticalCountRef.current || !hasPlayedSoundRef.current)
        ) {
          playAlertSound()
          hasPlayedSoundRef.current = true
        }

        lastCriticalCountRef.current = newCriticalCount
      } else {
        setError(data.error?.message || 'Erro ao carregar alertas')
      }
    } catch (err) {
      console.error('Erro ao buscar red flags:', err)
      setError('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }, [loading, playAlertSound])

  // Função para marcar como visualizado
  const markAsViewed = useCallback(async (followUpResponseId: string) => {
    try {
      const response = await fetch('/api/dashboard/red-flags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ followUpResponseId })
      })

      const data = await response.json()

      if (data.success) {
        // Atualiza a lista removendo o red flag visualizado
        setRedFlags(prev => prev.filter(flag => flag.id !== followUpResponseId))
        setCount(prev => Math.max(0, prev - 1))

        // Atualiza o count de critical se necessário
        const wasCritical = redFlags.find(
          flag => flag.id === followUpResponseId && flag.response.riskLevel === 'critical'
        )

        if (wasCritical) {
          lastCriticalCountRef.current = Math.max(0, lastCriticalCountRef.current - 1)
        }
      } else {
        throw new Error(data.error?.message || 'Erro ao marcar como visualizado')
      }
    } catch (err) {
      console.error('Erro ao marcar red flag como visualizado:', err)
      throw err
    }
  }, [redFlags])

  // Polling a cada 30 segundos
  useEffect(() => {
    // Busca inicial
    fetchRedFlags()

    // Configura polling
    const interval = setInterval(fetchRedFlags, 30000) // 30 segundos

    return () => {
      clearInterval(interval)
    }
  }, [fetchRedFlags])

  return {
    redFlags,
    count,
    loading,
    error,
    markAsViewed,
    refresh: fetchRedFlags
  }
}
