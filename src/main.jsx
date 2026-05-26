import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { DataProvider } from './context/DataContext.jsx'
import { GamificationProvider } from './context/GamificationContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <DataProvider>
        <GamificationProvider>
          <App />
        </GamificationProvider>
      </DataProvider>
    </AuthProvider>
  </StrictMode>
)
