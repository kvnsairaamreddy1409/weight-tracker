import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import WeightLossTracker from './weight_loss_tracker.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div style={{ height: '80vh', width: '100vw', padding:'0px', position:'absolute', top:0 }}>
      <WeightLossTracker />
    </div>
  </StrictMode>,
)
