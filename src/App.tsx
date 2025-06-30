<<<<<<< HEAD
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './contexts/AppContext'
import { Desktop } from './screens/Desktop'
import { AppDashboard } from './screens/App'
import { Login } from './screens/Login'

const AppContent: React.FC = () => {
  const { appMode, loading, user } = useApp()
=======
import React, { useEffect } from 'react'
import { AppProvider, useApp } from './contexts/AppContext'
import { Desktop } from './screens/Desktop'
import { AppDashboard } from './screens/App'
import { ToastContainer } from './components/ui/toast'
import { useToast, setGlobalToast } from './hooks/useToast'
import { ErrorBoundary } from './components/ErrorBoundary'

const AppContent: React.FC = () => {
  const { appMode, loading } = useApp()
  const toastInstance = useToast()
  
  useEffect(() => {
    setGlobalToast(toastInstance)
  }, [toastInstance])
>>>>>>> origin/dev

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
<<<<<<< HEAD
    <Router>
      <Routes>
        {/* Login Route */}
        <Route 
          path="/login" 
          element={
            user ? <Navigate to="/" replace /> : <Login />
          } 
        />
        
        {/* Main App Routes */}
        <Route 
          path="/*" 
          element={
            appMode.isAppMode ? <AppDashboard /> : <Desktop />
          } 
        />
      </Routes>
    </Router>
=======
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
>>>>>>> origin/dev
  )
}

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  )
}