import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Crown, Check, Zap, Shield, Star } from 'lucide-react'
import { api } from '../api/client'
import { useAuthStore } from '../store/auth'

export default function Premium() {
  const { user } = useAuthStore()
  const [plans, setPlans] = useState<any[]>([])

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await api.get('/premium/plans')
      setPlans(response.data.plans || [])
    } catch (error) {
      console.error('Error fetching plans:', error)
    }
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'standard': return Star
      case 'pro': return Zap
      case 'vip': return Crown
      default: return Check
    }
  }

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'standard': return 'from-blue-500 to-cyan-500'
      case 'pro': return 'from-purple-500 to-pink-500'
      case 'vip': return 'from-yellow-500 to-amber-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <div className="p-4 space-y-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center gap-3 mb-3">
          <Crown className="w-10 h-10" />
          <div>
            <h2 className="text-2xl font-bold">Premium Obuna</h2>
            <p className="text-yellow-100 text-sm">Barcha imkoniyatlardan foydalaning</p>
          </div>
        </div>
      </motion.div>

      {/* Current Status */}
      {user?.is_premium ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-50 border-2 border-green-200 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 text-green-700">
            <Shield className="w-5 h-5" />
            <span className="font-semibold">Sizda Premium obuna faol</span>
          </div>
          <p className="text-sm text-green-600 mt-1">
            Amal qilish muddati: {user.premium_until}
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4"
        >
          <p className="text-blue-700 font-medium">
            Premium obuna sotib oling va barcha imkoniyatlardan foydalaning!
          </p>
        </motion.div>
      )}

      {/* Plans */}
      <div className="space-y-4">
        {plans.map((plan, index) => {
          const Icon = getPlanIcon(plan.id)
          const colorClass = getPlanColor(plan.id)
          
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden"
            >
              <div className={`bg-gradient-to-r ${colorClass} p-4 text-white`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-6 h-6" />
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                  </div>
                  {plan.id === 'vip' && (
                    <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">
                      MASHHUR
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{plan.price?.toLocaleString()}</span>
                  <span className="text-white/80">so'm</span>
                  <span className="text-sm text-white/80">/ {plan.duration_days} kun</span>
                </div>
              </div>

              <div className="p-4">
                <ul className="space-y-3 mb-4">
                  {plan.features?.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-3 bg-gradient-to-r ${colorClass} text-white rounded-xl font-semibold hover:opacity-90 transition-opacity`}>
                  Sotib Olish
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Premium Afzalliklari</h3>
        <div className="grid gap-3">
          {[
            { icon: Zap, text: 'Cheksiz rezyume yaratish' },
            { icon: Shield, text: 'Prioritet yordam' },
            { icon: Star, text: 'Premium belgisi' },
            { icon: Crown, text: 'Maxsus imtiyozlar' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <item.icon className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-gray-700">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}