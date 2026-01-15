import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Wallet, Gift, Users, TrendingUp, CheckCircle,
  Eye, Heart, Calendar, Award, Activity
} from 'lucide-react'
import { api } from '../api/client'
import { useAuthStore } from '../store/auth'

export default function TekinObunachi() {
  const { user } = useAuthStore()
  const [balance, setBalance] = useState(0)
  const [stats, setStats] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'earn' | 'orders' | 'stats'>('earn')

  useEffect(() => {
    fetchBalance()
    fetchStats()
  }, [])

  const fetchBalance = async () => {
    try {
      const response = await api.get(`/tekin/balance?user_id=${user?.id}`)
      setBalance(response.data.balance)
    } catch (error) {
      console.error('Error fetching balance:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get(`/tekin/stats?user_id=${user?.id}`)
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const claimDailyBonus = async () => {
    try {
      const response = await api.post(`/tekin/daily-bonus?user_id=${user?.id}`)
      if (response.data.success) {
        alert(`✅ ${response.data.amount} so'm kunlik bonus olindi!`)
        fetchBalance()
      } else {
        alert('⚠️ Bugun bonus allaqachon olingan')
      }
    } catch (error: any) {
      alert('❌ Xatolik: ' + (error.response?.data?.detail || 'Unknown error'))
    }
  }

  const earningMethods = [
    {
      icon: Gift,
      title: 'Kunlik bonus',
      description: 'Har kuni bonus oling',
      reward: '500-1000 so\'m',
      action: claimDailyBonus
    },
    {
      icon: Users,
      title: 'Obuna bo\'lish',
      description: 'Kanallarga obuna bo\'ling',
      reward: '50-200 so\'m'
    },
    {
      icon: CheckCircle,
      title: 'Shartlar bajarish',
      description: 'Admin topshiriqlarini bajaring',
      reward: '100-500 so\'m'
    },
    {
      icon: TrendingUp,
      title: 'Referral',
      description: 'Do\'stlarni taklif qiling',
      reward: '1000 so\'m/kishi'
    },
  ]

  const orderTypes = [
    {
      icon: Users,
      title: 'Obunachi',
      description: 'Kanalingizga obunachi qo\'shing',
      price: '50 so\'m/kishi'
    },
    {
      icon: Heart,
      title: 'Reaksiya',
      description: 'Postingizga reaksiya',
      price: '30 so\'m/reaksiya'
    },
    {
      icon: Eye,
      title: 'Ko\'rishlar',
      description: 'Postingizga ko\'rishlar',
      price: '20 so\'m/ko\'rish'
    },
  ]

  return (
    <div className="p-4 space-y-6">
      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-green-100 text-sm mb-1">Tekin Obunachi Balansi</p>
            <h2 className="text-3xl font-bold">{balance.toLocaleString()} so'm</h2>
          </div>
          <Wallet className="w-12 h-12 text-green-200" />
        </div>
        
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-white/20 rounded-lg p-3">
            <p className="text-xs text-green-100 mb-1">Ishlab topilgan</p>
            <p className="text-lg font-bold">{stats?.total_earned || 0}</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <p className="text-xs text-green-100 mb-1">Sarflangan</p>
            <p className="text-lg font-bold">{stats?.total_spent || 0}</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <p className="text-xs text-green-100 mb-1">Yechilgan</p>
            <p className="text-lg font-bold">{stats?.total_withdrawn || 0}</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('earn')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'earn'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600'
          }`}
        >
          💰 Mablag' yig'ish
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'orders'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600'
          }`}
        >
          📦 Buyurtmalar
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'stats'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600'
          }`}
        >
          📊 Statistika
        </button>
      </div>

      {/* Earning Methods */}
      {activeTab === 'earn' && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-900">Pul ishlash usullari</h3>
          {earningMethods.map((method, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={method.action}
              className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-left hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                  <method.icon className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{method.title}</h4>
                  <p className="text-sm text-gray-500 mb-2">{method.description}</p>
                  <span className="inline-block bg-green-50 text-green-700 text-xs font-medium px-2 py-1 rounded">
                    +{method.reward}
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Order Types */}
      {activeTab === 'orders' && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-900">Buyurtma berish</h3>
          {orderTypes.map((type, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-left hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                  <type.icon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{type.title}</h4>
                  <p className="text-sm text-gray-500 mb-2">{type.description}</p>
                  <span className="inline-block bg-purple-50 text-purple-700 text-xs font-medium px-2 py-1 rounded">
                    {type.price}
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Statistics */}
      {activeTab === 'stats' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Statistika</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <Calendar className="w-6 h-6 text-blue-600 mb-2" />
              <p className="text-sm text-gray-600 mb-1">Kunlik daromad</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.daily_earnings || 0} <span className="text-sm text-gray-500">so'm</span>
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <Award className="w-6 h-6 text-yellow-600 mb-2" />
              <p className="text-sm text-gray-600 mb-1">Yutuqlar</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.achievements_count || 0}
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <Activity className="w-6 h-6 text-green-600 mb-2" />
              <p className="text-sm text-gray-600 mb-1">Faol buyurtmalar</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.active_orders || 0}
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <TrendingUp className="w-6 h-6 text-purple-600 mb-2" />
              <p className="text-sm text-gray-600 mb-1">Umumiy daromad</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.total_earned || 0} <span className="text-sm text-gray-500">so'm</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}