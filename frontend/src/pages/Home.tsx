import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  DollarSign, FileText, Briefcase, ShoppingBag, 
  BookOpen, Crown, TrendingUp, Users, Award 
} from 'lucide-react'
import { useAuthStore } from '../store/auth'

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const quickActions = [
    {
      icon: DollarSign,
      title: 'Tekin Obunachi',
      description: 'Mablag\' yig\'ing va buyurtma bering',
      color: 'from-green-500 to-emerald-500',
      path: '/tekin'
    },
    {
      icon: FileText,
      title: 'Resume Yaratish',
      description: 'Professional rezyume yarating',
      color: 'from-blue-500 to-cyan-500',
      path: '/resume'
    },
    {
      icon: Briefcase,
      title: 'Ish Topish',
      description: 'Eng yaxshi ishlarni toping',
      color: 'from-purple-500 to-pink-500',
      path: '/jobs'
    },
    {
      icon: ShoppingBag,
      title: 'Bozor',
      description: 'Mahsulot sotish va sotib olish',
      color: 'from-orange-500 to-red-500',
      path: '/market'
    },
    {
      icon: BookOpen,
      title: 'Kitoblar',
      description: 'O\'qing va musobaqalarda qatnashing',
      color: 'from-indigo-500 to-purple-500',
      path: '/books'
    },
    {
      icon: Crown,
      title: 'Premium',
      description: 'Premium imkoniyatlardan foydalaning',
      color: 'from-yellow-500 to-amber-500',
      path: '/premium'
    },
  ]

  const stats = [
    { icon: TrendingUp, label: 'Umumiy balans', value: user?.balance || 0, suffix: 'so\'m' },
    { icon: Users, label: 'Foydalanuvchilar', value: '50K+', suffix: '' },
    { icon: Award, label: 'Faol ishlar', value: '1000+', suffix: '' },
  ]

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-6 text-white"
      >
        <h2 className="text-2xl font-bold mb-2">
          Salom, {user?.first_name || 'Foydalanuvchi'}! 👋
        </h2>
        <p className="text-purple-100">
          MEGABOT Mini App'ga xush kelibsiz
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <stat.icon className="w-6 h-6 text-purple-600 mb-2" />
            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
            <p className="text-lg font-bold text-gray-900">
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              {stat.suffix && <span className="text-xs text-gray-500 ml-1">{stat.suffix}</span>}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Tez harakatlar</h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(action.path)}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-left hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-3`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">{action.title}</h4>
              <p className="text-xs text-gray-500">{action.description}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Premium Banner */}
      {!user?.is_premium && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white cursor-pointer"
          onClick={() => navigate('/premium')}
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Premium obuna</h3>
              <p className="text-yellow-100 text-sm mb-3">
                Barcha imkoniyatlardan cheksiz foydalaning
              </p>
              <button className="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold text-sm">
                Batafsil →
              </button>
            </div>
            <Crown className="w-12 h-12 text-yellow-200" />
          </div>
        </motion.div>
      )}
    </div>
  )
}