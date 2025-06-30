import { useEffect, useCallback, useState } from 'react'

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  cmd?: boolean
  alt?: boolean
  shift?: boolean
  description: string
  action: () => void
}

const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
  const [showHelp, setShowHelp] = useState(false)

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    // Check for help shortcut (?)
    if (event.key === '?' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault()
      setShowHelp(prev => !prev)
      return
    }

    // Check for Escape to close help
    if (event.key === 'Escape' && showHelp) {
      event.preventDefault()
      setShowHelp(false)
      return
    }

    // Check all registered shortcuts
    for (const shortcut of shortcuts) {
      const ctrlOrCmd = isMac ? event.metaKey : event.ctrlKey
      
      if (
        event.key.toLowerCase() === shortcut.key.toLowerCase() &&
        ((shortcut.ctrl || shortcut.cmd) ? ctrlOrCmd : !ctrlOrCmd) &&
        (shortcut.alt ? event.altKey : !event.altKey) &&
        (shortcut.shift ? event.shiftKey : !event.shiftKey)
      ) {
        event.preventDefault()
        shortcut.action()
        break
      }
    }
  }, [shortcuts, enabled, showHelp])

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, enabled])

  const getShortcutDisplay = (shortcut: KeyboardShortcut) => {
    const keys: string[] = []
    
    if (shortcut.ctrl || shortcut.cmd) {
      keys.push(isMac ? '⌘' : 'Ctrl')
    }
    if (shortcut.alt) {
      keys.push(isMac ? '⌥' : 'Alt')
    }
    if (shortcut.shift) {
      keys.push('⇧')
    }
    keys.push(shortcut.key.toUpperCase())
    
    return keys.join(' + ')
  }

  return {
    showHelp,
    setShowHelp,
    getShortcutDisplay,
    shortcuts: [
      ...shortcuts,
      {
        key: '?',
        description: 'Show keyboard shortcuts',
        action: () => setShowHelp(prev => !prev)
      }
    ]
  }
}

// Global shortcuts registry
export const globalShortcuts: KeyboardShortcut[] = [
  {
    key: 'k',
    cmd: true,
    ctrl: true,
    description: 'Open command palette',
    action: () => {
      // This will be implemented by the component using it
      const event = new CustomEvent('openCommandPalette')
      window.dispatchEvent(event)
    }
  },
  {
    key: 's',
    cmd: true,
    ctrl: true,
    description: 'Save current form',
    action: () => {
      const event = new CustomEvent('saveCurrentForm')
      window.dispatchEvent(event)
    }
  },
  {
    key: 'Escape',
    description: 'Close modal/dialog',
    action: () => {
      const event = new CustomEvent('closeModal')
      window.dispatchEvent(event)
    }
  }
]