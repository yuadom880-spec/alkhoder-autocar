import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'
import { CustomerAuthProvider } from './context/CustomerAuthContext'
import { LocaleProvider } from './context/LocaleContext'
import { ThemeProvider } from './context/ThemeContext'
import { recoverFromStaleAssets, registerPwaServiceWorker } from './lib/pwa'
import './index.css'
import App from './App.tsx'

recoverFromStaleAssets()
registerPwaServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <LocaleProvider>
        <AuthProvider>
          <CustomerAuthProvider>
            <App />
          </CustomerAuthProvider>
        </AuthProvider>
      </LocaleProvider>
    </ThemeProvider>
  </StrictMode>,
)