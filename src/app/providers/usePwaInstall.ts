import { useContext } from 'react'
import { PwaInstallContext } from './PwaInstallContext'

export function usePwaInstall() {
  return useContext(PwaInstallContext)
}
