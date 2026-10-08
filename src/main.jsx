import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { InventoryProvider } from './context/InventoryContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <InventoryProvider> {/* 2. Wrap your App so every component can access the live queue */}
      <App />
    </InventoryProvider>
  </React.StrictMode>,
)

