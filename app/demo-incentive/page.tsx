"use client"

import React, { useState } from 'react'
import { CompletenessIncentive } from '@/components/CompletenessIncentive'
import { MilestoneReward } from '@/components/MilestoneReward'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'

export default function IncentiveDemoPage() {
  const [completion, setCompletion] = useState(35)
  const [showMilestone, setShowMilestone] = useState<40 | 60 | 80 | 100 | null>(null)

  const handleCompletionChange = (value: number[]) => {
    setCompletion(value[0])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Gamified Incentive System Demo
          </h1>
          <p className="text-gray-600">
            Test the completion incentive components with interactive controls
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Controls</h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Completion Percentage: {completion}%
            </label>
            <Slider
              value={[completion]}
              onValueChange={handleCompletionChange}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              onClick={() => setShowMilestone(40)}
              variant="outline"
              className="w-full"
            >
              Show 40% Milestone
            </Button>
            <Button
              onClick={() => setShowMilestone(60)}
              variant="outline"
              className="w-full"
            >
              Show 60% Milestone
            </Button>
            <Button
              onClick={() => setShowMilestone(80)}
              variant="outline"
              className="w-full"
            >
              Show 80% Milestone
            </Button>
            <Button
              onClick={() => setShowMilestone(100)}
              variant="outline"
              className="w-full"
            >
              Show 100% Milestone
            </Button>
          </div>

          <div className="grid grid-cols-5 gap-2 mt-4">
            <Button
              onClick={() => setCompletion(15)}
              variant="secondary"
              size="sm"
            >
              15%
            </Button>
            <Button
              onClick={() => setCompletion(35)}
              variant="secondary"
              size="sm"
            >
              35%
            </Button>
            <Button
              onClick={() => setCompletion(55)}
              variant="secondary"
              size="sm"
            >
              55%
            </Button>
            <Button
              onClick={() => setCompletion(75)}
              variant="secondary"
              size="sm"
            >
              75%
            </Button>
            <Button
              onClick={() => setCompletion(95)}
              variant="secondary"
              size="sm"
            >
              95%
            </Button>
          </div>
        </div>

        {/* Incentive Component */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            Completeness Incentive
          </h2>
          <CompletenessIncentive
            currentCompletion={completion}
            onContinue={() => alert('Continue button clicked!')}
            showConfetti={true}
          />
        </div>

        {/* Feature Information */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Features</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Visual Progress Ring</h3>
              <p className="text-gray-600 text-sm">
                Apple-style circular progress indicator that updates smoothly as completion increases
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Dynamic Levels</h3>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>• 0-20%: &quot;Dados básicos&quot; - Red</li>
                <li>• 21-40%: &quot;Informações essenciais&quot; - Orange</li>
                <li>• 41-60%: &quot;Bom progresso&quot; - Yellow</li>
                <li>• 61-80%: &quot;Quase completo&quot; - Light green</li>
                <li>• 81-99%: &quot;Excelente!&quot; - Green</li>
                <li>• 100%: &quot;Cadastro perfeito!&quot; - Gold with confetti</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Unlockable Benefits</h3>
              <p className="text-gray-600 text-sm">
                Shows locked and unlocked benefits based on completion level, motivating users to complete their profile
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Milestone Celebrations</h3>
              <p className="text-gray-600 text-sm">
                Special celebration modals appear at 40%, 60%, 80%, and 100% completion with confetti effects
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Motivational Messages</h3>
              <p className="text-gray-600 text-sm">
                Context-aware messages that encourage users to continue based on their progress
              </p>
            </div>
          </div>
        </div>

        {/* Integration Example */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Integration Example</h2>

          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
            {`import { CompletenessIncentive } from '@/components/CompletenessIncentive'
import { MilestoneReward } from '@/components/MilestoneReward'
import { useState } from 'react'

function MyForm() {
  const [completion, setCompletion] = useState(0)
  const [showMilestone, setShowMilestone] = useState(null)

  // Calculate completion based on filled fields
  const calculateCompletion = (formData) => {
    const totalFields = Object.keys(formData).length
    const filledFields = Object.values(formData)
      .filter(v => v !== null && v !== '').length
    return Math.round((filledFields / totalFields) * 100)
  }

  return (
    <>
      <CompletenessIncentive
        currentCompletion={completion}
        onContinue={() => scrollToNextEmptyField()}
        showConfetti={true}
      />

      <MilestoneReward
        milestone={showMilestone}
        isVisible={showMilestone !== null}
        onClose={() => setShowMilestone(null)}
      />
    </>
  )
}`}
          </pre>
        </div>
      </div>

      {/* Milestone Reward Component */}
      {showMilestone && (
        <MilestoneReward
          milestone={showMilestone}
          isVisible={true}
          onClose={() => setShowMilestone(null)}
          autoClose={false}
        />
      )}
    </div>
  )
}
