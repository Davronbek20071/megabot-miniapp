import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, FileText, Package, DollarSign, TrendingUp, Settings } from 'lucide-react'
import { api } from '../api/client'

export default function Admin() {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats?user_id=1')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching admin stats:', error)
    }
  }

  const statCards = [
    { icon: Users, label: 'Foydalanuvchilar', value: stats?.total_users || 0, color: 'from-blue-500 to-cyan-500' },
    { icon: FileText, label: 'Rezyumeler', value: stats?.total_resumes || 0, color: 'from-green-500 to-emerald-500' },
    { icon: Package, label: 'Mahsulotlar', value: stats?.active_products || 0, color: 'from-orange-500 to-red-500' },
    { icon: DollarSign, label: 'Premium', value: stats?.premium_users || 0, color: 'from-yellow-500 to-amber-500' },
  ]

  return (
    <div className="p-4 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Admin Panel</h2>
        </div>
        <p className="text-gray-300">Bot statistikasi va sozlamalar</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-br ${card.color} rounded-xl p-4 text-white`}
          >
            <card.icon className="w-8 h-8 mb-2 opacity-80" />
            <p className="text-sm opacity-90 mb-1">{card.label}</p>
            <p className="text-2xl font-bold">{card.value.toLocaleString()}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-900">Tez amallar</h3>
        
        {[
          { icon: Users, label: 'Foydalanuvchilarni boshqarish', color: 'text-blue-600 bg-blue-50' },
          { icon: DollarSign, label: 'To\'lovlarni tasdiqlash', color: 'text-green-600 bg-green-50' },
          { icon: Package, label: 'Mahsulotlarni ko\'rish', color: 'text-orange-600 bg-orange-50' },
          { icon: TrendingUp, label: 'Statistika', color: 'text-purple-600 bg-purple-50' },
        ].map((action, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-left hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${action.color}`}>
                <action.icon className="w-6 h-6" />
              </div>
              <span className="font-semibold text-gray-900">{action.label}</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-3">So'nggi faoliyat</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Yangi foydalanuvchi ro'yxatdan o'tdi</span>
            <span className="ml-auto text-gray-400">2 daqiqa oldin</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Yangi ish e'loni qo'shildi</span>
            <span className="ml-auto text-gray-400">15 daqiqa oldin</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-gray-600">Mahsulot sotildi</span>
            <span className="ml-auto text-gray-400">1 soat oldin</span>
          </div>
        </div>
      </div>
    </div>
  )
}