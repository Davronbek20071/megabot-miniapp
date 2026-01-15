import { Wallet } from 'lucide-react'
import { useAuthStore } from '../store/auth'

export default function TopBar() {
  const { user } = useAuthStore()

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            M
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">MEGABOT</h1>
            <p className="text-xs text-gray-500">Mini App</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg">
          <Wallet className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-semibold text-purple-900">
            {user?.balance?.toLocaleString() || '0'} so'm
          </span>
        </div>
      </div>
    </div>
  )
}