import { useState } from 'react';
import {
  Home,
  LayoutGrid,
  Activity,
  Users,
  Bookmark,
  History,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  PlusCircle,
  UserCircle,
} from 'lucide-react';
import { useNav } from '@/context/NavContext';
import { useAuth } from '@/context/AuthContext';
import type { NavState, Page } from '@/types';

const NAV_ITEMS: { page: Page; label: string; icon: typeof Home }[] = [
  { page: 'home', label: 'Home', icon: Home },
  { page: 'categories', label: 'Categories', icon: LayoutGrid },
  { page: 'activity', label: 'Rental Activity', icon: Activity },
  { page: 'visited-sellers', label: 'Visited Sellers', icon: Users },
  { page: 'saved', label: 'Saved Items', icon: Bookmark },
  { page: 'history', label: 'History', icon: History },
];

export function Navbar({ state }: { state: NavState }) {
  const { navigate } = useNav();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (page: Page) => state.page === page;

  const handleSignOut = async () => {
    await signOut();
    navigate('home');
  };

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-sand-200 transition-shadow duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => navigate('home')}
            className="flex items-center gap-2 font-serif font-bold text-xl text-chocolate-800 shrink-0 transition-opacity hover:opacity-80"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-chocolate-800 text-cream transition-transform duration-200 hover:scale-105">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <span className="hidden sm:inline">Rent & Reuse</span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.page}
                onClick={() => navigate(item.page)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(item.page)
                    ? 'bg-chocolate-800 text-cream shadow-sm'
                    : 'text-chocolate-600 hover:bg-sand-200 hover:-translate-y-0.5'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <button
                  onClick={() => navigate('post-item')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-sand-200 text-chocolate-800 hover:bg-sand-300 transition-all duration-200 hover:-translate-y-0.5"
                >
                  <PlusCircle className="h-4 w-4" />
                  Post Item
                </button>
                <button
                  onClick={() => navigate('dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive('dashboard')
                      ? 'bg-chocolate-800 text-cream shadow-sm'
                      : 'text-chocolate-600 hover:bg-sand-200 hover:-translate-y-0.5'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden md:inline">Dashboard</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-lg text-chocolate-600 hover:bg-sand-200 transition-all duration-200 hover:scale-105"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('login')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-chocolate-600 hover:bg-sand-200 transition-all duration-200"
                >
                  <UserCircle className="h-4 w-4" />
                  Sign In
                </button>
                <button
                  onClick={() => navigate('signup')}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-chocolate-800 text-cream hover:bg-chocolate-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  Sign Up
                </button>
              </>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-chocolate-600 hover:bg-sand-200 transition-all duration-200 hover:scale-105"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-sand-200 bg-cream animate-slide-down origin-top">
          <nav className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.page}
                onClick={() => {
                  navigate(item.page);
                  setMobileOpen(false);
                }}
                className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.page)
                    ? 'bg-chocolate-800 text-cream'
                    : 'text-chocolate-600 hover:bg-sand-200'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
            {user ? (
              <>
                <button
                  onClick={() => {
                    navigate('post-item');
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-chocolate-600 hover:bg-sand-200"
                >
                  <PlusCircle className="h-4 w-4" />
                  Post Item
                </button>
                <button
                  onClick={() => {
                    navigate('dashboard');
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-chocolate-600 hover:bg-sand-200"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  navigate('login');
                  setMobileOpen(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-chocolate-600 hover:bg-sand-200"
              >
                <UserCircle className="h-4 w-4" />
                Sign In
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
