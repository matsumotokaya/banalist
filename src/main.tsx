import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './i18n' // Initialize i18n

// StrictMode removed to prevent duplicate executions and improve performance
// (causes 4-5x duplicate Supabase queries on mount)
createRoot(document.getElementById('root')!).render(
  <App />
)
