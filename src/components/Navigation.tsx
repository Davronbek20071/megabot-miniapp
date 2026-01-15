import { NavLink } from 'react-router-dom'
import { Home, DollarSign, FileText, Briefcase, ShoppingBag, BookOpen, Crown, Settings } from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: 'Bosh sahifa' },
  { to: '/tekin', icon: DollarSign, label: 'Tekin' },
  { to: '/resume', icon: FileText, label: 'Resume' },
  { to: '/jobs', icon: Briefcase, label: 'Ishlar' },
  { to: '/market', icon: ShoppingBag, label: 'Bozor' },
  { to: '/books', icon: BookOpen, label: 'Kitoblar' },
  { to: '/premium', icon: Crown, label: 'Premium' },
]

export default function Navigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="grid grid-cols-4 gap-1 px-2 py-2">
        {navItems.slice(0, 4).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-purple-50 text-purple-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs font-medium truncate w-full text-center">{item.label}</span>
          </NavLink>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-1 px-2 pb-2">
        {navItems.slice(4).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-purple-50 text-purple-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs font-medium truncate w-full text-center">{item.label}</span>
          </NavLink>
        ))}
        <NavLink
          to="/admin"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-purple-50 text-purple-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`
          }
        >
          <Settings className="w-5 h-5" />
          <span className="text-xs font-medium">Admin</span>
        </NavLink>
      </div>
    </nav>
  )
}