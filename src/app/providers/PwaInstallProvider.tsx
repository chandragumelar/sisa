import { useState, useEffect, type ReactNode } from 'react'
import { PwaInstallContext, type BeforeInstallPromptEvent } from './PwaInstallContext'

interface Props {
  children: ReactNode
}

export function PwaInstallProvider({ children }: Props) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  function clearPrompt() {
    setDeferredPrompt(null)
  }

  return (
    <PwaInstallContext.Provider value={{ deferredPrompt, clearPrompt }}>
      {children}
    </PwaInstallContext.Provider>
  )
}
