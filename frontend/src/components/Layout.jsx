import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Flame, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/sessions', label: 'Sessions', icon: LayoutDashboard },
  { to: '/heatmap', label: 'Heatmap', icon: Flame },
];

/**
 * Layout — wraps every page with the sidebar and top header.
 * Pass `title`, `subtitle`, and `liveConnected` as props.
 * `liveConnected` drives the pulsing live-indicator dot in the sidebar footer.
 */
export default function Layout({ children, title, subtitle, liveConnected = false }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ── Sidebar ── */}
      <aside className="flex w-60 shrink-0 flex-col border-r border-border glass">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <span className="text-base font-bold gradient-text">CausalFunnel</span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 p-3 flex-1">
          <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Analytics
          </p>
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-primary/15 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer — live status dot */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={cn(
                'h-2 w-2 rounded-full transition-colors duration-300',
                liveConnected ? 'bg-emerald-400 animate-pulse' : 'bg-muted-foreground/40'
              )}
            />
            <span
              className={cn(
                'text-[11px] font-medium transition-colors duration-300',
                liveConnected ? 'text-emerald-400' : 'text-muted-foreground/60'
              )}
            >
              {liveConnected ? 'Live tracking active' : 'Connecting…'}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Full Stack Assessment
            <br />
            <span className="text-primary/70">CausalFunnel · 2026</span>
          </p>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Page header */}
        <header className="shrink-0 border-b border-border px-8 py-5 glass">
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}

