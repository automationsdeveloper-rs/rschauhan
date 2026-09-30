import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { LangProvider } from './i18n'
import { Analytics } from '@vercel/analytics/react'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LangProvider>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <App />
            {!/^(localhost|127\.0\.0\.1)$/.test(window.location.hostname) && <Analytics />}
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
      </LangProvider>
    </BrowserRouter>
  </React.StrictMode>
)
