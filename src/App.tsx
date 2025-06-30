import React, { useEffect } from 'react'
import { AppProvider, useApp } from './contexts/AppContext'
import { FormProvider } from './contexts/FormContext'
import { MusicPlayerProvider } from './contexts/MusicPlayerContext'
import { Desktop } from './screens/Desktop'
import { AppDashboard } from './screens/App'
import { OnboardingGuard } from './components/onboarding'
import { ToastContainer } from './components/ui/toast'
import { useToast, setGlobalToast } from './hooks/useToast'
import { ErrorBoundary } from './components/ErrorBoundary'

const AppContent: React.FC = () => {
  const { appMode, loading } = useApp()
  const toastInstance = useToast()
  
  useEffect(() => {
    setGlobalToast(toastInstance)
  }, [toastInstance])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-4 bg-[url(/SigmaLogo.svg)] bg-contain bg-no-repeat bg-center filter drop-shadow-lg mb-4 mx-auto" />
          <p className="font-['Space_Mono'] text-[#6ad040] text-sm animate-pulse">
            Initializing Sigma...
          </p>
        </div>
      </div>
    )
  }

  return (
    // ONBOARDING DISABLED - Comment out OnboardingGuard to skip onboarding
    // <OnboardingGuard>
      <>
        {appMode.isAppMode ? <AppDashboard /> : <Desktop />}
        <ToastContainer 
          toasts={toastInstance.toasts.map(toast => ({
            ...toast,
            onClose: toastInstance.removeToast
          }))} 
          onClose={toastInstance.removeToast} 
        />
      </>
    // </OnboardingGuard>
  )
}

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <FormProvider>
          <MusicPlayerProvider>
            <AppContent />
          </MusicPlayerProvider>
        </FormProvider>
      </AppProvider>
    </ErrorBoundary>
  )
}