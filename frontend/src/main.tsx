import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/react'
import './index.css'
import App from './App.tsx'

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const clerkAppearance = {
  layout: {
    socialButtonsPlacement: 'bottom',
    showOptionalFields: false,
  },
  variables: {
    colorPrimary: '#ff8367',
    colorText: '#f5f7ff',
    colorTextSecondary: '#a9bedf',
    colorBackground: '#0c1628',
    colorSurface: '#141f36',
    colorInputBackground: 'rgba(255, 255, 255, 0.03)',
    colorInputText: '#f5f7ff',
    colorDanger: '#ff6d88',
    colorSuccess: '#5de1a0',
    borderRadius: '16px',
    fontFamily: "'Inter', 'Manrope', 'Segoe UI', sans-serif",
  },
  elements: {
    card: 'auth-card--clerk-inner',
  }
} as const

if (!clerkPublishableKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in frontend/.env')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPublishableKey} appearance={clerkAppearance}>
      <App />
    </ClerkProvider>
  </StrictMode>,
)
