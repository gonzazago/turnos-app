import { getOnboardingData } from './onboarding/actions'
import { OnboardingModalClient } from './components/OnboardingModalClient'

export async function OnboardingModal() {
  const onboardingDataPromise = getOnboardingData()
  
  return <OnboardingModalClient onboardingDataPromise={onboardingDataPromise} />
}
