import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

type UiPreferencesContextValue = {
  reduceMotion: boolean
  setReduceMotion: (value: boolean) => void
}

const UiPreferencesContext = createContext<UiPreferencesContextValue | undefined>(undefined)

const STORAGE_KEY = 'cr_admin_reduce_motion'

const getStoredPreference = () => {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(STORAGE_KEY) === 'true'
}

export function UiPreferencesProvider({ children }: { children: ReactNode }) {
  const [reduceMotion, setReduceMotion] = useState(() => getStoredPreference())

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, String(reduceMotion))
  }, [reduceMotion])

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.dataset.motion = reduceMotion ? 'reduced' : 'full'
  }, [reduceMotion])

  const value = useMemo(
    () => ({
      reduceMotion,
      setReduceMotion,
    }),
    [reduceMotion],
  )

  return <UiPreferencesContext.Provider value={value}>{children}</UiPreferencesContext.Provider>
}

export function useUiPreferences() {
  const context = useContext(UiPreferencesContext)
  if (!context) {
    throw new Error('useUiPreferences must be used within a UiPreferencesProvider')
  }
  return context
}
