import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { login as apiLogin } from '../services/api';
import toast from 'react-hot-toast';
import { FlaskConical, ClipboardCheck, Bug, LineChart } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await apiLogin(username, password);
      login(data.token, data.user);
      toast.success('Login successful!');
      navigate(data.user.role === 'TRAINER' ? '/trainer-dashboard' : '/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur rounded-3xl shadow-2xl overflow-hidden">
        {/* Left branding panel */}
        <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-indigo-600 to-violet-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <FlaskConical size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight">QA Training Lab</h1>
              <p className="text-indigo-200 text-sm">Software Testing Training Platform</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold leading-tight">
              Master the art of<br />manual software testing
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center">
                  <ClipboardCheck size={20} />
                </div>
                <p className="text-indigo-100">Read requirements and create effective test cases</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center">
                  <Bug size={20} />
                </div>
                <p className="text-indigo-100">Execute tests and find real defects</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center">
                  <LineChart size={20} />
                </div>
                <p className="text-indigo-100">Track your score and improve your skills</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-indigo-200">© 2025 QA Training Lab</p>
        </div>

        {/* Right form panel */}
        <div className="p-8 lg:p-12">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2">
              <span className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <FlaskConical size={22} />
              </span>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">QA Training Lab</h1>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">Welcome back</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Sign in to continue your training</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="form-group">
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full justify-center py-3 text-base"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold">
                Register here
              </Link>
            </p>
          </div>

          <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              Intern Demo Account
            </p>
            <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">intern</span>
              </span>
              <span className="text-slate-400 dark:text-slate-500">·</span>
              <span className="font-mono font-medium text-slate-800 dark:text-slate-200">intern123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
