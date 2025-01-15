import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import Index from './pages/Index.tsx'
import { HashRouter, Outlet, Route, Routes } from 'react-router'
import { HeaderBanner } from './HeaderBanner.tsx'
import { Layout } from './Layout.tsx'
import { Profile } from './pages/Profile.tsx'
import { Preferences } from './pages/Preferences.tsx'
import { SharePreferences } from './pages/SharePreferences.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route element={<Layout/>}>
          <Route index element={<Index />} />
          <Route path="/profile" element={<Profile/>} />
          <Route path="/preferences" element={<Preferences/>} />
          <Route path="/preferences/share" element={<SharePreferences/>} />
        </Route>
      </Routes>
    </HashRouter>
  </StrictMode>,
)
