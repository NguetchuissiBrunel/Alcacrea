import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { FilterMetadataProvider } from './contexts/FilterMetadataContext'
import { I18nProvider } from './contexts/I18nContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './components/ui/Toast'
import App from './App'
import { setupOpenApi } from './lib/setupOpenApi'
import './index.css'

setupOpenApi()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <FilterMetadataProvider>
          <ThemeProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </ThemeProvider>
        </FilterMetadataProvider>
      </I18nProvider>
    </BrowserRouter>
  </StrictMode>,
)
