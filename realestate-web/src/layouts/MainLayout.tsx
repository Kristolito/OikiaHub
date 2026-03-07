import { useMemo, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import useAuthState from '../hooks/useAuthState'

type LinkItem = { to: string; label: string }

const primaryLinks: LinkItem[] = [
  { to: '/', label: 'Home' },
  { to: '/properties', label: 'Properties' },
]

const userLinks: LinkItem[] = [
  { to: '/favorites', label: 'Favorites' },
  { to: '/my-inquiries', label: 'My Inquiries' },
]

const workspaceLinks: LinkItem[] = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/dashboard/inquiries', label: 'Inquiries' },
]

function linkClass(isActive: boolean) {
  return `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-slate-900 text-white'
      : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
  }`
}

function MainLayout() {
  const { user } = useAuthState()
  const isAdmin = user?.role === 'Admin'
  const [mobileOpen, setMobileOpen] = useState(false)

  const adminLinks = useMemo<LinkItem[]>(
    () =>
      isAdmin
        ? [
            { to: '/admin', label: 'Admin' },
            { to: '/admin/users', label: 'Users' },
            { to: '/admin/properties', label: 'Moderation' },
          ]
        : [],
    [isAdmin],
  )

  const authLinks: LinkItem[] = [
    { to: '/login', label: 'Login' },
    { to: '/register', label: 'Register' },
  ]

  const navGroups = [
    { label: 'Browse', links: primaryLinks },
    { label: 'Personal', links: userLinks },
    { label: 'Workspace', links: workspaceLinks },
    ...(adminLinks.length > 0 ? [{ label: 'Admin', links: adminLinks }] : []),
  ]

  const allMobileLinks = [...primaryLinks, ...userLinks, ...workspaceLinks, ...adminLinks, ...authLinks]

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-slate-900 dark:bg-slate-100" />
            <span className="text-xl font-semibold tracking-tight text-slate-100">OikiaHub</span>
          </div>

          <div className="hidden items-center gap-2 xl:flex">
            {navGroups.map((group) => (
              <div key={group.label} className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 p-1">
                {group.links.map((link) => (
                  <NavLink key={link.to} to={link.to} className={({ isActive }) => linkClass(isActive)}>
                    {link.label}
                  </NavLink>
                ))}
              </div>
            ))}
            {authLinks.length > 0 && (
              <div className="ml-1 flex items-center gap-1">
                {authLinks.map((link) => (
                  <NavLink key={link.to} to={link.to} className={({ isActive }) => linkClass(isActive)}>
                    {link.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-200 xl:hidden"
          >
            Menu
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-slate-800 bg-slate-950 px-4 py-3 xl:hidden">
            <nav className="grid gap-2">
              {allMobileLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => linkClass(isActive)}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:py-10">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
