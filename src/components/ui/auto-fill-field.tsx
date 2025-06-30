import React from 'react'
import { Sparkles } from 'lucide-react'
import { cn } from '../../lib/utils'

interface AutoFillFieldProps {
  isAutoFilled: boolean
  children: React.ReactNode
  className?: string
}

export const AutoFillField: React.FC<AutoFillFieldProps> = ({ 
  isAutoFilled, 
  children, 
  className 
}) => {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isAutoFilled && (
        <div className="absolute -top-2 -right-2 animate-bounce">
          <div className="bg-[#6ad040] rounded-full p-1">
            <Sparkles className="w-3 h-3 text-[#161616]" />
          </div>
        </div>
      )}
      {isAutoFilled && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full rounded-lg border-2 border-[#6ad040] animate-pulse" />
        </div>
      )}
    </div>
  )
}