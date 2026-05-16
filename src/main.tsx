import { StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const container = document.getElementById('root')!

// 复用 root 实例，避免 HMR 时重复 createRoot 导致报错
type HotData = { root?: Root }
const hotData = (import.meta.hot?.data ?? {}) as HotData

const root = hotData.root ?? createRoot(container)
if (import.meta.hot) {
  import.meta.hot.data.root = root
}

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)
