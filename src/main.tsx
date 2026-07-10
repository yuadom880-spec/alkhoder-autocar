import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'
import { recoverFromStaleAssets, registerPwaServiceWorker } from './lib/pwa'
import './index.css'
import App from './App.tsx'

recoverFromStaleAssets()
registerPwaServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)