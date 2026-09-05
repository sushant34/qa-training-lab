import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useEcommerceAuth } from '../hooks/useEcommerceAuth';
import { useTheme } from '../hooks/useTheme';
import {
  Store, ShoppingCart, LogOut, Menu, X, User, RotateCcw, ShoppingBag, Heart, Clock, UserCircle, Sun, Moon
} from 'lucide-react';

const EcommerceSidebar: React.FC = () => {
  const { user, isAuthenticated, logout } = useEcommerceAuth();
  const { toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);

  const isActive = (path: string) => location.pathname === path;

  const authLinks = [
    { path: '/ecommerce/shop', label: 'Shop', icon: Store },
    { path: '/ecommerce/cart', label: 'Cart', icon: ShoppingCart },
    { path: '/ecommerce/wishlist', label: 'Wishlist', icon: Heart },
    { path: '/ecommerce/orders', label: 'Orders', icon: Clock },
    { path: '/ecommerce/profile', label: 'Profile', icon: UserCircle },
  ];

  const guestLinks = [
    { path: '/ecommerce/login', label: 'Sign In', icon: LogOut },
    { path: '/ecommerce/register', label: 'Create Account', icon: User },
  ];

  const links = isAuthenticated ? authLinks : guestLinks;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-900/30"
        aria-label="Open navigation menu"
      >
        <Menu size={20} />
      </button>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-emerald-900 via-emerald-900 to-teal-950 text-white transform transition-transform duration-300 z-50 shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        aria-label="E-Commerce navigation"
      >
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-900/40">
                  <ShoppingBag size={22} className="text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold leading-tight">E-Commerce Store</h1>
                  <p className="text-xs text-emerald-300/60">Test the Shopping App</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleTheme}
                  className="theme-toggle"
                  aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="lg:hidden text-white p-1"
                  aria-label="Close navigation menu"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            {isAuthenticated && user && (
              <div className="mt-4 p-3 bg-white/10 rounded-xl backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-sm font-bold text-white">
                    {user.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{user.full_name}</p>
                    <p className="text-xs text-emerald-300">Shopper</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Shop navigation">
            <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-emerald-300/40">
              Shop
            </p>
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`sidebar-link ${isActive(link.path) ? 'active' : ''}`}
                aria-current={isActive(link.path) ? 'page' : undefined}
              >
                <link.icon size={18} />
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-white/10 space-y-1">
            {isAuthenticated && (
              <button
                onClick={() => { logout(); setIsOpen(false); }}
                className="sidebar-link w-full text-red-300 hover:bg-red-500/10 hover:text-red-200"
                aria-label="Sign out of your account"
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            )}
            <a
              href="/dashboard"
              className="sidebar-link w-full hover:bg-white/10"
            >
              <RotateCcw size={18} />
              <span>Back to Training Lab</span>
            </a>
          </div>
        </div>
      </aside>
    </>
  );
};

export default EcommerceSidebar;
