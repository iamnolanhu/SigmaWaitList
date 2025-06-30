import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle, RefreshCw, Bug } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development mode
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo)
    }
    
    this.setState({
      error,
      errorInfo
    })

    // You could also log to an error reporting service here
    // logErrorToService(error, errorInfo)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>
      }

      return (
        <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-black/50 backdrop-blur-md rounded-xl border-2 border-red-500/50 p-8">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <h1 className="font-['Orbitron'] font-bold text-red-500 text-xl">
                SYSTEM ERROR
              </h1>
            </div>

            <p className="font-['Space_Mono'] text-[#b7ffab] text-sm mb-4">
              An unexpected error occurred in the Matrix. The system has been notified.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6">
                <summary className="font-['Space_Mono'] text-[#6ad040] text-xs cursor-pointer hover:text-[#79e74c]">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 p-3 bg-black/50 rounded border border-[#6ad040]/30 font-['Space_Mono'] text-[#6ad040] text-xs overflow-x-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#6ad040] hover:bg-[#79e74c] text-black font-['Space_Grotesk'] font-bold rounded transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              
              <button
                onClick={() => window.open('https://github.com/anthropics/claude-code/issues', '_blank')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-black border-2 border-[#6ad040] hover:bg-[#6ad040]/10 text-[#6ad040] font-['Space_Grotesk'] font-bold rounded transition-colors"
              >
                <Bug className="w-4 h-4" />
                Report Issue
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  const resetError = () => setError(null)
  const captureError = (error: Error) => setError(error)

  return { resetError, captureError }
}