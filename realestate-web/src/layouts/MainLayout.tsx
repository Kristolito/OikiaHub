import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/properties', label: 'Properties' },
  { to: '/favorites', label: 'Favorites' },
  { to: '/my-inquiries', label: 'My Inquiries' },
  { to: '/dashboard/inquiries', label: 'Dashboard Inquiries' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/login', label: 'Login' },
  { to: '/register', label: 'Register' },
]

function MainLayout() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-4">
          <span className="text-lg font-semibold">OikiaHub</span>
          <nav className="flex flex-wrap gap-4">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  isActive ? 'font-semibold text-slate-900' : 'text-slate-600 hover:text-slate-900'
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
