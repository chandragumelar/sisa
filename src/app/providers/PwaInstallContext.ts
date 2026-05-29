import { createContext } from 'react'

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export interface PwaInstallContextValue {
  deferredPrompt: BeforeInstallPromptEvent | null
  clearPrompt: () => void
}

export const PwaInstallContext = createContext<PwaInstallContextValue>({
  deferredPrompt: null,
  clearPrompt: () => {},
})
