import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useStore } from '@/data/store';
import { cn } from '@/lib/cn';
import {
  IconChart,
  IconHome,
  IconList,
  IconLogo,
  IconPlus,
  IconStar,
  IconUser
} from '@/components/icons';
import type { ComponentType, SVGProps } from 'react';

interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

function useNav() {
  const { tenant, currentUser } = useStore();
  const base = `/${tenant.slug}`;
  const canReport = currentUser.role === 'owner';
  const fourth: NavItem = canReport
    ? { to: `${base}/reports`, label: 'Laporan', icon: IconChart }
    : { to: `${base}/follow-ups`, label: 'Tindak lanjut', icon: IconStar };
  const items: NavItem[] = [
    { to: `${base}/dashboard`, label: 'Beranda', icon: IconHome },
    { to: `${base}/orders`, label: 'Pesanan', icon: IconList },
    fourth,
    { to: `${base}/account`, label: 'Akun', icon: IconUser }
  ];
  return { base, items };
}

function Sidebar() {
  const { tenant, currentUser } = useStore();
  const { base } = useNav();
  const links: NavItem[] = [
    { to: `${base}/dashboard`, label: 'Beranda', icon: IconHome },
    { to: `${base}/orders`, label: 'Pesanan', icon: IconList },
    { to: `${base}/follow-ups`, label: 'Tindak lanjut', icon: IconStar },
    ...(currentUser.role === 'owner'
      ? [{ to: `${base}/reports`, label: 'Laporan', icon: IconChart }]
      : []),
    { to: `${base}/account`, label: 'Akun', icon: IconUser }
  ];
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-white px-4 py-6 lg:flex">
      <Link to={`${base}/dashboard`} className="mb-8 flex items-center gap-2 px-2">
        <IconLogo />
        <div className="leading-tight">
          <p className="font-bold text-ink">Rawatin</p>
          <p className="text-xs text-ink-faint">{tenant.name}</p>
        </div>
      </Link>
      <Link
        to={`${base}/orders/new`}
        className="mb-6 flex h-12 items-center justify-center gap-2 rounded-2xl bg-brand-500 font-semibold text-white shadow-pop transition-colors hover:bg-brand-600"
      >
        <IconPlus width={20} height={20} /> Order Baru
      </Link>
      <nav className="flex flex-col gap-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors',
                isActive ? 'bg-brand-50 text-brand-600' : 'text-ink-soft hover:bg-page'
              )
            }
          >
            <l.icon width={20} height={20} />
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto rounded-2xl bg-page px-3 py-3 text-xs text-ink-soft">
        Masuk sebagai <span className="font-semibold text-ink">{currentUser.name}</span>
        <br />
        <span className="capitalize">{currentUser.role === 'owner' ? 'Pemilik' : 'Staf'}</span>
      </div>
    </aside>
  );
}

function BottomNav() {
  const { base, items } = useNav();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur shadow-nav lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 items-end px-2 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5">
        {items.slice(0, 2).map((it) => (
          <NavTab key={it.to} item={it} />
        ))}
        <div className="flex justify-center">
          <Link
            to={`${base}/orders/new`}
            aria-label="Order baru"
            className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white shadow-pop transition-transform active:scale-95"
          >
            <IconPlus width={26} height={26} />
          </Link>
        </div>
        {items.slice(2).map((it) => (
          <NavTab key={it.to} item={it} />
        ))}
      </div>
    </nav>
  );
}

function NavTab({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        cn(
          'flex flex-col items-center gap-0.5 rounded-xl py-1 text-[11px] font-medium transition-colors',
          isActive ? 'text-brand-600' : 'text-ink-faint'
        )
      }
    >
      <item.icon width={22} height={22} />
      {item.label}
    </NavLink>
  );
}

const FULLSCREEN = /\/orders\/(new|[^/]+\/(pickup|share))$/;

export function AppShell() {
  const { pathname } = useLocation();
  const fullscreen = FULLSCREEN.test(pathname);

  return (
    <div className="min-h-dvh lg:flex">
      {!fullscreen && <Sidebar />}
      <div className="flex-1">
        <main
          className={cn(
            'mx-auto w-full',
            fullscreen ? 'max-w-2xl' : 'max-w-3xl px-4 pb-28 pt-4 lg:px-8 lg:pb-10 lg:pt-8'
          )}
        >
          <Outlet />
        </main>
      </div>
      {!fullscreen && <BottomNav />}
    </div>
  );
}
