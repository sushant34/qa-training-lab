import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard, BookOpen, FileText, Play, Bug, Award,
  Users, Shield, BarChart3, ShoppingCart, LogOut, Menu, X, ExternalLink, FlaskConical,
  GitBranch, Rocket, GraduationCap
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user, isTrainer, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);

  const isActive = (path: string) => location.pathname === path;

  const internLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/tutorial', label: 'Tutorial', icon: GraduationCap },
    { path: '/requirements', label: 'Requirements', icon: BookOpen },
    { path: '/test-cases', label: 'Test Cases', icon: FileText },
    { path: '/test-execution', label: 'Test Execution', icon: Play },
    { path: '/bug-reports', label: 'Bug Reports', icon: Bug },
    { path: '/my-score', label: 'My Score', icon: Award },
    { path: '/traceability', label: 'Traceability', icon: GitBranch },
    { path: '/coverage', label: 'Coverage', icon: BarChart3 },
    { path: '/ecommerce/shop', label: 'E-Commerce App', icon: ShoppingCart, external: true },
  ];

  const trainerLinks = [
    { path: '/trainer-dashboard', label: 'Trainer Dashboard', icon: BarChart3 },
    { path: '/interns', label: 'Interns', icon: Users },
    { path: '/bug-repository', label: 'Bug Repository', icon: Shield },
    { path: '/requirements', label: 'Requirements', icon: BookOpen },
    { path: '/test-cases', label: 'All Test Cases', icon: FileText },
    { path: '/bug-reports', label: 'All Bug Reports', icon: Bug },
    { path: '/traceability', label: 'Traceability', icon: GitBranch },
    { path: '/coverage', label: 'Coverage', icon: BarChart3 },
    { path: '/ecommerce/shop', label: 'E-Commerce App', icon: ShoppingCart, external: true },
  ];

  const links = isTrainer ? trainerLinks : internLinks;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-900/30"
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
        className={`fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white transform transition-transform duration-300 z-50 shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-900/40">
                  <FlaskConical size={22} className="text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold leading-tight">QA Training Lab</h1>
                  <p className="text-xs text-slate-400">Manual Testing Platform</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="lg:hidden text-white"
              >
                <X size={20} />
              </button>
            </div>
            {user && (
              <div className="mt-4 p-3 bg-white/10 rounded-xl backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-sm font-bold text-white">
                    {user.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{user.full_name}</p>
                    <p className={`text-xs ${isTrainer ? 'text-amber-300' : 'text-violet-300'}`}>
                      {isTrainer ? 'Trainer' : 'QA Intern'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {isTrainer ? 'Management' : 'My Work'
              }
            </p>
            {links.map((link) =>
              link.external ? (
                <a
                  key={link.path}
                  href={link.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sidebar-link"
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
                  className={`sidebar-link ${isActive(link.path) ? 'active' : ''}`}
                >
                  <link.icon size={18} />
                  <span>{link.label}</span>
                </Link>
              )
            )}
          </nav>

          <div className="p-4 border-t border-white/10">
            <button
              onClick={() => { logout(); setIsOpen(false); }}
              className="sidebar-link w-full text-red-300 hover:bg-red-500/10 hover:text-red-200"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
