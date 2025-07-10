import { type JSX } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getMockTokenData } from '../utils/mockTokens'

interface Step {
  number: number
  icon: JSX.Element
  title: string
  description: string
}

export function HowItWorksStepper() {
  const { isAuthenticated } = useAuth()
  const tokenData = getMockTokenData()
  
  // Determine current step
  const getCurrentStep = () => {
    if (!isAuthenticated) return 1
    if (tokenData.balance === 0) return 2
    if (tokenData.balance < 1000) return 3 // Less than Bronze tier
    return 4
  }
  
  const currentStep = getCurrentStep()
  
  const steps: Step[] = [
    {
      number: 1,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Connect Wallet",
      description: "Link your Phantom in one click."
    },
    {
      number: 2,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      title: "Interact With Our Models",
      description: "Start using our AI features to earn tokens."
    },
    {
      number: 3,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Earn Tokens",
      description: "Watch your balance grow."
    },
    {
      number: 4,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      title: "Redeem Rewards",
      description: "Unlock perks at each tier."
    }
  ]
  
  const getStepState = (stepNumber: number) => {
    if (stepNumber < currentStep) return 'completed'
    if (stepNumber === currentStep) return 'current'
    return 'future'
  }
  
  const getStepStyles = (state: string) => {
    switch (state) {
      case 'completed':
        return {
          circle: 'bg-accent text-white',
          icon: 'text-white',
          text: 'text-text-primary',
          connector: 'bg-accent'
        }
      case 'current':
        return {
          circle: 'bg-accent text-white ring-4 ring-accent/30 animate-pulse',
          icon: 'text-white',
          text: 'text-text-primary',
          connector: 'bg-border'
        }
      default:
        return {
          circle: 'bg-surface text-text-muted',
          icon: 'text-text-muted',
          text: 'text-text-muted',
          connector: 'bg-border'
        }
    }
  }
  
  return (
    <div className="w-full py-8">
      <h3 className="text-2xl font-bold text-center mb-8">How It Works</h3>
      
      <div className="relative">
        {/* Desktop Layout */}
        <div className="hidden md:block max-w-4xl mx-auto">
          <div className="flex items-center justify-between relative">
            {/* Background connector line */}
            <div className="absolute top-12 left-12 right-12 h-0.5 bg-border" />
            
            {steps.map((step) => {
              const state = getStepState(step.number)
              const styles = getStepStyles(state)
              
              return (
                <div key={step.number} className="relative flex flex-col items-center z-10">
                  {/* Circle */}
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${styles.circle}`}>
                    {state === 'completed' ? (
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <div className={styles.icon}>
                        {step.icon}
                      </div>
                    )}
                  </div>
                  
                  {/* Text */}
                  <div className="mt-4 text-center max-w-[150px] h-20 flex flex-col justify-start">
                    <h4 className={`font-semibold mb-2 ${styles.text} leading-tight`}>
                      {step.title}
                    </h4>
                    <p className={`text-sm ${styles.text} opacity-75 leading-tight`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Mobile Layout */}
        <div className="md:hidden space-y-4">
          {steps.map((step) => {
            const state = getStepState(step.number)
            const styles = getStepStyles(state)
            
            return (
              <div key={step.number} className="flex items-center gap-4">
                {/* Circle */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${styles.circle}`}>
                  {state === 'completed' ? (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <div className={`${styles.icon} scale-75`}>
                      {step.icon}
                    </div>
                  )}
                </div>
                
                {/* Text */}
                <div className="flex-1">
                  <h4 className={`font-semibold ${styles.text}`}>
                    {step.title}
                  </h4>
                  <p className={`text-sm ${styles.text} opacity-75`}>
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}