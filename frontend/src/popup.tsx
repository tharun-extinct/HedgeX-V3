import React from 'react'
import ReactDOM from 'react-dom/client'
import { PopupMenu } from '@/components/extension/PopupMenu'
import '@/index.css'
import '@/styles/popup.css'

ReactDOM.createRoot(document.getElementById('popup-root')!).render(
  <React.StrictMode>
    <PopupMenu />
  </React.StrictMode>,
)
