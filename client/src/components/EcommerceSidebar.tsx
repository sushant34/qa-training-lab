import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useEcommerceAuth } from '../hooks/useEcommerceAuth';
import {
  Store, ShoppingCart, LogOut, Menu, X, User
} from 'lucide-react';

const EcommerceSidebar: React.FC = () => {
  const { user, isAuthenticated, logout } = useEcommerceAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);

  const isActive = (path: string) => location.pathname === path;

  const authLinks = [
    { path: '/ecommerce/shop', label: 'Shop', icon: Store },
    { path: '/ecommerce/cart', label: 'Cart', icon: ShoppingCart },
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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-emerald-700 text-white rounded-lg"
      >
        <Menu size={20} />
      </button>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full bg-emerald-800 text-white w-64 transform transition-transform duration-300 z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">E-Commerce Store</h1>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-white"
            >
              <X size={20} />
            </button>
          </div>
          {isAuthenticated && user && (
            <div className="mt-4 p-3 bg-emerald-700/50 rounded-lg">
              <p className="text-sm font-medium">{user.full_name}</p>
              <p className="text-xs text-emerald-300">Shopper</p>
            </div>
          )}
        </div>

        <nav className="px-3 py-4">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`sidebar-link ${isActive(link.path) ? 'active' : 'text-slate-300'}`}
            >
              <link.icon size={18} />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-4 left-3 right-3">
          {isAuthenticated && (
            <button
              onClick={() => { logout(); setIsOpen(false); }}
              className="sidebar-link text-slate-300 w-full hover:bg-red-600/20 hover:text-red-400"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          )}
          <a
            href="/dashboard"
            className="sidebar-link text-slate-300 w-full hover:bg-slate-600/20"
          >
            <LogOut size={18} className="rotate-180" />
            <span>Back to Training Lab</span>
          </a>
        </div>
      </aside>
    </>
  );
};

export default EcommerceSidebar;
