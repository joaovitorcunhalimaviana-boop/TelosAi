/**
 * PostRegistrationModal - Usage Example
 *
 * This file demonstrates how to integrate the PostRegistrationModal
 * component into your patient registration flow.
 */

"use client"

import { useState } from 'react'
import { PostRegistrationModal } from './PostRegistrationModal'
import { toast } from 'sonner'

// Example: Integration in a patient registration form page
export default function PatientRegistrationExample() {
  const [showModal, setShowModal] = useState(false)
  const [registeredPatient, setRegisteredPatient] = useState<{
    id: string
    name: string
  } | null>(null)

  // Example: After successful patient registration
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePatientRegistration = async (formData: any) => {
    try {
      // Your existing patient registration logic
      const response = await fetch('/api/paciente', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        // Store patient info and show modal
        setRegisteredPatient({
          id: data.data.id,
          name: data.data.nome,
        })
        setShowModal(true)

        toast.success('Paciente cadastrado com sucesso!')
      }
    } catch (error) {
      console.error('Error registering patient:', error)
      toast.error('Erro ao cadastrar paciente')
    }
  }

  return (
    <div>
      {/* Your patient registration form here */}
      <form onSubmit={(e) => {
        e.preventDefault()
        // handlePatientRegistration(formData)
      }}>
        {/* Form fields... */}
      </form>

      {/* Post-Registration Modal */}
      {registeredPatient && (
        <PostRegistrationModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            // Optional: Navigate to patient dashboard
            // router.push('/dashboard/pacientes')
          }}
          patientId={registeredPatient.id}
          patientName={registeredPatient.name}
          onAssignSuccess={() => {
            // Optional: Refresh patient list or update UI
            console.log('Patient successfully assigned to research')
            // You can add additional logic here, like:
            // - Refreshing the patient list
            // - Navigating to the research page
            // - Showing additional success message
          }}
        />
      )}
    </div>
  )
}

/**
 * INTEGRATION STEPS:
 *
 * 1. Import the component:
 *    import { PostRegistrationModal } from '@/components/PostRegistrationModal'
 *
 * 2. Add state to control the modal:
 *    const [showModal, setShowModal] = useState(false)
 *    const [patientData, setPatientData] = useState({ id: '', name: '' })
 *
 * 3. After successful patient registration, show the modal:
 *    setPatientData({ id: newPatient.id, name: newPatient.nome })
 *    setShowModal(true)
 *
 * 4. Add the modal to your JSX:
 *    <PostRegistrationModal
 *      isOpen={showModal}
 *      onClose={() => setShowModal(false)}
 *      patientId={patientData.id}
 *      patientName={patientData.name}
 *      onAssignSuccess={() => {
 *        // Optional callback after successful assignment
 *      }}
 *    />
 *
 * FEATURES:
 * - Automatically fetches active research studies
 * - Shows success celebration animation
 * - Allows skipping research assignment
 * - Validates research and group selection
 * - Shows loading states during async operations
 * - Displays toast notifications for success/error
 * - Handles API errors gracefully
 * - Responsive design for mobile and desktop
 *
 * NOTES:
 * - The modal uses VigIA brand colors (#0A2647, #D4AF37)
 * - Toast notifications use 'sonner' library
 * - All UI components are from shadcn/ui
 * - Icons from lucide-react
 */
