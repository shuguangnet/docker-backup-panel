import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'
import App from './App'
import { AuthProvider } from './lib/auth'
import './index.css'

// 设置axios默认URL
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)