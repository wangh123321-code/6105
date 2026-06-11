import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Navbar() {
  const { token, user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-blue-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-wide">
          🏓 乒乓预约
        </Link>
        <div className="flex items-center gap-6">
          {token ? (
            <>
              <Link to="/" className="hover:text-blue-200 transition">球馆列表</Link>
              <Link to="/bookings" className="hover:text-blue-200 transition">我的预约</Link>
              <Link to="/match" className="hover:text-blue-200 transition">找球友</Link>
              <Link to="/match/requests" className="hover:text-blue-200 transition">我的约球</Link>
              <span className="text-blue-200 text-sm">{user?.nickname || user?.username}</span>
              <button
                onClick={handleLogout}
                className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-sm transition"
              >
                退出
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-200 transition">登录</Link>
              <Link to="/register" className="hover:text-blue-200 transition">注册</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
