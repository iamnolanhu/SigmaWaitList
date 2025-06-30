import React from 'react'
import { X } from 'lucide-react'
import { KeyboardShortcut } from '../../hooks/useKeyboardShortcuts'
import { cn } from '../../lib/utils'

interface KeyboardShortcutsHelpProps {
  shortcuts: KeyboardShortcut[]
  isOpen: boolean
  onClose: () => void
  getShortcutDisplay: (shortcut: KeyboardShortcut) => string
}

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  shortcuts,
  isOpen,
  onClose,
  getShortcutDisplay
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-black/90 border-2 border-[#6ad040] rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-['Orbitron'] font-bold text-[#6ad040] text-xl">
            KEYBOARD SHORTCUTS
          </h2>
          <button
            onClick={onClose}
            className="text-[#6ad040] hover:text-[#79e74c] transition-colors p-1"
            aria-label="Close shortcuts help"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b border-[#6ad040]/20 last:border-0"
            >
              <span className="font-['Space_Mono'] text-[#b7ffab] text-sm">
                {shortcut.description}
              </span>
              <kbd className="bg-[#6ad040]/20 border border-[#6ad040]/40 rounded px-2 py-1 font-['Space_Mono'] text-[#6ad040] text-xs">
                {getShortcutDisplay(shortcut)}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-[#6ad040]/20">
          <p className="font-['Space_Mono'] text-[#b7ffab]/60 text-xs text-center">
            Press <kbd className="bg-[#6ad040]/20 border border-[#6ad040]/40 rounded px-2 py-0.5 mx-1">?</kbd> to toggle this help
          </p>
        </div>
      </div>
    </div>
  )
}

// Visual hint component for displaying shortcuts in UI
interface ShortcutHintProps {
  shortcut: string
  className?: string
}

export const ShortcutHint: React.FC<ShortcutHintProps> = ({ shortcut, className }) => {
  return (
    <kbd
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-['Space_Mono'] bg-black/30 border border-[#6ad040]/30 rounded text-[#6ad040]/70",
        className
      )}
    >
      {shortcut}
    </kbd>
  )
}