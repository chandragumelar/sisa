import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { getSettings } from '@/db/settings.repository'
import { applyTheme } from '@/shared/utils/theme'
import { UpdateBanner } from './UpdateBanner'

export function App() {
  useEffect(() => {
    getSettings().then((s) => {
      if (s) applyTheme(s.theme)
    })
  }, [])

  return (
    <>
      <RouterProvider router={router} />
      <UpdateBanner />
    </>
  )
}
