import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Plus, Download, Trash2 } from 'lucide-react'
import { api } from '../api/client'
import { useAuthStore } from '../store/auth'

export default function Resume() {
  const { user } = useAuthStore()
  const [resumes, setResumes] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    date_of_birth: '',
    address: '',
    objective: '',
    education: '',
    experience: '',
    skills: '',
    languages: '',
    additional: '',
    template: 'classic'
  })

  useEffect(() => {
    fetchResumes()
  }, [])

  const fetchResumes = async () => {
    try {
      const response = await api.get(`/resume/list?user_id=${user?.id}`)
      setResumes(response.data.resumes || [])
    } catch (error) {
      console.error('Error fetching resumes:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await api.post(`/resume/create?user_id=${user?.id}`, formData)
      if (response.data.success) {
        alert('✅ Rezyume muvaffaqiyatli yaratildi!')
        setShowForm(false)
        fetchResumes()
        // Reset form
        setFormData({
          full_name: '',
          phone: '',
          email: '',
          date_of_birth: '',
          address: '',
          objective: '',
          education: '',
          experience: '',
          skills: '',
          languages: '',
          additional: '',
          template: 'classic'
        })
      }
    } catch (error: any) {
      alert('❌ Xatolik: ' + (error.response?.data?.detail || 'Unknown error'))
    }
  }

  const deleteResume = async (resumeId: number) => {
    if (!confirm('Rezyumeni o\'chirmoqchimisiz?')) return
    
    try {
      await api.delete(`/resume/${resumeId}?user_id=${user?.id}`)
      alert('✅ Rezyume o\'chirildi')
      fetchResumes()
    } catch (error) {
      alert('❌ Xatolik yuz berdi')
    }
  }

  if (showForm) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Yangi Rezyume</h2>
          <button
            onClick={() => setShowForm(false)}
            className="text-gray-600 hover:text-gray-900"
          >
            Bekor qilish
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To'liq ism *
            </label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              className="input-field"
              placeholder="Ism Familiya"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefon *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="input-field"
              placeholder="+998 90 123 45 67"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="input-field"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maqsad
            </label>
            <textarea
              value={formData.objective}
              onChange={(e) => setFormData({...formData, objective: e.target.value})}
              className="input-field"
              rows={3}
              placeholder="Sizning career maqsadingiz..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ta'lim
            </label>
            <textarea
              value={formData.education}
              onChange={(e) => setFormData({...formData, education: e.target.value})}
              className="input-field"
              rows={3}
              placeholder="Universitet, mutaxassislik..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ish tajribasi
            </label>
            <textarea
              value={formData.experience}
              onChange={(e) => setFormData({...formData, experience: e.target.value})}
              className="input-field"
              rows={4}
              placeholder="Kompaniya, lavozim, davri..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ko'nikmalar
            </label>
            <textarea
              value={formData.skills}
              onChange={(e) => setFormData({...formData, skills: e.target.value})}
              className="input-field"
              rows={3}
              placeholder="Python, React, SQL..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tillar
            </label>
            <textarea
              value={formData.languages}
              onChange={(e) => setFormData({...formData, languages: e.target.value})}
              className="input-field"
              rows={2}
              placeholder="O'zbek (Ona tili), Ingliz (B2)..."
            />
          </div>

          <button
            type="submit"
            className="w-full btn-primary"
          >
            Saqlash
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white"
      >
        <h2 className="text-2xl font-bold mb-2">Resume Builder</h2>
        <p className="text-blue-100">Professional rezyume yarating</p>
      </motion.div>

      <button
        onClick={() => setShowForm(true)}
        className="w-full bg-white rounded-xl p-4 shadow-sm border-2 border-dashed border-purple-300 hover:border-purple-500 hover:bg-purple-50 transition-colors"
      >
        <div className="flex items-center justify-center gap-2 text-purple-600">
          <Plus className="w-5 h-5" />
          <span className="font-semibold">Yangi Rezyume Yaratish</span>
        </div>
      </button>

      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-900">Mening rezyumelarim ({resumes.length})</h3>
        
        {resumes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Hali rezyume yo'q</p>
          </div>
        ) : (
          resumes.map((resume, index) => (
            <motion.div
              key={resume.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {resume.full_name || 'Nomsiz Rezyume'}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {new Date(resume.created_at).toLocaleDateString('uz-UZ')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Download className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => deleteResume(resume.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
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