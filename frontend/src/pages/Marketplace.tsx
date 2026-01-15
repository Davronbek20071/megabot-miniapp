import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Package, Search, Plus } from 'lucide-react'
import { api } from '../api/client'

export default function Marketplace() {
  const [products, setProducts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory])

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedCategory) params.append('category', selectedCategory)
      
      const response = await api.get(`/market/products?${params}`)
      setProducts(response.data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const categories = [
    'Elektronika',
    'Kiyim-kechak',
    'Uy-ro\'zg\'or',
    'Kitoblar',
    'Sport va Faoliyat',
    'Bolalar uchun',
    'Boshqa'
  ]

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-4 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white"
      >
        <h2 className="text-2xl font-bold mb-2">Bozor</h2>
        <p className="text-orange-100">Mahsulot sotish va sotib olish</p>
      </motion.div>

      {/* Add Product Button */}
      <button className="w-full bg-white rounded-xl p-4 shadow-sm border-2 border-dashed border-orange-300 hover:border-orange-500 hover:bg-orange-50 transition-colors">
        <div className="flex items-center justify-center gap-2 text-orange-600">
          <Plus className="w-5 h-5" />
          <span className="font-semibold">Mahsulot Qo'shish</span>
        </div>
      </button>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Mahsulot qidirish..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hidden pb-2">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            selectedCategory === ''
              ? 'bg-orange-600 text-white'
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
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filteredProducts.length === 0 ? (
          <div className="col-span-2 text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Mahsulot topilmadi</p>
          </div>
        ) : (
          filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-orange-600 font-bold text-lg">
                  {product.price?.toLocaleString()} so'm
                </p>
                <p className="text-xs text-gray-500 mt-1">{product.location}</p>
                <button className="w-full mt-2 px-3 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700">
                  Xarid qilish
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}