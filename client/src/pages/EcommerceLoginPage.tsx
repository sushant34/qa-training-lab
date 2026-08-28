import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEcommerceAuth } from '../hooks/useEcommerceAuth';
import toast from 'react-hot-toast';
import { ShoppingCart, LogIn } from 'lucide-react';

const EcommerceLoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useEcommerceAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/ecommerce/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      login(data.token, data.user);
      toast.success('Welcome to the store!');
      navigate('/shop');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 to-teal-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-4">
            <ShoppingCart size={32} className="text-emerald-300" />
          </div>
          <h1 className="text-3xl font-bold text-white">E-Commerce Store</h1>
          <p className="text-emerald-200 mt-2">Sign in to start shopping</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <LogIn size={20} />
            Sign In
          </h2>

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
              className="btn btn-primary w-full justify-center bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Don't have an account?{' '}
              <Link to="/ecommerce/register" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Register here
              </Link>
            </p>
          </div>

          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <p className="text-xs font-medium text-slate-700 mb-2">Quick Test:</p>
            <div className="text-xs text-slate-600 space-y-1">
              <p>Use existing account: <strong>intern / intern123</strong></p>
              <p>Or register a new account above</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcommerceLoginPage;
