import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  AlertCircle,
  GraduationCap,
  LogOut,
  ChevronRight,
  BookOpen,
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const navItems = [
  {
    label: 'Overview',
    path: '/admin',
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: 'WA Activity Log',
    path: '/admin/wa-log',
    icon: MessageSquare,
  },
  {
    label: 'Errors',
    path: '/admin/errors',
    icon: AlertCircle,
  },
  {
    label: 'Teachers',
    path: '/admin/teachers',
    icon: Users,
  },
  {
    label: 'FAQ & School Info',
    path: '/admin/faq',
    icon: BookOpen,
  },
]

export default function AdminSidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <aside className="w-56 min-h-screen bg-white border-r
      border-slate-100 flex flex-col">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex
          items-center justify-center flex-shrink-0">
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">
            EduConnect
          </p>
          <p className="text-xs text-slate-400">Admin panel</p>
        </div>
      </div>

      <Separator />

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg
              text-sm transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50'
              }`
            }
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <Separator />

      {/* User + logout */}
      <div className="p-3">
        <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
          <Avatar className="w-7 h-7">
            <AvatarFallback className="text-xs bg-blue-100
              text-blue-700">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-700 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start text-slate-500
            hover:text-red-600 hover:bg-red-50 text-xs"
        >
          <LogOut className="w-3.5 h-3.5 mr-2" />
          Sign out
        </Button>
      </div>

    </aside>
  )
}