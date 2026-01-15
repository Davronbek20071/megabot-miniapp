import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, MapPin, DollarSign, Clock, Search } from 'lucide-react'
import { api } from '../api/client'

export default function Jobs() {
  const [jobs, setJobs] = useState<any[]>([])
  const [jobType, setJobType] = useState<'monthly' | 'daily'>('monthly')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    fetchJobs()
  }, [jobType, selectedCategory])

  const fetchJobs = async () => {
    try {
      const endpoint = jobType === 'daily' ? '/jobs/daily' : '/jobs/list'
      const params = new URLSearchParams()
      if (selectedCategory) params.append('category', selectedCategory)
      params.append('job_type', jobType)
      
      const response = await api.get(`${endpoint}?${params}`)
      setJobs(response.data.jobs || [])
    } catch (error) {
      console.error('Error fetching jobs:', error)
    }
  }

  const categories = [
    'IT va Dasturlash',
    'Marketing va Reklama',
    'Savdo va Biznes',
    'Ta\'lim',
    'Sog\'liqni saqlash',
    'Qurilish',
    'Transport',
    'Boshqa'
  ]

  const filteredJobs = jobs.filter(job =>
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-4 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white"
      >
        <h2 className="text-2xl font-bold mb-2">Ish Topish</h2>
        <p className="text-purple-100">Eng yaxshi ishlarni toping</p>
      </motion.div>

      {/* Job Type Toggle */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setJobType('monthly')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            jobType === 'monthly'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600'
          }`}
        >
          📅 Oylik ishlar
        </button>
        <button
          onClick={() => setJobType('daily')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            jobType === 'daily'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600'
          }`}
        >
          ⚡ Kunlik ishlar
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Ish nomi yoki kompaniya..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hidden pb-2">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            selectedCategory === ''
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          Barchasi
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedCategory === category
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Job List */}
      <div className="space-y-3">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Hozircha ish topilmadi</p>
          </div>
        ) : (
          filteredJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                  <Briefcase className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{job.title}</h3>
                  {job.company && (
                    <p className="text-sm text-gray-600 mb-2">{job.company}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    {job.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </span>
                    )}
                    {(job.salary_min || job.salary) && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {job.salary || `${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()}`} so'm
                      </span>
                    )}
                    {job.work_date && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {job.work_date}
                      </span>
                    )}
                  </div>
                  
                  <button className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
                    Ariza Yuborish
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