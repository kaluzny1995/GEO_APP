import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/css/bd-vite.css'
import './index.css'
import App from './App.jsx'
import { ROUTER_FUTURE_FLAGS } from './config.js'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={ROUTER_FUTURE_FLAGS}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
