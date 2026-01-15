import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Trophy, Clock, Users, Award } from 'lucide-react'
import { api } from '../api/client'

export default function Books() {
  const [competitions, setCompetitions] = useState<any[]>([])
  const [myCompetitions, setMyCompetitions] = useState<any[]>([])

  useEffect(() => {
    fetchCompetitions()
    fetchMyCompetitions()
  }, [])

  const fetchCompetitions = async () => {
    try {
      const response = await api.get('/books/competitions')
      setCompetitions(response.data.competitions || [])
    } catch (error) {
      console.error('Error fetching competitions:', error)
    }
  }

  const fetchMyCompetitions = async () => {
    try {
      const response = await api.get('/books/my-competitions?user_id=1')
      setMyCompetitions(response.data.competitions || [])
    } catch (error) {
      console.error('Error fetching my competitions:', error)
    }
  }

  return (
    <div className="p-4 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl p-6 text-white"
      >
        <h2 className="text-2xl font-bold mb-2">Kitoblar & Musobaqalar</h2>
        <p className="text-indigo-100">O'qing va musobaqalarda qatnashing</p>
      </motion.div>

      {/* My Competitions */}
      {myCompetitions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-900">Mening musobaqalarim</h3>
          {myCompetitions.map((comp, index) => (
            <motion.div
              key={comp.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                  <Trophy className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{comp.title}</h4>
                  <p className="text-sm text-gray-500 mb-2">{comp.book_title}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Ball: {comp.test_score || '0'}/{comp.total_questions || '0'}
                    </span>
                    <span className={`px-2 py-1 rounded ${
                      comp.status === 'active' ? 'bg-green-50 text-green-700' :
                      comp.status === 'upcoming' ? 'bg-blue-50 text-blue-700' :
                      'bg-gray-50 text-gray-700'
                    }`}>
                      {comp.status === 'active' ? 'Faol' :
                       comp.status === 'upcoming' ? 'Kutilmoqda' : 'Yakunlangan'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Available Competitions */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-900">Mavjud musobaqalar</h3>
        
        {competitions.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Hozircha musobaqa yo'q</p>
          </div>
        ) : (
          competitions.map((comp, index) => (
            <motion.div
              key={comp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-start gap-3">
                <div className="w-16 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center shrink-0">
                  <BookOpen className="w-8 h-8 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-1">{comp.book_title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{comp.book_author}</p>
                  
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(comp.start_date).toLocaleDateString('uz-UZ')} - {new Date(comp.end_date).toLocaleDateString('uz-UZ')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {comp.participants_count || 0} ishtirokchi
                    </span>
                  </div>

                  {comp.participation_fee > 0 && (
                    <p className="text-sm font-semibold text-indigo-600 mb-2">
                      Ishtirok narxi: {comp.participation_fee?.toLocaleString()} so'm
                    </p>
                  )}

                  <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                    Ishtirok Etish
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}