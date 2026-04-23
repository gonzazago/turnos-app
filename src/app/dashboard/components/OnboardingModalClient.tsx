'use client'

import React, { useState, use, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/Modal'
import { completeOnboarding } from '../onboarding/actions'
import { updateProfile } from '../settings/actions'
import { createEventType } from '../event-types/actions'

// Step Components
import { WelcomeStep } from './onboarding/WelcomeStep'
import { ProfileStep } from './onboarding/ProfileStep'
import { EventStep } from './onboarding/EventStep'
import { ShareStep } from './onboarding/ShareStep'

interface OnboardingModalClientProps {
  onboardingDataPromise: Promise<any>
}

export function OnboardingModalClient({ onboardingDataPromise }: OnboardingModalClientProps) {
  const data = use(onboardingDataPromise)
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const profileData = data?.profile
  const hasCompletedOnboarding = profileData?.has_completed_onboarding

  const [isOpen, setIsOpen] = useState(!hasCompletedOnboarding)
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [userSlug, setUserSlug] = useState(profileData?.slug || '')
  const [copied, setCopied] = useState(false)

  // Profile State
  const [profile, setProfile] = useState({
    fullName: profileData?.full_name || '',
    brandColor: profileData?.brand_color || '#3b82f6',
    logoUrl: profileData?.logo_url || '',
    fontFamily: profileData?.font_family || 'var(--font-geist-sans)'
  })

  // Event State
  const [event, setEvent] = useState({
    title: '',
    duration: '30',
    startTime: '09:00',
    endTime: '17:00'
  })

  // Availability State
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5])

  const handleSkip = async () => {
    setIsSubmitting(true)
    const result = await completeOnboarding()
    if (result && 'success' in result) {
      setIsOpen(false)
      router.push('/dashboard/settings')
    }
    setIsSubmitting(false)
  }

  const nextStep = () => setStep(s => s + 1)

  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  const handleFinish = async () => {
    setIsSubmitting(true)
    try {
      // 1. Update Profile
      const profileFormData = new FormData()
      profileFormData.append('fullName', profile.fullName || 'Tu Nombre')
      profileFormData.append('brandColor', profile.brandColor)
      profileFormData.append('slug', userSlug) 
      
      const profileResult = await updateProfile(profileFormData)
      if ('error' in profileResult) throw new Error(profileResult.error)

      if (profileResult.success && 'slug' in profileResult && profileResult.slug) {
        setUserSlug(profileResult.slug)
      }

      // 2. Create First Event Type
      const eventFormData = new FormData()
      eventFormData.append('title', event.title || 'Consulta Inicial')
      eventFormData.append('duration_mins', event.duration)
      
      const availability = selectedDays.map(day => ({
        day_of_week: day,
        start_time: event.startTime,
        end_time: event.endTime
      }))

      const eventResult = await createEventType(eventFormData, availability)
      if ('error' in eventResult) throw new Error(eventResult.error)

      // 3. Mark Onboarding as Complete
      const onboardingResult = await completeOnboarding()
      if ('error' in onboardingResult) throw new Error(onboardingResult.error)

      setStep(4)
      startTransition(() => {
        router.refresh()
      })
    } catch (error: any) {
      alert(error.message || 'Ocurrió un error al guardar tu configuración.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    router.push('/dashboard?tour=true')
  }

  const bookingUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${userSlug}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(bookingUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} 
      title={step === 1 ? "¡Bienvenido a turnos.app!" : "Configura tu cuenta"}
      size={step === 1 ? "lg" : "xl"}
    >
      <div className="space-y-6">
        <div className="flex justify-center items-center gap-1.5 md:gap-2 mb-4 md:mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${
                step === s ? 'w-6 md:w-8 bg-blue-600' : 'w-1.5 md:w-2 bg-slate-200'
              }`}
            />
          ))}
        </div>

        {step === 1 && <WelcomeStep onNext={nextStep} onSkip={handleSkip} />}
        
        {step === 2 && (
          <ProfileStep 
            profile={profile} 
            setProfile={setProfile} 
            userSlug={userSlug} 
            setUserSlug={setUserSlug} 
            onNext={nextStep} 
            onSkip={handleSkip} 
          />
        )}

        {step === 3 && (
          <EventStep 
            event={event} 
            setEvent={setEvent} 
            selectedDays={selectedDays} 
            toggleDay={toggleDay} 
            onFinish={handleFinish} 
            isSubmitting={isSubmitting} 
          />
        )}

        {step === 4 && (
          <ShareStep 
            bookingUrl={bookingUrl} 
            copied={copied} 
            onCopy={copyToClipboard} 
            onClose={handleClose} 
          />
        )}
      </div>
    </Modal>
  )
}
