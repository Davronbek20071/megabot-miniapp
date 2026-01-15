import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { retrieveLaunchParams } from '@telegram-apps/sdk'
import Layout from './components/Layout'
import Home from './pages/Home'
import TekinObunachi from './pages/TekinObunachi'
import Resume from './pages/Resume'
import Jobs from './pages/Jobs'
import Marketplace from './pages/Marketplace'
import Books from './pages/Books'
import Premium from './pages/Premium'
import Admin from './pages/Admin'
import { useAuthStore } from './store/auth'

function App() {
  const { initAuth } = useAuthStore()

  useEffect(() => {
    // Initialize Telegram WebApp
    try {
      const { initDataRaw } = retrieveLaunchParams()
      if (initDataRaw && typeof initDataRaw === 'string') {
        initAuth(initDataRaw)
      } else {
        // For development/testing without Telegram
        console.warn('No Telegram initData found')
      }
    } catch (error) {
      console.error('Telegram WebApp initialization error:', error)
    }
  }, [initAuth])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="tekin" element={<TekinObunachi />} />
          <Route path="resume" element={<Resume />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="market" element={<Marketplace />} />
          <Route path="books" element={<Books />} />
          <Route path="premium" element={<Premium />} />
          <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App