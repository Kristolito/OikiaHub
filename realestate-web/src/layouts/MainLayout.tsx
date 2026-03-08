import { useMemo, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
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
  return `rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ease-in-out ${
    isActive
      ? 'bg-elevated text-text-primary ring-1 ring-primary/60'
      : 'text-text-secondary hover:bg-surface hover:text-text-primary'
  }`
}

function MainLayout() {
  const { user } = useAuthState()
  const isAdmin = user?.role === 'Admin'
  const [mobileOpen, setMobileOpen] = useState(false)
  const [logoError, setLogoError] = useState(false)

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
    <div className="min-h-screen bg-main">
      <header className="sticky top-0 z-30 border-b border-border bg-nav/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4 py-4">
          <Link to="/" className="flex items-center gap-3">
            {!logoError && (
              <img
                src="/oikiahub-logo.png"
                alt="OikiaHub"
                className="h-20 w-auto max-w-[420px] object-contain object-left"
                onError={() => setLogoError(true)}
              />
            )}
            {logoError && <span className="text-2xl font-semibold tracking-tight text-text-primary">OikiaHub</span>}
          </Link>

          <div className="hidden items-center gap-4 xl:flex">
            {navGroups.map((group) => (
              <div key={group.label} className="flex items-center gap-1 rounded-xl border border-border bg-surface px-1 py-1">
                {group.links.map((link) => (
                  <NavLink key={link.to} to={link.to} className={({ isActive }) => linkClass(isActive)}>
                    {link.label}
                  </NavLink>
                ))}
              </div>
            ))}
            {authLinks.length > 0 && (
              <div className="ml-2 flex items-center gap-3">
                <NavLink
                  to="/login"
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-text-primary transition-all duration-200 ease-in-out hover:bg-elevated"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 ease-in-out hover:bg-primary-hover"
                >
                  Register
                </NavLink>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="rounded-lg border border-slate-700 bg-surface px-4 py-2 text-sm font-medium text-text-primary transition-all duration-200 ease-in-out hover:bg-elevated xl:hidden"
          >
            Menu
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-border bg-nav px-4 py-4 xl:hidden">
            <nav className="grid gap-2">
              {allMobileLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ease-in-out ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-20">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
