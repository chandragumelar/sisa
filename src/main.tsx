import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/app/tokens.css'
import '@/app/global.css'
import { ClockProvider } from '@/app/providers/ClockProvider'
import { App } from '@/app/App'
import { initVTGuard } from '@/shared/utils/navigation.utils'

async function init() {
  initVTGuard()

  if (import.meta.env.VITE_DEMO === '1') {
    const { bootstrapDemo } = await import('@/features/demo/bootstrap')
    await bootstrapDemo()
  }

  const rootElement = document.getElementById('root')
  if (!rootElement) throw new Error('Root element not found')

  createRoot(rootElement).render(
    <StrictMode>
      <ClockProvider>
        <App />
      </ClockProvider>
    </StrictMode>,
  )
}

void init()
