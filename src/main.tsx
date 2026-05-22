import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/app/tokens.css'
import '@/app/global.css'
import { ClockProvider } from '@/app/providers/ClockProvider'
import { App } from '@/app/App'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

createRoot(rootElement).render(
  <StrictMode>
    <ClockProvider>
      <App />
    </ClockProvider>
  </StrictMode>,
)
