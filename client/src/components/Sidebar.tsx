import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard, BookOpen, FileText, Play, Bug, Award,
  Users, Shield, BarChart3, ShoppingCart, LogOut, Menu, X, ExternalLink
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user, isTrainer, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);

  const isActive = (path: string) => location.pathname === path;

  const internLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/requirements', label: 'Requirements', icon: BookOpen },
    { path: '/test-cases', label: 'Test Cases', icon: FileText },
    { path: '/test-execution', label: 'Test Execution', icon: Play },
    { path: '/bug-reports', label: 'Bug Reports', icon: Bug },
    { path: '/my-score', label: 'My Score', icon: Award },
    { path: '/ecommerce/shop', label: 'E-Commerce App', icon: ShoppingCart, external: true },
  ];

  const trainerLinks = [
    { path: '/trainer-dashboard', label: 'Trainer Dashboard', icon: BarChart3 },
    { path: '/interns', label: 'Interns', icon: Users },
    { path: '/bug-repository', label: 'Bug Repository', icon: Shield },
    { path: '/requirements', label: 'Requirements', icon: BookOpen },
    { path: '/test-cases', label: 'All Test Cases', icon: FileText },
    { path: '/bug-reports', label: 'All Bug Reports', icon: Bug },
    { path: '/ecommerce/shop', label: 'E-Commerce App', icon: ShoppingCart, external: true },
  ];

  const links = isTrainer ? trainerLinks : internLinks;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 text-white rounded-lg"
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
        className={`fixed left-0 top-0 h-full bg-slate-800 text-white w-64 transform transition-transform duration-300 z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">QA Training Lab</h1>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-white"
            >
              <X size={20} />
            </button>
          </div>
          {user && (
            <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
              <p className="text-sm font-medium">{user.full_name}</p>
              <p className="text-xs text-slate-400">{user.role}</p>
            </div>
          )}
        </div>

        <nav className="px-3 py-4">
          {links.map((link) =>
            link.external ? (
              <a
                key={link.path}
                href={link.path}
                target="_blank"
                rel="noopener noreferrer"
                className="sidebar-link text-slate-300"
              >
                <link.icon size={18} />
                <span>{link.label}</span>
                <ExternalLink size={14} className="ml-auto opacity-50" />
              </a>
            ) : (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`sidebar-link ${isActive(link.path) ? 'active' : 'text-slate-300'}`}
              >
                <link.icon size={18} />
                <span>{link.label}</span>
              </Link>
            )
          )}
        </nav>

        <div className="absolute bottom-4 left-3 right-3">
          <button
            onClick={() => { logout(); setIsOpen(false); }}
            className="sidebar-link text-slate-300 w-full hover:bg-red-600/20 hover:text-red-400"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
