import { Outlet } from 'react-router-dom'
import Navigation from './Navigation'
import TopBar from './TopBar'

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <TopBar />
      <main className="pt-16">
        <Outlet />
      </main>
      <Navigation />
    </div>
  )
}