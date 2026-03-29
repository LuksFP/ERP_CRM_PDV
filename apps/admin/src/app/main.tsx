import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppProviders } from './providers'
import '@/styles/globals.css'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element not found')

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <AppProviders />
  </React.StrictMode>
)
